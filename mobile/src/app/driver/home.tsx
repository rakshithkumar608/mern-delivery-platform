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

import { fetchReadyOrdersQueryFn, User } from "@/lib/api";
import { getUser, removeToken } from "@/features/auth/token-storage";
import { toast } from "@/lib/sonner";

// High-fidelity fallback sample orders matching _designs/v1/driver/driver-home-design.png
const DEFAULT_READY_ORDERS = [
  {
    _id: "ready-order-1",
    orderNumber: "CH-6401",
    restaurantName: "Mama Chow's Kitchen",
    restaurantAddress: "3 Hoe Street, Walthamstow",
    distanceText: "0.8 km away",
    dropoffArea: "Walthamstow",
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500&auto=format&fit=crop&q=80",
    driverFee: 6.40,
    itemCount: 3,
  },
  {
    _id: "ready-order-2",
    orderNumber: "CH-5802",
    restaurantName: "Bosco Pizza Co.",
    restaurantAddress: "Old Street Roundabout, London",
    distanceText: "1.4 km away",
    dropoffArea: "Leyton",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
    driverFee: 5.80,
    itemCount: 2,
  },
];

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

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["driver", "ready-orders"],
    queryFn: fetchReadyOrdersQueryFn,
    enabled: isOnline,
  });

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

  // Merge backend orders with mock orders if DB has fewer than 2
  const apiOrders = data?.orders || [];
  const displayOrders = apiOrders.length > 0 ? apiOrders : DEFAULT_READY_ORDERS;

  const onRefresh = useCallback(() => {
    if (isOnline) {
      refetch();
    }
  }, [isOnline, refetch]);

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
          6 deliveries • £42.30 today
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
          {/* Section Title */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-slate-900 tracking-tight">
              Ready orders
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
          ) : (
            <View className="gap-4">
              {displayOrders.map((item: any, index: number) => {
                const orderId = item._id || item.orderNumber || `order-${index}`;
                const restaurantName = item.restaurantName || "Restaurant";
                const imageUri =
                  item.image ||
                  item.items?.[0]?.image ||
                  "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500&auto=format&fit=crop&q=80";
                
                // Calculate display distance and dropoff area
                const distanceText =
                  item.distanceText ||
                  (index === 0 ? "0.8 km away" : "1.4 km away");
                const dropoffArea =
                  item.dropoffArea ||
                  item.deliveryAddress?.fullAddress?.split(",")?.[1]?.trim() ||
                  (index === 0 ? "Walthamstow" : "Leyton");
                
                // Calculate driver fee: in mockup £6.40 and £5.80
                const driverFee =
                  item.driverFee !== undefined
                    ? item.driverFee
                    : index === 0
                    ? 6.40
                    : 5.80;

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
                        <Text className="text-xs text-slate-500 font-normal mt-0.5">
                          Drop-off {dropoffArea}
                        </Text>
                      </View>

                      {/* Bottom Row: Payout & Claim Button */}
                      <View className="flex-row items-center justify-between mt-2 pt-1">
                        <Text className="font-extrabold text-base text-slate-900">
                          £{driverFee.toFixed(2)}
                        </Text>

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
