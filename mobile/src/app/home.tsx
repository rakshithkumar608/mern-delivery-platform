import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import { AddressBottomSheet } from "@/components/address-bottom-sheet";
import {
  Category,
  Restaurant,
  fetchCategoriesQueryFn,
  fetchRestaurantsQueryFn,
  getImageUrl,
} from "@/lib/api";
import { toast } from "@/lib/sonner";

// ─── Local Assets Map ───────────────────────────────────────────────────────
const LOCAL_CATEGORY_IMAGES: Record<string, any> = {
  offers: require("../../assets/category-imgs/offer.png"),
  burgers: require("../../assets/category-imgs/burger.png"),
  pizza: require("../../assets/category-imgs/pizza.png"),
  sushi: require("../../assets/category-imgs/sushi.png"),
  healthy: require("../../assets/category-imgs/healthy.png"),
  desserts: require("../../assets/category-imgs/desserts.png"),
  drinks: require("../../assets/category-imgs/drinks.png"),
  jollof: require("../../assets/category-imgs/jollof.png"),
};

// ─── Data ───────────────────────────────────────────────────────────────────

const OFFERS = [
  {
    id: "o1",
    title: "20% off selected comfort favourites",
    cta: "Order now →",
    badge: "20%\nOFF",
    code: "CHOWLY20",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80",
    bg: "#FFF0E0",
    ctaColor: "#E85D3A",
    badgeBg: "#E53E3E",
  },
  {
    id: "o2",
    title: "Free delivery on your first 3 orders",
    cta: "Claim now →",
    badge: "FREE\nSHIP",
    code: "FREESHIP",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80",
    bg: "#E8F5E9",
    ctaColor: "#2E7D32",
    badgeBg: "#2E7D32",
  },
  {
    id: "o3",
    title: "Buy 1 Get 1 on all sushi rolls",
    cta: "Order now →",
    badge: "BOGO\nDEAL",
    code: "BOGOFEAST",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&auto=format&fit=crop&q=80",
    bg: "#EDE7F6",
    ctaColor: "#7B1FA2",
    badgeBg: "#7B1FA2",
  },
  {
    id: "o4",
    title: "30% off healthy bowls this week",
    cta: "Explore →",
    badge: "30%\nOFF",
    code: "HEALTHY30",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80",
    bg: "#FFF8E1",
    ctaColor: "#F57F17",
    badgeBg: "#EF6C00",
  },
];

const FALLBACK_CATEGORIES: Category[] = [
  {
    _id: "offers",
    name: "Offers",
    slug: "offers",
    image: "/assets/category-imgs/offer.png",
    backgroundColor: "#FEE2E2",
    textColor: "#DC2626",
    isActive: true,
    displayOrder: 1,
  },
  {
    _id: "burgers",
    name: "Burgers",
    slug: "burgers",
    image: "/assets/category-imgs/burger.png",
    backgroundColor: "#FFF3E0",
    textColor: "#D97706",
    isActive: true,
    displayOrder: 2,
  },
  {
    _id: "pizza",
    name: "Pizza",
    slug: "pizza",
    image: "/assets/category-imgs/pizza.png",
    backgroundColor: "#FFE4E6",
    textColor: "#E11D48",
    isActive: true,
    displayOrder: 3,
  },
  {
    _id: "sushi",
    name: "Sushi",
    slug: "sushi",
    image: "/assets/category-imgs/sushi.png",
    backgroundColor: "#EDE9FE",
    textColor: "#7C3AED",
    isActive: true,
    displayOrder: 4,
  },
  {
    _id: "healthy",
    name: "Healthy",
    slug: "healthy",
    image: "/assets/category-imgs/healthy.png",
    backgroundColor: "#DCFCE7",
    textColor: "#16A34A",
    isActive: true,
    displayOrder: 5,
  },
  {
    _id: "desserts",
    name: "Desserts",
    slug: "desserts",
    image: "/assets/category-imgs/desserts.png",
    backgroundColor: "#FCE7F3",
    textColor: "#DB2777",
    isActive: true,
    displayOrder: 6,
  },
  {
    _id: "drinks",
    name: "Drinks",
    slug: "drinks",
    image: "/assets/category-imgs/drinks.png",
    backgroundColor: "#E0F2FE",
    textColor: "#0284C7",
    isActive: true,
    displayOrder: 7,
  },
  {
    _id: "jollof",
    name: "Jollof",
    slug: "jollof",
    image: "/assets/category-imgs/jollof.png",
    backgroundColor: "#FEF3C7",
    textColor: "#B45309",
    isActive: true,
    displayOrder: 8,
  },
];


