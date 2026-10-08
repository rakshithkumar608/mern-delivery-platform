import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import { useBasket } from "@/context/basket-context";
import { toast } from "@/lib/sonner";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Brand teal color matching v2 reference
const BRAND_TEAL = "#006B5B";

export default function BasketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  const {
    basket,
    subtotal,
    deliveryFee,
    serviceFee,
    freeDeliveryRemaining,
    freeDeliveryProgress,
    isFreeDeliveryUnlocked,
    total,
    updateQuantity,
    removeItem,
    toggleCutlery,
    applyPromoCode,
    setOrderNotes,
    clearBasket,
  } = useBasket();

  const [isEditMode, setIsEditMode] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesInput, setNotesInput] = useState(basket.orderNotes || "");
  const [showAllergyModal, setShowAllergyModal] = useState(false);

  const currency = basket.currency || "£";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  const handleAddMoreItems = () => {
    const slug = basket.restaurantName
      ? basket.restaurantName.toLowerCase().replace(/\s+/g, "-")
      : "bella-italia";
    router.push(`/restaurant/${slug}` as any);
  };

  const handleCheckout = () => {
    if (basket.items.length === 0) {
      toast.error("Your basket is empty. Please add items to proceed!");
      return;
    }
    router.push("/checkout" as any);
  };

  const handlePromoSubmit = async () => {
    if (!promoInput.trim()) return;
    await applyPromoCode(promoInput);
    setShowPromoModal(false);
    setPromoInput("");
  };

  const handleSaveNotes = async () => {
    await setOrderNotes(notesInput.trim());
    setShowNotesModal(false);
    toast.success("Order notes saved for the restaurant 📝");
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
          Basket
        </Text>

        <Pressable
          onPress={() => setIsEditMode(!isEditMode)}
          hitSlop={8}
          className="py-1 px-2"
        >
          <Text className="text-sm font-semibold text-[#00B37A]">
            {isEditMode ? "Done" : "Edit"}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── RESTAURANT CARD ─── */}
        <View className="flex-row items-center justify-between py-4 border-b border-border/60">
          <View className="flex-row items-center flex-1 pr-3">
            {/* Restaurant Logo Square */}
            <View
              className="h-12 w-12 rounded-xl items-center justify-center p-1.5 shadow-sm"
              style={{ backgroundColor: "#112620" }}
            >
              <Text className="text-[10px] font-bold text-white text-center leading-tight">
                Bella{"\n"}Italia
              </Text>
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-sm font-bold text-foreground">
                {basket.restaurantName}
              </Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                Delivery • {basket.restaurantDeliveryTime}
              </Text>
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                {basket.restaurantAddress}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/home")}
            hitSlop={8}
            className="py-1 px-1"
          >
            <Text className="text-sm font-semibold text-[#00B37A]">
              Change
            </Text>
          </Pressable>
        </View>

        {/* ─── BASKET ITEMS ─── */}
        {basket.items.length === 0 ? (
          <View className="py-14 items-center justify-center">
            <View className="h-16 w-16 rounded-full bg-muted items-center justify-center mb-3">
              <Feather name="shopping-bag" size={28} color="#9CA3AF" />
            </View>
            <Text className="text-base font-bold text-foreground text-center">
              Your basket is empty
            </Text>
            <Text className="text-xs text-muted-foreground text-center mt-1">
              Explore the menu and add your favorite dishes!
            </Text>
            <Pressable
              onPress={handleAddMoreItems}
              className="mt-4 rounded-xl px-5 py-2.5 bg-[#00B37A] active:opacity-90"
            >
              <Text className="text-sm font-bold text-white">Browse Menu</Text>
            </Pressable>
          </View>
        ) : (
          <View className="pt-2">
            {basket.items.map((item, index) => {
              const itemId = item._id ? String(item._id) : item.name;
              return (
                <View
                  key={itemId || index}
                  className="flex-row items-center justify-between py-3.5 border-b border-border/50"
                >
                  {/* Left: Dish thumbnail */}
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 68, height: 68, borderRadius: 14 }}
                    contentFit="cover"
                    transition={200}
                  />

                  {/* Middle: Name, Subtitle, Stepper */}
                  <View className="flex-1 px-3.5">
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

                    {/* Stepper (- 1 +) */}
                    <View className="flex-row items-center gap-3 mt-2">
                      <Pressable
                        onPress={() =>
                          updateQuantity(itemId, item.quantity - 1)
                        }
                        className="h-7 w-7 rounded-full border border-border items-center justify-center active:bg-muted"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Feather
                          name="minus"
                          size={14}
                          color={isDark ? "#f0f0f5" : "#1a1a2e"}
                        />
                      </Pressable>

                      <Text className="text-xs font-bold text-foreground min-w-4 text-center">
                        {item.quantity}
                      </Text>

                      <Pressable
                        onPress={() =>
                          updateQuantity(itemId, item.quantity + 1)
                        }
                        className="h-7 w-7 rounded-full border border-border items-center justify-center active:bg-muted"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Feather
                          name="plus"
                          size={14}
                          color={isDark ? "#f0f0f5" : "#1a1a2e"}
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Right: Price & optional delete icon in edit mode */}
                  <View className="items-end">
                    {isEditMode ? (
                      <Pressable
                        onPress={() => removeItem(String(itemId))}
                        className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/40"
                        hitSlop={8}
                      >
                        <Feather name="trash-2" size={16} color="#EF4444" />
                      </Pressable>
                    ) : (
                      <Text className="text-sm font-bold text-foreground">
                        {currency}
                        {(item.price * item.quantity).toFixed(2)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}

            {/* + Add more items Button */}
            <Pressable
              onPress={handleAddMoreItems}
              className="mt-3.5 h-11 w-full flex-row items-center justify-center rounded-xl border border-border bg-card active:bg-muted"
            >
              <Feather name="plus" size={17} color="#00B37A" />
              <Text className="ml-1.5 text-sm font-bold text-[#00B37A]">
                Add more items
              </Text>
            </Pressable>
          </View>
        )}

        {/* Divider */}
        <View className="h-px bg-border/70 my-4" />

        {/* ─── PREFERENCES SECTION ─── */}
        <View className="gap-4">
          {/* Promo code */}
          <Pressable
            onPress={() => setShowPromoModal(true)}
            className="flex-row items-center justify-between py-1 active:opacity-80"
          >
            <View className="flex-row items-center gap-3">
              <MaterialCommunityIcons
                name="ticket-percent-outline"
                size={20}
                color={isDark ? "#D1D5DB" : "#4B5563"}
              />
              <Text className="text-sm font-bold text-foreground">
                Promo code
              </Text>
            </View>

            {basket.promoCode ? (
              <View className="flex-row items-center gap-1.5 rounded-md bg-[#00B37A]/15 px-2.5 py-1">
                <Text className="text-xs font-bold text-[#00B37A]">
                  {basket.promoCode} (-£2.00)
                </Text>
                <Pressable onPress={() => applyPromoCode("")} hitSlop={6}>
                  <Feather name="x" size={12} color="#00B37A" />
                </Pressable>
              </View>
            ) : (
              <Text className="text-sm font-semibold text-[#00B37A]">
                Add
              </Text>
            )}
          </Pressable>

          {/* Cutlery */}
          <View className="flex-row items-center justify-between py-1">
            <View className="flex-row items-center gap-3">
              <Ionicons
                name="restaurant-outline"
                size={19}
                color={isDark ? "#D1D5DB" : "#4B5563"}
              />
              <Text className="text-sm font-bold text-foreground">
                Cutlery
              </Text>
            </View>

            <View className="flex-row items-center gap-3">
              <Text className="text-xs text-muted-foreground">
                Include cutlery
              </Text>
              <Switch
                value={basket.includeCutlery}
                onValueChange={toggleCutlery}
                trackColor={{ false: "#D1D5DB", true: "#00B37A" }}
                thumbColor="#ffffff"
              />
            </View>
          </View>

          {/* Allergy or dietary reminder */}
          <Pressable
            onPress={() => setShowAllergyModal(true)}
            className="flex-row items-center justify-between py-1 active:opacity-80"
          >
            <View className="flex-row items-center gap-3">
              <Feather
                name="info"
                size={18}
                color={isDark ? "#D1D5DB" : "#4B5563"}
              />
              <Text className="text-sm font-bold text-foreground">
                Allergy or dietary reminder
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#9CA3AF" />
          </Pressable>

          {/* Order notes (optional) */}
          <Pressable
            onPress={() => setShowNotesModal(true)}
            className="flex-row items-center justify-between py-1 active:opacity-80"
          >
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <Feather
                name="file-text"
                size={18}
                color={isDark ? "#D1D5DB" : "#4B5563"}
              />
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-sm font-bold text-foreground">
                    Order notes
                  </Text>
                  <Text className="text-xs text-muted-foreground ml-1">
                    (optional)
                  </Text>
                </View>
                <Text
                  className="text-xs text-muted-foreground mt-0.5"
                  numberOfLines={1}
                >
                  {basket.orderNotes || "Add a note for the restaurant"}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Divider */}
        <View className="h-px bg-border/70 my-4" />

        {/* ─── BILL BREAKDOWN ─── */}
        <View className="mt-4 gap-2.5">
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

          {/* Total Line */}
          <View className="flex-row items-center justify-between pt-3 mt-1 border-t border-border">
            <Text className="text-base font-bold text-foreground">Total</Text>
            <Text className="text-lg font-black text-foreground">
              {currency}
              {total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ─── DOCKED BOTTOM CHECKOUT ACTION ─── */}
      <View
        className="absolute left-0 right-0 bottom-0 bg-background border-t border-border px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Pressable
          onPress={handleCheckout}
          className="h-13 w-full flex-row items-center justify-center rounded-2xl active:opacity-95 shadow-md"
          style={{
            backgroundColor: BRAND_TEAL,
            shadowColor: BRAND_TEAL,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text className="text-base font-bold text-white tracking-wide">
            Checkout • {currency}
            {total.toFixed(2)}
          </Text>
        </Pressable>
      </View>

      {/* ─── PROMO CODE MODAL ─── */}
      <Modal visible={showPromoModal} transparent animationType="fade">
        <Pressable
          onPress={() => setShowPromoModal(false)}
          className="flex-1 bg-black/60 items-center justify-center px-6"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full rounded-3xl bg-card border border-border p-6 shadow-2xl"
          >
            <Text className="text-lg font-bold text-foreground mb-1">
              Add Promo Code
            </Text>
            <Text className="text-xs text-muted-foreground mb-4">
              Enter code (e.g. CHOWLY20) for instant discounts!
            </Text>
            <TextInput
              value={promoInput}
              onChangeText={setPromoInput}
              placeholder="Enter promo code"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              className="h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground mb-4 font-bold"
            />
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowPromoModal(false)}
                className="flex-1 h-11 items-center justify-center rounded-xl border border-border active:bg-muted"
              >
                <Text className="text-sm font-semibold text-foreground">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handlePromoSubmit}
                className="flex-1 h-11 items-center justify-center rounded-xl bg-[#00B37A] active:opacity-90"
              >
                <Text className="text-sm font-bold text-white">Apply</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ─── ORDER NOTES MODAL ─── */}
      <Modal visible={showNotesModal} transparent animationType="fade">
        <Pressable
          onPress={() => setShowNotesModal(false)}
          className="flex-1 bg-black/60 items-center justify-center px-6"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full rounded-3xl bg-card border border-border p-6 shadow-2xl"
          >
            <Text className="text-lg font-bold text-foreground mb-1">
              Order Notes
            </Text>
            <Text className="text-xs text-muted-foreground mb-4">
              Special instructions for restaurant staff
            </Text>
            <TextInput
              value={notesInput}
              onChangeText={setNotesInput}
              placeholder="e.g. Ring the doorbell, leave at the door..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              className="h-24 rounded-xl border border-border bg-background p-4 text-sm text-foreground mb-4 text-top"
            />
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowNotesModal(false)}
                className="flex-1 h-11 items-center justify-center rounded-xl border border-border active:bg-muted"
              >
                <Text className="text-sm font-semibold text-foreground">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSaveNotes}
                className="flex-1 h-11 items-center justify-center rounded-xl bg-[#00B37A] active:opacity-90"
              >
                <Text className="text-sm font-bold text-white">Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ─── ALLERGY REMINDER MODAL ─── */}
      <Modal visible={showAllergyModal} transparent animationType="fade">
        <Pressable
          onPress={() => setShowAllergyModal(false)}
          className="flex-1 bg-black/60 items-center justify-center px-6"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full rounded-3xl bg-card border border-border p-6 shadow-2xl"
          >
            <View className="h-12 w-12 rounded-full bg-amber-500/15 items-center justify-center mb-3">
              <Feather name="alert-triangle" size={24} color="#F59E0B" />
            </View>
            <Text className="text-lg font-bold text-foreground mb-1">
              Allergy & Dietary Info
            </Text>
            <Text className="text-sm text-muted-foreground leading-relaxed mb-5">
              If you or someone you are ordering for has a food allergy or
              intolerance, please contact Bella Italia directly before ordering.
            </Text>
            <Pressable
              onPress={() => setShowAllergyModal(false)}
              className="h-11 w-full items-center justify-center rounded-xl bg-[#00B37A] active:opacity-90"
            >
              <Text className="text-sm font-bold text-white">Understood</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
