import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import { OrderStepper } from "@/components/order/order-stepper";
import { useBasket } from "@/context/basket-context";
import { fetchOrderByIdQueryFn } from "@/lib/api";
import { toast } from "@/lib/sonner";

const BRAND_TEAL = "#007A5A";

// Default realistic reference items matching the design 1:1
const DEFAULT_ORDER_ITEMS = [
  {
    name: "Classic Margherita",
    subtitle: "Regular 10-inch",
    quantity: 1,
    price: 4.29,
    itemTotal: 4.29,
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80",
  },
  {
    name: "Garlic Bread",
    subtitle: "",
    quantity: 1,
    price: 3.49,
    itemTotal: 3.49,
    image:
      "https://images.unsplash.com/photo-1619895092538-128341789043?w=500&auto=format&fit=crop&q=80",
  },
  {
    name: "Coca-Cola",
    subtitle: "330ml",
    quantity: 1,
    price: 1.5,
    itemTotal: 1.5,
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80",
  },
];

export default function OrderDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";
  const { addItem } = useBasket();

  const { id } = useLocalSearchParams<{ id?: string }>();
  const orderId = id || "GF-2048";

  const [receiptModalVisible, setReceiptModalVisible] = useState(false);

  // Fetch real order from backend if valid mongo ID or order number
  const { data: orderData } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderByIdQueryFn(orderId),
    enabled: Boolean(orderId && orderId !== "GF-2048"),
    retry: 1,
  });

  const order = orderData?.order;

  // Unified display data matching design
  const displayOrderNumber = order?.orderNumber || "GF-2048";
  const restaurantName = order?.restaurantName || "Bella Italia";
  const restaurantAddress =
    order?.restaurantAddress || "221B Baker Street, London";
  const restaurantImage =
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80";

  const orderStatus = order?.status || "on_the_way";
  const displayStatus =
    orderStatus === "delivered"
      ? "Delivered"
      : orderStatus === "cancelled"
      ? "Cancelled"
      : "On the way";

  const items = useMemo(() => {
    if (order?.items && order.items.length > 0) {
      return order.items;
    }
    return DEFAULT_ORDER_ITEMS;
  }, [order]);

  const currencySymbol =
    order?.pricing?.currency === "INR"
      ? "₹"
      : order?.pricing?.currency === "USD"
      ? "$"
      : "£";

  const subtotal = order?.pricing?.subtotal ?? 9.28;
  const deliveryFee = order?.pricing?.deliveryFee ?? 1.49;
  const serviceFee = order?.pricing?.serviceFee ?? 0.99;
  const total = order?.pricing?.total ?? 11.76;

  const deliveryAddress =
    order?.deliveryAddress?.fullAddress || "221B Baker Street, London";
  const paymentCard =
    order?.payment?.cardLast4 ? `•••• ${order.payment.cardLast4}` : "•••• 4242";

  // Reorder all items into basket
  const handleReorder = async () => {
    try {
      for (const it of items) {
        await addItem({
          name: it.name,
          subtitle: it.subtitle || "",
          price: it.price,
          quantity: it.quantity || 1,
          image: (it as any).image || restaurantImage,
        });
      }
      toast.success("Added items to your basket! 🛒", {
        action: {
          label: "View Basket",
          onClick: () => router.push("/basket"),
        },
      });
    } catch {
      toast.error("Could not add items to basket");
    }
  };

  // Navigate to live tracking screen
  const handleTrackOrder = () => {
    router.push(`/order/track/${orderId}` as any);
  };

  // Call restaurant
  const handleCallRestaurant = () => {
    Alert.alert(
      `Call ${restaurantName}`,
      "Would you like to call the restaurant?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => {
            Linking.openURL("tel:+442079460192").catch(() => {
              toast.info("Phone: +44 20 7946 0192");
            });
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ─── TOP HEADER ─── */}
      <View
        style={{
          paddingTop: Math.max(insets.top + 6, 18),
          paddingBottom: 10,
        }}
        className="px-5 border-b border-border/40 bg-background"
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

          <View className="items-center flex-1 pr-8">
            <Text className="text-lg font-bold text-foreground tracking-tight">
              Order details
            </Text>
            <Text className="text-xs text-muted-foreground font-medium mt-0.5">
              {displayOrderNumber}
            </Text>
          </View>
        </View>

        {/* Status text */}
        <View className="items-center justify-center mt-1.5">
          <Text
            className="text-base font-bold tracking-tight"
            style={{ color: BRAND_TEAL }}
          >
            {displayStatus}
          </Text>
        </View>
      </View>

      {/* ─── SCROLLABLE CONTENT ─── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom + 90, 110),
        }}
      >
        {/* ─── 1. STATUS STEPPER ─── */}
        <View className="my-2">
          <OrderStepper currentStatus={orderStatus} />
        </View>

        {/* ─── 2. RESTAURANT CARD ─── */}
        <View className="bg-card rounded-2xl p-3.5 border border-border/70 shadow-xs flex-row items-center justify-between mt-3 mb-6">
          <View className="flex-row items-center flex-1">
            <Image
              source={{ uri: restaurantImage }}
              style={{ width: 56, height: 56, borderRadius: 12 }}
              contentFit="cover"
              transition={200}
            />
            <View className="ml-3.5 flex-1 pr-2">
              <Text
                className="text-base font-bold text-foreground"
                numberOfLines={1}
              >
                {restaurantName}
              </Text>
              <Pressable
                onPress={() =>
                  router.push(
                    `/restaurant/${order?.restaurantId || "bella-italia"}` as any
                  )
                }
                className="mt-1 self-start"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: BRAND_TEAL }}
                >
                  View menu
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Call button */}
          <Pressable
            onPress={handleCallRestaurant}
            className="w-11 h-11 rounded-full items-center justify-center border border-border/80 bg-background active:opacity-75 shadow-xs"
          >
            <Feather
              name="phone"
              size={18}
              color={isDark ? "#F3F4F6" : "#374151"}
            />
          </Pressable>
        </View>

        {/* ─── 3. ITEMS LIST ─── */}
        <View className="mb-6">
          <Text className="text-[15px] font-bold text-foreground mb-3">
            Items
          </Text>

          <View className="bg-card rounded-2xl p-4 border border-border/70 shadow-xs">
            {/* Items rows */}
            {items.map((item, index) => (
              <View
                key={`${item.name}-${index}`}
                className={`flex-row items-center justify-between py-2.5 ${
                  index > 0 ? "border-t border-border/40" : ""
                }`}
              >
                <View className="flex-1 pr-3">
                  <Text className="text-sm font-semibold text-foreground">
                    {item.name}
                  </Text>
                  {Boolean(item.subtitle) && (
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {item.subtitle}
                    </Text>
                  )}
                </View>

                {/* Quantity */}
                <Text className="text-sm font-medium text-foreground mr-6">
                  {item.quantity || 1}
                </Text>

                {/* Price */}
                <Text className="text-sm font-bold text-foreground min-w-[50px] text-right">
                  {currencySymbol}
                  {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </Text>
              </View>
            ))}

            {/* Divider */}
            <View className="h-[1px] bg-border/70 my-3" />

            {/* Subtotal & Fees */}
            <View className="gap-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-muted-foreground">Subtotal</Text>
                <Text className="text-xs font-semibold text-foreground">
                  {currencySymbol}
                  {subtotal.toFixed(2)}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-muted-foreground">
                  Delivery fee
                </Text>
                <Text className="text-xs font-semibold text-foreground">
                  {currencySymbol}
                  {deliveryFee.toFixed(2)}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-muted-foreground">
                  Service fee
                </Text>
                <Text className="text-xs font-semibold text-foreground">
                  {currencySymbol}
                  {serviceFee.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Total */}
            <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-border/70">
              <Text className="text-base font-extrabold text-foreground">
                Total
              </Text>
              <Text className="text-base font-extrabold text-foreground">
                {currencySymbol}
                {total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* ─── 4. INFO LIST GROUP ─── */}
        <View className="bg-card rounded-2xl border border-border/70 shadow-xs overflow-hidden mb-6">
          {/* Payment Method */}
          <View className="flex-row items-center justify-between p-4 border-b border-border/50">
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 rounded-lg bg-muted/40 items-center justify-center mr-3">
                <Feather
                  name="credit-card"
                  size={16}
                  color={isDark ? "#9CA3AF" : "#4B5563"}
                />
              </View>
              <Text className="text-xs font-medium text-muted-foreground">
                Payment method
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-xs font-black text-blue-600 tracking-wider mr-1.5">
                VISA
              </Text>
              <Text className="text-xs font-semibold text-foreground">
                Visa {paymentCard}
              </Text>
            </View>
          </View>

          {/* Delivery Address */}
          <View className="flex-row items-center justify-between p-4 border-b border-border/50">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-muted/40 items-center justify-center mr-3">
                <Feather
                  name="map-pin"
                  size={16}
                  color={isDark ? "#9CA3AF" : "#4B5563"}
                />
              </View>
              <Text className="text-xs font-medium text-muted-foreground">
                Delivery address
              </Text>
            </View>
            <Text
              className="text-xs font-medium text-foreground max-w-[55%] text-right"
              numberOfLines={1}
            >
              {deliveryAddress}
            </Text>
          </View>

          {/* View Receipt */}
          <Pressable
            onPress={() => setReceiptModalVisible(true)}
            className="flex-row items-center justify-between p-4 border-b border-border/50 active:bg-muted/30"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-muted/40 items-center justify-center mr-3">
                <MaterialCommunityIcons
                  name="receipt-text-outline"
                  size={18}
                  color={isDark ? "#9CA3AF" : "#4B5563"}
                />
              </View>
              <Text className="text-xs font-medium text-foreground">
                View receipt
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color="#9CA3AF" />
          </Pressable>

          {/* Get Help */}
          <Pressable
            onPress={() =>
              Alert.alert(
                "Chowly Support",
                "How can we help you with this order?\n\n• Order delayed\n• Missing or wrong item\n• Change delivery instructions",
                [
                  { text: "Close", style: "cancel" },
                  {
                    text: "Chat with Support",
                    onPress: () =>
                      toast.info("Connecting to Chowly Live Support... 💬"),
                  },
                ]
              )
            }
            className="flex-row items-center justify-between p-4 active:bg-muted/30"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-muted/40 items-center justify-center mr-3">
                <Feather
                  name="help-circle"
                  size={17}
                  color={isDark ? "#9CA3AF" : "#4B5563"}
                />
              </View>
              <Text className="text-xs font-medium text-foreground">
                Get help
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color="#9CA3AF" />
          </Pressable>
        </View>
      </ScrollView>

      {/* ─── DOCKED BOTTOM ACTIONS ─── */}
      <View
        className="absolute bottom-0 left-0 right-0 px-5 pt-3 bg-background/95 border-t border-border/60 flex-row gap-3"
        style={{ paddingBottom: Math.max(insets.bottom, 18) }}
      >
        {/* Reorder Button */}
        <Pressable
          onPress={handleReorder}
          className="flex-1 h-12 rounded-xl items-center justify-center border active:bg-muted/30"
          style={{ borderColor: BRAND_TEAL, backgroundColor: "transparent" }}
        >
          <Text
            className="text-[15px] font-bold tracking-wide"
            style={{ color: BRAND_TEAL }}
          >
            Reorder
          </Text>
        </Pressable>

        {/* Track Order Button */}
        <Pressable
          onPress={handleTrackOrder}
          className="flex-1 h-12 rounded-xl items-center justify-center active:opacity-90 shadow-xs"
          style={{ backgroundColor: BRAND_TEAL }}
        >
          <Text className="text-[15px] font-bold text-white tracking-wide">
            Track order
          </Text>
        </Pressable>
      </View>

      {/* ─── RECEIPT MODAL ─── */}
      <Modal
        visible={receiptModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReceiptModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View
            className="bg-card rounded-t-3xl p-6"
            style={{ paddingBottom: Math.max(insets.bottom + 16, 32) }}
          >
            <View className="items-center mb-4">
              <View className="w-12 h-1.5 bg-muted rounded-full mb-3" />
              <Text className="text-lg font-bold text-foreground">
                Electronic Receipt
              </Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                Order #{displayOrderNumber}
              </Text>
            </View>

            <View className="bg-muted/20 rounded-xl p-4 mb-4 gap-2 border border-border/50">
              <Text className="text-xs font-bold text-foreground">
                Restaurant: {restaurantName}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {restaurantAddress}
              </Text>
              <Text className="text-xs text-muted-foreground">
                Paid with Visa {paymentCard}
              </Text>
              <Text className="text-xs text-muted-foreground">
                Delivered to {deliveryAddress}
              </Text>
              <View className="h-[1px] bg-border my-2" />
              <View className="flex-row justify-between">
                <Text className="text-sm font-bold text-foreground">Total Paid</Text>
                <Text className="text-sm font-bold text-foreground">
                  {currencySymbol}
                  {total.toFixed(2)}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setReceiptModalVisible(false)}
              className="h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: BRAND_TEAL }}
            >
              <Text className="text-white font-bold">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
