import { Feather, Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import { MenuItem, fetchDishByIdQueryFn } from "@/lib/api";
import { toast } from "@/lib/sonner";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Brand teal color from v2 design reference
const BRAND_TEAL = "#006B5B";

const FALLBACK_DISH: MenuItem = {
  _id: "bi_4",
  id: "bi_4",
  name: "Classic Margherita",
  description:
    "San Marzano tomato sauce, fior di latte mozzarella, fresh basil and extra virgin olive oil.",
  price: 4.29,
  calories: 680,
  image:
    "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=80",
  category: "Pizza",
  rating: 4.7,
  reviewCount: 520,
  isPopular: true,
  isAvailable: true,
  sizes: [
    { label: 'Regular (10")', price: 4.29 },
    { label: 'Large (12")', price: 5.49 },
    { label: 'Extra Large (14")', price: 6.49 },
  ],
  extras: [
    { label: "Extra Mozzarella", price: 1.0 },
    { label: "Rocket", price: 0.8 },
    { label: "Cherry Tomatoes", price: 0.8 },
  ],
  removables: ["No Cheese", "No Basil"],
  allergens: ["Milk", "Gluten"],
};

export default function DishDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  const dishId = id || "bi_4";

  // Fetch dish from API
  const { data: dishData } = useQuery({
    queryKey: ["dish", dishId],
    queryFn: () => fetchDishByIdQueryFn(dishId),
    retry: 1,
  });

  const dish: MenuItem = dishData?.item ?? FALLBACK_DISH;
  const currency = dishData?.restaurant?.currency || "£";

  // Sizes
  const sizes = useMemo(() => {
    if (dish.sizes && dish.sizes.length > 0) {
      return dish.sizes.map((s) => ({
        label: s.label,
        price:
          s.price === 0 || s.price < dish.price
            ? Number((dish.price + s.price).toFixed(2))
            : s.price,
      }));
    }
    return [
      { label: 'Regular (10")', price: dish.price },
      { label: 'Large (12")', price: Number((dish.price + 1.2).toFixed(2)) },
      { label: 'Extra Large (14")', price: Number((dish.price + 2.2).toFixed(2)) },
    ];
  }, [dish]);

  // Extras
  const extras = useMemo(() => {
    if (dish.extras && dish.extras.length > 0) return dish.extras;
    if (dish.toppings && dish.toppings.length > 0) return dish.toppings;
    return [
      { label: "Extra Mozzarella", price: 1.0 },
      { label: "Rocket", price: 0.8 },
      { label: "Cherry Tomatoes", price: 0.8 },
    ];
  }, [dish]);

  // Removables
  const removables = useMemo(() => {
    if (dish.removables && dish.removables.length > 0) {
      return dish.removables.map((r) =>
        r.toLowerCase().startsWith("no ") ? r : `No ${r}`
      );
    }
    return ["No Cheese", "No Basil"];
  }, [dish]);

  const calories = dish.calories || 680;
  const allergensText = dish.allergens?.join(", ") || "Milk, Gluten";

  // Form states
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [selectedExtras, setSelectedExtras] = useState<Record<number, boolean>>({});
  const [selectedRemovals, setSelectedRemovals] = useState<Record<number, boolean>>({});
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Price computation
  const currentSize = sizes[selectedSizeIndex] || sizes[0];
  const extrasTotal = Object.entries(selectedExtras)
    .filter(([, checked]) => checked)
    .reduce((sum, [idx]) => sum + (extras[Number(idx)]?.price || 0), 0);

  const unitPrice = currentSize.price + extrasTotal;
  const totalPrice = Number((unitPrice * quantity).toFixed(2));

  const toggleExtra = (idx: number) => {
    setSelectedExtras((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleRemoval = (idx: number) => {
    setSelectedRemovals((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      const restaurantSlug =
        dishData?.restaurant?.slug || dishData?.restaurant?._id;
      if (restaurantSlug) {
        router.replace(`/restaurant/${restaurantSlug}`);
      } else {
        router.replace("/");
      }
    }
  };

  const handleAddToCart = () => {
    toast.success(
      `Added ${quantity}× ${dish.name} (${currency}${totalPrice.toFixed(2)}) to your basket! 🍕`
    );
    handleGoBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Top Drag Indicator Handle */}
      <View
        className="items-center pt-2.5 pb-1"
        style={{ paddingTop: Math.max(insets.top, 10) }}
      >
        <View className="h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700" />
      </View>

      {/* Top Floating Action Bar: Close (X) & Favorite Heart */}
      <View className="flex-row items-center justify-between px-5 py-1">
        <Pressable
          onPress={handleGoBack}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
          hitSlop={8}
        >
          <Feather
            name="x"
            size={24}
            color={isDark ? "#f0f0f5" : "#1a1a2e"}
          />
        </Pressable>

        <Pressable
          onPress={() => {
            setIsFavorite(!isFavorite);
            toast.success(
              isFavorite
                ? "Removed from favorites"
                : `Saved ${dish.name} to favorites ❤️`
            );
          }}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
          hitSlop={8}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#E53E3E" : isDark ? "#f0f0f5" : "#1a1a2e"}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Dish Hero Image (Perspective presentation matching v2 screenshot) */}
        <View className="items-center justify-center px-6 py-2">
          <Image
            source={{ uri: dish.image }}
            style={{
              width: SCREEN_WIDTH - 56,
              height: 220,
              borderRadius: 20,
            }}
            contentFit="cover"
            transition={300}
          />
        </View>

        {/* Dish Info */}
        <View className="px-6 pt-3">
          <Text className="text-[24px] font-bold text-foreground tracking-tight">
            {dish.name}
          </Text>

          {/* Price & Calories */}
          <View className="flex-row items-center gap-1.5 mt-1">
            <Text className="text-base font-bold text-foreground">
              {currency}{dish.price.toFixed(2)}
            </Text>
            <Text className="text-sm font-semibold text-muted-foreground">
              • {calories} kcal
            </Text>
          </View>

          {/* Description */}
          <Text className="text-sm text-muted-foreground mt-2 leading-[22px] font-normal">
            {dish.description}
          </Text>

          {/* Allergens Notice */}
          <View className="flex-row items-center gap-1.5 mt-3">
            <Feather
              name="info"
              size={14}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
            <Text className="text-xs text-muted-foreground">
              Contains:{" "}
              <Text className="font-semibold text-foreground/85">
                {allergensText}.
              </Text>
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
            <Text className="text-xs text-muted-foreground ml-1.5 font-normal">
              (required)
            </Text>
          </View>

          <View className="gap-3.5">
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
                          : "border-neutral-300 dark:border-neutral-600"
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
            <Text className="text-xs text-muted-foreground ml-1.5 font-normal">
              (optional)
            </Text>
          </View>

          <View className="gap-3.5">
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
                          : "border-neutral-300 dark:border-neutral-600 bg-transparent"
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
            <Text className="text-xs text-muted-foreground ml-1.5 font-normal">
              (optional)
            </Text>
          </View>

          <View className="gap-3.5">
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
                          : "border-neutral-300 dark:border-neutral-600 bg-transparent"
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
            <Text className="text-xs text-muted-foreground ml-1.5 font-normal">
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

      {/* ─── DOCKED BOTTOM ACTION AREA ─── */}
      <View
        className="border-t border-border bg-background px-6 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {/* Quantity Stepper (- 1 +) */}
        <View className="flex-row items-center justify-center gap-6 mb-3">
          <Pressable
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-8 w-8 items-center justify-center rounded-full border border-border active:bg-muted"
            disabled={quantity <= 1}
            style={{ opacity: quantity <= 1 ? 0.4 : 1 }}
            hitSlop={6}
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
            hitSlop={6}
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
          onPress={handleAddToCart}
          className="h-13 w-full items-center justify-center rounded-2xl active:opacity-95 shadow-md"
          style={{
            backgroundColor: BRAND_TEAL,
            shadowColor: BRAND_TEAL,
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
    </KeyboardAvoidingView>
  );
}
