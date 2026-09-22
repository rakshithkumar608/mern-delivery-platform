import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useUniwind } from "uniwind";

import { toast } from "@/lib/sonner";

interface SizeOption {
  label: string;
  price: number;
}

interface ToppingOption {
  label: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sizes: SizeOption[];
  toppings: ToppingOption[];
}

interface ItemDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  item: MenuItem | null;
}

export function ItemDetailSheet({
  visible,
  onClose,
  item,
}: ItemDetailSheetProps) {
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedToppings, setSelectedToppings] = useState<
    Record<number, boolean>
  >({ 1: true }); // Bacon pre-selected as in Board 2
  const [quantity, setQuantity] = useState(1);

  if (!item) return null;

  const sizePrice = item.sizes[selectedSize]?.price ?? 0;
  const toppingsPrice = Object.entries(selectedToppings)
    .filter(([, v]) => v)
    .reduce((sum, [idx]) => sum + (item.toppings[Number(idx)]?.price ?? 0), 0);
  const unitTotal = item.price + sizePrice + toppingsPrice;
  const total = unitTotal * quantity;

  const toggleTopping = (idx: number) => {
    setSelectedToppings((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleAddToCart = () => {
    toast.success(
      `Added ${quantity}× ${item.name} to cart — $${total.toFixed(2)} 🛒`
    );
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50" onPress={onClose}>
        <View className="flex-1" />
      </Pressable>

      <View className="absolute bottom-0 left-0 right-0 rounded-t-[28px] bg-background border-t border-border shadow-2xl max-h-[92%]">
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Hero Image */}
          <View className="relative">
            <Image
              source={{ uri: item.image }}
              style={{ width: "100%", height: 220 }}
              contentFit="cover"
              transition={300}
              className="rounded-t-[28px]"
            />

            {/* Back / Close button */}
            <Pressable
              onPress={onClose}
              className="absolute left-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-white shadow-md active:scale-95"
            >
              <Feather name="chevron-left" size={22} color="#1a1a2e" />
            </Pressable>

            {/* Favorite heart */}
            <Pressable className="absolute right-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-white shadow-md active:scale-95">
              <Ionicons name="heart-outline" size={20} color="#1a1a2e" />
            </Pressable>
          </View>

          {/* Item Info */}
          <View className="px-6 pt-5">
            <Text className="text-xl font-bold text-foreground">
              {item.name}
            </Text>
            <Text className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {item.description}
            </Text>
            <Text className="text-xl font-bold text-[#00B37A] mt-2">
              ${item.price.toFixed(2)}
            </Text>
          </View>

          {/* Divider */}
          <View className="h-px bg-border mx-6 my-4" />

          {/* Size Options — Required */}
          <View className="px-6">
            <View className="flex-row items-center gap-2 mb-3">
              <Text className="text-base font-bold text-foreground">Size</Text>
              <View className="rounded-md bg-red-100 px-2 py-0.5">
                <Text className="text-[11px] font-bold text-red-600">
                  Required
                </Text>
              </View>
            </View>

            <View className="gap-3">
              {item.sizes.map((size, idx) => {
                const isSelected = selectedSize === idx;
                return (
                  <Pressable
                    key={size.label}
                    onPress={() => setSelectedSize(idx)}
                    className="flex-row items-center justify-between py-1"
                  >
                    <View className="flex-row items-center">
                      {/* Radio */}
                      <View
                        className={`h-5.5 w-5.5 items-center justify-center rounded-full border-2 mr-3 ${
                          isSelected
                            ? "border-[#00B37A] bg-[#00B37A]"
                            : "border-border bg-transparent"
                        }`}
                      >
                        {isSelected && (
                          <View className="h-2.5 w-2.5 rounded-full bg-white" />
                        )}
                      </View>
                      <Text className="text-sm font-medium text-foreground">
                        {size.label}
                      </Text>
                    </View>
                    <Text className="text-sm font-medium text-foreground">
                      ${size.price.toFixed(2)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Divider */}
          <View className="h-px bg-border mx-6 my-4" />

          {/* Extra Toppings — Optional */}
          <View className="px-6">
            <View className="flex-row items-center gap-2 mb-3">
              <Text className="text-base font-bold text-foreground">
                Extra Toppings
              </Text>
              <View className="rounded-md bg-muted px-2 py-0.5">
                <Text className="text-[11px] font-semibold text-muted-foreground">
                  Optional
                </Text>
              </View>
            </View>

            <View className="gap-3">
              {item.toppings.map((topping, idx) => {
                const isChecked = !!selectedToppings[idx];
                return (
                  <Pressable
                    key={topping.label}
                    onPress={() => toggleTopping(idx)}
                    className="flex-row items-center justify-between py-1"
                  >
                    <View className="flex-row items-center">
                      {/* Checkbox */}
                      <View
                        className={`h-5.5 w-5.5 items-center justify-center rounded-md border-2 mr-3 ${
                          isChecked
                            ? "border-[#00B37A] bg-[#00B37A]"
                            : "border-border bg-transparent"
                        }`}
                      >
                        {isChecked && (
                          <Feather name="check" size={14} color="#ffffff" />
                        )}
                      </View>
                      <Text className="text-sm font-medium text-foreground">
                        {topping.label}
                      </Text>
                    </View>
                    <Text className="text-sm font-medium text-muted-foreground">
                      + ${topping.price.toFixed(2)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Fixed: Quantity + Add to Cart */}
        <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-6 pb-8 pt-4 flex-row items-center gap-4">
          {/* Quantity Stepper */}
          <View className="flex-row items-center rounded-xl border border-border bg-card">
            <Pressable
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              className="h-11 w-11 items-center justify-center active:bg-muted rounded-l-xl"
            >
              <Feather name="minus" size={18} color={isDark ? "#f0f0f5" : "#1a1a2e"} />
            </Pressable>
            <Text className="w-8 text-center text-base font-bold text-foreground">
              {quantity}
            </Text>
            <Pressable
              onPress={() => setQuantity((q) => q + 1)}
              className="h-11 w-11 items-center justify-center active:bg-muted rounded-r-xl"
            >
              <Feather name="plus" size={18} color={isDark ? "#f0f0f5" : "#1a1a2e"} />
            </Pressable>
          </View>

          {/* Add to Cart Button */}
          <Pressable
            onPress={handleAddToCart}
            className="flex-1 h-12 flex-row items-center justify-center rounded-xl bg-[#00B37A] active:bg-primary-dark shadow-sm"
          >
            <Text className="text-[15px] font-bold text-white">
              Add to Cart — ${total.toFixed(2)}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// Default exportable menu item data for reuse
export const SAMPLE_MENU_ITEM: MenuItem = {
  id: "1",
  name: "Classic Cheeseburger",
  description:
    "Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce",
  price: 8.99,
  image:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
  sizes: [
    { label: "Regular", price: 0 },
    { label: "Large", price: 2.0 },
    { label: "Extra Large", price: 3.5 },
  ],
  toppings: [
    { label: "Extra Cheese", price: 1.5 },
    { label: "Bacon", price: 2.0 },
    { label: "Jalapeños", price: 0.75 },
  ],
};

export type { MenuItem };
