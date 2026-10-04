import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import { useBasket } from "@/context/basket-context";
import { Order, fetchUserOrdersQueryFn } from "@/lib/api";
import { toast } from "@/lib/sonner";

const BRAND_TEAL = "#00B37A";

export interface DisplayPastOrder {
  id: string;
  restaurantName: string;
  dateLabel: string;
  status: string;
  price: string;
  rawPrice: number;
  image: string;
  reorderItem: {
    name: string;
    subtitle: string;
    price: number;
    image: string;
  };
}

export const DEFAULT_PAST_ORDERS: DisplayPastOrder[] = [
  {
    id: "past_1",
    restaurantName: "Burger & Beyond",
    dateLabel: "Today • 1:15 PM",
    status: "Delivered",
    price: "£13.45",
    rawPrice: 13.45,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
    reorderItem: {
      name: "Bougie Burger with Truffle Mayo",
      subtitle: "Medium Rare, Brioche Bun",
      price: 13.45,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
    },
  },
  {
    id: "past_2",
    restaurantName: "Sushi Daily",
    dateLabel: "Yesterday • 7:45 PM",
    status: "Delivered",
    price: "£16.20",
    rawPrice: 16.2,
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=80",
    reorderItem: {
      name: "Rainbow Sushi Platter (12 pcs)",
      subtitle: "Salmon, Tuna, Avocado",
      price: 16.2,
      image:
        "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=80",
    },
  },
  {
    id: "past_3",
    restaurantName: "Pasta Evangelists",
    dateLabel: "May 12 • 1:20 PM",
    status: "Delivered",
    price: "£11.30",
    rawPrice: 11.3,
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80",
    reorderItem: {
      name: "Truffle Tagliatelle",
      subtitle: "Parmesan & Wild Mushrooms",
      price: 11.3,
      image:
        "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80",
    },
  },
  {
    id: "past_4",
    restaurantName: "Wagamama",
    dateLabel: "May 8 • 6:30 PM",
    status: "Delivered",
    price: "£14.50",
    rawPrice: 14.5,
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80",
    reorderItem: {
      name: "Chicken Katsu Curry Ramen",
      subtitle: "Steamed Noodles, Rich Broth",
      price: 14.5,
      image:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80",
    },
  },
];

interface OrdersViewProps {
  onDiscoverRestaurants?: () => void;
}

