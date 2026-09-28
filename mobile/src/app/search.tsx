import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import { Restaurant, SearchDishItem, searchQueryFn } from "@/lib/api";
import { toast } from "@/lib/sonner";

const POPULAR_SEARCHES = [
  { label: "Pizza 🍕", term: "Pizza" },
  { label: "Burgers 🍔", term: "Burger" },
  { label: "Pasta 🍝", term: "Pasta" },
  { label: "Sushi 🍣", term: "Sushi" },
  { label: "Desserts 🍰", term: "Dessert" },
  { label: "Margherita 🧀", term: "Margherita" },
];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  // Read initial query from route params if navigated from home search input
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(q || "");
  const [debouncedQuery, setDebouncedQuery] = useState(q || "");
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Pizza",
    "Margherita",
    "Burger",
  ]);

  // Sync route param changes (e.g. user typed on home page)
  useEffect(() => {
    if (q && q !== query) {
      setQuery(q);
      setDebouncedQuery(q);
    }
  }, [q]);

  // Debounce query to prevent excessive API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  // Query Search API
  const {
    data: searchData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchQueryFn(debouncedQuery),
    enabled: debouncedQuery.length > 0,
    staleTime: 1000 * 60 * 2,
  });

  const restaurants: Restaurant[] = searchData?.restaurants || [];
  const dishes: SearchDishItem[] = searchData?.dishes || [];
  const hasResults = restaurants.length > 0 || dishes.length > 0;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  const handleSelectTerm = (term: string) => {
    setQuery(term);
    if (!recentSearches.includes(term)) {
      setRecentSearches((prev) => [term, ...prev.slice(0, 4)]);
    }
  };

  const removeRecent = (term: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== term));
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ─── SEARCH HEADER BAR ─── */}
      <View className="flex-row items-center px-4 gap-3 pb-3 border-b border-border/40">
        <View className="flex-1 flex-row items-center h-11 rounded-xl bg-card px-3.5 border border-border">
          <Feather name="search" size={18} color="#9ca3af" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder="Search restaurants or dishes"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            className="ml-2.5 flex-1 text-sm text-foreground font-sans h-full"
            returnKeyType="search"
            onSubmitEditing={() => {
              if (query.trim() && !recentSearches.includes(query.trim())) {
                setRecentSearches((prev) => [query.trim(), ...prev.slice(0, 4)]);
              }
            }}
          />
          {isFetching ? (
            <ActivityIndicator size="small" color="#00B37A" />
          ) : query.length > 0 ? (
            <Pressable
              onPress={() => setQuery("")}
              className="h-5 w-5 items-center justify-center rounded-full bg-muted active:opacity-75"
              hitSlop={8}
            >
              <Feather name="x" size={12} color="#6b7280" />
            </Pressable>
          ) : null}
        </View>

        <Pressable onPress={handleBack} hitSlop={8} className="py-2 px-1">
          <Text className="text-sm font-semibold text-[#00B37A]">Cancel</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── WHEN QUERY IS EMPTY: RECENT & POPULAR TAGS ─── */}
        {query.length === 0 && (
          <View className="mt-4">
            {recentSearches.length > 0 && (
              <View className="mb-6">
                <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Recent searches
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <Pressable
                      key={term}
                      onPress={() => handleSelectTerm(term)}
                      className="flex-row items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 active:bg-muted"
                    >
                      <Feather name="clock" size={13} color="#9ca3af" />
                      <Text className="text-sm font-medium text-foreground">
                        {term}
                      </Text>
                      <Pressable
                        onPress={() => removeRecent(term)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Feather name="x" size={12} color="#9ca3af" />
                      </Pressable>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Popular Searches */}
            <View>
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Popular searches
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {POPULAR_SEARCHES.map((item) => (
                  <Pressable
                    key={item.term}
                    onPress={() => handleSelectTerm(item.term)}
                    className="rounded-full border border-border/80 bg-card px-4 py-2.5 active:bg-muted"
                  >
                    <Text className="text-sm font-medium text-foreground">
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ─── WHEN QUERY HAS INPUT ─── */}
        {query.length > 0 && (
          <>
            {/* Loading Skeleton Indicator */}
            {isLoading && (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator size="large" color="#00B37A" />
                <Text className="text-sm text-muted-foreground mt-3">
                  Searching dishes and restaurants...
                </Text>
              </View>
            )}

            {/* Empty State */}
            {!isLoading && !hasResults && (
              <View className="py-16 items-center justify-center">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Feather name="search" size={28} color="#9CA3AF" />
                </View>
                <Text className="text-base font-bold text-foreground text-center">
                  No matches for &quot;{query}&quot;
                </Text>
                <Text className="text-xs text-muted-foreground text-center mt-1 max-w-[260px]">
                  Try searching for a different dish name, cuisine, or restaurant.
                </Text>

                <View className="flex-row flex-wrap justify-center gap-2 mt-5">
                  {["Pizza", "Burger", "Pasta", "Sushi"].map((suggest) => (
                    <Pressable
                      key={suggest}
                      onPress={() => handleSelectTerm(suggest)}
                      className="rounded-full bg-[#00B37A]/10 border border-[#00B37A]/30 px-3.5 py-1.5"
                    >
                      <Text className="text-xs font-semibold text-[#00B37A]">
                        {suggest}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Restaurants Section */}
            {!isLoading && restaurants.length > 0 && (
              <View className="mt-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-base font-bold text-foreground">
                    Restaurants
                  </Text>
                  <Text className="text-xs font-medium text-muted-foreground">
                    {restaurants.length} found
                  </Text>
                </View>

                <View className="gap-3">
                  {restaurants.map((resto) => {
                    const restoId = resto.slug || resto._id || resto.id;
                    const cuisines = Array.isArray(resto.cuisineType)
                      ? resto.cuisineType.join(" • ")
                      : "Italian • Fast Food";
                    return (
                      <Pressable
                        key={resto._id || resto.id}
                        onPress={() => router.push(`/restaurant/${restoId}` as any)}
                        className="flex-row items-center justify-between p-3 rounded-2xl bg-card border border-border/80 active:opacity-85 shadow-sm"
                      >
                        <View className="flex-row items-center flex-1 pr-2">
                          <Image
                            source={{ uri: resto.coverImage }}
                            style={{ width: 58, height: 58, borderRadius: 14 }}
                            contentFit="cover"
                            transition={200}
                          />
                          <View className="ml-3 flex-1">
                            <Text
                              className="text-sm font-bold text-foreground"
                              numberOfLines={1}
                            >
                              {resto.name}
                            </Text>
                            <Text
                              className="text-xs text-muted-foreground mt-0.5"
                              numberOfLines={1}
                            >
                              {cuisines}
                            </Text>
                            <View className="flex-row items-center gap-2 mt-1">
                              <View className="flex-row items-center gap-0.5">
                                <Ionicons name="star" size={12} color="#FFB800" />
                                <Text className="text-xs font-bold text-foreground">
                                  {resto.rating}
                                </Text>
                              </View>
                              <Text className="text-xs text-muted-foreground">
                                • {resto.deliveryTime || "25-35 min"}
                              </Text>
                              <Text className="text-xs text-muted-foreground">
                                • {resto.distance || "1.2 miles"}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Feather name="chevron-right" size={18} color="#9ca3af" />
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Dishes Section */}
            {!isLoading && dishes.length > 0 && (
              <View className="mt-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-base font-bold text-foreground">
                    Dishes
                  </Text>
                  <Text className="text-xs font-medium text-muted-foreground">
                    {dishes.length} found
                  </Text>
                </View>

                <View className="gap-3">
                  {dishes.map((dish) => {
                    const dishId = dish._id || dish.id;
                    const currency = dish.currency || "£";
                    return (
                      <Pressable
                        key={dish._id || dish.id}
                        onPress={() => router.push(`/dish/${dishId}` as any)}
                        className="flex-row items-center justify-between p-3 rounded-2xl bg-card border border-border/80 active:opacity-85 shadow-sm"
                      >
                        <View className="flex-row items-center flex-1 pr-2">
                          <Image
                            source={{ uri: dish.image }}
                            style={{ width: 58, height: 58, borderRadius: 14 }}
                            contentFit="cover"
                            transition={200}
                          />
                          <View className="ml-3 flex-1">
                            <Text
                              className="text-sm font-bold text-foreground"
                              numberOfLines={1}
                            >
                              {dish.name}
                            </Text>
                            <Text
                              className="text-xs text-muted-foreground mt-0.5"
                              numberOfLines={1}
                            >
                              {dish.restaurantName || "Bella Italia"}
                              {dish.calories ? ` • ${dish.calories} kcal` : ""}
                            </Text>
                            <Text className="text-xs font-bold text-[#00B37A] mt-1">
                              {currency}{dish.price?.toFixed(2)}
                            </Text>
                          </View>
                        </View>
                        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#00B37A]/15">
                          <Feather name="plus" size={16} color="#00B37A" />
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
