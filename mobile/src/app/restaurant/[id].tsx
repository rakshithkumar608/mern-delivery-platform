import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import {
  ItemDetailSheet,
} from "@/components/item-detail-sheet";
import {
  MenuItem,
  Restaurant,
  fetchRestaurantByIdQueryFn,
} from "@/lib/api";
import { toast } from "@/lib/sonner";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COVER_HEIGHT = 270;

// ─── Default Fallback Data (Bella Italia matching reference design) ───────────

const BELLA_ITALIA_ITEMS: MenuItem[] = [
  {
    _id: "bi_1",
    id: "bi_1",
    name: "Spaghetti Carbonara",
    description:
      "Spaghetti tossed with crispy guanciale, pecorino romano, egg yolk, and freshly cracked black pepper.",
    price: 6.49,
    image:
      "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop&q=80",
    category: "Pasta",
    rating: 4.6,
    reviewCount: 812,
    isPopular: true,
    isAvailable: true,
    sizes: [
      { label: "Regular", price: 0 },
      { label: "Large", price: 2.0 },
    ],
    toppings: [
      { label: "Extra Pecorino", price: 1.0 },
      { label: "Crispy Pancetta", price: 1.5 },
    ],
    allergens: ["Gluten", "Dairy", "Eggs"],
  },
  {
    _id: "bi_2",
    id: "bi_2",
    name: "Penne Arrabbiata",
    description:
      "Penne pasta in a fiery San Marzano tomato sauce infused with garlic, fresh basil, and red chilli flakes.",
    price: 5.49,
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
    category: "Pasta",
    rating: 4.5,
    reviewCount: 642,
    isPopular: true,
    isAvailable: true,
    sizes: [
      { label: "Regular", price: 0 },
      { label: "Large", price: 1.8 },
    ],
    toppings: [{ label: "Fresh Burrata on top", price: 2.5 }],
    allergens: ["Gluten"],
  },
  {
    _id: "bi_3",
    id: "bi_3",
    name: "Tiramisu Classico",
    description:
      "Savoiardi ladyfingers soaked in espresso liqueur, layered with velvet mascarpone cream and dusted with raw cocoa.",
    price: 4.7,
    image:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80",
    category: "Desserts",
    rating: 4.8,
    reviewCount: 410,
    isPopular: true,
    isAvailable: true,
    sizes: [{ label: "Single Slice", price: 0 }],
    toppings: [{ label: "Chocolate Curls", price: 0.8 }],
    allergens: ["Gluten", "Dairy", "Eggs"],
  },
  {
    _id: "bi_4",
    id: "bi_4",
    name: "Classic Margherita",
    description:
      "San Marzano tomato sauce, fior di latte mozzarella, fresh basil and extra virgin olive oil.",
    price: 4.29,
    calories: 680,
    image:
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80",
    category: "Pizza",
    rating: 4.7,
    reviewCount: 520,
    isPopular: false,
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
  },
  {
    _id: "bi_5",
    id: "bi_5",
    name: "Garlic Bread",
    description:
      "With garlic butter, fresh parsley, and toasted artisan crust.",
    price: 3.49,
    image:
      "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&auto=format&fit=crop&q=80",
    category: "Sides",
    rating: 4.5,
    reviewCount: 290,
    isPopular: false,
    isAvailable: true,
    sizes: [{ label: "Regular", price: 0 }],
    toppings: [{ label: "Melted Mozzarella", price: 1.2 }],
    allergens: ["Gluten", "Dairy"],
  },
  {
    _id: "bi_6",
    id: "bi_6",
    name: "Coca-Cola",
    description: "330ml chilled can, crisp and refreshing.",
    price: 1.5,
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80",
    category: "Sides",
    rating: 4.9,
    reviewCount: 890,
    isPopular: false,
    isAvailable: true,
    sizes: [{ label: "330ml Can", price: 0 }],
    toppings: [],
    allergens: [],
  },
  {
    _id: "bi_7",
    id: "bi_7",
    name: "Diavola Spicy Pepperoni",
    description:
      "Spicy Calabrian salami, crushed plum tomato sauce, mozzarella, chili oil, and hot honey.",
    price: 5.99,
    image:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80",
    category: "Pizza",
    rating: 4.6,
    reviewCount: 388,
    isPopular: false,
    isAvailable: true,
    sizes: [
      { label: '10" Medium', price: 0 },
      { label: '12" Large', price: 2.5 },
    ],
    toppings: [{ label: "Extra Jalapeños", price: 0.75 }],
    allergens: ["Gluten", "Dairy"],
  },
];

