import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import { OrdersView } from "@/components/orders-view";
import { toast } from "@/lib/sonner";

const BRAND_TEAL = "#00B37A";

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  return (
    <View className="flex-1 bg-[#F9FAFB] dark:bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Orders View */}
      <OrdersView onDiscoverRestaurants={() => router.replace("/home")} />

      {/* ─── BOTTOM TAB BAR (5 Tabs) ─── */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-border bg-background flex-row"
        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      >
        {/* Home Tab */}
        <Pressable
          onPress={() => router.replace("/home")}
          className="flex-1 items-center pt-2.5 pb-1 active:opacity-75"
        >
          <Ionicons name="home-outline" size={22} color="#9CA3AF" />
          <Text className="text-[11px] font-medium text-muted-foreground mt-0.5">
            Home
          </Text>
        </Pressable>

        {/* Search Tab */}
        <Pressable
          onPress={() => router.push("/search")}
          className="flex-1 items-center pt-2.5 pb-1 active:opacity-75"
        >
          <Ionicons name="search-outline" size={22} color="#9CA3AF" />
          <Text className="text-[11px] font-medium text-muted-foreground mt-0.5">
            Search
          </Text>
        </Pressable>

        {/* Orders Tab (ACTIVE) */}
        <Pressable className="flex-1 items-center pt-2.5 pb-1 active:opacity-75">
          <Ionicons name="bag-handle" size={22} color={BRAND_TEAL} />
          <Text className="text-[11px] font-semibold text-[#00B37A] mt-0.5">
            Orders
          </Text>
        </Pressable>

        {/* Favourites Tab */}
        <Pressable
          onPress={() => router.push("/favourites")}
          className="flex-1 items-center pt-2.5 pb-1 active:opacity-75"
        >
          <Ionicons name="heart-outline" size={22} color="#9CA3AF" />
          <Text className="text-[11px] font-medium text-muted-foreground mt-0.5">
            Favourites
          </Text>
        </Pressable>

        {/* Profile Tab */}
        <Pressable
          onPress={() => router.push("/profile")}
          className="flex-1 items-center pt-2.5 pb-1 active:opacity-75"
        >
          <Ionicons name="person-outline" size={22} color="#9CA3AF" />
          <Text className="text-[11px] font-medium text-muted-foreground mt-0.5">
            Profile
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
