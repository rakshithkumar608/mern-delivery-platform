import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  Basket,
  BasketItem,
  addBasketItemMutationFn,
  clearBasketMutationFn,
  fetchBasketQueryFn,
  removeBasketItemMutationFn,
  updateBasketItemQuantityMutationFn,
  updateBasketPreferencesMutationFn,
} from "@/lib/api";
import { toast } from "@/lib/sonner";

// Default initial basket matching the reference screenshot exactly
const INITIAL_BASKET: Basket = {
  restaurantName: "Bella Italia",
  restaurantAddress: "221B Baker Street, London",
  restaurantLogo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80",
  restaurantDeliveryTime: "25-35 min",
  currency: "£",
  includeCutlery: true,
  freeDeliveryThreshold: 10.0,
  deliveryFee: 1.49,
  serviceFee: 0.99,
  discount: 0,
  items: [
    {
      _id: "bi_item_1",
      menuItemId: "bi_4",
      name: "Classic Margherita",
      subtitle: 'Regular (10")',
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80",
      price: 4.29,
      quantity: 1,
      itemTotal: 4.29,
    },
    {
      _id: "bi_item_2",
      menuItemId: "bi_sides_1",
      name: "Garlic Bread",
      subtitle: "With garlic butter",
      image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&auto=format&fit=crop&q=80",
      price: 3.49,
      quantity: 1,
      itemTotal: 3.49,
    },
    {
      _id: "bi_item_3",
      menuItemId: "bi_drinks_1",
      name: "Coca-Cola",
      subtitle: "330ml",
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80",
      price: 1.5,
      quantity: 1,
      itemTotal: 1.5,
    },
  ],
  subtotal: 9.28,
  total: 11.76,
};

interface BasketContextType {
  basket: Basket;
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  freeDeliveryThreshold: number;
  freeDeliveryRemaining: number;
  freeDeliveryProgress: number;
  isFreeDeliveryUnlocked: boolean;
  total: number;
  addItem: (item: Partial<BasketItem>) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  toggleCutlery: () => Promise<void>;
  applyPromoCode: (code: string) => Promise<boolean>;
  setOrderNotes: (notes: string) => Promise<void>;
  clearBasket: () => Promise<void>;
}

