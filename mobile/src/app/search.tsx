import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import { toast } from "@/lib/sonner";

// ─── Data ───────────────────────────────────────────────────────────────────

const RECENT_SEARCHES = ["Pizza", "Sushi", "Coffee"];

const RESTAURANTS_RESULTS = [
  {
    id: "f1",
    name: "Burger Palace",
    rating: "4.7",
    reviews: "342",
    time: "25-35 min",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "f2",
    name: "BBQ Brothers",
    rating: "4.5",
    reviews: "189",
    time: "20-30 min",
    image:
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&auto=format&fit=crop&q=80",
  },
];

const DISHES_RESULTS = [
  {
    id: "d1",
    name: "Classic Cheeseburger",
    restaurant: "Burger Palace",
    price: "$8.99",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "d2",
    name: "Wagyu Burger",
    restaurant: "BBQ Brothers",
    price: "$15.99",
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&auto=format&fit=crop&q=80",
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  const [query, setQuery] = useState("burger");
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);

  const removeRecent = (term: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== term));
  };

  const filteredRestaurants = RESTAURANTS_RESULTS.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );
  const filteredDishes = DISHES_RESULTS.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.restaurant.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Search Bar + Cancel */}
      <View className="flex-row items-center px-5 gap-3 pb-3">
        <View className="flex-1 flex-row items-center h-11 rounded-xl bg-muted px-3.5 border border-border/50">
          <Feather name="search" size={17} color="#9ca3af" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder="Search restaurants or dishes"
            placeholderTextColor="#9ca3af"
            className="ml-2 flex-1 text-sm text-foreground font-sans"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery("")}
              className="h-5 w-5 items-center justify-center rounded-full bg-border"
            >
              <Feather name="x" size={12} color="#6b7280" />
            </Pressable>
          )}
        </View>
        <Pressable onPress={() => router.back()}>
          <Text className="text-sm font-semibold text-[#00B37A]">Cancel</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Recent Searches */}
        {query.length === 0 && recentSearches.length > 0 && (
          <View className="mt-3">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              Recent searches
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {recentSearches.map((term) => (
                <Pressable
                  key={term}
                  onPress={() => setQuery(term)}
                  className="flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 active:bg-muted"
                >
                  <Text className="text-sm font-medium text-foreground">
                    {term}
                  </Text>
                  <Pressable
                    onPress={() => removeRecent(term)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="x" size={13} color="#9ca3af" />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Restaurants Results */}
        {query.length > 0 && (
          <>
            <View className="mt-4">
              <Text className="text-base font-bold text-foreground mb-3">
                Restaurants
              </Text>
              <View className="gap-3">
                {filteredRestaurants.map((resto) => (
                  <Pressable
                    key={resto.id}
                    onPress={() => router.push(`/restaurant/${resto.id}` as any)}
                    className="flex-row items-center justify-between py-1 active:opacity-80"
                  >
                    <View className="flex-row items-center flex-1">
                      <Image
                        source={{ uri: resto.image }}
                        style={{ width: 52, height: 52, borderRadius: 12 }}
                        contentFit="cover"
                        transition={200}
                      />
                      <View className="ml-3 flex-1">
                        <Text className="text-sm font-bold text-foreground">
                          {resto.name}
                        </Text>
                        <View className="flex-row items-center gap-1 mt-0.5">
                          <Ionicons name="star" size={11} color="#FFB800" />
                          <Text className="text-xs font-semibold text-foreground">
                            {resto.rating}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            ({resto.reviews})
                          </Text>
                        </View>
                        <Text className="text-xs text-muted-foreground">
                          {resto.time}
                        </Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={18} color="#9ca3af" />
                  </Pressable>
                ))}
                {filteredRestaurants.length === 0 && (
                  <Text className="text-sm text-muted-foreground italic">
                    No restaurants matching &quot;{query}&quot;
                  </Text>
                )}
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-border my-4" />

            {/* Dishes Results */}
            <View>
              <Text className="text-base font-bold text-foreground mb-3">
                Dishes
              </Text>
              <View className="gap-3">
                {filteredDishes.map((dish) => (
                  <Pressable
                    key={dish.id}
                    onPress={() => {
                      toast.success(`Viewing ${dish.name}`);
                      router.push(`/restaurant/f1` as any);
                    }}
                    className="flex-row items-center justify-between py-1 active:opacity-80"
                  >
                    <View className="flex-row items-center flex-1">
                      <Image
                        source={{ uri: dish.image }}
                        style={{ width: 52, height: 52, borderRadius: 12 }}
                        contentFit="cover"
                        transition={200}
                      />
                      <View className="ml-3 flex-1">
                        <Text className="text-sm font-bold text-foreground">
                          {dish.name}
                        </Text>
                        <Text className="text-xs text-muted-foreground mt-0.5">
                          {dish.restaurant} · {dish.price}
                        </Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={18} color="#9ca3af" />
                  </Pressable>
                ))}
                {filteredDishes.length === 0 && (
                  <Text className="text-sm text-muted-foreground italic">
                    No dishes matching &quot;{query}&quot;
                  </Text>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
