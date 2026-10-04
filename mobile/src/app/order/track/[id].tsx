import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import { OrderStepper } from "@/components/order/order-stepper";
import { OrderTrackingMap } from "@/components/order/order-tracking-map";
import { fetchOrderByIdQueryFn } from "@/lib/api";
import { toast } from "@/lib/sonner";

const BRAND_TEAL = "#007A5A";
const COURIER_AVATAR = require("@/../assets/images/courier-alex.jpg");

export default function OrderTrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  const { id } = useLocalSearchParams<{ id?: string }>();
  const orderId = id || "GF-2048";

  // Fetch real order from backend if available with live status polling
  const { data: orderData } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderByIdQueryFn(orderId),
    enabled: Boolean(orderId && orderId !== "GF-2048"),
    refetchInterval: (query) => {
      const status = query.state.data?.order?.status;
      return status === "delivered" || status === "cancelled" ? false : 3000;
    },
    retry: 1,
  });

  const order = orderData?.order;
  const isDelivered = order?.status === "delivered";
  const deliveryOtp = order?.deliveryOtp || "4829";
  const otpDigits = deliveryOtp.split("");

  // Unified display data matching design
  const displayOrderNumber = order?.orderNumber || "GF-2048";
  const restaurantName = order?.restaurantName || "Bella Italia";
  const formattedEta = order?.arrivalEstimate || "18–24 min";
  const currencySymbol =
    order?.pricing?.currency === "INR"
      ? "₹"
      : order?.pricing?.currency === "USD"
      ? "$"
      : "£";
  const total = order?.pricing?.total ?? 11.76;
  const deliveryAddress =
    order?.deliveryAddress?.fullAddress || "221B Baker Street, London";

  // State to simulate or toggle driver assignment (default: driver assigned)
  // If backend explicitly says driver is null/undefined and order status is 'placed', defaults to false
  const [driverAssigned, setDriverAssigned] = useState<boolean>(() => {
    if (order) {
      if (order.driver) return true;
      if (order.status === "placed" || order.status === "accepted") return false;
    }
    return true; // Match the default v2 design reference with Alex
  });

  // Expandable bottom order summary state
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  // Driver details
  const courier = useMemo(() => {
    if (!driverAssigned) return null;
    return {
      name: order?.driver?.name || "Alex",
      role: order?.driver?.role || "Your courier",
      rating: order?.driver?.rating || 4.8,
      totalRatings: order?.driver?.totalRatings || 320,
      phone: order?.driver?.phone || "+44 7700 900456",
    };
  }, [driverAssigned, order]);

  // Order items preview
  const items = useMemo(() => {
    if (order?.items && order.items.length > 0) {
      return order.items;
    }
    return [
      { name: "Classic Margherita", subtitle: "Regular 10-inch", quantity: 1, price: 4.29 },
      { name: "Garlic Bread", subtitle: "", quantity: 1, price: 3.49 },
      { name: "Coca-Cola", subtitle: "330ml", quantity: 1, price: 1.5 },
    ];
  }, [order]);

  const handleCallCourier = () => {
    if (!courier) return;
    Alert.alert(
      `Call ${courier.name}`,
      `Would you like to call your courier at ${courier.phone}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => {
            Linking.openURL(`tel:${courier.phone}`).catch(() => {
              toast.info(`Calling courier: ${courier.phone}`);
            });
          },
        },
      ]
    );
  };

  const handleChatCourier = () => {
    if (!courier) return;
    toast.info(`💬 Opened chat with courier ${courier.name}`);
  };

  const handleContactSupport = () => {
    Alert.alert(
      "Courier Dispatch Status",
      "We are matching you with the nearest rider near Bella Italia. Food is being freshly prepared in the meantime.",
      [{ text: "OK" }]
    );
  };

  const getHeaderTitle = (status?: string): string => {
    switch (status) {
      case "placed":
        return "Order Confirmed";
      case "accepted":
        return "Courier Assigned";
      case "preparing":
        return "Kitchen Preparing Food";
      case "ready":
        return "Ready for Courier";
      case "picked_up":
        return "Courier Picked Up Food";
      case "on_the_way":
        return "Order on the way";
      case "delivered":
        return "Order Delivered! 🎉";
      case "cancelled":
        return "Order Cancelled";
      default:
        return "Order in Progress";
    }
  };

  const headerTitle = getHeaderTitle(order?.status);

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ─── TOP HEADER & STATUS ─── */}
      <View
        style={{
          paddingTop: Math.max(insets.top + 6, 18),
          paddingBottom: 8,
        }}
        className="px-5 bg-background border-b border-border/30"
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-muted/40 -ml-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather
              name="arrow-left"
              size={22}
              color={isDark ? "#F3F4F6" : "#111827"}
            />
          </Pressable>

          {/* Test State Switcher */}
          <Pressable
            onPress={() => setDriverAssigned((prev) => !prev)}
            className="px-2.5 py-1 rounded-full bg-muted/30 border border-border/60 flex-row items-center active:opacity-75"
          >
            <Text className="text-[10px] font-semibold text-muted-foreground mr-1">
              Driver:
            </Text>
            <Text
              className="text-[10px] font-bold"
              style={{ color: driverAssigned ? BRAND_TEAL : "#D97706" }}
            >
              {driverAssigned ? "Assigned (Alex)" : "Not Assigned"}
            </Text>
          </Pressable>
        </View>

        {/* Header Titles */}
        <View className="items-center mt-1">
          <Text className="text-xl font-extrabold text-foreground tracking-tight">
            {headerTitle}
          </Text>
          <Text className="text-xs text-muted-foreground font-semibold mt-0.5">
            {displayOrderNumber}
          </Text>
        </View>

        {/* ETA or Delivered Banner */}
        <View className="items-center mt-2.5 mb-1">
          <Text className="text-xs text-muted-foreground font-medium">
            {isDelivered ? "Status" : "Arrives in"}
          </Text>
          <Text
            className="text-2xl font-extrabold tracking-tight mt-0.5"
            style={{ color: BRAND_TEAL }}
          >
            {isDelivered ? "Delivered at your door" : formattedEta}
          </Text>
        </View>

        {/* 5-Step Status Stepper */}
        <View className="mt-2 mb-1">
          <OrderStepper currentStatus={order?.status || "placed"} />
        </View>
      </View>

      {/* ─── MAP CANVAS (London Vector Map) ─── */}
      <View className="flex-1 w-full relative">
        <OrderTrackingMap
          isDriverAssigned={driverAssigned}
          driverName={courier?.name || "Alex"}
          restaurantName={restaurantName}
          destinationAddress={deliveryAddress}
          height={370}
        />
      </View>

      {/* ─── DOCKED BOTTOM SECTION (Courier Card & Collapsible Summary) ─── */}
      <View
        className="px-5 pt-3 bg-background border-t border-border/50 gap-2.5"
        style={{ paddingBottom: Math.max(insets.bottom, 14) }}
      >
        {/* ── DELIVERY CONFIRMATION PIN CARD ── */}
        {!isDelivered ? (
          <View className="bg-emerald-50 dark:bg-emerald-950/40 border border-[#00B37A]/40 rounded-2xl p-3.5 shadow-xs">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <View className="w-6 h-6 rounded-full bg-[#00B37A]/20 items-center justify-center">
                  <Feather name="shield" size={13} color="#00B37A" />
                </View>
                <Text className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Delivery Confirmation PIN
                </Text>
              </View>
              <Text className="text-[11px] text-muted-foreground font-medium">
                Share with courier
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                {otpDigits.map((digit, idx) => (
                  <View
                    key={idx}
                    className="w-10 h-11 rounded-xl bg-white dark:bg-card border-2 border-[#00B37A] items-center justify-center shadow-xs"
                  >
                    <Text className="text-lg font-black text-[#00B37A]">
                      {digit}
                    </Text>
                  </View>
                ))}
              </View>
              <View className="flex-1 ml-3.5">
                <Text className="text-[11px] text-muted-foreground leading-4">
                  Share this 4-digit PIN with your driver upon arrival to complete delivery.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="bg-[#007A5E] rounded-2xl p-4 flex-row items-center justify-between shadow-xs">
            <View className="flex-row items-center flex-1 pr-3">
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
                <Feather name="check" size={22} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-extrabold text-base">
                  Delivered! 🎉
                </Text>
                <Text className="text-emerald-100 text-xs mt-0.5">
                  Verified with delivery confirmation PIN
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.replace("/orders")}
              className="bg-white px-3.5 py-2 rounded-xl active:bg-emerald-50"
            >
              <Text className="text-[#007A5E] font-bold text-xs">View Orders</Text>
            </Pressable>
          </View>
        )}
        {/* ── COURIER CARD OR NOT ASSIGNED STATE ── */}
        {driverAssigned && courier ? (
          <View className="bg-card rounded-2xl p-3.5 border border-border/70 shadow-sm flex-row items-center justify-between">
            {/* Courier avatar + info */}
            <View className="flex-row items-center flex-1 pr-2">
              <Image
                source={COURIER_AVATAR}
                style={{ width: 52, height: 52, borderRadius: 26 }}
                contentFit="cover"
                transition={200}
              />
              <View className="ml-3.5 flex-1">
                <Text className="text-base font-bold text-foreground">
                  {courier.name}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {courier.role}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text className="text-xs font-bold text-amber-500 ml-1">
                    {courier.rating.toFixed(1)}
                  </Text>
                  <Text className="text-xs text-muted-foreground ml-1">
                    ({courier.totalRatings})
                  </Text>
                </View>
              </View>
            </View>

            {/* Action buttons (Call & Chat) */}
            <View className="flex-row items-center gap-2.5">
              <Pressable
                onPress={handleCallCourier}
                className="w-11 h-11 rounded-full items-center justify-center border border-border/80 bg-background active:opacity-75 shadow-xs"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Feather
                  name="phone"
                  size={18}
                  color={isDark ? "#F3F4F6" : "#374151"}
                />
              </Pressable>

              <Pressable
                onPress={handleChatCourier}
                className="w-11 h-11 rounded-full items-center justify-center border border-border/80 bg-background active:opacity-75 shadow-xs"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={18}
                  color={isDark ? "#F3F4F6" : "#374151"}
                />
              </Pressable>
            </View>
          </View>
        ) : (
          /* ── "DRIVER NOT ASSIGNED YET" STATE ── */
          <View className="bg-card rounded-2xl p-4 border border-amber-500/40 shadow-sm flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 items-center justify-center mr-3.5">
                <MaterialCommunityIcons
                  name="moped-outline"
                  size={24}
                  color="#D97706"
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-sm font-bold text-foreground">
                    Driver not assigned yet
                  </Text>
                </View>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Finding nearest courier for {restaurantName}
                </Text>
                <Text className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1">
                  Food is being prepared
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleContactSupport}
              className="px-3 py-2 rounded-xl bg-muted/40 border border-border/80 active:opacity-75"
            >
              <Text className="text-xs font-semibold text-foreground">
                Status
              </Text>
            </Pressable>
          </View>
        )}

        {/* ── COLLAPSIBLE ORDER SUMMARY DRAWER ── */}
        <View className="bg-card rounded-2xl border border-border/70 overflow-hidden shadow-xs">
          <Pressable
            onPress={() => setSummaryExpanded((prev) => !prev)}
            className="flex-row items-center justify-between p-3.5 active:bg-muted/20"
          >
            <Text className="text-sm font-bold text-foreground">
              Order summary • {currencySymbol}
              {total.toFixed(2)}
            </Text>
            <Feather
              name={summaryExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={isDark ? "#9CA3AF" : "#4B5563"}
            />
          </Pressable>

          {/* Expanded Drawer Details */}
          {summaryExpanded && (
            <View className="px-3.5 pb-3.5 pt-1 border-t border-border/40">
              <View className="gap-2 mb-3">
                {items.map((it, idx) => (
                  <View
                    key={`${it.name}-${idx}`}
                    className="flex-row items-center justify-between"
                  >
                    <Text
                      className="text-xs text-foreground font-medium flex-1 pr-2"
                      numberOfLines={1}
                    >
                      {it.quantity}x {it.name}
                    </Text>
                    <Text className="text-xs text-muted-foreground font-medium">
                      {currencySymbol}
                      {(it.price * (it.quantity || 1)).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              <View className="h-[1px] bg-border/40 my-2" />

              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xs text-muted-foreground">Deliver to</Text>
                <Text
                  className="text-xs text-foreground font-medium max-w-[60%] text-right"
                  numberOfLines={1}
                >
                  {deliveryAddress}
                </Text>
              </View>

              {/* View Full Order Details button */}
              <Pressable
                onPress={() => router.push(`/order/${orderId}` as any)}
                className="w-full h-10 rounded-xl items-center justify-center border active:bg-muted/30 mt-1"
                style={{ borderColor: BRAND_TEAL }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: BRAND_TEAL }}
                >
                  View full order details
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