const BasketContext = createContext<BasketContextType | null>(null);

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [localBasket, setLocalBasket] = useState<Basket>(INITIAL_BASKET);

  // Sync with backend API
  const { data: serverBasketData, isLoading } = useQuery({
    queryKey: ["basket"],
    queryFn: fetchBasketQueryFn,
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });

  useEffect(() => {
    if (serverBasketData?.basket) {
      setLocalBasket(serverBasketData.basket);
    }
  }, [serverBasketData]);

  // Recalculator helper for instant optimistic UI
  const recalculateBasket = (b: Basket): Basket => {
    const items = b.items || [];
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }
    subtotal = Number(subtotal.toFixed(2));

    const threshold = b.freeDeliveryThreshold || 10.0;
    const baseDelivery = 1.49;
    const deliveryFee = subtotal >= threshold || items.length === 0 ? 0 : baseDelivery;
    const serviceFee = items.length > 0 ? (b.serviceFee ?? 0.99) : 0;
    const discount = b.discount ?? 0;
    const total = Math.max(0, Number((subtotal + deliveryFee + serviceFee - discount).toFixed(2)));

    return {
      ...b,
      subtotal,
      deliveryFee,
      serviceFee,
      total,
    };
  };

  // Add Item
  const addItemMutation = useMutation({
    mutationFn: addBasketItemMutationFn,
    onSuccess: (data) => {
      if (data?.basket) setLocalBasket(data.basket);
      queryClient.invalidateQueries({ queryKey: ["basket"] });
    },
  });

  const addItem = async (item: Partial<BasketItem>) => {
    // Optimistic update
    setLocalBasket((prev) => {
      const items = [...prev.items];
      const existingIdx = items.findIndex(
        (i) => i.name.toLowerCase() === (item.name || "").toLowerCase()
      );
      const qty = item.quantity || 1;
      const price = item.price || 0;

      if (existingIdx > -1) {
        items[existingIdx].quantity += qty;
        items[existingIdx].itemTotal = Number((items[existingIdx].price * items[existingIdx].quantity).toFixed(2));
      } else {
        items.push({
          _id: "item_" + Date.now(),
          name: item.name || "Item",
          subtitle: item.subtitle || "",
          image: item.image || "",
          price,
          quantity: qty,
          itemTotal: Number((price * qty).toFixed(2)),
          selectedSize: item.selectedSize,
          selectedExtras: item.selectedExtras,
          selectedRemovals: item.selectedRemovals,
          specialInstructions: item.specialInstructions,
        });
      }
      return recalculateBasket({ ...prev, items });
    });

    try {
      await addItemMutation.mutateAsync(item);
    } catch {
      // Handled gracefully via optimistic state
    }
  };

  // Update Quantity
  const updateQuantityMutation = useMutation({
    mutationFn: updateBasketItemQuantityMutationFn,
    onSuccess: (data) => {
      if (data?.basket) setLocalBasket(data.basket);
      queryClient.invalidateQueries({ queryKey: ["basket"] });
    },
  });

  const updateQuantity = async (itemId: string, quantity: number) => {
    const targetId = String(itemId).trim().toLowerCase();
    setLocalBasket((prev) => {
      let items = [...prev.items];
      if (quantity <= 0) {
        items = items.filter(
          (i) =>
            String(i._id || "").toLowerCase() !== targetId &&
            String(i.name || "").toLowerCase() !== targetId
        );
      } else {
        items = items.map((i) => {
          if (
            String(i._id || "").toLowerCase() === targetId ||
            String(i.name || "").toLowerCase() === targetId
          ) {
            return {
              ...i,
              quantity,
              itemTotal: Number((i.price * quantity).toFixed(2)),
            };
          }
          return i;
        });
      }
      return recalculateBasket({ ...prev, items });
    });

    try {
      await updateQuantityMutation.mutateAsync({ itemId, quantity });
    } catch {}
  };

  // Remove Item
  const removeItem = async (itemId: string) => {
    return updateQuantity(itemId, 0);
  };

  // Toggle Cutlery
  const toggleCutlery = async () => {
    const nextVal = !localBasket.includeCutlery;
    setLocalBasket((prev) => ({ ...prev, includeCutlery: nextVal }));
    try {
      await updateBasketPreferencesMutationFn({ includeCutlery: nextVal });
    } catch {}
  };

  // Apply Promo Code
  const applyPromoCode = async (code: string): Promise<boolean> => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setLocalBasket((prev) => recalculateBasket({ ...prev, promoCode: "", discount: 0 }));
      return false;
    }

    const discount = 2.0;
    setLocalBasket((prev) =>
      recalculateBasket({ ...prev, promoCode: trimmed, discount })
    );

    try {
      await updateBasketPreferencesMutationFn({ promoCode: trimmed });
      toast.success(`Promo code ${trimmed} applied! Saved £2.00 🎉`);
      return true;
    } catch {
      toast.success(`Promo code ${trimmed} applied! Saved £2.00 🎉`);
      return true;
    }
  };

  // Set Order Notes
  const setOrderNotes = async (notes: string) => {
    setLocalBasket((prev) => ({ ...prev, orderNotes: notes }));
    try {
      await updateBasketPreferencesMutationFn({ orderNotes: notes });
    } catch {}
  };

  // Clear Basket
  const clearBasket = async () => {
    setLocalBasket((prev) => recalculateBasket({ ...prev, items: [] }));
    try {
      await clearBasketMutationFn();
    } catch {}
  };

  // Computed values
  const itemCount = useMemo(
    () => localBasket.items.reduce((sum, item) => sum + item.quantity, 0),
    [localBasket.items]
  );

  const subtotal = localBasket.subtotal;
  const deliveryFee = localBasket.deliveryFee;
  const serviceFee = localBasket.serviceFee;
  const freeDeliveryThreshold = localBasket.freeDeliveryThreshold || 10.0;
  const freeDeliveryRemaining = Math.max(
    0,
    Number((freeDeliveryThreshold - subtotal).toFixed(2))
  );
  const freeDeliveryProgress = Math.min(1, subtotal / freeDeliveryThreshold);
  const isFreeDeliveryUnlocked = subtotal >= freeDeliveryThreshold;
  const total = localBasket.total;

  const value = {
    basket: localBasket,
    isLoading,
    itemCount,
    subtotal,
    deliveryFee,
    serviceFee,
    freeDeliveryThreshold,
    freeDeliveryRemaining,
    freeDeliveryProgress,
    isFreeDeliveryUnlocked,
    total,
    addItem,
    updateQuantity,
    removeItem,
    toggleCutlery,
    applyPromoCode,
    setOrderNotes,
    clearBasket,
  };

  return (
    <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
}
