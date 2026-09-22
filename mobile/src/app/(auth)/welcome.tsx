import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { toast } from "@/lib/sonner";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = Dimensions.get("window");
  const isSmallScreen = height < 700;

  const handleGoogleSignIn = () => {
    toast.success("Signed in with Google! Welcome to Chowly 🌿");
    setTimeout(() => {
      router.replace("/(auth)/add-address");
    }, 600);
  };

  return (
    <View
      className="flex-1 bg-[#00B37A]"
      style={{
        flex: 1,
        backgroundColor: "#00B37A",
      }}
    >
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 20),
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Brand Wordmark */}
        <View className="items-center pt-2 pb-2">
          <Image
            source={require("../../../assets/images/logo.png")}
            style={{ width: 140, height: 44 }}
            contentFit="contain"
            tintColor="#ffffff"
          />
        </View>

        {/* Hero Artwork - Fresh Food Paper Bag */}
        <View className="items-center justify-center py-2 flex-1">
          <Image
            source={require("../../../assets/images/Welcome.png")}
            style={{
              width: "100%",
              maxWidth: 320,
              height: isSmallScreen ? 220 : 280,
            }}
            contentFit="contain"
            transition={300}
          />
        </View>

        {/* Value Proposition Headlines */}
        <View className="items-center px-2 pb-6">
          <Text className="text-center text-[28px] font-bold leading-tight tracking-tight text-white">
            Fresh food,{"\n"}delivered fast.
          </Text>
          <Text className="mt-2.5 text-center text-sm font-medium text-white/90">
            Order from the best restaurants near you.
          </Text>
        </View>

        {/* Bottom Primary Actions */}
        <View className="w-full gap-3 pt-2">
          {/* Email Continue Button */}
          <Pressable
            onPress={() => router.push("/(auth)/signup")}
            className="h-13 w-full flex-row items-center justify-center rounded-full bg-white active:opacity-90 shadow-sm"
          >
            <Text className="text-base font-bold text-[#00B37A]">
              Continue with Email
            </Text>
          </Pressable>

          {/* Google Continue Button */}
          <Pressable
            onPress={handleGoogleSignIn}
            className="h-13 w-full flex-row items-center justify-center gap-2.5 rounded-full border border-white bg-transparent active:bg-white/10"
          >
            <FontAwesome name="google" size={18} color="#ffffff" />
            <Text className="text-base font-semibold text-white">
              Continue with Google
            </Text>
          </Pressable>

          {/* Log in text link */}
          <View className="mt-3 flex-row items-center justify-center">
            <Text className="text-sm font-medium text-white/90">
              Already have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/(auth)/login")}>
              <Text className="text-sm font-bold text-white underline">
                Log in
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
