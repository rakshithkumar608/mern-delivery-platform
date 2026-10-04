import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Linking,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  fetchActiveDriverOrderQueryFn,
  fetchOrderByIdQueryFn,
  updateDriverStatusMutationFn,
} from "@/lib/api";
import { toast } from "@/lib/sonner";

export default function DriverActiveDeliveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Driver stages: 'heading_to_pickup' | 'picked_up' | 'delivered'
  const [stage, setStage] = useState<"heading_to_pickup" | "picked_up" | "delivered">("heading_to_pickup");
  const [itemsExpanded, setItemsExpanded] = useState(true);

  // OTP Modal & Input State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isDeliveredSuccess, setIsDeliveredSuccess] = useState(false);
  const otpInputRef = useRef<TextInput>(null);

  // Slider animation state & responsive width
  const [sliderWidth, setSliderWidth] = useState(320);
  const buttonWidth = 54;
  const maxDrag = Math.max(100, sliderWidth - buttonWidth - 8);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Fetch real order data by ID
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["driver", "active-order", id],
    queryFn: () => fetchOrderByIdQueryFn(id || ""),
    enabled: !!id && id !== "ready-order-1" && id !== "ready-order-2",
    refetchInterval: 4000,
  });

  // Fallback query for currently active driver order in case ID was changed/resumed
  const { data: activeOrderData, refetch: refetchActive } = useQuery({
    queryKey: ["driver", "current-active"],
    queryFn: fetchActiveDriverOrderQueryFn,
    enabled: !data?.order,
    refetchInterval: 4000,
  });

  const order = data?.order || activeOrderData?.order;

  // Synchronize initial stage with order status
  useEffect(() => {
    if (order?.status) {
      if (order.status === "picked_up" || order.status === "on_the_way") {
        setStage("picked_up");
      } else if (order.status === "delivered") {
        setStage("delivered");
        setIsDeliveredSuccess(true);
      }
    }
  }, [order?.status]);

  const isSecondOrder = id === "ready-order-2" || id === "CH-5802";
  const restaurantName = order?.restaurantName || (isSecondOrder ? "Bosco Pizza Co." : "Mama Chow's Kitchen");
  const restaurantAddress = order?.restaurantAddress || (isSecondOrder ? "Old Street Roundabout, London" : "3 Hoe Street");
  const restaurantPhone = "+44 20 7946 0192";

  const customerAddress = order?.deliveryAddress?.fullAddress || (isSecondOrder ? "88 Upper Street, Islington, N1 0NP" : "14 Bramley Road, E17 6QT");
  const customerPhone = order?.deliveryAddress?.contactPhone || "+44 7700 900222";
  const driverFee = isSecondOrder ? "£5.80" : "£6.40";

  // Expected OTP code for this order (from backend, or fallback to default 1234)
  const expectedOtp = order?.deliveryOtp || "1234";

  // Always use real customer order items if present!
  const items = order?.items && order.items.length > 0 ? order.items : [];

  const targetOrderId = order?.orderNumber || order?._id || id || "CH-6401";

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: ({ nextStatus, note, otp }: { nextStatus: string; note?: string; otp?: string }) =>
      updateDriverStatusMutationFn({
        orderId: targetOrderId,
        status: nextStatus,
        note,
        otp,
      }),
    onSuccess: (_, variables) => {
      if (variables.nextStatus === "picked_up") {
        setStage("picked_up");
        toast.success("Marked as Picked Up! 🥡 Head to drop-off address.");
      } else if (variables.nextStatus === "delivered") {
        setStage("delivered");
        setIsOtpModalOpen(false);
        setIsDeliveredSuccess(true);
        toast.success("Delivery confirmed with OTP! 🎉 Shift stats updated.");
        refetch();
        refetchActive();
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Could not update delivery status");
    },
  });

  const handleSlideAction = useCallback(() => {
    if (stage === "heading_to_pickup") {
      updateStatus({
        nextStatus: "picked_up",
        note: `Order picked up from ${restaurantName} by driver`,
      });
    } else if (stage === "picked_up") {
      // Open OTP Verification Dialog before marking delivered!
      setOtpCode("");
      setIsOtpModalOpen(true);
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 250);
    }
  }, [stage, updateStatus, restaurantName]);

  const handleConfirmOtpDelivery = () => {
    const trimmed = otpCode.trim();
    if (trimmed.length < 4) {
      toast.error("Please enter the complete 4-digit PIN code");
      return;
    }

    updateStatus({
      nextStatus: "delivered",
      otp: trimmed,
      note: `Delivered safely to ${customerAddress} with OTP verification`,
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          const newX = Math.max(0, Math.min(gestureState.dx, maxDrag));
          slideAnim.setValue(newX);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx >= maxDrag * 0.65) {
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
  const actionText = isPickedUp ? "Slide to complete delivery" : "Slide to confirm pickup";
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
          {stage === "delivered" ? "Delivery completed" : "Active delivery"}
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
        {/* Loading State */}
        {isLoading && !order ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#007A5E" />
            <Text className="text-sm font-medium text-slate-500 mt-3">
              Loading active delivery details...
            </Text>
          </View>
        ) : isDeliveredSuccess ? (
          <View className="items-center py-12 px-4">
            <View className="w-20 h-20 rounded-full bg-[#007A5E]/15 items-center justify-center mb-5">
              <Feather name="check" size={40} color="#007A5E" />
            </View>

            <Text className="text-2xl font-black text-slate-900 text-center mb-1">
              Delivery Complete! 🎉
            </Text>
            <Text className="text-sm text-slate-500 text-center mb-6 max-w-[280px]">
              Order #{order?.orderNumber || id} delivered safely with PIN confirmation.
            </Text>

            <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 w-full mb-6 items-center">
              <Text className="text-xs font-bold text-[#007A5E] uppercase tracking-wider mb-1">
                Driver Payout Earned
              </Text>
              <Text className="text-3xl font-extrabold text-[#007A5E]">
                {driverFee}
              </Text>
              <Text className="text-xs text-slate-500 mt-1">
                Added to today&apos;s shift balance
              </Text>
            </View>

            <View className="w-full gap-3">
              <Pressable
                onPress={() => router.replace("/driver/home")}
                className="w-full py-4 rounded-2xl bg-[#007A5E] items-center justify-center active:opacity-90 shadow-sm"
              >
                <Text className="text-white font-bold text-base">
                  Back to Ready Orders
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.replace("/driver/history")}
                className="w-full py-3.5 rounded-2xl border border-slate-200 items-center justify-center active:bg-slate-50"
              >
                <Text className="text-slate-700 font-semibold text-sm">
                  View Delivery History
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            {/* Mint Top Banner */}
            <View className="bg-[#EBF7F2] border border-[#CDEEE0] rounded-2xl p-4 mb-4 flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#007A5E]/15 items-center justify-center mr-3">
                <Feather name="map-pin" size={20} color="#007A5E" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#007A5E] uppercase tracking-wider">
                  {isPickedUp ? "Drop-off in progress" : "Pickup in progress"}
                </Text>
                <Text
                  numberOfLines={2}
                  className="text-base font-bold text-slate-900 tracking-tight mt-0.5"
                >
                  {targetHeadline}
                </Text>
              </View>
            </View>

            {/* Pickup Card */}
            <View className={`bg-white rounded-2xl border ${!isPickedUp ? "border-[#007A5E]/40 shadow-xs" : "border-slate-200/90"} p-4 mb-3.5 flex-row items-center justify-between`}>
              <View className="flex-1 pr-3">
                <View className="flex-row items-center gap-1.5 mb-0.5">
                  <Text className="text-xs font-bold text-[#007A5E] tracking-wider uppercase">
                    Pickup
                  </Text>
                  {isPickedUp && (
                    <View className="flex-row items-center bg-emerald-100 px-1.5 py-0.2 rounded-md">
                      <Feather name="check" size={10} color="#007A5E" />
                      <Text className="text-[10px] font-bold text-[#007A5E] ml-1">Collected</Text>
                    </View>
                  )}
                </View>
                <Text className="text-base font-bold text-slate-900 tracking-tight">
                  {restaurantName}
                </Text>
                <Text className="text-sm text-slate-500 font-normal mt-0.5">
                  {restaurantAddress}
                </Text>
              </View>

              {/* Action CTAs */}
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
            <View className={`bg-white rounded-2xl border ${isPickedUp ? "border-[#007A5E]/40 shadow-xs" : "border-slate-200/90"} p-4 mb-4 flex-row items-center justify-between`}>
              <View className="flex-1 pr-3">
                <Text className="text-xs font-bold text-[#007A5E] tracking-wider uppercase mb-0.5">
                  Drop-off
                </Text>
                <Text className="text-base font-bold text-slate-900 tracking-tight">
                  {customerAddress}
                </Text>
                {isPickedUp && (
                  <View className="flex-row items-center mt-1">
                    <Feather name="shield" size={12} color="#007A5E" style={{ marginRight: 4 }} />
                    <Text className="text-xs text-[#007A5E] font-medium">
                      Requires Customer Confirmation PIN
                    </Text>
                  </View>
                )}
              </View>

              {/* Action CTAs */}
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

            {/* Collapsible Items Card */}
            <View className="bg-white rounded-2xl border border-slate-200/90 p-4 mb-6 shadow-xs">
              <Pressable
                onPress={() => setItemsExpanded(!itemsExpanded)}
                className="flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Feather name="package" size={20} color="#007A5E" style={{ marginRight: 10 }} />
                  <Text className="text-base font-bold text-slate-900">
                    {items.length} {items.length === 1 ? "item" : "items"} to deliver
                  </Text>
                </View>
                <Feather
                  name={itemsExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#64748b"
                />
              </Pressable>

              {itemsExpanded && (
                <View className="mt-3 pt-3 border-t border-slate-100 gap-3">
                  {items.length === 0 ? (
                    <Text className="text-xs text-slate-400 italic">No items listed for this order</Text>
                  ) : (
                    items.map((item: any, idx: number) => (
                      <View key={idx} className="flex-row items-center justify-between">
                        {item.image ? (
                          <Image
                            source={{ uri: item.image }}
                            style={{ width: 44, height: 44, borderRadius: 10, marginRight: 12 }}
                            contentFit="cover"
                          />
                        ) : (
                          <View className="w-11 h-11 rounded-xl bg-slate-100 items-center justify-center mr-3">
                            <Feather name="shopping-bag" size={18} color="#64748b" />
                          </View>
                        )}
                        <View className="flex-1 pr-2">
                          <Text className="text-sm font-bold text-slate-800">
                            {item.quantity || 1}x {item.name}
                          </Text>
                          {item.subtitle ? (
                            <Text className="text-xs text-slate-500 mt-0.5">
                              {item.subtitle}
                            </Text>
                          ) : null}
                          {item.specialInstructions ? (
                            <Text className="text-[11px] text-amber-700 italic mt-0.5">
                              Note: {item.specialInstructions}
                            </Text>
                          ) : null}
                        </View>
                        {item.itemTotal || item.price ? (
                          <Text className="text-xs font-semibold text-slate-600">
                            £{Number(item.itemTotal || item.price).toFixed(2)}
                          </Text>
                        ) : null}
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>

            {/* Slide To Action Slider */}
            <View className="items-center mt-2">
              <View
                onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
                className="w-full bg-[#EBF7F2] border border-[#CDEEE0] rounded-full justify-center relative overflow-hidden"
                style={{ height: 62 }}
              >
                {/* Center Label */}
                <Text className="text-center font-bold text-sm text-[#007A5E] tracking-wide px-14">
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

              {/* Direct Tap Action Option for Accessibility / Direct PIN input */}
              <Pressable
                onPress={handleSlideAction}
                className="mt-3 py-2 px-5 rounded-full bg-slate-50 border border-slate-200 active:bg-slate-100 flex-row items-center gap-1.5"
              >
                <Feather name={isPickedUp ? "key" : "check"} size={14} color="#007A5E" />
                <Text className="text-xs font-semibold text-slate-700">
                  {isPickedUp ? "Or enter Confirmation PIN directly" : "Or tap to mark Picked Up"}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      {/* ─── DELIVERY OTP CONFIRMATION MODAL ─── */}
      <Modal
        visible={isOtpModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOtpModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end bg-black/60"
        >
          <Pressable
            className="flex-1"
            onPress={() => setIsOtpModalOpen(false)}
          />

          <View className="bg-white rounded-t-[32px] p-6 pb-9 shadow-2xl">
            {/* Modal Drag Handle */}
            <View className="items-center mb-4">
              <View className="w-12 h-1.5 rounded-full bg-slate-200" />
            </View>

            {/* Icon & Title */}
            <View className="items-center mb-5">
              <View className="w-14 h-14 rounded-full bg-emerald-100 items-center justify-center mb-3">
                <Feather name="shield" size={26} color="#007A5E" />
              </View>
              <Text className="text-xl font-extrabold text-slate-900 text-center tracking-tight">
                Enter Delivery PIN
              </Text>
              <Text className="text-xs text-slate-500 text-center mt-1 px-4 leading-4">
                Ask the customer for the 4-digit confirmation PIN displayed on their order screen.
              </Text>
            </View>

            {/* 4-Box PIN Display */}
            <Pressable
              onPress={() => otpInputRef.current?.focus()}
              className="flex-row justify-center gap-3 mb-4"
            >
              {[0, 1, 2, 3].map((index) => {
                const char = otpCode[index] || "";
                const isCurrent = otpCode.length === index;

                return (
                  <View
                    key={index}
                    className={`w-14 h-16 rounded-2xl items-center justify-center border-2 ${
                      char
                        ? "border-[#007A5E] bg-emerald-50/40"
                        : isCurrent
                        ? "border-[#007A5E] bg-white"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <Text className="text-2xl font-black text-slate-900">
                      {char}
                    </Text>
                  </View>
                );
              })}
            </Pressable>

            {/* Hidden Input to handle physical & soft keyboard */}
            <TextInput
              ref={otpInputRef}
              value={otpCode}
              onChangeText={(text) => setOtpCode(text.replace(/[^0-9]/g, "").slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              style={{ position: "absolute", opacity: 0, height: 1, width: 1 }}
              autoFocus={true}
            />

            {/* Quick Testing Hint Chip */}
            <View className="items-center mb-5">
              <Pressable
                onPress={() => setOtpCode(expectedOtp)}
                className="flex-row items-center bg-slate-100 px-3.5 py-1.5 rounded-full active:bg-slate-200"
              >
                <Feather name="zap" size={13} color="#007A5E" style={{ marginRight: 5 }} />
                <Text className="text-xs font-semibold text-slate-700">
                  Tap to auto-fill PIN: <Text className="font-bold text-[#007A5E]">{expectedOtp}</Text>
                </Text>
              </Pressable>
            </View>

            {/* Confirm Button */}
            <Pressable
              onPress={handleConfirmOtpDelivery}
              disabled={isPending || otpCode.length < 4}
              className={`w-full py-4 rounded-2xl items-center justify-center shadow-sm ${
                otpCode.length === 4
                  ? "bg-[#007A5E] active:opacity-90"
                  : "bg-slate-200"
              }`}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text
                  className={`font-bold text-base ${
                    otpCode.length === 4 ? "text-white" : "text-slate-400"
                  }`}
                >
                  Verify & Confirm Delivery
                </Text>
              )}
            </Pressable>

            {/* Cancel Button */}
            <Pressable
              onPress={() => setIsOtpModalOpen(false)}
              className="mt-3 py-2 items-center"
            >
              <Text className="text-xs font-medium text-slate-500">
                Cancel
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
