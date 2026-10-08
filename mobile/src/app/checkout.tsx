import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { initStripe, useStripe } from "@stripe/stripe-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import { useBasket } from "@/context/basket-context";
import {
  createCheckoutSessionMutationFn,
  simulateWebhookSuccessMutationFn,
} from "@/lib/api";
import { toast } from "@/lib/sonner";

const BRAND_TEAL = "#007A5A";

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  const { basket, subtotal, deliveryFee, serviceFee, total, clearBasket } = useBasket();
  const currency = basket.currency || "₹";

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Editable fields matching reference design
  const [address, setAddress] = useState(
    basket.restaurantAddress || "221B Baker Street, London"
  );
  const [contactPhone, setContactPhone] = useState("+44 7700 900123");
  const [instructions, setInstructions] = useState("Leave at the door");

  // Modals for editing fields
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressInput, setAddressInput] = useState(address);

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState(contactPhone);

  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [instructionsInput, setInstructionsInput] = useState(instructions);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/basket" as any);
    }
  };

  const handlePlaceOrder = async () => {
    if (basket.items.length === 0) {
      toast.error("Your basket is empty. Please add items before checking out!");
      return;
    }

    setIsPlacingOrder(true);

    try {
      // 1. Create checkout session on backend (computes pricing in INR paise, pre-creates order)
      const sessionResponse = await createCheckoutSessionMutationFn({
        deliveryAddress: {
          label: "Delivery Address",
          fullAddress: address,
          contactPhone,
          instructions,
        },
        contactPhone,
        deliveryInstructions: instructions,
      });

      const { orderId, orderNumber, clientSecret, publishableKey } = sessionResponse.data;

      // 2. Initialize and present Stripe Payment Sheet
      let paymentSucceeded = false;

      try {
        const activeKey =
          publishableKey ||
          process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
          "";

        if (activeKey) {
          try {
            await initStripe({
              publishableKey: activeKey,
              merchantIdentifier: "merchant.com.chowly",
            });
          } catch (initStripeErr) {
            console.warn("initStripe warning:", initStripeErr);
          }
        }

        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: "Chowly",
          defaultBillingDetails: {
            phone: contactPhone,
          },
          allowsDelayedPaymentMethods: false,
        });

        if (initError) {
          // If running in development / Expo Go simulator where native Stripe view is mocked
          if (__DEV__ || clientSecret.includes("mock")) {
            await simulateWebhookSuccessMutationFn(orderId);
            paymentSucceeded = true;
          } else {
            toast.error(initError.message || "Failed to initialize payment sheet");
            setIsPlacingOrder(false);
            return;
          }
        } else {
          const { error: presentError } = await presentPaymentSheet();

          if (presentError) {
            if (presentError.code === "Canceled") {
              toast.info("Payment canceled");
            } else {
              toast.error(presentError.message || "Payment could not be completed");
            }
            setIsPlacingOrder(false);
            return;
          }
          paymentSucceeded = true;
        }
      } catch (stripeNativeErr: any) {
        // Graceful fallback for non-native development environment
        if (__DEV__) {
          await simulateWebhookSuccessMutationFn(orderId);
          paymentSucceeded = true;
        } else {
          toast.error("Payment sheet unavailable: " + stripeNativeErr.message);
          setIsPlacingOrder(false);
          return;
        }
      }

      if (paymentSucceeded) {
        // Clear local basket
        await clearBasket();

        toast.success(`Order ${orderNumber} placed successfully! 🎉`);

        // Navigate to Order Confirmed Screen
        router.replace({
          pathname: "/order-confirmed",
          params: { orderId, orderNumber },
        } as any);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ─── TOP BAR ─── */}
      <View
        className="flex-row items-center justify-between px-5 pb-3 border-b border-border/50"
        style={{ paddingTop: Math.max(insets.top, 14) }}
      >
        <Pressable
          onPress={handleBack}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
          hitSlop={8}
        >
          <Feather
            name="arrow-left"
            size={22}
            color={isDark ? "#f0f0f5" : "#1a1a2e"}
          />
        </Pressable>

        <Text className="text-lg font-bold text-foreground tracking-tight">
          Checkout
        </Text>

        <View className="w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 130 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── DETAILS & DELIVERY INFO CARD (Exact replica of v2 design) ─── */}
        <View className="rounded-2xl border border-border bg-card overflow-hidden mb-6 shadow-sm">
          {/* Row 1: Delivery Address */}
          <View className="flex-row items-center justify-between p-4 border-b border-border/50">
            <View className="flex-row items-center flex-1 pr-3">
              <View className="h-9 w-9 rounded-full bg-muted/60 items-center justify-center mr-3">
                <Ionicons
                  name="location-outline"
                  size={19}
                  color={isDark ? "#D1D5DB" : "#374151"}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">
                  Delivery address
                </Text>
                <Text
                  className="text-xs text-muted-foreground mt-0.5"
                  numberOfLines={1}
                >
                  {address}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                setAddressInput(address);
                setShowAddressModal(true);
              }}
              hitSlop={8}
              className="py-1 px-1.5"
            >
              <Text className="text-sm font-semibold text-[#00B37A]">Edit</Text>
            </Pressable>
          </View>

          {/* Row 2: Arrival Estimate */}
          <View className="flex-row items-center justify-between p-4 border-b border-border/50">
            <View className="flex-row items-center flex-1">
              <View className="h-9 w-9 rounded-full bg-muted/60 items-center justify-center mr-3">
                <Feather
                  name="clock"
                  size={17}
                  color={isDark ? "#D1D5DB" : "#374151"}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">
                  Arrival estimate
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {basket.restaurantDeliveryTime || "25–35 min"}
                </Text>
              </View>
            </View>
          </View>

          {/* Row 3: Contact Details */}
          <View className="flex-row items-center justify-between p-4 border-b border-border/50">
            <View className="flex-row items-center flex-1 pr-3">
              <View className="h-9 w-9 rounded-full bg-muted/60 items-center justify-center mr-3">
                <Feather
                  name="phone"
                  size={17}
                  color={isDark ? "#D1D5DB" : "#374151"}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">
                  Contact details
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {contactPhone}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                setPhoneInput(contactPhone);
                setShowPhoneModal(true);
              }}
              hitSlop={8}
              className="py-1 px-1.5"
            >
              <Text className="text-sm font-semibold text-[#00B37A]">Edit</Text>
            </Pressable>
          </View>

          {/* Row 4: Payment Method (CARD — No Change button per user requirement) */}
          <View className="flex-row items-center justify-between p-4 border-b border-border/50">
            <View className="flex-row items-center flex-1">
              <View className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 items-center justify-center mr-3 border border-blue-200 dark:border-blue-800/40">
                <FontAwesome5 name="cc-visa" size={20} color="#1A1F71" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">
                  Payment method
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Visa •••• 4242
                </Text>
              </View>
            </View>
            {/* NO change button: payment method is strictly fixed to CARD */}
          </View>

          {/* Row 5: Delivery Instructions */}
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center flex-1 pr-3">
              <View className="h-9 w-9 rounded-full bg-muted/60 items-center justify-center mr-3">
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color={isDark ? "#D1D5DB" : "#374151"}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">
                  Delivery instructions
                </Text>
                <Text
                  className="text-xs text-muted-foreground mt-0.5"
                  numberOfLines={1}
                >
                  {instructions}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                setInstructionsInput(instructions);
                setShowInstructionsModal(true);
              }}
              hitSlop={8}
              className="py-1 px-1.5"
            >
              <Text className="text-sm font-semibold text-[#00B37A]">Edit</Text>
            </Pressable>
          </View>
        </View>

        {/* ─── ORDER SUMMARY (Exact replica of v2 design) ─── */}
        <Text className="text-base font-bold text-foreground mb-3">
          Order summary
        </Text>

        <View className="rounded-2xl border border-border bg-card p-4 shadow-sm mb-6">
          {basket.items.map((item, index) => (
            <View
              key={item._id || index}
              className={`flex-row items-center justify-between py-3 ${
                index > 0 ? "border-t border-border/40" : ""
              }`}
            >
              {/* Item Thumbnail */}
              <Image
                source={{ uri: item.image }}
                style={{ width: 56, height: 56, borderRadius: 12 }}
                contentFit="cover"
                transition={200}
              />

              {/* Item Details */}
              <View className="flex-1 px-3">
                <Text
                  className="text-sm font-bold text-foreground"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                {item.subtitle ? (
                  <Text
                    className="text-xs text-muted-foreground mt-0.5"
                    numberOfLines={1}
                  >
                    {item.subtitle}
                  </Text>
                ) : null}
              </View>

              {/* Quantity */}
              <Text className="text-sm font-semibold text-foreground px-3">
                {item.quantity}
              </Text>

              {/* Price */}
              <Text className="text-sm font-bold text-foreground min-w-[50px] text-right">
                {currency}
                {(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          {/* Breakdown Rows */}
          <View className="pt-3 mt-1 border-t border-border/60 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">Subtotal</Text>
              <Text className="text-sm font-semibold text-foreground">
                {currency}
                {subtotal.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">Delivery fee</Text>
              <Text className="text-sm font-semibold text-foreground">
                {currency}
                {deliveryFee.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">Service fee</Text>
              <Text className="text-sm font-semibold text-foreground">
                {currency}
                {serviceFee.toFixed(2)}
              </Text>
            </View>

            {basket.discount > 0 && (
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-[#00B37A] font-medium">
                  Promo Discount
                </Text>
                <Text className="text-sm font-bold text-[#00B37A]">
                  -{currency}
                  {basket.discount.toFixed(2)}
                </Text>
              </View>
            )}

            {/* Total Row */}
            <View className="flex-row items-center justify-between pt-3 mt-1 border-t border-border">
              <Text className="text-base font-bold text-foreground">Total</Text>
              <Text className="text-lg font-black text-foreground">
                {currency}
                {total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ─── DOCKED BOTTOM ACTION BUTTON (Place order • £XX.XX) ─── */}
      <View
        className="absolute left-0 right-0 bottom-0 bg-background border-t border-border px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Pressable
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
          className="h-13 w-full flex-row items-center justify-center rounded-2xl active:opacity-95 shadow-md"
          style={{
            backgroundColor: BRAND_TEAL,
            shadowColor: BRAND_TEAL,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
            opacity: isPlacingOrder ? 0.75 : 1,
          }}
        >
          {isPlacingOrder ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text className="text-base font-bold text-white tracking-wide">
              Place order • {currency}
              {total.toFixed(2)}
            </Text>
          )}
        </Pressable>
      </View>

      {/* ─── ADDRESS EDIT MODAL ─── */}
      <Modal visible={showAddressModal} transparent animationType="fade">
        <Pressable
          onPress={() => setShowAddressModal(false)}
          className="flex-1 bg-black/60 items-center justify-center px-6"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full rounded-3xl bg-card border border-border p-6 shadow-2xl"
          >
            <Text className="text-lg font-bold text-foreground mb-1">
              Edit Delivery Address
            </Text>
            <Text className="text-xs text-muted-foreground mb-4">
              Enter your complete street address
            </Text>
            <TextInput
              value={addressInput}
              onChangeText={setAddressInput}
              placeholder="e.g. 221B Baker Street, London"
              placeholderTextColor="#9CA3AF"
              className="h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground mb-4 font-medium"
            />
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowAddressModal(false)}
                className="flex-1 h-11 items-center justify-center rounded-xl border border-border active:bg-muted"
              >
                <Text className="text-sm font-semibold text-foreground">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (addressInput.trim()) setAddress(addressInput.trim());
                  setShowAddressModal(false);
                }}
                className="flex-1 h-11 items-center justify-center rounded-xl bg-[#00B37A] active:opacity-90"
              >
                <Text className="text-sm font-bold text-white">Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ─── PHONE EDIT MODAL ─── */}
      <Modal visible={showPhoneModal} transparent animationType="fade">
        <Pressable
          onPress={() => setShowPhoneModal(false)}
          className="flex-1 bg-black/60 items-center justify-center px-6"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full rounded-3xl bg-card border border-border p-6 shadow-2xl"
          >
            <Text className="text-lg font-bold text-foreground mb-1">
              Edit Contact Phone
            </Text>
            <Text className="text-xs text-muted-foreground mb-4">
              For delivery updates and driver contact
            </Text>
            <TextInput
              value={phoneInput}
              onChangeText={setPhoneInput}
              keyboardType="phone-pad"
              placeholder="+44 7700 900123"
              placeholderTextColor="#9CA3AF"
              className="h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground mb-4 font-medium"
            />
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowPhoneModal(false)}
                className="flex-1 h-11 items-center justify-center rounded-xl border border-border active:bg-muted"
              >
                <Text className="text-sm font-semibold text-foreground">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (phoneInput.trim()) setContactPhone(phoneInput.trim());
                  setShowPhoneModal(false);
                }}
                className="flex-1 h-11 items-center justify-center rounded-xl bg-[#00B37A] active:opacity-90"
              >
                <Text className="text-sm font-bold text-white">Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ─── INSTRUCTIONS EDIT MODAL ─── */}
      <Modal visible={showInstructionsModal} transparent animationType="fade">
        <Pressable
          onPress={() => setShowInstructionsModal(false)}
          className="flex-1 bg-black/60 items-center justify-center px-6"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full rounded-3xl bg-card border border-border p-6 shadow-2xl"
          >
            <Text className="text-lg font-bold text-foreground mb-1">
              Delivery Instructions
            </Text>
            <Text className="text-xs text-muted-foreground mb-4">
              Directions for the courier upon arrival
            </Text>
            <TextInput
              value={instructionsInput}
              onChangeText={setInstructionsInput}
              placeholder="e.g. Leave at the door, buzz apartment 4B..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              className="h-24 rounded-xl border border-border bg-background p-4 text-sm text-foreground mb-4 text-top"
            />
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowInstructionsModal(false)}
                className="flex-1 h-11 items-center justify-center rounded-xl border border-border active:bg-muted"
              >
                <Text className="text-sm font-semibold text-foreground">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setInstructions(instructionsInput.trim() || "Leave at the door");
                  setShowInstructionsModal(false);
                }}
                className="flex-1 h-11 items-center justify-center rounded-xl bg-[#00B37A] active:opacity-90"
              >
                <Text className="text-sm font-bold text-white">Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