export function OrdersView({ onDiscoverRestaurants }: OrdersViewProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  const { addItem } = useBasket();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real user orders from the backend API
  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["user-orders"],
    queryFn: fetchUserOrdersQueryFn,
    staleTime: 1000 * 30, // 30 seconds
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const userOrders = ordersData?.orders || [];

  // Identify active order from backend or fall back to reference design
  const activeOrder = useMemo(() => {
    const active = userOrders.find(
      (o: Order) => o.status !== "delivered" && o.status !== "cancelled"
    );

    if (active) {
      const firstItem = active.items?.[0];
      const currencySymbol = active.pricing?.currency === "INR" ? "₹" : "£";
      const displayPrice = `${currencySymbol}${active.pricing?.total?.toFixed(2) || "14.99"}`;

      let displayStatus = "On the way";
      if (active.status === "placed") displayStatus = "Order Placed";
      else if (active.status === "accepted") displayStatus = "Accepted";
      else if (active.status === "preparing") displayStatus = "Preparing";
      else if (active.status === "ready") displayStatus = "Ready";
      else if (active.status === "picked_up" || active.status === "on_the_way") displayStatus = "On the way";

      return {
        id: active._id,
        orderNumber: active.orderNumber || "CH-2048",
        restaurantName: active.restaurantName || "Bella Italia",
        image:
          firstItem?.image ||
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80",
        status: displayStatus,
        eta: active.arrivalEstimate || "18–24 min",
        price: displayPrice,
        isReal: true,
      };
    }

    // Default reference active order matching design
    return {
      id: "default_active_1",
      orderNumber: "GF-2048",
      restaurantName: "Bella Italia",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80",
      status: "On the way",
      eta: "18–24 min",
      price: "£11.76",
      isReal: false,
    };
  }, [userOrders]);

  // Combine delivered orders from DB with reference past orders
  const pastOrdersList: DisplayPastOrder[] = useMemo(() => {
    const realDelivered = userOrders
      .filter((o: Order) => o.status === "delivered" || o.status === "cancelled")
      .map((o: Order) => {
        const firstItem = o.items?.[0];
        const date = new Date(o.createdAt || Date.now());
        const hours = date.getHours();
        const mins = date.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHour = hours % 12 || 12;
        const timeString = `${formattedHour}:${mins} ${ampm}`;
        const currencySymbol = o.pricing?.currency === "INR" ? "₹" : "£";

        return {
          id: o._id,
          restaurantName: o.restaurantName || "Chowly Kitchen",
          dateLabel: `Today • ${timeString}`,
          status: o.status === "delivered" ? "Delivered" : "Cancelled",
          price: `${currencySymbol}${o.pricing?.total?.toFixed(2) || "0.00"}`,
          rawPrice: o.pricing?.total || 0,
          image:
            firstItem?.image ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
          reorderItem: {
            name: firstItem?.name || "Order Favourites",
            subtitle: firstItem?.subtitle || "",
            price: firstItem?.price || o.pricing?.total || 10,
            image:
              firstItem?.image ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
          },
        };
      });

    return [...realDelivered, ...DEFAULT_PAST_ORDERS];
  }, [userOrders]);

  // Handle reorder action
  const handleReorder = async (pastOrder: DisplayPastOrder) => {
    try {
      await addItem({
        name: pastOrder.reorderItem.name,
        subtitle: pastOrder.reorderItem.subtitle,
        price: pastOrder.reorderItem.price,
        image: pastOrder.reorderItem.image,
        quantity: 1,
      });
      toast.success(`Added ${pastOrder.restaurantName} items to basket! 🛒`, {
        action: {
          label: "View Basket",
          onClick: () => router.push("/basket"),
        },
      });
    } catch {
      toast.error("Could not add items to basket");
    }
  };

  const handleTrackOrder = (orderId?: string) => {
    const id = orderId || activeOrder.id;
    router.push(`/order/track/${id}` as any);
  };

  const handleViewOrderDetails = (orderId: string) => {
    router.push(`/order/${orderId}` as any);
  };

  const handleDiscover = () => {
    if (onDiscoverRestaurants) {
      onDiscoverRestaurants();
    } else {
      router.push("/home");
    }
  };

  return (
    <View className="flex-1 bg-[#F9FAFB] dark:bg-background">
      {/* ─── TOP HEADER ─── */}
      <View
        style={{
          paddingTop: Math.max(insets.top + 8, 20),
          paddingBottom: 14,
        }}
        className="items-center justify-center bg-[#F9FAFB] dark:bg-background"
      >
        <Text className="text-xl font-bold text-foreground tracking-tight">
          Orders
        </Text>
      </View>

      {/* ─── MAIN CONTENT SCROLL ─── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: Math.max(insets.bottom + 90, 110),
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={BRAND_TEAL}
            colors={[BRAND_TEAL]}
          />
        }
      >
        {/* ─── SECTION 1: ACTIVE ORDER ─── */}
        <View className="mt-2 mb-6">
          <Text className="text-[15px] font-bold text-foreground mb-3">
            Active order
          </Text>

          <Pressable
            onPress={() => handleViewOrderDetails(activeOrder.id)}
            className="bg-card rounded-2xl p-3.5 border border-border/70 shadow-sm flex-row items-center active:opacity-95"
          >
            {/* Food Thumbnail */}
            <Image
              source={{ uri: activeOrder.image }}
              style={{ width: 68, height: 68, borderRadius: 12 }}
              contentFit="cover"
              transition={200}
            />

            {/* Middle Details */}
            <View className="flex-1 ml-3.5 justify-center pr-1">
              <Text
                className="text-base font-bold text-foreground"
                numberOfLines={1}
              >
                {activeOrder.restaurantName}
              </Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                {activeOrder.orderNumber}
              </Text>
              <Text className="text-xs font-semibold text-[#00B37A] mt-2">
                {activeOrder.status}
              </Text>
            </View>

            {/* Right Details & Action */}
            <View className="items-end justify-between self-stretch py-0.5">
              <View className="items-end">
                <Text className="text-xs font-medium text-foreground">
                  {activeOrder.eta}
                </Text>
                <Text className="text-sm font-bold text-foreground mt-0.5">
                  {activeOrder.price}
                </Text>
              </View>

              <Pressable
                onPress={() => handleTrackOrder(activeOrder.id)}
                className="flex-row items-center active:opacity-70 mt-2 px-1 py-0.5"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text className="text-xs font-semibold text-[#00B37A] mr-1">
                  Track order
                </Text>
                <Feather name="chevron-right" size={14} color={BRAND_TEAL} />
              </Pressable>
            </View>
          </Pressable>
        </View>

        {/* ─── SECTION 2: PAST ORDERS (Flat list, skipping sub-buckets) ─── */}
        <View className="mb-4">
          <Text className="text-[15px] font-bold text-foreground mb-3">
            Past orders
          </Text>

          <View className="gap-3">
            {pastOrdersList.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleViewOrderDetails(item.id)}
                className="bg-card rounded-2xl p-3.5 border border-border/70 shadow-sm flex-row items-center active:opacity-90"
              >
                {/* Food Thumbnail */}
                <Image
                  source={{ uri: item.image }}
                  style={{ width: 68, height: 68, borderRadius: 12 }}
                  contentFit="cover"
                  transition={200}
                />

                {/* Middle Details */}
                <View className="flex-1 ml-3.5 justify-center pr-1">
                  <Text
                    className="text-base font-bold text-foreground"
                    numberOfLines={1}
                  >
                    {item.restaurantName}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {item.dateLabel}
                  </Text>
                  <Text className="text-xs font-semibold text-[#00B37A] mt-2">
                    {item.status}
                  </Text>
                </View>

                {/* Right Details & Action */}
                <View className="items-end justify-between self-stretch py-0.5">
                  <Text className="text-sm font-bold text-foreground">
                    {item.price}
                  </Text>

                  <Pressable
                    onPress={() => handleReorder(item)}
                    className="flex-row items-center active:opacity-70 mt-3"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text className="text-xs font-semibold text-[#00B37A] mr-1">
                      Reorder
                    </Text>
                    <Feather
                      name="chevron-right"
                      size={14}
                      color={BRAND_TEAL}
                    />
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ─── SECTION 3: NO MORE ORDERS YET (Footer Card) ─── */}
        <View className="bg-muted/30 dark:bg-card/70 border border-border rounded-2xl p-4 flex-row items-center mt-2 mb-4">
          {/* Receipt jagged outline icon matching design */}
          <View className="w-12 h-14 items-center justify-center">
            <MaterialCommunityIcons
              name="receipt-text-outline"
              size={42}
              color={isDark ? "#6B7280" : "#9CA3AF"}
            />
          </View>

          {/* Prompt copy and link */}
          <View className="flex-1 ml-3">
            <Text className="text-sm font-bold text-foreground">
              No more orders yet
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5 leading-4">
              Discover great restaurants to order from.
            </Text>

            <Pressable
              onPress={handleDiscover}
              className="flex-row items-center active:opacity-70 mt-2"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text className="text-xs font-semibold text-[#00B37A] mr-1">
                Discover restaurants
              </Text>
              <Feather name="chevron-right" size={13} color={BRAND_TEAL} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
