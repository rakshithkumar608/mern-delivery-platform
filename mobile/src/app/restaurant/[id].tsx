import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import {
  ItemDetailSheet,
  SAMPLE_MENU_ITEM,
} from "@/components/item-detail-sheet";
import type { MenuItem } from "@/components/item-detail-sheet";
import { toast } from "@/lib/sonner";

//  Data 

const RESTAURANTS: Record<
  string,
  {
    name: string;
    cuisine: string;
    rating: string;
    reviews: string;
    time: string;
    deliveryFee: string;
    coverImage: string;
    categories: string[];
    menu: Record<string, MenuItem[]>;
  }
> = {
  f1: {
    name: "Burger Palace",
    cuisine: "American, Burgers",
    rating: "4.7",
    reviews: "342",
    time: "25-35 min",
    deliveryFee: "$2.49 delivery",
    coverImage:
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=900&auto=format&fit=crop&q=80",
    categories: ["Burgers", "Sides", "Drinks", "Desserts"],
    menu: {
      Burgers: [
        {
          id: "m1",
          name: "Classic Cheeseburger",
          description:
            "Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce",
          price: 8.99,
          image:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80",
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
        },
        {
          id: "m2",
          name: "BBQ Bacon Burger",
          description:
            "Smoky BBQ sauce, crispy bacon, onion rings, and aged cheddar",
          price: 11.49,
          image:
            "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&auto=format&fit=crop&q=80",
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
        },
      ],
      Sides: [
        {
          id: "m3",
          name: "Loaded Fries",
          description:
            "Crispy golden fries topped with cheese sauce, bacon, and chives",
          price: 5.99,
          image:
            "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80",
          sizes: [
            { label: "Regular", price: 0 },
            { label: "Large", price: 1.5 },
          ],
          toppings: [
            { label: "Extra Cheese", price: 1.0 },
            { label: "Truffle Oil", price: 1.5 },
          ],
        },
      ],
      Drinks: [
        {
          id: "m4",
          name: "Craft Root Beer",
          description: "Handcrafted small-batch root beer, ice cold",
          price: 3.49,
          image:
            "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&auto=format&fit=crop&q=80",
          sizes: [
            { label: "Regular", price: 0 },
            { label: "Large", price: 1.0 },
          ],
          toppings: [],
        },
      ],
      Desserts: [
        {
          id: "m5",
          name: "Salted Caramel Shake",
          description: "Premium ice cream blended with salted caramel and cream",
          price: 6.99,
          image:
            "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop&q=80",
          sizes: [
            { label: "Regular", price: 0 },
            { label: "Large", price: 1.5 },
          ],
          toppings: [{ label: "Whipped Cream", price: 0.5 }],
        },
      ],
    },
  },
};

// Fallback for unknown IDs
const DEFAULT_RESTAURANT = RESTAURANTS.f1;

const COVER_HEIGHT = 260;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

