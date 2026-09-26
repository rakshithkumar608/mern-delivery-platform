import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import { MenuItem } from "@/lib/api";
import { toast } from "@/lib/sonner";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BRAND_TEAL = "#006B5B";


interface ItemDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  item: MenuItem | null;
  currency?: string;
  onAddToCart?: (customizedItem: {
    item: MenuItem;
    selectedSize: { label: string; price: number };
    selectedExtras: { label: string; price: number }[];
    selectedRemovals: string[];
    specialInstructions: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }) => void;
}

export function ItemDetailSheet({
  visible,
  onClose,
  item,
  currency = "£",
  onAddToCart,
}: ItemDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  // Sizes: default to Margherita sizes or item sizes
  const sizes = useMemo(() => {
    if (item?.sizes && item.sizes.length > 0) {
      return item.sizes.map((s) => ({
        label: s.label,
        // If price is 0 or less than base price, treat as offset or full price
        price:
          s.price === 0 || s.price < (item.price ?? 0)
            ? Number(((item.price ?? 4.29) + s.price).toFixed(2))
            : s.price,
      }));
    }
    return [
      { label: 'Regular (10")', price: item?.price ?? 4.29 },
      { label: 'Large (12")', price: Number(((item?.price ?? 4.29) + 1.2).toFixed(2)) },
      { label: 'Extra Large (14")', price: Number(((item?.price ?? 4.29) + 2.2).toFixed(2)) },
    ];
  }, [item]);

  // Extras / Add-ons: default to Margherita extras if not provided
  const extras = useMemo(() => {
    if (item?.extras && item.extras.length > 0) {
      return item.extras;
    }
    if (item?.toppings && item.toppings.length > 0) {
      return item.toppings;
    }
    return [
      { label: "Extra Mozzarella", price: 1.0 },
      { label: "Rocket", price: 0.8 },
      { label: "Cherry Tomatoes", price: 0.8 },
    ];
  }, [item]);

  // Removables: default to "No Cheese", "No Basil"
  const removables = useMemo(() => {
    if (item?.removables && item.removables.length > 0) {
      return item.removables.map((r) =>
        r.toLowerCase().startsWith("no ") ? r : `No ${r}`
      );
    }
    return ["No Cheese", "No Basil"];
  }, [item]);

  // Calories and allergens
  const calories = item?.calories || 680;
  const allergensText = useMemo(() => {
    if (item?.allergens && item.allergens.length > 0) {
      return item.allergens.join(", ");
    }
    return "Milk, Gluten";
  }, [item]);

  // State
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [selectedExtras, setSelectedExtras] = useState<Record<number, boolean>>({});
  const [selectedRemovals, setSelectedRemovals] = useState<Record<number, boolean>>({});
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Reset selections when item changes or modal opens
  useEffect(() => {
    if (visible) {
      setSelectedSizeIndex(0);
      setSelectedExtras({});
      setSelectedRemovals({});
      setSpecialInstructions("");
      setQuantity(1);
    }
  }, [visible, item]);

  if (!item) return null;

  // Price computation
  const currentSize = sizes[selectedSizeIndex] || sizes[0];
  const extrasTotal = Object.entries(selectedExtras)
    .filter(([, checked]) => checked)
    .reduce((sum, [idx]) => sum + (extras[Number(idx)]?.price || 0), 0);

  const unitPrice = currentSize.price + extrasTotal;
  const totalPrice = Number((unitPrice * quantity).toFixed(2));

  const toggleExtra = (idx: number) => {
    setSelectedExtras((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleRemoval = (idx: number) => {
    setSelectedRemovals((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleAdd = () => {
    const customizedItem = {
      item,
      selectedSize: currentSize,
      selectedExtras: Object.entries(selectedExtras)
        .filter(([, checked]) => checked)
        .map(([idx]) => extras[Number(idx)]),
      selectedRemovals: Object.entries(selectedRemovals)
        .filter(([, checked]) => checked)
        .map(([idx]) => removables[Number(idx)]),
      specialInstructions: specialInstructions.trim(),
      quantity,
      unitPrice,
      totalPrice,
    };

    if (onAddToCart) {
      onAddToCart(customizedItem);
    } else {
      toast.success(
        `Added ${quantity}× ${item.name} (${currency}${totalPrice.toFixed(2)}) to your basket! 🍕`
      );
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <Pressable className="flex-1 bg-black/60" onPress={onClose}>
          <View className="flex-1" />
        </Pressable>

        {/* ─── MODAL CONTAINER ─── */}
        <View
          className="rounded-t-[32px] bg-background border-t border-border shadow-2xl overflow-hidden"
          style={{ maxHeight: "92%" }}
        >
          {/* Top Handle Bar */}
          <View className="items-center pt-3 pb-1">
            <View className="w-12 h-1.5 rounded-full bg-muted-foreground/25" />
          </View>

          {/* Top Bar: Close (X) & Favorite Heart */}
          <View className="flex-row items-center justify-between px-5 pt-1 pb-2">
            <Pressable
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full active:bg-muted"
            >
              <Feather
                name="x"
                size={22}
                color={isDark ? "#f0f0f5" : "#1a1a2e"}
              />
            </Pressable>

            <Pressable
              onPress={() => {
                setIsFavorite(!isFavorite);
                toast.success(
                  isFavorite
                    ? "Removed from saved items"
                    : `Saved ${item.name} to favorites ❤️`
                );
              }}
              className="h-9 w-9 items-center justify-center rounded-full active:bg-muted"
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? "#E53E3E" : isDark ? "#f0f0f5" : "#1a1a2e"}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 110 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* ─── DISH HERO IMAGE ─── */}
            <View className="items-center justify-center px-6 py-2">
              <Image
                source={{ uri: item.image }}
                style={{
                  width: SCREEN_WIDTH - 64,
                  height: 200,
                  borderRadius: 24,
                }}
                contentFit="cover"
                transition={300}
              />
            </View>

            {/* ─── DISH INFO ─── */}
            <View className="px-6 pt-3">
              <Text className="text-2xl font-black text-foreground tracking-tight">
                {item.name}
              </Text>

              {/* Price & Calories */}
              <View className="flex-row items-center gap-1.5 mt-1">
                <Text className="text-base font-bold text-foreground">
                  {currency}{item.price.toFixed(2)}
                </Text>
                <Text className="text-sm font-semibold text-muted-foreground">
                  • {calories} kcal
                </Text>
              </View>

              {/* Description */}
              <Text className="text-sm text-muted-foreground mt-2 leading-relaxed font-normal">
                {item.description}
              </Text>

              {/* Allergen Info */}
              <View className="flex-row items-center gap-1.5 mt-2.5">
                <Feather name="info" size={13} color="#9CA3AF" />
                <Text className="text-xs text-muted-foreground">
                  Contains: <Text className="font-semibold">{allergensText}.</Text>
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-border mx-6 my-4" />

            {/* ─── SECTION 1: CHOOSE SIZE (REQUIRED) ─── */}
            <View className="px-6">
              <View className="flex-row items-center mb-3">
                <Text className="text-sm font-bold text-foreground">
                  Choose size
                </Text>
                <Text className="text-xs text-muted-foreground ml-1 font-normal">
                  (required)
                </Text>
              </View>

              <View className="gap-3">
                {sizes.map((size, index) => {
                  const isSelected = selectedSizeIndex === index;
                  return (
                    <Pressable
                      key={size.label}
                      onPress={() => setSelectedSizeIndex(index)}
                      className="flex-row items-center justify-between py-1 active:opacity-80"
                    >
                      <View className="flex-row items-center gap-3">
                        {/* Radio Button */}
                        <View
                          className={`h-5 w-5 rounded-full border-2 items-center justify-center ${
                            isSelected
                              ? "border-[#006B5B]"
                              : "border-muted-foreground/50"
                          }`}
                        >
                          {isSelected && (
                            <View className="h-2.5 w-2.5 rounded-full bg-[#006B5B]" />
                          )}
                        </View>
                        <Text
                          className={`text-sm ${
                            isSelected
                              ? "font-bold text-foreground"
                              : "font-medium text-foreground"
                          }`}
                        >
                          {size.label}
                        </Text>
                      </View>

                      <Text className="text-sm font-semibold text-foreground">
                        {currency}{size.price.toFixed(2)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-border mx-6 my-4" />

            {/* ─── SECTION 2: ADD EXTRAS (OPTIONAL) ─── */}
            <View className="px-6">
              <View className="flex-row items-center mb-3">
                <Text className="text-sm font-bold text-foreground">
                  Add extras
                </Text>
                <Text className="text-xs text-muted-foreground ml-1 font-normal">
                  (optional)
                </Text>
              </View>

              <View className="gap-3">
                {extras.map((extra, index) => {
                  const isChecked = !!selectedExtras[index];
                  return (
                    <Pressable
                      key={extra.label}
                      onPress={() => toggleExtra(index)}
                      className="flex-row items-center justify-between py-1 active:opacity-80"
                    >
                      <View className="flex-row items-center gap-3">
                        {/* Checkbox */}
                        <View
                          className={`h-5 w-5 rounded-md border-2 items-center justify-center ${
                            isChecked
                              ? "border-[#006B5B] bg-[#006B5B]"
                              : "border-muted-foreground/50 bg-transparent"
                          }`}
                        >
                          {isChecked && (
                            <Feather name="check" size={13} color="#ffffff" />
                          )}
                        </View>
                        <Text className="text-sm font-medium text-foreground">
                          {extra.label}
                        </Text>
                      </View>

                      <Text className="text-sm font-semibold text-foreground">
                        {currency}{extra.price.toFixed(2)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-border mx-6 my-4" />

            {/* ─── SECTION 3: REMOVE (OPTIONAL) ─── */}
            <View className="px-6">
              <View className="flex-row items-center mb-3">
                <Text className="text-sm font-bold text-foreground">
                  Remove
                </Text>
                <Text className="text-xs text-muted-foreground ml-1 font-normal">
                  (optional)
                </Text>
              </View>

              <View className="gap-3">
                {removables.map((rem, index) => {
                  const isChecked = !!selectedRemovals[index];
                  return (
                    <Pressable
                      key={rem}
                      onPress={() => toggleRemoval(index)}
                      className="flex-row items-center justify-between py-1 active:opacity-80"
                    >
                      <View className="flex-row items-center gap-3">
                        {/* Checkbox */}
                        <View
                          className={`h-5 w-5 rounded-md border-2 items-center justify-center ${
                            isChecked
                              ? "border-[#006B5B] bg-[#006B5B]"
                              : "border-muted-foreground/50 bg-transparent"
                          }`}
                        >
                          {isChecked && (
                            <Feather name="check" size={13} color="#ffffff" />
                          )}
                        </View>
                        <Text className="text-sm font-medium text-foreground">
                          {rem}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-border mx-6 my-4" />

            {/* ─── SECTION 4: ADD A NOTE (OPTIONAL) ─── */}
            <View className="px-6">
              <View className="flex-row items-center mb-2">
                <Text className="text-sm font-bold text-foreground">
                  Add a note
                </Text>
                <Text className="text-xs text-muted-foreground ml-1 font-normal">
                  (optional)
                </Text>
              </View>

              <TextInput
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                placeholder="E.g. Extra crispy base, no onion"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                className="h-12 rounded-xl border border-border bg-card px-4 text-sm text-foreground"
              />
            </View>
          </ScrollView>

          {/* ─── FIXED DOCKED BOTTOM ACTION AREA ─── */}
          <View
            className="border-t border-border bg-background px-6 pt-3"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            {/* Quantity Selector (- 1 +) */}
            <View className="flex-row items-center justify-center gap-6 mb-3">
              <Pressable
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-8 w-8 items-center justify-center rounded-full border border-border active:bg-muted"
                disabled={quantity <= 1}
                style={{ opacity: quantity <= 1 ? 0.4 : 1 }}
              >
                <Feather
                  name="minus"
                  size={16}
                  color={isDark ? "#f0f0f5" : "#1a1a2e"}
                />
              </Pressable>

              <Text className="text-base font-bold text-foreground w-6 text-center">
                {quantity}
              </Text>

              <Pressable
                onPress={() => setQuantity((q) => q + 1)}
                className="h-8 w-8 items-center justify-center rounded-full border border-border active:bg-muted"
              >
                <Feather
                  name="plus"
                  size={16}
                  color={isDark ? "#f0f0f5" : "#1a1a2e"}
                />
              </Pressable>
            </View>

            {/* Big "Add for £X.XX" Button */}
            <Pressable
              onPress={handleAdd}
              className="h-13 w-full items-center justify-center rounded-2xl active:opacity-95 shadow-md"
              style={{
                backgroundColor: "#006B5B",
                shadowColor: "#006B5B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text className="text-base font-bold text-white tracking-wide">
                Add for {currency}{totalPrice.toFixed(2)}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
