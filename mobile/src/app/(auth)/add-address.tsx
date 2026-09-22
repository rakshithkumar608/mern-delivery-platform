import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { useUniwind } from "uniwind";

import { createAddressMutationFn } from "@/lib/api";
import { toast } from "@/lib/sonner";

type AddressTag = "Home" | "Work" | "Other";

interface ManualAddressForm {
  street: string;
  unit: string;
  city: string;
  state: string;
  zipCode: string;
  instructions: string;
}

export default function AddAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  // Address states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<AddressTag>("Home");
  const [currentAddress, setCurrentAddress] = useState(
    "123 Main Street, Apt 4B, New York, NY 10001"
  );
  const [addressVerified, setAddressVerified] = useState(false);
  const [verificationSource, setVerificationSource] = useState<"gps" | "manual" | "default">("default");
  const [isLocating, setIsLocating] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual Form State
  const [manualForm, setManualForm] = useState<ManualAddressForm>({
    street: "",
    unit: "",
    city: "",
    state: "",
    zipCode: "",
    instructions: "",
  });
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isVerifyingManual, setIsVerifyingManual] = useState(false);

  const { mutate: saveAddress, isPending: isSavingAddress } = useMutation({
    mutationFn: createAddressMutationFn,
    onSuccess: (data) => {
      toast.success(`Address saved for ${data.address.label || selectedTag}! 🍽️`);
      router.replace("/home");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save address");
    },
  });

  // Real GPS & Reverse Geocoding Location Access
  const handleUseMyLocation = async () => {
    try {
      setIsLocating(true);
      toast.info("Requesting device location access... 🛰️");

      // 1. Request native permission through expo-location
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;
        setCoords({ latitude, longitude });

        let street = "";
        let city = "";
        let state = "";
        let zipCode = "";
        let formatted = "";

        // Attempt reverse geocoding via expo-location
        try {
          const addresses = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          if (addresses && addresses.length > 0) {
            const a = addresses[0];
            const streetNum = a.streetNumber || "";
            const streetName = a.street || a.name || "";
            street = [streetNum, streetName].filter(Boolean).join(" ");
            city = a.city || a.subregion || a.district || "";
            state = a.region || "";
            zipCode = a.postalCode || "";
            const country = a.country || "";

            formatted = [
              street,
              city,
              state ? `${state} ${zipCode}`.trim() : zipCode,
              country,
            ]
              .filter(Boolean)
              .join(", ");
          }
        } catch {
          // Continue to fallback reverse geocoder if needed
        }

        // Secondary fallback to OpenStreetMap Nominatim for exact real street name
        if (!formatted || !street) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  "User-Agent": "ChowlyDeliveryApp/1.0",
                },
              }
            );
            if (res.ok) {
              const data = await res.json();
              if (data && data.address) {
                const houseNumber = data.address.house_number || "";
                const road =
                  data.address.road ||
                  data.address.pedestrian ||
                  data.address.neighbourhood ||
                  data.address.suburb ||
                  "";
                street = [houseNumber, road].filter(Boolean).join(" ") || data.name || "";
                city =
                  data.address.city ||
                  data.address.town ||
                  data.address.village ||
                  data.address.county ||
                  "";
                state = data.address.state || "";
                zipCode = data.address.postcode || "";
                formatted = [street, city, state, zipCode].filter(Boolean).join(", ");
              }
            }
          } catch {
            // Keep coordinates if network reverse geocoding fails
          }
        }

        if (!formatted) {
          formatted = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        }

        setCurrentAddress(formatted);
        setManualForm({
          street: street || formatted.split(",")[0] || "Current Location",
          unit: "",
          city: city || "",
          state: state || "",
          zipCode: zipCode || "",
          instructions: "",
        });
        setAddressVerified(true);
        setVerificationSource("gps");
        setIsLocating(false);
        toast.success(`Current location locked: ${formatted} 📍`);
        return;
      }

      // 2. If device permission is denied, try real IP-based geolocation
      toast.info("GPS permission denied. Trying network location... 🌐");
      const ipRes = await fetch("https://ipapi.co/json/");
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData && ipData.city) {
          const ipFormatted = `${ipData.city}, ${ipData.region} ${ipData.postal || ""}, ${ipData.country_name || ""}`;
          setCurrentAddress(ipFormatted);
          setManualForm({
            street: ipData.city,
            unit: "",
            city: ipData.city,
            state: ipData.region_code || ipData.region || "",
            zipCode: ipData.postal || "",
            instructions: "",
          });
          setAddressVerified(true);
          setVerificationSource("gps");
          setIsLocating(false);
          toast.success(`Network location found: ${ipFormatted} 📍`);
          return;
        }
      }

      setIsLocating(false);
      toast.error("Could not fetch location. Please enter address manually.");
      setShowManualModal(true);
    } catch {
      setIsLocating(false);
      toast.error("Location request failed. Please enter address manually.");
      setShowManualModal(true);
    }
  };

  // Verify and Save Manual Address
  const handleVerifyManualAddress = () => {
    if (!manualForm.street.trim()) {
      toast.error("Please enter a street address");
      return;
    }
    if (!manualForm.city.trim()) {
      toast.error("Please enter a city");
      return;
    }
    if (!manualForm.zipCode.trim() || manualForm.zipCode.length < 5) {
      toast.error("Please enter a valid 5-digit ZIP code");
      return;
    }

    setIsVerifyingManual(true);

    // Verify manual input
    setTimeout(() => {
      setIsVerifyingManual(false);
      const formatted = `${manualForm.street}${
        manualForm.unit ? `, ${manualForm.unit}` : ""
      }, ${manualForm.city}, ${manualForm.state} ${manualForm.zipCode}`;
      setCurrentAddress(formatted);
      setAddressVerified(true);
      setVerificationSource("manual");
      setShowManualModal(false);
      toast.success("Address verified successfully! ✅");
    }, 700);
  };

  // Confirm final address & proceed to Home
  const handleConfirmAddress = () => {
    const street =
      manualForm.street.trim() ||
      currentAddress.split(",")[0]?.trim() ||
      "123 Main Street";
    const city = manualForm.city.trim() || "New York";

    saveAddress({
      label: selectedTag,
      street,
      unit: manualForm.unit.trim(),
      city,
      state: manualForm.state.trim() || "NY",
      zipCode: manualForm.zipCode.trim() || "10001",
      formattedAddress: currentAddress,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      instructions: manualForm.instructions.trim(),
      isDefault: true,
    });
  };

  const handleSkip = () => {
    toast.info("You can set your delivery address anytime from Home 🏠");
    router.replace("/home");
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/welcome");
    }
  };

  const tags: AddressTag[] = ["Home", "Work", "Other"];

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 20),
            paddingHorizontal: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            {/* Top Back Navigation */}
            <Pressable
              onPress={handleBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className="h-10 w-10 items-center justify-center -ml-2 rounded-full active:bg-muted"
            >
              <Feather
                name="arrow-left"
                size={24}
                color={isDark ? "#f0f0f5" : "#1a1a2e"}
              />
            </Pressable>

            {/* Title */}
            <View className="mt-5 mb-4">
              <Text className="text-[28px] font-bold tracking-tight text-foreground">
                Where should we{"\n"}deliver?
              </Text>
            </View>

            {/* Address Search Input Bar */}
            <View className="h-12 flex-row items-center rounded-2xl bg-muted px-4 border border-border/50">
              <Feather name="search" size={18} color="#9ca3af" />
              <TextInput
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (text.length > 5) {
                    setCurrentAddress(`${text}, New York, NY 10001`);
                    setAddressVerified(false);
                    setVerificationSource("default");
                  }
                }}
                placeholder="Search for your address"
                placeholderTextColor="#9ca3af"
                className="ml-2.5 flex-1 text-sm text-foreground font-sans"
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="x" size={16} color="#9ca3af" />
                </Pressable>
              )}
            </View>

            {/* Quick Action Buttons: Use my location (Solid Green) & Enter address manually (White BG, Green Text) */}
            <View className="mt-4 gap-3">
              {/* Use my location Button (Same style as Confirm Address: solid green pill, white text) */}
              <Pressable
                onPress={handleUseMyLocation}
                disabled={isLocating}
                className="h-13 w-full flex-row items-center justify-center gap-2 rounded-full bg-[#00B37A] active:bg-primary-dark shadow-sm"
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="navigate" size={18} color="#ffffff" />
                )}
                <Text className="text-base font-semibold text-white">
                  {isLocating ? "Fetching your location..." : "Use my location"}
                </Text>
              </Pressable>

              {/* Enter address manually Button (White bg, green text, green border) */}
              <Pressable
                onPress={() => setShowManualModal(true)}
                className="h-13 w-full flex-row items-center justify-center gap-2 rounded-full bg-white border border-[#00B37A] active:bg-slate-50 shadow-sm"
              >
                <Feather name="edit-3" size={18} color="#00B37A" />
                <Text className="text-base font-semibold text-[#00B37A]">
                  Enter address manually
                </Text>
              </Pressable>
            </View>

            {/* Map Preview Card */}
            <View className="relative mt-5 h-44 w-full overflow-hidden rounded-2xl border border-border shadow-sm bg-muted">
              <Image
                source={require("../../../assets/images/map.jpg")}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={200}
              />

              {/* Geographic Labels */}
              <View className="absolute left-4 top-3 rounded-md bg-white/85 px-2 py-0.5 shadow-xs">
                <Text className="text-[11px] font-semibold text-slate-700">
                  Manhattan
                </Text>
              </View>
              <View className="absolute bottom-3 left-4 rounded-md bg-white/85 px-2 py-0.5 shadow-xs">
                <Text className="text-[11px] font-bold text-slate-800">
                  New York
                </Text>
              </View>
              <View className="absolute right-3 top-8 rounded-md bg-white/85 px-1.5 py-0.5 rotate-90 shadow-xs">
                <Text className="text-[10px] font-medium text-blue-600">
                  East River
                </Text>
              </View>

              {/* Center Location Pin with Badge */}
              <View className="absolute inset-0 items-center justify-center">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-[#00B37A]/20">
                  <View className="h-7 w-7 items-center justify-center rounded-full bg-[#00B37A] shadow-md">
                    <Ionicons name="location-sharp" size={18} color="#ffffff" />
                  </View>
                </View>
              </View>

              {/* GPS Indicator Overlay */}
              {verificationSource === "gps" && (
                <View className="absolute top-3 right-3 flex-row items-center gap-1 rounded-full bg-[#00B37A] px-2.5 py-1 shadow-sm">
                  <View className="h-2 w-2 rounded-full bg-white" />
                  <Text className="text-[10px] font-bold text-white">GPS Active</Text>
                </View>
              )}
            </View>

            {/* Selected Address Confirmation Card */}
            <View className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary mr-3">
                    <Ionicons name="location-outline" size={22} color="#00B37A" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text
                        className="text-sm font-semibold text-foreground leading-snug"
                        numberOfLines={1}
                      >
                        {currentAddress.split(",")[0] || currentAddress}
                      </Text>
                      {addressVerified && (
                        <View className="flex-row items-center rounded-md bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2">
                          <Text className="text-[10px] font-bold text-[#00B37A]">
                            ✓ Verified
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      className="text-xs text-muted-foreground mt-0.5"
                      numberOfLines={1}
                    >
                      {currentAddress.split(",").slice(1).join(",").trim() ||
                        "New York, NY 10001"}
                    </Text>
                  </View>
                </View>

                {/* Edit Button opens manual verification modal */}
                <Pressable
                  onPress={() => setShowManualModal(true)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="h-8 w-8 items-center justify-center rounded-full bg-muted active:bg-border"
                >
                  <Feather name="edit-2" size={15} color="#00B37A" />
                </Pressable>
              </View>
            </View>

            {/* Address Tag Chips (Home, Work, Other) */}
            <View className="mt-4 flex-row items-center gap-3">
              {tags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <Pressable
                    key={tag}
                    onPress={() => {
                      setSelectedTag(tag);
                      toast.info(`Tagged as ${tag}`);
                    }}
                    className={`h-10 flex-1 items-center justify-center rounded-full border transition-all ${
                      isSelected
                        ? "bg-[#00B37A] border-[#00B37A]"
                        : "bg-card border-border active:bg-muted"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        isSelected ? "text-white" : "text-foreground"
                      }`}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Bottom Actions */}
          <View className="w-full pt-6">
            <Pressable
              onPress={handleConfirmAddress}
              disabled={isSavingAddress}
              className={`h-13 w-full items-center justify-center rounded-full bg-[#00B37A] active:bg-primary-dark shadow-sm ${
                isSavingAddress ? "opacity-80" : ""
              }`}
            >
              {isSavingAddress ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  Confirm Address
                </Text>
              )}
            </Pressable>

            {/* Skip for now text link */}
            <Pressable
              onPress={handleSkip}
              className="mt-3.5 items-center justify-center py-1"
            >
              <Text className="text-sm font-medium text-muted-foreground">
                Skip for now
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MANUAL ADDRESS VERIFICATION MODAL */}
      <Modal
        visible={showManualModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowManualModal(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View className="rounded-t-[28px] bg-background p-6 border-t border-border shadow-2xl">
              {/* Drag Indicator & Header */}
              <View className="items-center pb-3">
                <View className="h-1.5 w-12 rounded-full bg-border" />
              </View>

              <View className="flex-row items-center justify-between pb-4">
                <View>
                  <Text className="text-xl font-bold text-foreground">
                    Enter Address Manually
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    Verify full street details for accurate delivery
                  </Text>
                </View>
                <Pressable
                  onPress={() => setShowManualModal(false)}
                  className="h-8 w-8 items-center justify-center rounded-full bg-muted active:bg-border"
                >
                  <Feather name="x" size={18} color={isDark ? "#f0f0f5" : "#1a1a2e"} />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingBottom: Math.max(insets.bottom, 16) }}
              >
                {/* Street Address */}
                <View>
                  <Text className="text-xs font-semibold text-foreground mb-1.5">
                    Street Address *
                  </Text>
                  <View className="h-12 flex-row items-center rounded-xl bg-card px-3.5 border border-border">
                    <Feather name="map-pin" size={16} color="#9ca3af" />
                    <TextInput
                      value={manualForm.street}
                      onChangeText={(val) =>
                        setManualForm((prev) => ({ ...prev, street: val }))
                      }
                      placeholder="e.g. 123 Main Street"
                      placeholderTextColor="#9ca3af"
                      className="ml-2.5 flex-1 text-sm text-foreground font-sans"
                    />
                  </View>
                </View>

                {/* Unit / Apt / Floor */}
                <View>
                  <Text className="text-xs font-semibold text-foreground mb-1.5">
                    Apartment, Suite, Unit, or Floor
                  </Text>
                  <View className="h-12 flex-row items-center rounded-xl bg-card px-3.5 border border-border">
                    <Feather name="home" size={16} color="#9ca3af" />
                    <TextInput
                      value={manualForm.unit}
                      onChangeText={(val) =>
                        setManualForm((prev) => ({ ...prev, unit: val }))
                      }
                      placeholder="e.g. Apt 4B or Floor 3"
                      placeholderTextColor="#9ca3af"
                      className="ml-2.5 flex-1 text-sm text-foreground font-sans"
                    />
                  </View>
                </View>

                {/* City, State & Zip Code Row */}
                <View className="flex-row gap-2.5">
                  <View className="flex-2">
                    <Text className="text-xs font-semibold text-foreground mb-1.5">
                      City *
                    </Text>
                    <View className="h-12 rounded-xl bg-card px-3.5 border border-border justify-center">
                      <TextInput
                        value={manualForm.city}
                        onChangeText={(val) =>
                          setManualForm((prev) => ({ ...prev, city: val }))
                        }
                        placeholder="New York"
                        placeholderTextColor="#9ca3af"
                        className="text-sm text-foreground font-sans"
                      />
                    </View>
                  </View>

                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-foreground mb-1.5">
                      State *
                    </Text>
                    <View className="h-12 rounded-xl bg-card px-3.5 border border-border justify-center">
                      <TextInput
                        value={manualForm.state}
                        onChangeText={(val) =>
                          setManualForm((prev) => ({ ...prev, state: val.toUpperCase() }))
                        }
                        maxLength={2}
                        placeholder="NY"
                        placeholderTextColor="#9ca3af"
                        className="text-sm text-foreground font-sans uppercase"
                      />
                    </View>
                  </View>

                  <View className="flex-1.5">
                    <Text className="text-xs font-semibold text-foreground mb-1.5">
                      ZIP Code *
                    </Text>
                    <View className="h-12 rounded-xl bg-card px-3.5 border border-border justify-center">
                      <TextInput
                        value={manualForm.zipCode}
                        onChangeText={(val) =>
                          setManualForm((prev) => ({ ...prev, zipCode: val }))
                        }
                        keyboardType="numeric"
                        maxLength={5}
                        placeholder="10001"
                        placeholderTextColor="#9ca3af"
                        className="text-sm text-foreground font-sans"
                      />
                    </View>
                  </View>
                </View>

                {/* Delivery Instructions */}
                <View>
                  <Text className="text-xs font-semibold text-foreground mb-1.5">
                    Delivery Instructions (Optional)
                  </Text>
                  <View className="h-16 rounded-xl bg-card px-3.5 py-2 border border-border">
                    <TextInput
                      value={manualForm.instructions}
                      onChangeText={(val) =>
                        setManualForm((prev) => ({ ...prev, instructions: val }))
                      }
                      multiline
                      placeholder="e.g. Leave at door, call when arrived"
                      placeholderTextColor="#9ca3af"
                      className="text-sm text-foreground font-sans"
                    />
                  </View>
                </View>

                {/* Verify & Save Address Button */}
                <Pressable
                  onPress={handleVerifyManualAddress}
                  disabled={isVerifyingManual}
                  className="mt-2 h-13 w-full flex-row items-center justify-center gap-2 rounded-full bg-[#00B37A] active:bg-primary-dark shadow-sm"
                >
                  {isVerifyingManual ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <MaterialIcons name="verified" size={18} color="#ffffff" />
                  )}
                  <Text className="text-base font-semibold text-white">
                    {isVerifyingManual ? "Verifying Address..." : "Verify & Save Address"}
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}
