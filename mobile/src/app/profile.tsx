import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import { AddressBottomSheet } from "@/components/address-bottom-sheet";
import { getUser, removeToken } from "@/features/auth/token-storage";
import { User } from "@/lib/api";
import { toast } from "@/lib/sonner";

const BRAND_TEAL = "#007A5E";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  const [userName, setUserName] = useState("Amaka Obi");
  const [userEmail, setUserEmail] = useState("amaka@example.com");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Modals state
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Notification toggles
  const [pushEnabled, setPushEnabled] = useState(true);
  const [orderUpdatesEnabled, setOrderUpdatesEnabled] = useState(true);
  const [promoOffersEnabled, setPromoOffersEnabled] = useState(false);

  // Fetch logged in user
  useEffect(() => {
    getUser<User>().then((user) => {
      if (user) {
        if (user.name) setUserName(user.name);
        if (user.email) setUserEmail(user.email);
        if (user.avatar) setUserAvatar(user.avatar);
      }
    });
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out of your Chowly account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            await removeToken();
            toast.success("Logged out successfully");
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#F9FAFB] dark:bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top + 16, 28),
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom + 90, 110),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text className="text-3xl font-extrabold text-slate-900 dark:text-foreground tracking-tight mb-6">
          Profile
        </Text>

        {/* User Card */}
        <View className="flex-row items-center mb-7">
          <View
            className="w-18 h-18 rounded-full overflow-hidden border-2 border-slate-200/80 dark:border-slate-700 mr-4 shadow-xs"
            style={{ width: 72, height: 72, borderRadius: 36 }}
          >
            {userAvatar ? (
              <Image
                source={{ uri: userAvatar }}
                style={{ width: 72, height: 72 }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <Image
                source={require("../../assets/images/user-avatar.png")}
                style={{ width: 72, height: 72 }}
                contentFit="cover"
                transition={200}
              />
            )}
          </View>

          <View className="flex-1 justify-center">
            <Text className="text-xl font-bold text-slate-900 dark:text-foreground tracking-tight">
              {userName}
            </Text>
            <Text className="text-sm text-slate-500 dark:text-muted-foreground font-normal mt-0.5">
              {userEmail}
            </Text>
          </View>
        </View>

        {/* ─── MAIN MENU GROUP ─── */}
        <View
          className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border overflow-hidden mb-4 shadow-xs"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          {/* Favourites */}
          <Pressable
            onPress={() => router.push("/favourites")}
            className="flex-row items-center justify-between px-5 py-4 active:bg-slate-50 dark:active:bg-slate-800/40"
            style={{ minHeight: 56 }}
          >
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-8 items-center justify-center mr-3.5">
                <Feather name="heart" size={22} color={isDark ? "#E2E8F0" : "#334155"} />
              </View>
              <Text className="text-base font-semibold text-slate-800 dark:text-foreground">
                Favourites
              </Text>
            </View>

            <View className="flex-row items-center">
              <View
                className="rounded-full bg-[#EBF7F2] dark:bg-emerald-950/60 items-center justify-center mr-2.5"
                style={{ width: 28, height: 28, borderRadius: 14 }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#007A5E",
                    textAlign: "center",
                    lineHeight: 16,
                  }}
                >
                  4
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={isDark ? "#94A3B8" : "#3B3D4C"} />
            </View>
          </Pressable>

          <View className="border-t border-slate-100 dark:border-slate-800 w-full" />

          {/* Addresses */}
          <Pressable
            onPress={() => setShowAddressSheet(true)}
            className="flex-row items-center justify-between px-5 py-4 active:bg-slate-50 dark:active:bg-slate-800/40"
            style={{ minHeight: 56 }}
          >
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-8 items-center justify-center mr-3.5">
                <Feather name="map-pin" size={22} color={isDark ? "#E2E8F0" : "#334155"} />
              </View>
              <Text className="text-base font-semibold text-slate-800 dark:text-foreground">
                Addresses
              </Text>
            </View>
            <View className="flex-row items-center">
              <Feather name="chevron-right" size={18} color={isDark ? "#94A3B8" : "#3B3D4C"} />
            </View>
          </Pressable>

          <View className="border-t border-slate-100 dark:border-slate-800 w-full" />

          {/* Payment methods */}
          <Pressable
            onPress={() => setShowPaymentsModal(true)}
            className="flex-row items-center justify-between px-5 py-4 active:bg-slate-50 dark:active:bg-slate-800/40"
            style={{ minHeight: 56 }}
          >
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-8 items-center justify-center mr-3.5">
                <Feather name="credit-card" size={22} color={isDark ? "#E2E8F0" : "#334155"} />
              </View>
              <Text className="text-base font-semibold text-slate-800 dark:text-foreground">
                Payment methods
              </Text>
            </View>
            <View className="flex-row items-center">
              <Feather name="chevron-right" size={18} color={isDark ? "#94A3B8" : "#3B3D4C"} />
            </View>
          </Pressable>

          <View className="border-t border-slate-100 dark:border-slate-800 w-full" />

          {/* Notifications */}
          <Pressable
            onPress={() => setShowNotificationsModal(true)}
            className="flex-row items-center justify-between px-5 py-4 active:bg-slate-50 dark:active:bg-slate-800/40"
            style={{ minHeight: 56 }}
          >
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-8 items-center justify-center mr-3.5">
                <Feather name="bell" size={22} color={isDark ? "#E2E8F0" : "#334155"} />
              </View>
              <Text className="text-base font-semibold text-slate-800 dark:text-foreground">
                Notifications
              </Text>
            </View>
            <View className="flex-row items-center">
              <Feather name="chevron-right" size={18} color={isDark ? "#94A3B8" : "#3B3D4C"} />
            </View>
          </Pressable>

          <View className="border-t border-slate-100 dark:border-slate-800 w-full" />

          {/* Help */}
          <Pressable
            onPress={() => setShowHelpModal(true)}
            className="flex-row items-center justify-between px-5 py-4 active:bg-slate-50 dark:active:bg-slate-800/40"
            style={{ minHeight: 56 }}
          >
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-8 items-center justify-center mr-3.5">
                <Feather name="help-circle" size={22} color={isDark ? "#E2E8F0" : "#334155"} />
              </View>
              <Text className="text-base font-semibold text-slate-800 dark:text-foreground">
                Help
              </Text>
            </View>
            <View className="flex-row items-center">
              <Feather name="chevron-right" size={18} color={isDark ? "#94A3B8" : "#3B3D4C"} />
            </View>
          </Pressable>

          <View className="border-t border-slate-100 dark:border-slate-800 w-full" />

          {/* About */}
          <Pressable
            onPress={() => setShowAboutModal(true)}
            className="flex-row items-center justify-between px-5 py-4 active:bg-slate-50 dark:active:bg-slate-800/40"
            style={{ minHeight: 56 }}
          >
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-8 items-center justify-center mr-3.5">
                <Feather name="info" size={22} color={isDark ? "#E2E8F0" : "#334155"} />
              </View>
              <Text className="text-base font-semibold text-slate-800 dark:text-foreground">
                About
              </Text>
            </View>
            <View className="flex-row items-center">
              <Feather name="chevron-right" size={18} color={isDark ? "#94A3B8" : "#3B3D4C"} />
            </View>
          </Pressable>
        </View>

        {/* ─── SEPARATE LOG OUT CARD ─── */}
        <Pressable
          onPress={handleLogout}
          className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border px-5 py-4 flex-row items-center justify-between shadow-xs active:bg-red-50/50"
          style={{
            minHeight: 56,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <View className="flex-row items-center flex-1 pr-2">
            <View className="w-8 items-center justify-center mr-3.5">
              <Feather name="log-out" size={22} color="#EF4444" />
            </View>
            <Text className="text-base font-semibold text-red-500">
              Log out
            </Text>
          </View>
          <View className="flex-row items-center">
            <Feather name="chevron-right" size={18} color="#EF4444" />
          </View>
        </Pressable>
      </ScrollView>

      {/* ─── BOTTOM TAB BAR (4 TABS MATCHING PROFILE DESIGN) ─── */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-slate-200/80 dark:border-border bg-white dark:bg-card flex-row"
        style={{ paddingBottom: Math.max(insets.bottom, 10) }}
      >
        {/* Home Tab */}
        <Pressable
          onPress={() => router.replace("/home")}
          className="flex-1 items-center pt-2.5 pb-1 active:opacity-75"
        >
          <Ionicons name="home-outline" size={22} color="#9CA3AF" />
          <Text className="text-[11px] font-medium text-slate-400 mt-0.5">
            Home
          </Text>
        </Pressable>

        {/* Search Tab */}
        <Pressable
          onPress={() => router.push("/search")}
          className="flex-1 items-center pt-2.5 pb-1 active:opacity-75"
        >
          <Ionicons name="search-outline" size={22} color="#9CA3AF" />
          <Text className="text-[11px] font-medium text-slate-400 mt-0.5">
            Search
          </Text>
        </Pressable>

        {/* Orders Tab */}
        <Pressable
          onPress={() => router.push("/orders")}
          className="flex-1 items-center pt-2.5 pb-1 active:opacity-75"
        >
          <Ionicons name="clipboard-outline" size={22} color="#9CA3AF" />
          <Text className="text-[11px] font-medium text-slate-400 mt-0.5">
            Orders
          </Text>
        </Pressable>

        {/* Profile Tab (ACTIVE) */}
        <Pressable className="flex-1 items-center pt-2.5 pb-1 active:opacity-75">
          <Ionicons name="person-circle" size={24} color={BRAND_TEAL} />
          <Text className="text-[11px] font-bold text-[#007A5E] mt-0.5">
            Profile
          </Text>
        </Pressable>
      </View>

      {/* ─── ADDRESS BOTTOM SHEET ─── */}
      <AddressBottomSheet
        visible={showAddressSheet}
        onClose={() => setShowAddressSheet(false)}
        selectedId="home"
        onSelect={(_id, label, address) => {
          setShowAddressSheet(false);
          toast.success(`Active address: ${label} (${address})`);
        }}
      />

      {/* ─── PAYMENT METHODS MODAL ─── */}
      <Modal
        visible={showPaymentsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaymentsModal(false)}
      >
        <View
          style={{ paddingTop: Math.max(insets.top, 16) }}
          className="flex-1 bg-white dark:bg-background"
        >
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-border">
            <Text className="text-xl font-bold text-slate-900 dark:text-foreground">
              Payment Methods
            </Text>
            <Pressable
              onPress={() => setShowPaymentsModal(false)}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center active:bg-slate-200"
              accessibilityLabel="Close Payment Methods"
              accessibilityRole="button"
            >
              <Feather name="x" size={20} color={isDark ? "#ffffff" : "#0f172a"} />
            </Pressable>
          </View>

          <View className="p-5">
            <View className="bg-slate-900 rounded-2xl p-5 mb-5 shadow-md">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xs font-bold text-white/70 tracking-widest uppercase">
                  Chowly Pay
                </Text>
                <Text className="text-base font-extrabold text-white">
                  VISA
                </Text>
              </View>
              <Text className="text-lg font-mono text-white tracking-widest mb-4">
                •••• •••• •••• 4242
              </Text>
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-[10px] text-white/60 uppercase">
                    Card Holder
                  </Text>
                  <Text className="text-sm font-semibold text-white">
                    {userName}
                  </Text>
                </View>
                <View>
                  <Text className="text-[10px] text-white/60 uppercase">
                    Expires
                  </Text>
                  <Text className="text-sm font-semibold text-white">
                    12/28
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-500/20 mb-4">
              <View className="flex-row items-center">
                <Feather name="check-circle" size={18} color="#007A5E" />
                <Text className="text-sm font-semibold text-[#007A5E] dark:text-emerald-400 ml-2.5">
                  Default Payment Method
                </Text>
              </View>
              <Text className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Stripe Verified
              </Text>
            </View>

            <Pressable
              onPress={() => toast.info("Stripe card management active at checkout! 💳")}
              className="w-full bg-[#007A5E] rounded-xl py-3.5 items-center justify-center active:opacity-90 mt-2"
            >
              <Text className="text-white font-bold text-sm">
                Add New Card
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ─── NOTIFICATIONS MODAL ─── */}
      <Modal
        visible={showNotificationsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <View
          style={{ paddingTop: Math.max(insets.top, 16) }}
          className="flex-1 bg-white dark:bg-background"
        >
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-border">
            <Text className="text-xl font-bold text-slate-900 dark:text-foreground">
              Notification Settings
            </Text>
            <Pressable
              onPress={() => setShowNotificationsModal(false)}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center active:bg-slate-200"
              accessibilityLabel="Close Notifications"
              accessibilityRole="button"
            >
              <Feather name="x" size={20} color={isDark ? "#ffffff" : "#0f172a"} />
            </Pressable>
          </View>

          <View className="p-5 gap-4">
            <View className="flex-row items-center justify-between py-3 border-b border-slate-100 dark:border-border">
              <View className="flex-1 pr-3">
                <Text className="text-base font-semibold text-slate-800 dark:text-foreground">
                  Push Notifications
                </Text>
                <Text className="text-xs text-slate-500 mt-0.5">
                  Receive real-time alerts on your device
                </Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: "#e2e8f0", true: "#007A5E" }}
                thumbColor="#ffffff"
              />
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-slate-100 dark:border-border">
              <View className="flex-1 pr-3">
                <Text className="text-base font-semibold text-slate-800 dark:text-foreground">
                  Order Status Updates
                </Text>
                <Text className="text-xs text-slate-500 mt-0.5">
                  SMS and alerts when courier is assigned and en-route
                </Text>
              </View>
              <Switch
                value={orderUpdatesEnabled}
                onValueChange={setOrderUpdatesEnabled}
                trackColor={{ false: "#e2e8f0", true: "#007A5E" }}
                thumbColor="#ffffff"
              />
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1 pr-3">
                <Text className="text-base font-semibold text-slate-800 dark:text-foreground">
                  Promotions & Discounts
                </Text>
                <Text className="text-xs text-slate-500 mt-0.5">
                  Exclusive offers and flash weekend coupons
                </Text>
              </View>
              <Switch
                value={promoOffersEnabled}
                onValueChange={setPromoOffersEnabled}
                trackColor={{ false: "#e2e8f0", true: "#007A5E" }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── HELP MODAL ─── */}
      <Modal
        visible={showHelpModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View
          style={{ paddingTop: Math.max(insets.top, 16) }}
          className="flex-1 bg-white dark:bg-background"
        >
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-border">
            <Text className="text-xl font-bold text-slate-900 dark:text-foreground">
              Help & Support
            </Text>
            <Pressable
              onPress={() => setShowHelpModal(false)}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center active:bg-slate-200"
              accessibilityLabel="Close Help"
              accessibilityRole="button"
            >
              <Feather name="x" size={20} color={isDark ? "#ffffff" : "#0f172a"} />
            </Pressable>
          </View>

          <View className="p-5 gap-3">
            <Pressable
              onPress={() => toast.info("Opening Live Support Chat... 💬")}
              className="p-4 bg-slate-50 dark:bg-card border border-slate-200/80 dark:border-border rounded-xl flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Feather name="message-circle" size={20} color="#007A5E" style={{ marginRight: 12 }} />
                <Text className="text-sm font-semibold text-slate-800 dark:text-foreground">
                  Chat with Customer Support
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#94a3b8" />
            </Pressable>

            <Pressable
              onPress={() => toast.info("Email: support@chowly.com 📧")}
              className="p-4 bg-slate-50 dark:bg-card border border-slate-200/80 dark:border-border rounded-xl flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Feather name="mail" size={20} color="#007A5E" style={{ marginRight: 12 }} />
                <Text className="text-sm font-semibold text-slate-800 dark:text-foreground">
                  Email Support (support@chowly.com)
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#94a3b8" />
            </Pressable>

            <Pressable
              onPress={() => toast.info("Frequently Asked Questions")}
              className="p-4 bg-slate-50 dark:bg-card border border-slate-200/80 dark:border-border rounded-xl flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Feather name="help-circle" size={20} color="#007A5E" style={{ marginRight: 12 }} />
                <Text className="text-sm font-semibold text-slate-800 dark:text-foreground">
                  Frequently Asked Questions (FAQ)
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#94a3b8" />
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ─── ABOUT MODAL ─── */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View
          style={{ paddingTop: Math.max(insets.top, 16) }}
          className="flex-1 bg-white dark:bg-background"
        >
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-border">
            <Text className="text-xl font-bold text-slate-900 dark:text-foreground">
              About Chowly
            </Text>
            <Pressable
              onPress={() => setShowAboutModal(false)}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center active:bg-slate-200"
              accessibilityLabel="Close About"
              accessibilityRole="button"
            >
              <Feather name="x" size={20} color={isDark ? "#ffffff" : "#0f172a"} />
            </Pressable>
          </View>

          <View className="p-6 items-center">
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 140, height: 48, marginBottom: 16 }}
              contentFit="contain"
            />
            <Text className="text-lg font-bold text-slate-900 dark:text-foreground">
              Chowly Food Delivery
            </Text>
            <Text className="text-xs text-slate-400 mt-1 mb-6">
              Version 1.0.0 (Build 2026.10)
            </Text>

            <View className="w-full bg-slate-50 dark:bg-card p-4 rounded-xl border border-slate-200/80 dark:border-border mb-4">
              <Text className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-center">
                Chowly brings London&apos;s best independent restaurants and artisan kitchens right to your door with real-time GPS tracking and instant courier dispatch.
              </Text>
            </View>

            <Text className="text-xs text-slate-400 text-center">
              © 2026 Chowly Technologies Ltd. All rights reserved.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
