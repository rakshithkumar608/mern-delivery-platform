import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import {
  fetchActiveDriverOrderQueryFn,
  fetchDeliveryRulesQueryFn,
  fetchReadyOrdersQueryFn,
  User,
} from "@/lib/api";
import { getUser, removeToken } from "@/features/auth/token-storage";
import { toast } from "@/lib/sonner";

export default function DriverHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(true);
  const [driverName, setDriverName] = useState("Tunde A.");

  useEffect(() => {
    getUser<User>().then((user) => {
      if (user?.name) {
        setDriverName(user.name);
      }
    });
  }, []);

  // Delivery rules & driver payout configuration
  const { data: rulesData } = useQuery({
    queryKey: ["delivery-rules"],
    queryFn: fetchDeliveryRulesQueryFn,
    staleTime: 60000,
  });
  const rules = rulesData?.rules;

  // Poll for ready orders
  const {
    data,
    isLoading,
    isRefetching,
    refetch: refetchReady,
  } = useQuery({
    queryKey: ["driver", "ready-orders"],
    queryFn: fetchReadyOrdersQueryFn,
    enabled: isOnline,
    refetchInterval: isOnline ? 6000 : false,
  });

  // Check if driver has an active delivery in progress
  const {
    data: activeData,
    refetch: refetchActive,
  } = useQuery({
    queryKey: ["driver", "active-order-summary"],
    queryFn: fetchActiveDriverOrderQueryFn,
    enabled: isOnline,
    refetchInterval: isOnline ? 4000 : false,
  });

  const activeDelivery = activeData?.order;

  const handleLogout = async () => {
    await removeToken();
    toast.success("Logged out successfully");
    router.replace("/(auth)/login");
  };

  const handleSwitchToCustomer = () => {
    router.replace("/home");
  };

  const handleToggleOnline = (value: boolean) => {
    setIsOnline(value);
    if (value) {
      toast.success("You are now Online and receiving deliveries 🟢");
    } else {
      toast.info("You are now Offline ⚪");
    }
  };

  // Strictly filter out any delivered or cancelled orders
  const apiOrders = (data?.orders || []).filter(
    (item: any) => item.status !== "delivered" && item.status !== "cancelled"
  );

  const onRefresh = useCallback(() => {
    if (isOnline) {
      refetchReady();
      refetchActive();
    }
  }, [isOnline, refetchReady, refetchActive]);

  return (
    <View className="flex-1 bg-[#00A876]">
      <StatusBar style="light" />

      {/* Header Teal Area */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 16),
          paddingHorizontal: 20,
          paddingBottom: 28,
        }}
        className="bg-[#00A876]"
      >
        {/* Top Status Bar: Online Switch & Quick Action Nav */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-white text-base font-semibold">
              {isOnline ? "Online" : "Offline"}
            </Text>
            <View
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? "bg-emerald-300" : "bg-white/40"
              }`}
            />
          </View>

          <View className="flex-row items-center gap-3">
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: "#007A5E", true: "#ffffff" }}
              thumbColor={isOnline ? "#00A876" : "#ffffff"}
              ios_backgroundColor="#007A5E"
            />
            {/* Delivery History button */}
            <Pressable
              onPress={() => router.push("/driver/history")}
              className="w-9 h-9 rounded-full bg-white/20 items-center justify-center active:bg-white/30"
              accessibilityLabel="Delivery history"
            >
              <Feather name="clock" size={17} color="#ffffff" />
            </Pressable>
            {/* Logout / Switch Account */}
            <Pressable
              onPress={handleLogout}
              className="w-9 h-9 rounded-full bg-white/20 items-center justify-center active:bg-white/30"
              accessibilityLabel="Log out"
            >
              <Feather name="log-out" size={16} color="#ffffff" />
            </Pressable>
          </View>
        </View>

        {/* Driver Name & Shift Stats */}
        <Text className="text-3xl font-extrabold text-white tracking-tight">
          {driverName}
        </Text>
        <Text className="text-emerald-100 text-sm font-medium mt-1">
          Shift active • Ready for dispatch
        </Text>
      </View>

      {/* Main Content Card Container */}
      <View className="flex-1 bg-white rounded-t-[32px] overflow-hidden">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: Math.max(insets.bottom + 20, 36),
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              tintColor="#00A876"
            />
          }
        >
          {/* Active Delivery in Progress Banner */}
          {activeDelivery && (
            <View className="mb-6 bg-[#EBF7F2] border-2 border-[#00A876] rounded-2xl p-4 shadow-sm">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-1.5">
                  <View className="w-2.5 h-2.5 rounded-full bg-[#00A876]" />
                  <Text className="text-xs font-bold text-[#007A5E] uppercase tracking-wider">
                    Delivery In Progress
                  </Text>
                </View>
                <Text className="text-xs font-bold text-slate-700">
                  {activeDelivery.orderNumber}
                </Text>
              </View>

              <Text className="text-base font-bold text-slate-900 mb-0.5">
                {activeDelivery.restaurantName}
              </Text>
              <Text className="text-xs text-slate-500 mb-1" numberOfLines={1}>
                Drop-off: {activeDelivery.deliveryAddress?.fullAddress || "Customer Address"}
              </Text>

              {activeDelivery.items && activeDelivery.items.length > 0 && (
                <View className="flex-row items-center mb-3">
                  <Feather name="package" size={13} color="#007A5E" style={{ marginRight: 5 }} />
                  <Text className="text-xs font-semibold text-emerald-800" numberOfLines={1}>
                    {activeDelivery.items.map((it: any) => `${it.quantity || 1}x ${it.name}`).join(", ")}
                  </Text>
                </View>
              )}

              <Pressable
                onPress={() => router.push(`/driver/active/${activeDelivery.orderNumber || activeDelivery._id}` as any)}
                className="bg-[#007A5E] py-3 rounded-xl items-center justify-center flex-row gap-2 active:opacity-90 shadow-xs"
              >
                <Feather name="navigation" size={15} color="#ffffff" />
                <Text className="text-white font-bold text-sm">
                  Resume Active Delivery
                </Text>
              </Pressable>
            </View>
          )}

          {/* Section Title */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-slate-900 tracking-tight">
              Ready orders ({apiOrders.length})
            </Text>
            {isLoading && isOnline && (
              <ActivityIndicator size="small" color="#00A876" />
            )}
          </View>

          {!isOnline ? (
            <View className="items-center justify-center py-16 px-6">
              <View className="w-16 h-16 rounded-full bg-slate-100 items-center justify-center mb-4">
                <Feather name="moon" size={28} color="#94a3b8" />
              </View>
              <Text className="text-lg font-bold text-slate-800 text-center mb-1">
                You&apos;re currently offline
              </Text>
              <Text className="text-sm text-slate-500 text-center max-w-[260px] mb-6">
                Switch the toggle at the top to &apos;Online&apos; to view ready orders and start delivering.
              </Text>
              <Pressable
                onPress={() => handleToggleOnline(true)}
                className="bg-[#007A5E] px-6 py-3 rounded-full active:opacity-90 shadow-sm"
              >
                <Text className="text-white font-semibold text-sm">
                  Go Online Now
                </Text>
              </Pressable>
            </View>
          ) : apiOrders.length === 0 ? (
            <View className="items-center justify-center py-12 px-6 bg-slate-50 rounded-2xl border border-slate-100">
              <View className="w-14 h-14 rounded-full bg-emerald-100 items-center justify-center mb-3">
                <Feather name="check-circle" size={26} color="#007A5E" />
              </View>
              <Text className="text-base font-bold text-slate-800 text-center mb-1">
                No orders waiting for pickup
              </Text>
              <Text className="text-xs text-slate-500 text-center max-w-[250px] mb-4">
                Once customer orders are confirmed by the kitchen, they will appear here to claim.
              </Text>
              <Pressable
                onPress={() => onRefresh()}
                className="flex-row items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 active:bg-slate-50"
              >
                <Feather name="refresh-cw" size={13} color="#007A5E" />
                <Text className="text-xs font-semibold text-[#007A5E]">
                  Refresh orders
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-4">
              {apiOrders.map((item: any, index: number) => {
                const orderId = item._id || item.orderNumber || `order-${index}`;
                const restaurantName = item.restaurantName || "Restaurant";
                const imageUri =
                  item.image ||
                  item.items?.[0]?.image ||
                  "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500&auto=format&fit=crop&q=80";
                
                const distanceKm = 0.8 + index * 0.4;
                const distanceText =
                  item.distanceText || `${distanceKm.toFixed(1)} km away`;
                const dropoffArea =
                  item.dropoffArea ||
                  item.deliveryAddress?.fullAddress?.split(",")?.[1]?.trim() ||
                  item.deliveryAddress?.label ||
                  "Customer location";
                
                const currencySymbol = item.driverPayout?.currency || rules?.currency || "£";
                const driverFee =
                  item.driverPayout?.totalFee ??
                  (rules
                    ? Math.max(
                        rules.driverMinPayout,
                        Number(
                          (
                            (rules.driverBasePayout + distanceKm * rules.driverPerKmRate) *
                            (1 - (rules.platformCommissionRate ?? 15) / 100)
                          ).toFixed(2)
                        )
                      )
                    : 6.40);

                return (
                  <View
                    key={orderId}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex-row items-center"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    {/* Food Thumbnail */}
                    <Image
                      source={{ uri: imageUri }}
                      style={{ width: 80, height: 80, borderRadius: 14 }}
                      contentFit="cover"
                      transition={200}
                    />

                    {/* Details Column */}
                    <View className="flex-1 ml-4 justify-between" style={{ minHeight: 80 }}>
                      <View>
                        <Text
                          numberOfLines={1}
                          className="font-bold text-base text-slate-900 tracking-tight"
                        >
                          {restaurantName}
                        </Text>

                        {/* Distance Row */}
                        <View className="flex-row items-center mt-1">
                          <Feather name="map-pin" size={13} color="#64748b" style={{ marginRight: 4 }} />
                          <Text className="text-xs text-slate-500 font-medium">
                            {distanceText}
                          </Text>
                        </View>

                        {/* Drop-off Area */}
                        <Text className="text-xs text-slate-500 font-normal mt-0.5" numberOfLines={1}>
                          Drop-off: {dropoffArea}
                        </Text>

                        {/* Items Summary */}
                        {item.items && item.items.length > 0 && (
                          <View className="flex-row items-center mt-1">
                            <Feather name="package" size={11} color="#007A5E" style={{ marginRight: 4 }} />
                            <Text className="text-[11px] font-semibold text-emerald-800" numberOfLines={1}>
                              {item.items.map((it: any) => `${it.quantity || 1}x ${it.name}`).join(", ")}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Bottom Row: Payout & Claim Button */}
                      <View className="flex-row items-center justify-between mt-2 pt-1">
                        <View>
                          <Text className="font-extrabold text-base text-slate-900">
                            {currencySymbol}{driverFee.toFixed(2)}
                          </Text>
                          <Text className="text-[10px] text-slate-500 font-medium">
                            Courier payout
                          </Text>
                        </View>

                        <Pressable
                          onPress={() => router.push(`/driver/delivery/${item.orderNumber || orderId}` as any)}
                          className="bg-[#007A5E] rounded-xl px-5 py-2 active:opacity-90"
                          style={{
                            shadowColor: "#007A5E",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 2,
                          }}
                        >
                          <Text className="text-white font-bold text-sm tracking-wide">
                            Claim
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Quick link to switch back to customer view */}
          <View className="mt-8 pt-4 border-t border-slate-100 items-center">
            <Pressable
              onPress={handleSwitchToCustomer}
              className="flex-row items-center py-2 px-4 rounded-full active:bg-slate-50"
            >
              <Feather name="shopping-bag" size={15} color="#64748b" style={{ marginRight: 6 }} />
              <Text className="text-xs font-semibold text-slate-600">
                Switch to Customer Food Ordering
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