const FALLBACK_FEATURED = [
  {
    id: "bella-italia",
    _id: "bella-italia",
    slug: "bella-italia",
    name: "Bella Italia",
    cuisineType: ["Italian", "Pizza", "Pasta"],
    rating: 4.6,
    totalReviews: 812,
    deliveryTime: "25-35 min",
    deliveryFee: 1.49,
    currency: "£",
    coverImage:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
    isFeatured: true,
  },
  {
    id: "burger-palace",
    _id: "burger-palace",
    slug: "burger-palace",
    name: "Burger Palace",
    cuisineType: ["American", "Burgers"],
    rating: 4.7,
    totalReviews: 342,
    deliveryTime: "25-35 min",
    deliveryFee: 2.49,
    currency: "$",
    coverImage:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    isFeatured: true,
  },
  {
    id: "sakura-sushi",
    _id: "sakura-sushi",
    slug: "sakura-sushi",
    name: "Sakura Sushi",
    cuisineType: ["Japanese", "Sushi"],
    rating: 4.8,
    totalReviews: 215,
    deliveryTime: "30-40 min",
    deliveryFee: 0,
    currency: "$",
    coverImage:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80",
    isFeatured: true,
  },
];

const FALLBACK_NEARBY = [
  {
    id: "taco-fiesta",
    _id: "taco-fiesta",
    slug: "taco-fiesta",
    name: "Taco Fiesta",
    cuisineType: ["Mexican", "Street Food"],
    rating: 4.6,
    totalReviews: 198,
    deliveryTime: "20-30 min",
    deliveryFee: 1.99,
    currency: "$",
    coverImage:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&auto=format&fit=crop&q=80",
    isFeatured: false,
  },
  {
    id: "burger-craft-co",
    _id: "burger-craft-co",
    slug: "burger-craft-co",
    name: "Burger Craft Co.",
    cuisineType: ["American", "Burgers"],
    rating: 4.9,
    totalReviews: 412,
    deliveryTime: "15-25 min",
    deliveryFee: 0,
    currency: "$",
    coverImage:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&auto=format&fit=crop&q=80",
    isFeatured: false,
  },
  {
    id: "green-garden-bowl",
    _id: "green-garden-bowl",
    slug: "green-garden-bowl",
    name: "Green Garden Bowl",
    cuisineType: ["Healthy", "Salads"],
    rating: 4.7,
    totalReviews: 180,
    deliveryTime: "15-25 min",
    deliveryFee: 1.49,
    currency: "$",
    coverImage:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80",
    isFeatured: false,
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const OFFER_CARD_WIDTH = SCREEN_WIDTH - 48;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("home");
  const [deliveryLabel, setDeliveryLabel] = useState("Home");
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);

  // TanStack Query: Fetch food categories from API
  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategoriesQueryFn,
    staleTime: 1000 * 60 * 5,
  });

  const categoryList: Category[] =
    categoriesResponse?.categories && categoriesResponse.categories.length > 0
      ? categoriesResponse.categories
      : FALLBACK_CATEGORIES;

  // TanStack Query: Fetch restaurants from API (with category filter)
  const { data: restaurantsResponse, isLoading: isLoadingRestaurants } = useQuery({
    queryKey: ["restaurants", selectedCategory],
    queryFn: () =>
      fetchRestaurantsQueryFn(
        selectedCategory !== "all" ? { category: selectedCategory } : undefined
      ),
    staleTime: 1000 * 60 * 3,
  });

  const liveRestaurants = restaurantsResponse?.restaurants ?? [];
  const featuredList =
    liveRestaurants.length > 0
      ? liveRestaurants.filter((r) => r.isFeatured)
      : selectedCategory === "all"
      ? FALLBACK_FEATURED
      : FALLBACK_FEATURED.filter((r) =>
          r.cuisineType.some((c) =>
            c.toLowerCase().includes(selectedCategory.toLowerCase())
          )
        );

  const nearbyList =
    liveRestaurants.length > 0
      ? liveRestaurants.filter((r) => !r.isFeatured)
      : selectedCategory === "all"
      ? FALLBACK_NEARBY
      : FALLBACK_NEARBY.filter((r) =>
          r.cuisineType.some((c) =>
            c.toLowerCase().includes(selectedCategory.toLowerCase())
          )
        );

  // Auto-rotate offers every 3 seconds
  const offerListRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoRotate = useCallback(() => {
    timerRef.current = setInterval(() => {
      setActiveOfferIndex((prev) => {
        const next = (prev + 1) % OFFERS.length;
        offerListRef.current?.scrollToIndex({
          index: next,
          animated: true,
        });
        return next;
      });
    }, 3000);
  }, []);

  useEffect(() => {
    startAutoRotate();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoRotate]);

  const onOfferViewableChange = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveOfferIndex(viewableItems[0].index);
      }
    }
  ).current;

  const handleOfferScroll = () => {
    // Reset auto-rotate timer when user manually scrolls
    if (timerRef.current) clearInterval(timerRef.current);
    startAutoRotate();
  };

  // Category icon renderer
  const renderCategoryIcon = (
    icon: string,
    family: string,
    isSelected: boolean
  ) => {
    const color = isSelected ? "#00B37A" : isDark ? "#6b7280" : "#374151";
    const size = 22;
    if (family === "feather") {
      return <Feather name={icon as keyof typeof Feather.glyphMap} size={size} color={color} />;
    }
    if (family === "ionicons") {
      return <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
    }
    return (
      <MaterialCommunityIcons
        name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={size}
        color={color}
      />
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* ─── GREEN HEADER WITH CONCAVE CURVE ─── */}
      <View
        className="bg-[#00B37A] px-6 pb-14"
        style={{ paddingTop: Math.max(insets.top + 4, 20) }}
      >
        {/* Greeting + Address */}
        <Pressable
          onPress={() => setShowAddressSheet(true)}
          className="active:opacity-80"
        >
          <Text className="text-lg font-bold text-white">
            Hey, Alex 👋
          </Text>
          <View className="flex-row items-center gap-1 mt-1">
            <Ionicons name="location" size={14} color="#ffffff" />
            <Text className="text-sm font-medium text-white/90">
              Delivering to {deliveryLabel}
            </Text>
            <Feather name="chevron-down" size={14} color="rgba(255,255,255,0.8)" />
          </View>
        </Pressable>

        {/* Search Pill → navigates to /search */}
        <Pressable
          onPress={() => router.push("/search")}
          className="mt-4 h-11 flex-row items-center rounded-xl bg-white px-4 shadow-sm active:opacity-95"
        >
          <Feather name="search" size={18} color="#9ca3af" />
          <Text className="ml-2.5 flex-1 text-sm text-gray-400 font-sans">
            Search restaurants or dishes
          </Text>
        </Pressable>
      </View>

      {/* Concave curve overlay */}
      <View
        className="-mt-5 rounded-t-[28px] bg-background flex-1"
        style={{ overflow: "hidden" }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90 }}
        >
          {/* ─── CATEGORY ICONS (Unique pastel background circles + 3D assets) ─── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: 6,
            }}
          >
            <View className="flex-row items-center gap-4">
              {/* "All" category circle */}
              <Pressable
                onPress={() => setSelectedCategory("all")}
                className="items-center active:opacity-85"
                style={{ width: 56 }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    borderWidth: selectedCategory === "all" ? 2 : 1.5,
                    borderColor:
                      selectedCategory === "all"
                        ? "#00B37A"
                        : isDark
                        ? "#2a2d36"
                        : "#E5E7EB",
                    backgroundColor:
                      selectedCategory === "all"
                        ? isDark
                          ? "rgba(0,179,122,0.18)"
                          : "#E6F7F2"
                        : isDark
                        ? "rgba(255,255,255,0.06)"
                        : "#F3F4F6",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: selectedCategory === "all" ? "#00B37A" : "#000",
                    shadowOffset: { width: 0, height: selectedCategory === "all" ? 2 : 1 },
                    shadowOpacity: selectedCategory === "all" ? 0.2 : 0.04,
                    shadowRadius: selectedCategory === "all" ? 4 : 2,
                    elevation: selectedCategory === "all" ? 3 : 1,
                  }}
                >
                  <Feather
                    name="grid"
                    size={24}
                    color={
                      selectedCategory === "all"
                        ? "#00B37A"
                        : isDark
                        ? "#9CA3AF"
                        : "#4B5563"
                    }
                  />
                </View>
                <Text
                  className="mt-1.5 text-center font-sans"
                  style={{
                    fontSize: 11.5,
                    fontWeight: selectedCategory === "all" ? "700" : "500",
                    color:
                      selectedCategory === "all"
                        ? "#00B37A"
                        : isDark
                        ? "#9CA3AF"
                        : "#374151",
                  }}
                  numberOfLines={1}
                >
                  All
                </Text>
              </Pressable>

              {/* Dynamic categories from API / Seed */}
              {categoryList.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                const imageSource = cat.image?.startsWith("http")
                  ? { uri: cat.image }
                  : LOCAL_CATEGORY_IMAGES[cat.slug] || {
                      uri: getImageUrl(cat.image),
                    };

                return (
                  <Pressable
                    key={cat._id || cat.slug}
                    onPress={() => setSelectedCategory(cat.slug)}
                    className="items-center active:opacity-85"
                    style={{ width: 56 }}
                  >
                    {/* Circle with unique pastel background color */}
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        overflow: "hidden",
                        borderWidth: isSelected ? 2 : 1.5,
                        borderColor: isSelected
                          ? "#00B37A"
                          : isDark
                          ? "transparent"
                          : "rgba(0,0,0,0.04)",
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.08)"
                          : cat.backgroundColor || "#F3F4F6",
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: isSelected ? "#00B37A" : "#000",
                        shadowOffset: {
                          width: 0,
                          height: isSelected ? 2 : 1,
                        },
                        shadowOpacity: isSelected ? 0.25 : 0.05,
                        shadowRadius: isSelected ? 4 : 2,
                        elevation: isSelected ? 3 : 1,
                      }}
                    >
                      <Image
                        source={imageSource}
                        style={{
                          width: 44,
                          height: 44,
                        }}
                        contentFit="contain"
                        transition={200}
                      />
                    </View>
                    <Text
                      className="mt-1.5 text-center font-sans"
                      style={{
                        fontSize: 11.5,
                        fontWeight: isSelected ? "700" : "500",
                        color: isSelected
                          ? "#00B37A"
                          : isDark
                          ? "#9CA3AF"
                          : "#374151",
                      }}
                      numberOfLines={1}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}


            </View>
          </ScrollView>


          {/* ─── AUTO-ROTATING OFFERS BANNER ─── */}
          <View className="mt-4">
            <FlatList
              ref={offerListRef}
              data={OFFERS}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={OFFER_CARD_WIDTH + 12}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 24 }}
              onScrollBeginDrag={handleOfferScroll}
              onViewableItemsChanged={onOfferViewableChange}
              viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
              getItemLayout={(_, index) => ({
                length: OFFER_CARD_WIDTH + 12,
                offset: (OFFER_CARD_WIDTH + 12) * index,
                index,
              })}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    toast.success(`Code ${item.code} applied! 🎉`);
                  }}
                  className="overflow-hidden rounded-2xl shadow-sm active:opacity-95"
                  style={{
                    width: OFFER_CARD_WIDTH,
                    marginRight: 12,
                    backgroundColor: item.bg,
                  }}
                >
                  <View className="flex-row items-center p-4">
                    {/* Left: Text */}
                    <View className="flex-1 pr-3">
                      <Text
                        style={{ fontSize: 15, fontWeight: "700", color: "#1a1a2e", lineHeight: 20 }}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={{ fontSize: 13, fontWeight: "600", color: item.ctaColor, marginTop: 8 }}
                      >
                        {item.cta}
                      </Text>
                    </View>

                    {/* Right: Food Image + Discount Badge */}
                    <View style={{ position: "relative" }}>
                      <Image
                        source={{ uri: item.image }}
                        style={{ width: 90, height: 90, borderRadius: 16 }}
                        contentFit="cover"
                        transition={200}
                      />
                      {/* Floating discount badge */}
                      <View
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          width: 42,
                          height: 42,
                          borderRadius: 21,
                          backgroundColor: item.badgeBg,
                          alignItems: "center",
                          justifyContent: "center",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 3,
                          elevation: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: "900",
                            color: "#ffffff",
                            textAlign: "center",
                            lineHeight: 11,
                          }}
                        >
                          {item.badge}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              )}
            />


            {/* Pagination Dots */}
            <View className="flex-row items-center justify-center gap-1.5 mt-3">
              {OFFERS.map((_, idx) => (
                <View
                  key={idx}
                  className={`rounded-full ${
                    idx === activeOfferIndex
                      ? "w-5 h-1.5 bg-[#00B37A]"
                      : "w-1.5 h-1.5 bg-border"
                  }`}
                />
              ))}
            </View>
          </View>

          {/* ─── FEATURED RESTAURANTS ─── */}
          <View className="mt-6">
            <View className="flex-row items-center justify-between px-6 mb-3">
              <Text className="text-lg font-bold text-foreground">
                Featured
              </Text>
              <Pressable
                onPress={() => toast.info("Viewing all featured restaurants")}
                className="flex-row items-center gap-0.5"
              >
                <Text className="text-sm font-semibold text-[#00B37A]">
                  See all
                </Text>
                <Feather name="arrow-right" size={14} color="#00B37A" />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            >
              <View className="flex-row gap-3">
                {featuredList.map((resto: any) => {
                  const targetId = resto.slug || resto._id || resto.id;
                  const imageSrc = resto.coverImage || resto.image;
                  const isFree =
                    resto.deliveryFee === 0 || resto.freeDelivery === true;
                  const feeText =
                    typeof resto.deliveryFee === "number"
                      ? resto.deliveryFee === 0
                        ? "Free delivery"
                        : `${resto.currency || "$"}${resto.deliveryFee.toFixed(2)} delivery`
                      : resto.deliveryFee;

                  return (
                    <Pressable
                      key={targetId}
                      onPress={() =>
                        router.push(`/restaurant/${targetId}` as any)
                      }
                      className="w-50 overflow-hidden rounded-2xl border border-border bg-card shadow-sm active:opacity-95"
                    >
                      <Image
                        source={{ uri: imageSrc }}
                        style={{ width: "100%", height: 120 }}
                        contentFit="cover"
                        transition={300}
                      />
                      <View className="p-3">
                        <Text
                          className="text-sm font-bold text-foreground"
                          numberOfLines={1}
                        >
                          {resto.name}
                        </Text>
                        <View className="flex-row items-center gap-1 mt-1">
                          <Ionicons name="star" size={12} color="#FFB800" />
                          <Text className="text-xs font-semibold text-foreground">
                            {resto.rating}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            ({resto.totalReviews ?? resto.reviews ?? 0})
                          </Text>
                        </View>
                        <Text className="text-xs text-muted-foreground mt-0.5">
                          {resto.deliveryTime ?? resto.time ?? "25-35 min"} •{" "}
                          <Text
                            className={
                              isFree
                                ? "text-[#00B37A] font-semibold"
                                : "text-muted-foreground"
                            }
                          >
                            {feeText}
                          </Text>
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* ─── NEARBY RESTAURANTS ─── */}
          <View className="mt-7 px-6">
            <Text className="text-lg font-bold text-foreground mb-3">
              Nearby Restaurants
            </Text>

            <View className="gap-3">
              {nearbyList.map((resto: any) => {
                const targetId = resto.slug || resto._id || resto.id;
                const imageSrc = resto.coverImage || resto.image;
                const isFree =
                  resto.deliveryFee === 0 || resto.freeDelivery === true;
                const feeText =
                  typeof resto.deliveryFee === "number"
                    ? resto.deliveryFee === 0
                      ? "Free delivery"
                      : `${resto.currency || "$"}${resto.deliveryFee.toFixed(2)} delivery`
                    : resto.deliveryFee;

                const cuisineStr = Array.isArray(resto.cuisineType)
                  ? resto.cuisineType.join(" • ")
                  : resto.cuisine ?? "";

                return (
                  <Pressable
                    key={targetId}
                    onPress={() =>
                      router.push(`/restaurant/${targetId}` as any)
                    }
                    className="flex-row items-center rounded-2xl border border-border bg-card p-3 shadow-sm active:opacity-95"
                  >
                    <Image
                      source={{ uri: imageSrc }}
                      style={{ width: 64, height: 64, borderRadius: 12 }}
                      contentFit="cover"
                      transition={200}
                    />
                    <View className="flex-1 ml-3">
                      <Text className="text-sm font-bold text-foreground">
                        {resto.name}
                      </Text>
                      {cuisineStr ? (
                        <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
                          {cuisineStr}
                        </Text>
                      ) : null}
                      <View className="flex-row items-center gap-1 mt-1">
                        <Ionicons name="star" size={11} color="#FFB800" />
                        <Text className="text-xs font-semibold text-foreground">
                          {resto.rating}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          ({resto.totalReviews ?? resto.reviews ?? 0})
                        </Text>
                        <Text className="text-xs text-muted-foreground mx-0.5">
                          •
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          {resto.deliveryTime ?? resto.time ?? "20-30 min"}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text
                        className={`text-xs font-medium ${
                          isFree
                            ? "text-[#00B37A] font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {feeText}
                      </Text>
                      <Feather
                        name="chevron-right"
                        size={16}
                        color="#9ca3af"
                        style={{ marginTop: 4 }}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* ─── BOTTOM TAB BAR ─── */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-border bg-background flex-row"
        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      >
        {/* Home Tab (Active) */}
        <Pressable className="flex-1 items-center pt-2.5 pb-1">
          <Ionicons name="home" size={22} color="#00B37A" />
          <Text className="text-[11px] font-semibold text-[#00B37A] mt-0.5">
            Home
          </Text>
        </Pressable>

        {/* Search Tab */}
        <Pressable
          onPress={() => router.push("/search")}
          className="flex-1 items-center pt-2.5 pb-1"
        >
          <Ionicons name="search-outline" size={22} color="#9ca3af" />
          <Text className="text-[11px] font-medium text-muted-foreground mt-0.5">
            Search
          </Text>
        </Pressable>

        {/* Orders Tab */}
        <Pressable
          onPress={() => toast.info("Orders tab coming in Board 4")}
          className="flex-1 items-center pt-2.5 pb-1"
        >
          <Ionicons name="receipt-outline" size={22} color="#9ca3af" />
          <Text className="text-[11px] font-medium text-muted-foreground mt-0.5">
            Orders
          </Text>
        </Pressable>

        {/* Profile Tab */}
        <Pressable
          onPress={() => toast.info("Profile tab coming in Board 4")}
          className="flex-1 items-center pt-2.5 pb-1"
        >
          <Ionicons name="person-outline" size={22} color="#9ca3af" />
          <Text className="text-[11px] font-medium text-muted-foreground mt-0.5">
            Profile
          </Text>
        </Pressable>
      </View>

      {/* Address Bottom Sheet */}
      <AddressBottomSheet
        visible={showAddressSheet}
        onClose={() => setShowAddressSheet(false)}
        selectedId={selectedAddressId}
        onSelect={(id, label) => {
          setSelectedAddressId(id);
          setDeliveryLabel(label);
        }}
      />
    </View>
  );
}
