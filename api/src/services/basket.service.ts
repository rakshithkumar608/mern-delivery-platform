import { Basket, IBasket, IBasketDocument, IBasketItem } from "../models/basket.model";
import { MenuItem } from "../models/menu-item.model";
import { Restaurant } from "../models/restaurant.model";
import { NotFoundException } from "../utils/app-error";

// Default seed data matching the v2 design screenshot exactly
const DEFAULT_BASKET_DATA: Partial<IBasket> = {
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
      selectedSize: { label: 'Regular (10")', price: 4.29 },
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
      selectedSize: { label: "Standard", price: 3.49 },
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
      selectedSize: { label: "330ml", price: 1.5 },
      itemTotal: 1.5,
    },
  ],
  subtotal: 9.28,
  total: 11.76,
};

// In-memory fallback cache for development or when MongoDB is offline
const memoryBasketStore: Map<string, any> = new Map();

export class BasketService {
  /**
   * Helper to recalculate subtotal, delivery fee, threshold, service fee, and total
   */
  private recalculate(basket: any): any {
    const items = basket.items || [];
    let subtotal = 0;

    for (const item of items) {
      item.itemTotal = Number((item.price * item.quantity).toFixed(2));
      subtotal += item.itemTotal;
    }

    subtotal = Number(subtotal.toFixed(2));
    const baseDeliveryFee = 1.49;
    const deliveryFee = items.length === 0 ? 0 : (basket.deliveryFee ?? baseDeliveryFee);
    const serviceFee = items.length > 0 ? (basket.serviceFee ?? 0.99) : 0;
    const discount = basket.discount ?? 0;
    const total = Math.max(0, Number((subtotal + deliveryFee + serviceFee - discount).toFixed(2)));

    basket.subtotal = subtotal;
    basket.deliveryFee = deliveryFee;
    basket.serviceFee = serviceFee;
    basket.total = total;

    return basket;
  }

  /**
   * Get basket for a user or session identifier
   */
  async getBasket(identifier: string): Promise<any> {
    try {
      let basket = await Basket.findOne({
        $or: [{ userId: identifier }, { sessionId: identifier }],
      }).exec();

      if (!basket) {
        if (memoryBasketStore.has(identifier)) {
          return memoryBasketStore.get(identifier);
        }

        // Initialize default basket
        const initial = JSON.parse(JSON.stringify(DEFAULT_BASKET_DATA));
        initial.sessionId = identifier;
        this.recalculate(initial);
        memoryBasketStore.set(identifier, initial);
        return initial;
      }

      this.recalculate(basket);
      await basket.save();
      return basket;
    } catch {
      if (!memoryBasketStore.has(identifier)) {
        const initial = JSON.parse(JSON.stringify(DEFAULT_BASKET_DATA));
        initial.sessionId = identifier;
        this.recalculate(initial);
        memoryBasketStore.set(identifier, initial);
      }
      return memoryBasketStore.get(identifier);
    }
  }

