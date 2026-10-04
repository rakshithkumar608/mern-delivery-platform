import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import { fetchOrderByIdQueryFn } from "@/lib/api";
import { toast } from "@/lib/sonner";

const BRAND_TEAL = "#007A5A";

export default function OrderConfirmedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  const { orderId, orderNumber: paramOrderNumber } = useLocalSearchParams<{
    orderId?: string;
    orderNumber?: string;
  }>();

  // Fetch verified order details from backend
  const { data: orderData } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderByIdQueryFn(orderId || ""),
    enabled: Boolean(orderId),
  });

  const order = orderData?.order;
  const displayOrderNumber =
    order?.orderNumber || paramOrderNumber || "CH-2481";

  // Calculate arrival time string (e.g. "18:40")
  const formattedEta = React.useMemo(() => {
    if (order?.formattedEta) return order.formattedEta;
    if (order?.estimatedDeliveryTime) {
      const d = new Date(order.estimatedDeliveryTime);
      return `${d.getHours().toString().padStart(2, "0")}:${d
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    }
    const defaultEta = new Date(Date.now() + 30 * 60 * 1000);
    return `${defaultEta.getHours().toString().padStart(2, "0")}:${defaultEta
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }, [order]);

  const handleTrackOrder = () => {
    const targetId = orderId || displayOrderNumber || "CH-2481";
    router.push(`/order/track/${targetId}` as any);
  };

  const handleBackToHome = () => {
    router.replace("/home");
  };

  return (
    <View className="flex-1 bg-background justify-between px-6">
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Top spacer */}
      <View style={{ height: Math.max(insets.top, 20) }} />

      {/* ─── CENTER HERO CONTENT (Exact replica of v1 design) ─── */}
      <View className="items-center justify-center py-10">
        {/* Soft mint circular badge with green checkmark */}
        <View
          className="h-32 w-32 rounded-full items-center justify-center mb-9"
          style={{ backgroundColor: isDark ? "#0A3328" : "#E2F6F0" }}
        >
          <Feather name="check" size={54} color={BRAND_TEAL} />
        </View>

        {/* Heading */}
        <Text className="text-3xl font-extrabold text-foreground tracking-tight text-center">
          Order confirmed
        </Text>

        {/* Order Reference Number */}
        <Text className="text-xl font-bold text-foreground mt-3 tracking-wide">
          #{displayOrderNumber}
        </Text>

        {/* Arrival Time */}
        <Text className="text-base font-medium text-muted-foreground mt-2">
          Arriving by {formattedEta}
        </Text>
      </View>

      {/* ─── DOCKED BOTTOM ACTIONS (Exact replica of v1 design) ─── */}
      <View
        className="w-full gap-3"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        {/* Primary CTA: Track order */}
        <Pressable
          onPress={handleTrackOrder}
          className="h-13 w-full items-center justify-center rounded-2xl active:opacity-90 shadow-md"
          style={{
            backgroundColor: BRAND_TEAL,
            shadowColor: BRAND_TEAL,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text className="text-base font-bold text-white tracking-wide">
            Track order
          </Text>
        </Pressable>

        {/* Secondary CTA: Back to home */}
        <Pressable
          onPress={handleBackToHome}
          className="h-13 w-full items-center justify-center rounded-2xl border active:bg-muted/40"
          style={{
            borderColor: BRAND_TEAL,
            backgroundColor: "transparent",
          }}
        >
          <Text
            className="text-base font-bold tracking-wide"
            style={{ color: BRAND_TEAL }}
          >
            Back to home
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
