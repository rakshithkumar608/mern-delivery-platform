import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import { toast } from "@/lib/sonner";

interface FavouriteItem {
  id: string;
  type: "restaurant" | "dish";
  name: string;
  slug?: string;
  subtitle: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: string;
  offer?: string;
  image: string;
  price?: string;
  dishId?: string;
}

const INITIAL_FAVOURITES: FavouriteItem[] = [
  {
    id: "fav-1",
    type: "restaurant",
    name: "Bella Italia",
    slug: "bella-italia",
    subtitle: "Italian • Neapolitan Pizza & Handmade Pasta",
    rating: 4.8,
    reviews: 812,
    deliveryTime: "25-35 min",
    deliveryFee: "£1.49 delivery",
    offer: "20% off selected favourites",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "fav-2",
    type: "restaurant",
    name: "Mama Chow's Kitchen",
    slug: "bella-italia", // Fallback to available restaurant
    subtitle: "Asian Fusion • Dim Sum & Crispy Noodles",
    rating: 4.9,
    reviews: 490,
    deliveryTime: "20-30 min",
    deliveryFee: "Free delivery over £15",
    offer: "Free dim sum on orders £25+",
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "fav-3",
    type: "restaurant",
    name: "Burger Craft Co.",
    slug: "burger-craft-co",
    subtitle: "American • Smash Burgers & Truffle Fries",
    rating: 4.7,
    reviews: 620,
    deliveryTime: "15-25 min",
    deliveryFee: "£1.99 delivery",
    offer: "Buy 1 get 1 50% off",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "fav-4",
    type: "dish",
    name: "Truffle Carbonara",
    slug: "bella-italia",
    subtitle: "Bella Italia • Fresh handmade egg pasta with pancetta",
    rating: 4.9,
    reviews: 320,
    deliveryTime: "25-35 min",
    deliveryFee: "£1.49 delivery",
    price: "£13.50",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=900&auto=format&fit=crop&q=80",
  },
];