  /**
   * Add item to basket
   */
  async addItem(identifier: string, itemData: Partial<IBasketItem>): Promise<any> {
    try {
      let basket = await Basket.findOne({
        $or: [{ userId: identifier }, { sessionId: identifier }],
      }).exec();

      if (!basket) {
        basket = new Basket({
          ...DEFAULT_BASKET_DATA,
          items: [],
          sessionId: identifier,
        });
      }

      const existingIndex = basket.items.findIndex(
        (i: any) =>
          String(i.name).toLowerCase() === String(itemData.name).toLowerCase() &&
          String(i.subtitle || "").toLowerCase() === String(itemData.subtitle || "").toLowerCase()
      );

      const quantity = Math.max(1, Number(itemData.quantity) || 1);
      const unitPrice = Number(itemData.price) || 0;

      if (existingIndex > -1) {
        basket.items[existingIndex].quantity += quantity;
        basket.items[existingIndex].itemTotal = Number(
          (basket.items[existingIndex].price * basket.items[existingIndex].quantity).toFixed(2)
        );
      } else {
        const newItem: any = {
          name: itemData.name || "Custom Item",
          subtitle: itemData.subtitle || "",
          image: itemData.image || "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80",
          price: unitPrice,
          quantity,
          selectedSize: itemData.selectedSize,
          selectedExtras: itemData.selectedExtras,
          selectedRemovals: itemData.selectedRemovals,
          specialInstructions: itemData.specialInstructions,
          itemTotal: Number((unitPrice * quantity).toFixed(2)),
        };
        basket.items.push(newItem);
      }

      this.recalculate(basket);
      await basket.save();
      memoryBasketStore.set(identifier, basket.toObject());
      return basket;
    } catch {
      let inMem = memoryBasketStore.get(identifier) || JSON.parse(JSON.stringify(DEFAULT_BASKET_DATA));
      const existing = inMem.items.find(
        (i: any) =>
          String(i.name).toLowerCase() === String(itemData.name).toLowerCase() &&
          String(i.subtitle || "").toLowerCase() === String(itemData.subtitle || "").toLowerCase()
      );

      const quantity = Math.max(1, Number(itemData.quantity) || 1);
      const unitPrice = Number(itemData.price) || 0;

      if (existing) {
        existing.quantity += quantity;
        existing.itemTotal = Number((existing.price * existing.quantity).toFixed(2));
      } else {
        inMem.items.push({
          _id: "item_" + Date.now(),
          name: itemData.name || "Custom Item",
          subtitle: itemData.subtitle || "",
          image: itemData.image || "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80",
          price: unitPrice,
          quantity,
          itemTotal: Number((unitPrice * quantity).toFixed(2)),
        });
      }

      this.recalculate(inMem);
      memoryBasketStore.set(identifier, inMem);
      return inMem;
    }
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(
    identifier: string,
    itemId: string,
    quantity: number
  ): Promise<any> {
    const cleanItemId = String(itemId).trim();
    const decodedItemId = decodeURIComponent(cleanItemId).toLowerCase();

    try {
      let basket = await Basket.findOne({
        $or: [{ userId: identifier }, { sessionId: identifier }],
      }).exec();

      if (basket) {
        if (quantity <= 0) {
          basket.items = basket.items.filter(
            (i: any) =>
              String(i._id) !== cleanItemId &&
              String(i.name).toLowerCase() !== decodedItemId
          ) as any;
        } else {
          const item = basket.items.find(
            (i: any) =>
              String(i._id) === cleanItemId ||
              String(i.name).toLowerCase() === decodedItemId
          );
          if (item) {
            item.quantity = quantity;
            item.itemTotal = Number((item.price * quantity).toFixed(2));
          }
        }

        this.recalculate(basket);
        await basket.save();
        memoryBasketStore.set(identifier, basket.toObject());
        return basket;
      }
    } catch {}

    let inMem = memoryBasketStore.get(identifier) || JSON.parse(JSON.stringify(DEFAULT_BASKET_DATA));
    if (quantity <= 0) {
      inMem.items = inMem.items.filter(
        (i: any) =>
          String(i._id) !== cleanItemId &&
          String(i.name).toLowerCase() !== decodedItemId
      );
    } else {
      const item = inMem.items.find(
        (i: any) =>
          String(i._id) === cleanItemId ||
          String(i.name).toLowerCase() !== decodedItemId
      );
      if (item) {
        item.quantity = quantity;
        item.itemTotal = Number((item.price * quantity).toFixed(2));
      }
    }

    this.recalculate(inMem);
    memoryBasketStore.set(identifier, inMem);
    return inMem;
  }

  /**
   * Remove item from basket
   */
  async removeItem(identifier: string, itemId: string): Promise<any> {
    return this.updateItemQuantity(identifier, itemId, 0);
  }

  /**
   * Update basket preferences (cutlery, promo code, notes)
   */
  async updatePreferences(
    identifier: string,
    prefs: {
      includeCutlery?: boolean;
      promoCode?: string;
      orderNotes?: string;
      allergyReminder?: string;
    }
  ): Promise<any> {
    try {
      let basket = await Basket.findOne({
        $or: [{ userId: identifier }, { sessionId: identifier }],
      }).exec();

      if (basket) {
        if (prefs.includeCutlery !== undefined) basket.includeCutlery = prefs.includeCutlery;
        if (prefs.promoCode !== undefined) {
          basket.promoCode = prefs.promoCode;
          basket.discount = prefs.promoCode.trim().length > 0 ? 2.0 : 0;
        }
        if (prefs.orderNotes !== undefined) basket.orderNotes = prefs.orderNotes;
        if (prefs.allergyReminder !== undefined) basket.allergyReminder = prefs.allergyReminder;

        this.recalculate(basket);
        await basket.save();
        memoryBasketStore.set(identifier, basket.toObject());
        return basket;
      }
    } catch {}

    let inMem = memoryBasketStore.get(identifier) || JSON.parse(JSON.stringify(DEFAULT_BASKET_DATA));
    if (prefs.includeCutlery !== undefined) inMem.includeCutlery = prefs.includeCutlery;
    if (prefs.promoCode !== undefined) {
      inMem.promoCode = prefs.promoCode;
      inMem.discount = prefs.promoCode.trim().length > 0 ? 2.0 : 0;
    }
    if (prefs.orderNotes !== undefined) inMem.orderNotes = prefs.orderNotes;
    if (prefs.allergyReminder !== undefined) inMem.allergyReminder = prefs.allergyReminder;

    this.recalculate(inMem);
    memoryBasketStore.set(identifier, inMem);
    return inMem;
  }

  /**
   * Clear all items in basket
   */
  async clearBasket(identifier: string): Promise<any> {
    try {
      let basket = await Basket.findOne({
        $or: [{ userId: identifier }, { sessionId: identifier }],
      }).exec();

      if (basket) {
        basket.items = [] as any;
        this.recalculate(basket);
        await basket.save();
        memoryBasketStore.set(identifier, basket.toObject());
        return basket;
      }
    } catch {}

    let inMem = memoryBasketStore.get(identifier) || JSON.parse(JSON.stringify(DEFAULT_BASKET_DATA));
    inMem.items = [];
    this.recalculate(inMem);
    memoryBasketStore.set(identifier, inMem);
    return inMem;
  }
}

export const basketService = new BasketService();