const FALLBACK_RESTAURANT: Restaurant = {
  _id: "bella-italia",
  id: "bella-italia",
  name: "Bella Italia",
  slug: "bella-italia",
  description:
    "Authentic wood-fired Neapolitan pizzas, freshly rolled handmade pasta, and artisan Italian desserts crafted with traditional ingredients.",
  cuisineType: ["Italian", "Pizza", "Pasta"],
  coverImage:
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80",
  rating: 4.6,
  totalReviews: 812,
  deliveryTime: "25-35 min",
  distance: "1.2 miles",
  deliveryFee: 1.49,
  minOrder: 8.0,
  currency: "£",
  openingHours: "Closes 10:30 PM",
  offer: "20% off selected favourites",
  offerSubtitle: "Offer applies to items marked eligible.",
  allergensInfo:
    "Dishes may contain traces of gluten, dairy, celery, egg, or nuts. Please check with staff if you have specific dietary restrictions.",
  isFeatured: true,
  isActive: true,
  displayOrder: 1,
};

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  const restaurantId = id || "bella-italia";

  // TanStack Query: Fetch restaurant details and menu items
  const { data: detailData, isLoading } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => fetchRestaurantByIdQueryFn(restaurantId),
    retry: 1,
  });

  const restaurant: Restaurant = detailData?.restaurant ?? FALLBACK_RESTAURANT;
  const allDishes: MenuItem[] =
    detailData?.items && detailData.items.length > 0
      ? detailData.items
      : BELLA_ITALIA_ITEMS;

  const popularDishes: MenuItem[] =
    detailData?.popularItems && detailData.popularItems.length > 0
      ? detailData.popularItems
      : allDishes.filter((i) => i.isPopular);

  // Categories list
  const categories = useMemo(() => {
    const raw = detailData?.categories ?? Array.from(new Set(allDishes.map((i) => i.category)));
    return ["Popular", ...raw.filter((c) => c && c.toLowerCase() !== "popular")];
  }, [detailData, allDishes]);

  // Selected Category filter ("Popular" shows popular; specific category filters that category; or "All")
  const [activeCategory, setActiveCategory] = useState("Popular");
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllergensModal, setShowAllergensModal] = useState(false);

  // Cart state
  const [cartItemsCount, setCartItemsCount] = useState(3);
  const [cartTotal, setCartTotal] = useState(9.28);

  // Item detail bottom sheet
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [showItemSheet, setShowItemSheet] = useState(false);

  // Animated header on scroll
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const headerOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [100, 180], [0, 1], Extrapolation.CLAMP),
  }));

  // Filtered dishes for the menu list
  const displayedDishes = useMemo(() => {
    let list = allDishes;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      );
    } else if (activeCategory === "Popular") {
      // Show popular + other highlighted dishes
      list = allDishes;
    } else if (activeCategory) {
      list = allDishes.filter(
        (item) => item.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    return list;
  }, [allDishes, activeCategory, searchQuery]);

  const currencySymbol = restaurant.currency || "£";

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${restaurant.name} on Chowly! ${restaurant.description}`,
      });
    } catch {
      toast.info(`Shared ${restaurant.name}`);
    }
  };

  const handleAddItemDirectly = (dish: MenuItem) => {
    setCartItemsCount((prev) => prev + 1);
    setCartTotal((prev) => Number((prev + dish.price).toFixed(2)));
    toast.success(`Added ${dish.name} to basket! 🛒`);
  };

  const openCustomizationSheet = (dish: MenuItem) => {
    setSelectedItem(dish);
    setShowItemSheet(true);
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  const cuisineText = Array.isArray(restaurant.cuisineType)
    ? restaurant.cuisineType.join(" • ")
    : (restaurant as any).cuisine || "Italian • Pizza • Pasta";

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />

      {/* ─── STICKY HEADER (Appears on scroll) ─── */}
      <Animated.View
        style={[
          headerOpacity,
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 30,
            paddingTop: Math.max(insets.top, 14),
            paddingBottom: 10,
            paddingHorizontal: 16,
            backgroundColor: isDark ? "#17181f" : "#ffffff",
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#2a2d36" : "#E5E7EB",
          },
        ]}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={handleGoBack}
            className="h-9 w-9 items-center justify-center rounded-full bg-muted active:scale-95"
          >
            <Feather
              name="arrow-left"
              size={20}
              color={isDark ? "#f0f0f5" : "#1a1a2e"}
            />
          </Pressable>

          <Text
            className="text-base font-bold text-foreground text-center flex-1 px-3"
            numberOfLines={1}
          >
            {restaurant.name}
          </Text>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => setIsFavorite(!isFavorite)}
              className="h-9 w-9 items-center justify-center rounded-full bg-muted active:scale-95"
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={18}
                color={isFavorite ? "#E53E3E" : isDark ? "#f0f0f5" : "#1a1a2e"}
              />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ─── HERO COVER IMAGE & FLOATING BUTTONS ─── */}
        <View className="relative" style={{ height: COVER_HEIGHT }}>
          <Image
            source={{ uri: restaurant.coverImage }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={300}
          />
          {/* Subtle gradient overlay for contrast */}
          <View
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.22)" }}
          />

          {/* Floating Action Buttons */}
          <View
            className="absolute left-0 right-0 flex-row items-center justify-between px-4"
            style={{ top: Math.max(insets.top, 16) }}
          >
            {/* Back Button */}
            <Pressable
              onPress={handleGoBack}
              className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-md active:scale-95"
              style={{ shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
            >
              <Feather name="arrow-left" size={20} color="#1a1a2e" />
            </Pressable>

            {/* Right Group: Favorite, Share, Search */}
            <View className="flex-row items-center gap-2.5">
              <Pressable
                onPress={() => {
                  setIsFavorite(!isFavorite);
                  toast.success(
                    isFavorite
                      ? "Removed from favorites"
                      : `Saved ${restaurant.name} to favorites ❤️`
                  );
                }}
                className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-md active:scale-95"
                style={{ shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorite ? "#E53E3E" : "#1a1a2e"}
                />
              </Pressable>

              <Pressable
                onPress={handleShare}
                className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-md active:scale-95"
                style={{ shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
              >
                <Feather name="share" size={18} color="#1a1a2e" />
              </Pressable>

              <Pressable
                onPress={() => setShowSearch(!showSearch)}
                className={`h-10 w-10 items-center justify-center rounded-full shadow-md active:scale-95 ${
                  showSearch ? "bg-[#00B37A]" : "bg-white"
                }`}
                style={{ shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
              >
                <Feather
                  name="search"
                  size={18}
                  color={showSearch ? "#ffffff" : "#1a1a2e"}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* ─── OVERLAPPING RESTAURANT INFO CARD ─── */}
        <View className="-mt-8 rounded-t-4xl bg-card px-5 pt-5 border-t border-border shadow-md">
          {/* Restaurant Title & Cuisines */}
          <Text className="text-2xl font-black text-foreground tracking-tight">
            {restaurant.name}
          </Text>
          <Text className="text-sm text-muted-foreground mt-1 font-medium">
            {cuisineText}
          </Text>

          {/* Badges: Rating & Allergens button */}
          <View className="flex-row items-center gap-3 mt-3">
            <View className="flex-row items-center gap-1.5 bg-[#FFF9E6] dark:bg-amber-950/30 px-2.5 py-1 rounded-full">
              <Ionicons name="star" size={14} color="#FF7A00" />
              <Text className="text-xs font-bold text-[#E65100] dark:text-[#FFA726]">
                {restaurant.rating}
              </Text>
              <Text className="text-xs text-muted-foreground">
                ({restaurant.totalReviews})
              </Text>
            </View>

            <Pressable
              onPress={() => setShowAllergensModal(true)}
              className="flex-row items-center gap-1.5 border border-border px-3 py-1 rounded-full active:bg-muted"
            >
              <Feather name="info" size={13} color="#6B7280" />
              <Text className="text-xs font-semibold text-foreground">
                Allergens
              </Text>
            </Pressable>
          </View>

          {/* ─── 4-COLUMN META STATS (Exact replica of design screenshot) ─── */}
          <View className="flex-row items-center justify-between border-y border-border py-3.5 mt-4">
            {/* Delivery time */}
            <View className="flex-1 items-center">
              <View className="flex-row items-center gap-1">
                <Feather name="clock" size={13} color="#6B7280" />
                <Text className="text-xs font-bold text-foreground">
                  {restaurant.deliveryTime}
                </Text>
              </View>
              <Text className="text-[11px] text-muted-foreground mt-0.5">
                Delivery
              </Text>
            </View>

            <View className="h-6 w-px bg-border" />

            {/* Distance */}
            <View className="flex-1 items-center">
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text className="text-xs font-bold text-foreground">
                  {restaurant.distance}
                </Text>
              </View>
              <Text className="text-[11px] text-muted-foreground mt-0.5">
                Distance
              </Text>
            </View>

            <View className="h-6 w-px bg-border" />

            {/* Delivery fee */}
            <View className="flex-1 items-center">
              <View className="flex-row items-center gap-1">
                <Feather name="tag" size={13} color="#6B7280" />
                <Text className="text-xs font-bold text-foreground">
                  {restaurant.deliveryFee === 0
                    ? "Free"
                    : `${currencySymbol}${restaurant.deliveryFee.toFixed(2)}`}
                </Text>
              </View>
              <Text className="text-[11px] text-muted-foreground mt-0.5">
                Delivery fee
              </Text>
            </View>

            <View className="h-6 w-px bg-border" />

            {/* Minimum order */}
            <View className="flex-1 items-center">
              <View className="flex-row items-center gap-1">
                <Feather name="shopping-bag" size={13} color="#6B7280" />
                <Text className="text-xs font-bold text-foreground">
                  {currencySymbol}{restaurant.minOrder || 8}
                </Text>
              </View>
              <Text className="text-[11px] text-muted-foreground mt-0.5">
                Minimum
              </Text>
            </View>
          </View>

          {/* Closes / Status info */}
          <View className="flex-row items-center gap-1.5 pt-3">
            <Feather name="clock" size={14} color="#4B5563" />
            <Text className="text-xs font-medium text-muted-foreground">
              {restaurant.openingHours}
            </Text>
          </View>

          {/* ─── PROMO BANNER (20% off selected favourites) ─── */}
          {restaurant.offer ? (
            <Pressable
              onPress={() => toast.info(restaurant.offerSubtitle || "Offer applied automatically")}
              className="mt-3.5 flex-row items-center justify-between rounded-2xl p-3.5 active:opacity-95"
              style={{
                backgroundColor: isDark ? "rgba(234, 88, 12, 0.15)" : "#FFF3E6",
                borderWidth: 1,
                borderColor: isDark ? "rgba(234, 88, 12, 0.3)" : "#FFE0B2",
              }}
            >
              <View className="flex-row items-center flex-1 pr-2">
                <View
                  className="h-9 w-9 items-center justify-center rounded-xl mr-3"
                  style={{ backgroundColor: "#FF7A00" }}
                >
                  <MaterialCommunityIcons
                    name="ticket-percent-outline"
                    size={20}
                    color="#ffffff"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-foreground">
                    {restaurant.offer}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {restaurant.offerSubtitle || "Offer applies to items marked eligible."}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#FF7A00" />
            </Pressable>
          ) : null}

          {/* Search bar inside header if active */}
          {showSearch && (
            <View className="mt-3 flex-row items-center rounded-xl bg-muted px-3 py-2">
              <Feather name="search" size={16} color="#6B7280" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search menu dishes..."
                placeholderTextColor="#9CA3AF"
                className="ml-2 flex-1 text-sm text-foreground"
                autoFocus
              />
              {searchQuery ? (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Feather name="x" size={16} color="#6B7280" />
                </Pressable>
              ) : null}
            </View>
          )}

          {/* ─── "POPULAR WITH OTHER PEOPLE" CAROUSEL ─── */}
          {popularDishes.length > 0 && !searchQuery ? (
            <View className="mt-5">
              <Text className="text-base font-bold text-foreground mb-3">
                Popular with other people
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingRight: 4 }}
              >
                {popularDishes.map((dish) => (
                  <Pressable
                    key={dish._id || dish.id}
                    onPress={() => openCustomizationSheet(dish)}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm active:opacity-95"
                    style={{ width: 160 }}
                  >
                    <Image
                      source={{ uri: dish.image }}
                      style={{ width: "100%", height: 110 }}
                      contentFit="cover"
                      transition={200}
                    />
                    <View className="p-2.5">
                      <Text
                        className="text-sm font-bold text-foreground"
                        numberOfLines={1}
                      >
                        {dish.name}
                      </Text>
                      <View className="flex-row items-center justify-between mt-1">
                        <Text className="text-xs font-bold text-foreground">
                          {currencySymbol}{dish.price.toFixed(2)}
                        </Text>
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="star" size={11} color="#FF7A00" />
                          <Text className="text-[11px] font-semibold text-foreground">
                            {dish.rating || 4.6}
                          </Text>
                          <Text className="text-[10px] text-muted-foreground">
                            ({dish.reviewCount || 400})
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* ─── CATEGORY TABS & ALL DISHES LIST ─── */}
          <View className="mt-6 border-b border-border">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 20, paddingBottom: 10 }}
            >
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      setActiveCategory(cat);
                      if (searchQuery) setSearchQuery("");
                    }}
                    className="items-center"
                  >
                    <Text
                      className={`text-sm font-bold pb-1.5 ${
                        isActive
                          ? "text-[#00B37A]"
                          : "text-muted-foreground font-semibold"
                      }`}
                    >
                      {cat}
                    </Text>
                    {isActive ? (
                      <View className="h-0.5 w-full bg-[#00B37A] rounded-full" />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ─── DISHES LIST (WITH GREEN CIRCULAR PLUS BUTTON) ─── */}
          <View className="pt-3 pb-8">
            {displayedDishes.length === 0 ? (
              <View className="py-12 items-center justify-center">
                <Feather name="inbox" size={32} color="#9CA3AF" />
                <Text className="text-sm text-muted-foreground mt-2">
                  No dishes found matching your selection
                </Text>
              </View>
            ) : (
              displayedDishes.map((dish, idx) => (
                <View
                  key={dish._id || dish.id || idx}
                  className="flex-row items-center justify-between py-3.5 border-b border-border/60"
                >
                  {/* Left: Dish thumbnail */}
                  <Pressable
                    onPress={() => openCustomizationSheet(dish)}
                    className="active:opacity-85"
                  >
                    <Image
                      source={{ uri: dish.image }}
                      style={{ width: 72, height: 72, borderRadius: 14 }}
                      contentFit="cover"
                      transition={200}
                    />
                  </Pressable>

                  {/* Middle: Name, Description, Price */}
                  <Pressable
                    onPress={() => openCustomizationSheet(dish)}
                    className="flex-1 px-3.5 active:opacity-85"
                  >
                    <Text
                      className="text-sm font-bold text-foreground"
                      numberOfLines={1}
                    >
                      {dish.name}
                    </Text>
                    <Text
                      className="text-xs text-muted-foreground mt-0.5 leading-4"
                      numberOfLines={2}
                    >
                      {dish.description}
                    </Text>
                    <Text className="text-xs font-bold text-foreground mt-1.5">
                      {currencySymbol}{dish.price.toFixed(2)}
                    </Text>
                  </Pressable>

                  {/* Right: Circular Green Plus Button (Exact replica of design screenshot) */}
                  <Pressable
                    onPress={() => handleAddItemDirectly(dish)}
                    className="h-8 w-8 items-center justify-center rounded-full border border-[#00B37A] active:bg-[#00B37A]/15"
                  >
                    <Feather name="plus" size={17} color="#00B37A" />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {/* ─── FLOATING BASKET / CART PILL BAR (Exact replica of design screenshot) ─── */}
      {cartItemsCount > 0 && (
        <View
          className="absolute left-4 right-4"
          style={{ bottom: Math.max(insets.bottom + 10, 20) }}
        >
          <Pressable
            onPress={() =>
              toast.info(
                `Your basket contains ${cartItemsCount} items (${currencySymbol}${cartTotal.toFixed(
                  2
                )}). Checkout flow ready!`
              )
            }
            className="flex-row items-center justify-between rounded-2xl px-4 py-3.5 shadow-xl active:scale-[0.99]"
            style={{
              backgroundColor: "#007A5A",
              shadowColor: "#007A5A",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            {/* Left: Bag Icon + Count */}
            <View className="flex-row items-center gap-2.5">
              <View className="relative">
                <MaterialCommunityIcons
                  name="shopping-outline"
                  size={22}
                  color="#ffffff"
                />
                <View className="absolute -top-1 -right-1 h-3.5 w-3.5 items-center justify-center rounded-full bg-white">
                  <Text className="text-[9px] font-black text-[#007A5A]">
                    {cartItemsCount}
                  </Text>
                </View>
              </View>
              <Text className="text-sm font-bold text-white">
                {cartItemsCount} {cartItemsCount === 1 ? "item" : "items"}
              </Text>
            </View>

            {/* Right: View Basket • Total > */}
            <View className="flex-row items-center gap-1">
              <Text className="text-sm font-bold text-white">
                View Basket • {currencySymbol}{cartTotal.toFixed(2)}
              </Text>
              <Feather name="chevron-right" size={18} color="#ffffff" />
            </View>
          </Pressable>
        </View>
      )}

      {/* ─── ALLERGENS MODAL ─── */}
      <Modal
        visible={showAllergensModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAllergensModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/60 items-center justify-center p-6"
          onPress={() => setShowAllergensModal(false)}
        >
          <Pressable
            className="w-full max-w-sm rounded-3xl bg-card p-6 border border-border shadow-2xl"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <Feather name="alert-circle" size={20} color="#00B37A" />
                <Text className="text-lg font-bold text-foreground">
                  Allergen Information
                </Text>
              </View>
              <Pressable
                onPress={() => setShowAllergensModal(false)}
                className="h-8 w-8 items-center justify-center rounded-full bg-muted"
              >
                <Feather name="x" size={16} color="#6B7280" />
              </Pressable>
            </View>
            <Text className="text-sm text-muted-foreground leading-relaxed">
              {restaurant.allergensInfo ||
                "Dishes may contain or come into contact with common allergens such as dairy, gluten, nuts, and eggs. Please advise our staff or leave notes for dietary preferences."}
            </Text>
            <Pressable
              onPress={() => setShowAllergensModal(false)}
              className="mt-5 h-11 w-full items-center justify-center rounded-xl bg-[#00B37A] active:opacity-90"
            >
              <Text className="text-sm font-bold text-white">Understood</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ─── ITEM CUSTOMIZATION BOTTOM SHEET ─── */}
      <ItemDetailSheet
        visible={showItemSheet}
        onClose={() => setShowItemSheet(false)}
        item={selectedItem}
      />
    </View>
  );
}
