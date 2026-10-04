import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { fetchDriverHistoryQueryFn } from "@/lib/api";

interface HistoryItem {
  id: string;
  restaurant: string;
  locality: string;
  time: string;
  fee: number;
}

const TODAY_DELIVERIES: HistoryItem[] = [
  {
    id: "del-1",
    restaurant: "Mama Chow's Kitchen",
    locality: "Walthamstow",
    time: "6:40 pm",
    fee: 6.40,
  },
  {
    id: "del-2",
    restaurant: "Bosco Pizza Co.",
    locality: "Leyton",
    time: "3:15 pm",
    fee: 5.80,
  },
  {
    id: "del-3",
    restaurant: "Green Bowl",
    locality: "Hackney",
    time: "12:30 pm",
    fee: 7.10,
  },
];

const YESTERDAY_DELIVERIES: HistoryItem[] = [
  {
    id: "del-4",
    restaurant: "The Noodle Bar",
    locality: "Stratford",
    time: "7:05 pm",
    fee: 6.20,
  },
  {
    id: "del-5",
    restaurant: "Suya Republic",
    locality: "Leytonstone",
    time: "4:20 pm",
    fee: 5.90,
  },
];

export default function DriverDeliveryHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["driver", "history"],
    queryFn: fetchDriverHistoryQueryFn,
  });

  const displayTodayDeliveries =
    data?.orders && data.orders.length > 0
      ? [
          ...data.orders.map((o, idx) => ({
            id: o._id || `order-${idx}`,
            restaurant: o.restaurantName || "Restaurant",
            locality:
              o.deliveryAddress?.fullAddress?.split(",")?.[1]?.trim() ||
              "London",
            time: "Just now",
            fee: 6.40,
          })),
          ...TODAY_DELIVERIES,
        ].slice(0, 4)
      : TODAY_DELIVERIES;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/driver/home");
    }
  };

  const renderHistoryRow = (item: HistoryItem, isLast: boolean) => (
    <View key={item.id}>
      <View className="flex-row items-center justify-between py-3.5 px-4">
        {/* Left: Green Checkmark */}
        <View className="w-7 h-7 rounded-full border border-emerald-500 items-center justify-center bg-emerald-50/60 mr-3.5">
          <Feather name="check" size={15} color="#059669" />
        </View>

        {/* Center: Restaurant & Locality */}
        <View className="flex-1 pr-2">
          <Text
            numberOfLines={1}
            className="text-base font-bold text-slate-900 tracking-tight"
          >
            {item.restaurant}
          </Text>
          <Text className="text-xs text-slate-500 font-normal mt-0.5">
            {item.locality}
          </Text>
        </View>

        {/* Right: Time & Fee */}
        <View className="items-end">
          <Text className="text-xs text-slate-500 font-medium">
            {item.time}
          </Text>
          <Text className="text-base font-extrabold text-slate-900 mt-0.5">
            £{item.fee.toFixed(2)}
          </Text>
        </View>
      </View>

      {!isLast && <View className="border-t border-slate-100 mx-4" />}
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Top Header */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 16),
          paddingHorizontal: 20,
          paddingBottom: 16,
        }}
        className="flex-row items-center justify-between border-b border-slate-100"
      >
        <Pressable
          onPress={handleBack}
          className="w-10 h-10 rounded-full border border-slate-200 items-center justify-center active:bg-slate-50"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>

        <Text className="text-lg font-bold text-slate-900">
          Delivery history
        </Text>

        {/* Placeholder for symmetry */}
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: Math.max(insets.bottom + 20, 36),
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#007A5E"
          />
        }
        className="flex-1"
      >
        {isLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#007A5E" />
          </View>
        ) : (
          <>
            {/* Section 1: Today */}
            <View className="mb-6">
              <Text className="text-base font-bold text-[#007A5E] tracking-tight mb-3">
                Today • £42.30
              </Text>

              <View
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                {displayTodayDeliveries.map((item, index) =>
                  renderHistoryRow(item, index === displayTodayDeliveries.length - 1)
                )}
              </View>
            </View>

            {/* Section 2: Yesterday */}
            <View className="mb-6">
              <Text className="text-base font-bold text-[#007A5E] tracking-tight mb-3">
                Yesterday • £38.10
              </Text>

              <View
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                {YESTERDAY_DELIVERIES.map((item, index) =>
                  renderHistoryRow(item, index === YESTERDAY_DELIVERIES.length - 1)
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