//  Component 

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  const restaurant = RESTAURANTS[id ?? "f1"] ?? DEFAULT_RESTAURANT;
  const [activeCategory, setActiveCategory] = useState(
    restaurant.categories[0]
  );
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showItemSheet, setShowItemSheet] = useState(false);
  const [cartCount, setCartCount] = useState(2);
  const [cartTotal, setCartTotal] = useState(20.48);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const headerOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 160], [0, 1], Extrapolation.CLAMP),
  }));

  const openItemSheet = (item: MenuItem) => {
    setSelectedItem(item);
    setShowItemSheet(true);
  };

  const menuItems = restaurant.menu[activeCategory] ?? [];

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />

      {/* Sticky Compact Header (appears on scroll) */}
      <Animated.View
        style={[
          headerOpacity,
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: 12,
            paddingHorizontal: 20,
            backgroundColor: isDark ? "#1a1a2e" : "#ffffff",
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#2d2d4a" : "#e5e7eb",
          },
        ]}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full bg-muted active:scale-95"
          >
            <Feather
              name="arrow-left"
              size={20}
              color={isDark ? "#f0f0f5" : "#1a1a2e"}
            />
          </Pressable>
          <Text
            className="text-base font-bold text-foreground"
            numberOfLines={1}
          >
            {restaurant.name}
          </Text>
          <View className="w-9" />
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ─── COVER IMAGE ─── */}
        <View className="relative" style={{ height: COVER_HEIGHT }}>
          <Image
            source={{ uri: restaurant.coverImage }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={300}
          />
          {/* Dark gradient overlay */}
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(0,0,0,0.35)",
            }}
          />

          {/* Top Buttons */}
          <View
            className="absolute left-0 right-0 flex-row items-center justify-between px-5"
            style={{ top: Math.max(insets.top, 16) }}
          >
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md active:scale-95"
            >
              <Feather name="arrow-left" size={20} color="#1a1a2e" />
            </Pressable>
            <Pressable
              onPress={() => {
                setIsFavorite(!isFavorite);
                toast.success(
                  isFavorite
                    ? "Removed from favorites"
                    : `Saved ${restaurant.name} to favorites`
                );
              }}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md active:scale-95"
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? "#E53E3E" : "#1a1a2e"}
              />
            </Pressable>
          </View>

          {/* Restaurant Info Overlay */}
          <View className="absolute bottom-0 left-0 right-0 px-5 pb-5">
            <Text className="text-2xl font-bold text-white">
              {restaurant.name}
            </Text>
            <Text className="text-sm text-white/80 mt-0.5">
              {restaurant.cuisine}
            </Text>
            <View className="flex-row items-center gap-2 mt-2">
              <View className="flex-row items-center gap-1">
                <Ionicons name="star" size={13} color="#FFB800" />
                <Text className="text-sm font-bold text-white">
                  {restaurant.rating}
                </Text>
                <Text className="text-xs text-white/70">
                  ({restaurant.reviews})
                </Text>
              </View>
              <Text className="text-white/50">•</Text>
              <Text className="text-xs text-white/80">{restaurant.time}</Text>
              <Text className="text-white/50">•</Text>
              <Text className="text-xs text-white/80">
                {restaurant.deliveryFee}
              </Text>
            </View>
          </View>
        </View>

        {/* ─── CATEGORY TABS ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14 }}
          className="border-b border-border"
        >
          <View className="flex-row gap-6">
            {restaurant.categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <Pressable key={cat} onPress={() => setActiveCategory(cat)}>
                  <Text
                    className={`text-sm pb-2 ${
                      isActive
                        ? "text-[#00B37A] font-bold"
                        : "text-muted-foreground font-medium"
                    }`}
                  >
                    {cat}
                  </Text>
                  {isActive && (
                    <View className="h-0.5 bg-[#00B37A] rounded-full" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* ─── MENU ITEMS ─── */}
        <View className="px-5 pt-4 gap-4">
          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => openItemSheet(item)}
              className="flex-row items-start justify-between py-2 active:opacity-80"
            >
              <View className="flex-1 pr-4">
                <Text className="text-base font-bold text-foreground">
                  {item.name}
                </Text>
                <Text
                  className="text-sm text-muted-foreground mt-1 leading-relaxed"
                  numberOfLines={3}
                >
                  {item.description}
                </Text>
                <Text className="text-base font-bold text-[#00B37A] mt-2">
                  ${item.price.toFixed(2)}
                </Text>
              </View>
              <Image
                source={{ uri: item.image }}
                style={{ width: 80, height: 80, borderRadius: 12 }}
                contentFit="cover"
                transition={200}
              />
            </Pressable>
          ))}
        </View>
      </Animated.ScrollView>

      {/* ─── FLOATING CART BAR ─── */}
      {cartCount > 0 && (
        <View
          className="absolute left-5 right-5"
          style={{ bottom: Math.max(insets.bottom + 8, 24) }}
        >
          <Pressable
            onPress={() => toast.info("Cart screen coming in Board 3")}
            className="h-13 flex-row items-center justify-between rounded-2xl bg-[#00B37A] px-5 shadow-lg active:opacity-95"
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="cart" size={20} color="#ffffff" />
              <Text className="text-sm font-bold text-white">
                {cartCount} items — View Cart
              </Text>
            </View>
            <Text className="text-sm font-bold text-white">
              ${cartTotal.toFixed(2)}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Item Detail Bottom Sheet */}
      <ItemDetailSheet
        visible={showItemSheet}
        onClose={() => setShowItemSheet(false)}
        item={selectedItem}
      />
    </View>
  );
}