export default function FavouritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  const [favourites, setFavourites] = useState<FavouriteItem[]>(INITIAL_FAVOURITES);
  const [activeFilter, setActiveFilter] = useState<"all" | "restaurants" | "dishes">("all");

  const filteredItems = favourites.filter((item) => {
    if (activeFilter === "restaurants") return item.type === "restaurant";
    if (activeFilter === "dishes") return item.type === "dish";
    return true;
  });

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/profile");
    }
  };

  const handleToggleFavourite = (item: FavouriteItem) => {
    setFavourites((prev) => prev.filter((fav) => fav.id !== item.id));
    toast.success(`Removed ${item.name} from favourites`);
  };

  const handleItemPress = (item: FavouriteItem) => {
    if (item.slug) {
      router.push(`/restaurant/${item.slug}` as any);
    } else {
      router.push("/restaurant/bella-italia" as any);
    }
  };

  return (
    <View className="flex-1 bg-[#F9FAFB] dark:bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ─── TOP APP BAR ─── */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 16),
          paddingHorizontal: 20,
          paddingBottom: 14,
        }}
        className="bg-white dark:bg-card border-b border-slate-100 dark:border-border flex-row items-center justify-between"
      >
        {/* Back / Close Button ('X') with generous touch target */}
        <Pressable
          onPress={handleClose}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 items-center justify-center active:bg-slate-200"
          accessibilityLabel="Close Favourites"
          accessibilityRole="button"
        >
          <Feather name="x" size={20} color={isDark ? "#ffffff" : "#0f172a"} />
        </Pressable>

        {/* Center Title + Count Badge */}
        <View className="flex-row items-center">
          <Text className="text-lg font-bold text-slate-900 dark:text-foreground">
            Favourites
          </Text>
          <View className="bg-[#EBF7F2] dark:bg-emerald-950/60 px-2 py-0.5 rounded-full ml-2">
            <Text className="text-xs font-bold text-[#007A5E] dark:text-emerald-400">
              {favourites.length}
            </Text>
          </View>
        </View>

        {/* Symmetry spacer */}
        <View className="w-10" />
      </View>

      {/* ─── FILTER TABS ─── */}
      <View className="flex-row items-center px-5 pt-3 pb-2 gap-2 bg-white dark:bg-card border-b border-slate-100 dark:border-border">
        <Pressable
          onPress={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-full border ${
            activeFilter === "all"
              ? "bg-[#007A5E] border-[#007A5E]"
              : "bg-slate-50 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeFilter === "all" ? "text-white" : "text-slate-600 dark:text-slate-300"
            }`}
          >
            All ({favourites.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveFilter("restaurants")}
          className={`px-4 py-2 rounded-full border ${
            activeFilter === "restaurants"
              ? "bg-[#007A5E] border-[#007A5E]"
              : "bg-slate-50 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeFilter === "restaurants"
                ? "text-white"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Restaurants ({favourites.filter((f) => f.type === "restaurant").length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveFilter("dishes")}
          className={`px-4 py-2 rounded-full border ${
            activeFilter === "dishes"
              ? "bg-[#007A5E] border-[#007A5E]"
              : "bg-slate-50 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeFilter === "dishes" ? "text-white" : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Dishes ({favourites.filter((f) => f.type === "dish").length})
          </Text>
        </Pressable>
      </View>

      {/* ─── CARDS SCROLLVIEW ─── */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom + 24, 36),
        }}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length === 0 ? (
          <View className="items-center justify-center py-20 px-6">
            <View className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mb-4">
              <Feather name="heart" size={28} color="#94a3b8" />
            </View>
            <Text className="text-lg font-bold text-slate-800 dark:text-foreground text-center mb-1">
              No favourites here yet
            </Text>
            <Text className="text-sm text-slate-500 dark:text-muted-foreground text-center max-w-[260px] mb-6">
              Tap the heart icon on any restaurant or dish to save it here for fast ordering.
            </Text>
            <Pressable
              onPress={() => router.push("/home")}
              className="bg-[#007A5E] px-6 py-3 rounded-full active:opacity-90 shadow-sm"
            >
              <Text className="text-white font-semibold text-sm">
                Explore Restaurants
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-4">
            {filteredItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleItemPress(item)}
                className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border overflow-hidden shadow-xs active:scale-[0.99]"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                {/* Cover Image Container */}
                <View className="relative w-full h-44 bg-slate-100 dark:bg-slate-800">
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={200}
                  />

                  {/* Gradient Overlay bottom vignette */}
                  <View className="absolute inset-0 bg-black/10" />

                  {/* Top Left: Delivery Time Badge */}
                  <View className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/90 px-3 py-1.5 rounded-full flex-row items-center shadow-xs">
                    <Feather name="clock" size={12} color="#007A5E" style={{ marginRight: 5 }} />
                    <Text className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {item.deliveryTime}
                    </Text>
                  </View>

                  {/* Top Right: Heart Unfavourite Button with generous hitSlop */}
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      handleToggleFavourite(item);
                    }}
                    hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 dark:bg-slate-900/90 items-center justify-center shadow-sm active:scale-90"
                    accessibilityLabel="Remove from favourites"
                  >
                    <Ionicons name="heart" size={22} color="#EF4444" />
                  </Pressable>

                  {/* Bottom Left Offer Ribbon (if any) */}
                  {item.offer && (
                    <View className="absolute bottom-3 left-3 bg-[#007A5E] px-3 py-1 rounded-lg shadow-xs">
                      <Text className="text-xs font-bold text-white tracking-wide">
                        {item.offer}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Details Section */}
                <View className="p-4">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text
                      numberOfLines={1}
                      className="text-lg font-bold text-slate-900 dark:text-foreground tracking-tight flex-1 mr-2"
                    >
                      {item.name}
                    </Text>

                    {item.price && (
                      <Text className="text-base font-extrabold text-[#007A5E] dark:text-emerald-400">
                        {item.price}
                      </Text>
                    )}
                  </View>

                  <Text
                    numberOfLines={1}
                    className="text-xs text-slate-500 dark:text-muted-foreground font-normal mb-3"
                  >
                    {item.subtitle}
                  </Text>

                  {/* Meta Row: Rating, Reviews, Delivery Fee, & CTA */}
                  <View className="flex-row items-center justify-between pt-2 border-t border-slate-100 dark:border-border">
                    <View className="flex-row items-center gap-2">
                      <View className="flex-row items-center bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                        <Ionicons name="star" size={13} color="#F59E0B" />
                        <Text className="text-xs font-bold text-amber-700 dark:text-amber-400 ml-1">
                          {item.rating}
                        </Text>
                      </View>
                      <Text className="text-xs text-slate-400">
                        ({item.reviews}+)
                      </Text>
                      <Text className="text-xs text-slate-400">•</Text>
                      <Text className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {item.deliveryFee}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => handleItemPress(item)}
                      className="bg-[#007A5E] px-3.5 py-1.5 rounded-xl active:opacity-90 flex-row items-center"
                    >
                      <Text className="text-xs font-bold text-white mr-1">
                        Order
                      </Text>
                      <Feather name="arrow-right" size={12} color="#ffffff" />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
