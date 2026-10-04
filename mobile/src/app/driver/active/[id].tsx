import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Linking,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@tanstack/react-query";

import { fetchOrderByIdQueryFn, updateDriverStatusMutationFn } from "@/lib/api";
import { toast } from "@/lib/sonner";

export default function DriverActiveDeliveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Driver stage: 'heading_to_pickup' | 'picked_up' | 'delivered'
  const [stage, setStage] = useState<"heading_to_pickup" | "picked_up" | "delivered">("heading_to_pickup");
  const [itemsExpanded, setItemsExpanded] = useState(false);

  // Fetch real order data if present
  const { data } = useQuery({
    queryKey: ["driver", "active-order", id],
    queryFn: () => fetchOrderByIdQueryFn(id || ""),
    enabled: !!id && id !== "ready-order-1" && id !== "ready-order-2",
  });

  const order = data?.order;

  const isSecondOrder = id === "ready-order-2" || id === "CH-5802";
  const restaurantName = order?.restaurantName || (isSecondOrder ? "Bosco Pizza Co." : "Mama Chow's Kitchen");
  const restaurantAddress = order?.restaurantAddress || (isSecondOrder ? "Old Street Roundabout, London" : "3 Hoe Street");
  const restaurantPhone = "+44 20 7946 0192";

  const customerAddress = order?.deliveryAddress?.fullAddress || (isSecondOrder ? "88 Upper Street, Islington, N1 0NP" : "14 Bramley Road, E17 6QT");
  const customerPhone = order?.deliveryAddress?.contactPhone || "+44 7700 900222";

  const items = order?.items && order.items.length > 0 ? order.items : [
    { name: "Crispy Chilli Mutton", subtitle: "With egg fried rice", quantity: 1 },
    { name: "Steamed Dim Sum Platter", subtitle: "6 pieces dumplings", quantity: 1 },
    { name: "Jasmine Blossom Iced Tea", subtitle: "Cold brew 500ml", quantity: 1 },
  ];

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: ({ nextStatus, note }: { nextStatus: string; note?: string }) =>
      updateDriverStatusMutationFn({
        orderId: id || "CH-6401",
        status: nextStatus,
        note,
      }),
  });

  // Slider animation state
  const sliderWidth = 320;
  const buttonWidth = 56;
  const maxDrag = sliderWidth - buttonWidth - 8;
  const [slideAnim] = useState(() => new Animated.Value(0));

  const handleSlideAction = useCallback(() => {
    if (stage === "heading_to_pickup") {
      setStage("picked_up");
      updateStatus({
        nextStatus: "picked_up",
        note: `Order picked up from ${restaurantName} by driver`,
      });
      toast.success("Marked as Picked Up! 🥡 Head to drop-off address.");
    } else if (stage === "picked_up") {
      setStage("delivered");
      updateStatus({
        nextStatus: "delivered",
        note: `Delivered safely to ${customerAddress}`,
      });
      toast.success("Order Delivered successfully! 🎉 Shift stats updated.");
      setTimeout(() => {
        router.replace("/driver/history");
      }, 700);
    }
  }, [stage, updateStatus, restaurantName, customerAddress, router]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          const newX = Math.max(0, Math.min(gestureState.dx, maxDrag));
          slideAnim.setValue(newX);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx >= maxDrag * 0.7) {
            // Snap to end and trigger action
            Animated.timing(slideAnim, {
              toValue: maxDrag,
              duration: 150,
              useNativeDriver: false,
            }).start(() => {
              handleSlideAction();
              // Reset slide position
              Animated.timing(slideAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
              }).start();
            });
          } else {
            // Snap back
            Animated.spring(slideAnim, {
              toValue: 0,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    [handleSlideAction, maxDrag, slideAnim]
  );

  const openNavigation = (address: string) => {
    const encoded = encodeURIComponent(address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`).catch(() => {
      toast.info(`Navigating to ${address}`);
    });
  };

  const callContact = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      toast.info(`Calling ${phone}`);
    });
  };

  const isPickedUp = stage === "picked_up";
  const actionText = isPickedUp ? "Slide to mark delivered" : "Slide to mark picked up";
  const targetHeadline = isPickedUp ? customerAddress : restaurantName;

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 16),
          paddingHorizontal: 20,
          paddingBottom: 16,
        }}
        className="flex-row items-center justify-between border-b border-slate-100"
      >
        <Pressable
          onPress={() => router.push("/driver/home")}
          className="w-10 h-10 rounded-full border border-slate-200 items-center justify-center active:bg-slate-50"
          accessibilityLabel="Back to Driver Home"
        >
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </Pressable>

        <Text className="text-lg font-bold text-slate-900">
          Active delivery
        </Text>

        <Pressable
          onPress={() => router.push("/driver/history")}
          className="w-10 h-10 rounded-full border border-slate-200 items-center justify-center active:bg-slate-50"
          accessibilityLabel="History"
        >
          <Feather name="clock" size={18} color="#0f172a" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom + 24, 36),
        }}
        className="flex-1"
      >
        {/* Mint Top Banner matching active-delivery-design.png */}
        <View className="bg-[#EBF7F2] border border-[#CDEEE0] rounded-2xl p-4 mb-4 flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-[#007A5E]/15 items-center justify-center mr-3">
            <Feather name="map-pin" size={20} color="#007A5E" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-700">
              Head to
            </Text>
            <Text
              numberOfLines={2}
              className="text-base font-bold text-slate-900 tracking-tight"
            >
              {targetHeadline}
            </Text>
          </View>
        </View>

        {/* Pickup Card */}
        <View className="bg-white rounded-2xl border border-slate-200/90 p-4 mb-3.5 flex-row items-center justify-between shadow-xs">
          <View className="flex-1 pr-3">
            <Text className="text-xs font-bold text-[#007A5E] tracking-wider uppercase mb-0.5">
              Pickup
            </Text>
            <Text className="text-base font-bold text-slate-900 tracking-tight">
              {restaurantName}
            </Text>
            <Text className="text-sm text-slate-500 font-normal mt-0.5">
              {restaurantAddress}
            </Text>
          </View>

          {/* Action CTAs: Navigation & Call */}
          <View className="flex-row items-center gap-2.5">
            <Pressable
              onPress={() => openNavigation(restaurantAddress)}
              className="w-11 h-11 rounded-xl border border-[#007A5E]/30 bg-emerald-50/50 items-center justify-center active:bg-emerald-100"
              accessibilityLabel="Navigate to pickup"
            >
              <Feather name="navigation" size={19} color="#007A5E" />
            </Pressable>
            <Pressable
              onPress={() => callContact(restaurantPhone)}
              className="w-11 h-11 rounded-xl border border-[#007A5E]/30 bg-emerald-50/50 items-center justify-center active:bg-emerald-100"
              accessibilityLabel="Call restaurant"
            >
              <Feather name="phone" size={18} color="#007A5E" />
            </Pressable>
          </View>
        </View>

        {/* Drop-off Card */}
        <View className="bg-white rounded-2xl border border-slate-200/90 p-4 mb-4 flex-row items-center justify-between shadow-xs">
          <View className="flex-1 pr-3">
            <Text className="text-xs font-bold text-[#007A5E] tracking-wider uppercase mb-0.5">
              Drop-off
            </Text>
            <Text className="text-base font-bold text-slate-900 tracking-tight">
              {customerAddress}
            </Text>
          </View>

          {/* Action CTAs: Navigation & Call */}
          <View className="flex-row items-center gap-2.5">
            <Pressable
              onPress={() => openNavigation(customerAddress)}
              className="w-11 h-11 rounded-xl border border-[#007A5E]/30 bg-emerald-50/50 items-center justify-center active:bg-emerald-100"
              accessibilityLabel="Navigate to drop-off"
            >
              <Feather name="navigation" size={19} color="#007A5E" />
            </Pressable>
            <Pressable
              onPress={() => callContact(customerPhone)}
              className="w-11 h-11 rounded-xl border border-[#007A5E]/30 bg-emerald-50/50 items-center justify-center active:bg-emerald-100"
              accessibilityLabel="Call customer"
            >
              <Feather name="phone" size={18} color="#007A5E" />
            </Pressable>
          </View>
        </View>

        {/* Collapsible 3 Items Card */}
        <View className="bg-white rounded-2xl border border-slate-200/90 p-4 mb-8 shadow-xs">
          <Pressable
            onPress={() => setItemsExpanded(!itemsExpanded)}
            className="flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Feather name="package" size={20} color="#007A5E" style={{ marginRight: 10 }} />
              <Text className="text-base font-bold text-slate-900">
                {items.length} items
              </Text>
            </View>
            <Feather
              name={itemsExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#64748b"
            />
          </Pressable>

          {itemsExpanded && (
            <View className="mt-3 pt-3 border-t border-slate-100 gap-2">
              {items.map((item: any, idx: number) => (
                <View key={idx} className="flex-row items-start justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-semibold text-slate-800">
                      {item.quantity || 1}x {item.name}
                    </Text>
                    {item.subtitle && (
                      <Text className="text-xs text-slate-500">
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Slide To Action Button matching active-delivery-design.png */}
        <View className="items-center mt-4">
          <View
            className="w-full bg-[#EBF7F2] border border-[#CDEEE0] rounded-full h-15 p-1 justify-center relative overflow-hidden"
            style={{ height: 62 }}
          >
            {/* Center Label */}
            <Text className="text-center font-bold text-sm text-[#007A5E] tracking-wide">
              {actionText}
            </Text>

            {/* Draggable Circle Slider */}
            <Animated.View
              {...panResponder.panHandlers}
              style={{
                position: "absolute",
                left: 4,
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: "#007A5E",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#007A5E",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
                transform: [{ translateX: slideAnim }],
              }}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Feather name="arrow-right" size={22} color="#ffffff" />
              )}
            </Animated.View>
          </View>

          {/* Quick tap fallback for testing accessibility */}
          <Pressable
            onPress={handleSlideAction}
            className="mt-3 py-1 px-4 active:opacity-70"
          >
            <Text className="text-xs font-medium text-slate-400">
              Tap here if slide gesture is unavailable
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
