import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import { toast } from "@/lib/sonner";

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


const CATEGORIES = [
  { id: "all", name: "All", icon: "grid" as const, family: "feather" },
  {
    id: "offers",
    name: "Offers",
    icon: "tag" as const,
    family: "feather",
  },
  { id: "pizza", name: "Pizza", icon: "pizza-outline" as const, family: "ionicons" },
  {
    id: "burgers",
    name: "Burgers",
    icon: "fast-food-outline" as const,
    family: "ionicons",
  },
  {
    id: "sushi",
    name: "Sushi",
    icon: "fish-outline" as const,
    family: "ionicons",
  },
  { id: "coffee", name: "Coffee", icon: "cafe-outline" as const, family: "ionicons" },
  {
    id: "desserts",
    name: "Desserts",
    icon: "ice-cream-outline" as const,
    family: "ionicons",
  },
];


const FEATURED = [
  {
    id: "f1",
    name: "Burger Palace",
    rating: "4.7",
    reviews: "342",
    time: "25-35 min",
    deliveryFee: "$2.49 delivery",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "f2",
    name: "Sakura Sushi",
    rating: "4.8",
    reviews: "215",
    time: "30-40 min",
    deliveryFee: "Free delivery",
    freeDelivery: true,
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80",
  },
];

const NEARBY = [
  {
    id: "n1",
    name: "Taco Fiesta",
    cuisine: "Mexican",
    rating: "4.6",
    reviews: "198",
    time: "20-30 min",
    deliveryFee: "$1.99 delivery",
    image:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "n2",
    name: "Pizza Haven",
    cuisine: "Italian",
    rating: "4.5",
    reviews: "276",
    time: "25-35 min",
    deliveryFee: "$2.49 delivery",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "n3",
    name: "Burger Craft Co.",
    cuisine: "American",
    rating: "4.9",
    reviews: "412",
    time: "15-25 min",
    deliveryFee: "Free delivery",
    freeDelivery: true,
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&auto=format&fit=crop&q=80",
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
          {/*  CATEGORY ICONS (Outlined circles + label)  */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 20,
              paddingBottom: 6,
            }}
          >
            <View className="flex-row gap-5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    className="items-center"
                    style={{ width: 56 }}
                  >
                    {/* Outlined circle — green border when selected */}
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        borderWidth: 1.5,
                        borderColor: isSelected ? "#00B37A" : isDark ? "#3a3a5c" : "#d1d5db",
                        backgroundColor: isSelected
                          ? isDark ? "rgba(0,179,122,0.12)" : "rgba(0,179,122,0.06)"
                          : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {renderCategoryIcon(cat.icon, cat.family, isSelected)}
                    </View>
                    <Text
                      className="mt-1.5 text-center"
                      style={{
                        fontSize: 11,
                        fontWeight: isSelected ? "700" : "500",
                        color: isSelected
                          ? "#00B37A"
                          : isDark ? "#9ca3af" : "#374151",
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
                {FEATURED.map((resto) => (
                  <Pressable
                    key={resto.id}
                    onPress={() => router.push(`/restaurant/${resto.id}` as any)}
                    className="w-50 overflow-hidden rounded-2xl border border-border bg-card shadow-sm active:opacity-95"
                  >
                    <Image
                      source={{ uri: resto.image }}
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
                          ({resto.reviews})
                        </Text>
                      </View>
                      <Text className="text-xs text-muted-foreground mt-0.5">
                        {resto.time} •{" "}
                        <Text
                          className={
                            resto.freeDelivery
                              ? "text-[#00B37A] font-semibold"
                              : "text-muted-foreground"
                          }
                        >
                          {resto.deliveryFee}
                        </Text>
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ─── NEARBY RESTAURANTS ─── */}
          <View className="mt-7 px-6">
            <Text className="text-lg font-bold text-foreground mb-3">
              Nearby Restaurants
            </Text>

            <View className="gap-3">
              {NEARBY.map((resto) => (
                <Pressable
                  key={resto.id}
                  onPress={() => router.push(`/restaurant/${resto.id}` as any)}
                  className="flex-row items-center rounded-2xl border border-border bg-card p-3 shadow-sm active:opacity-95"
                >
                  <Image
                    source={{ uri: resto.image }}
                    style={{ width: 64, height: 64, borderRadius: 12 }}
                    contentFit="cover"
                    transition={200}
                  />
                  <View className="flex-1 ml-3">
                    <Text className="text-sm font-bold text-foreground">
                      {resto.name}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {resto.cuisine}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-1">
                      <Ionicons name="star" size={11} color="#FFB800" />
                      <Text className="text-xs font-semibold text-foreground">
                        {resto.rating}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        ({resto.reviews})
                      </Text>
                      <Text className="text-xs text-muted-foreground mx-0.5">
                        •
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {resto.time}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text
                      className={`text-xs font-medium ${
                        resto.freeDelivery
                          ? "text-[#00B37A] font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {resto.deliveryFee}
                    </Text>
                    <Feather
                      name="chevron-right"
                      size={16}
                      color="#9ca3af"
                      style={{ marginTop: 4 }}
                    />
                  </View>
                </Pressable>
              ))}
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
