import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { getToken, removeToken, setUser } from "@/features/auth/token-storage";
import { getCurrentUserQueryFn } from "@/lib/api";

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);
  const targetRouteRef = useRef<string | null>(null);
  const isNavigatedRef = useRef<boolean>(false);

  useEffect(() => {
    // Smooth logo reveal animation
    opacity.value = withTiming(1, { duration: 700 });
    scale.value = withSpring(1, { damping: 12, stiffness: 90 });

    let isMounted = true;

    const checkAuthAndRoute = async () => {
      const startTime = Date.now();
      let destination = "/(auth)/login";

      try {
        const token = await getToken();
        if (token) {
          try {
            const data = await getCurrentUserQueryFn();
            if (data?.user) {
              await setUser(data.user);
              destination = data.hasAddress ? "/home" : "/(auth)/add-address";
            } else {
              await removeToken();
              destination = "/(auth)/login";
            }
          } catch {
            // Token expired or invalid: clear and route to login
            await removeToken();
            destination = "/(auth)/login";
          }
        } else {
          destination = "/(auth)/login";
        }
      } catch {
        destination = "/(auth)/login";
      }

      targetRouteRef.current = destination;

      // Ensure minimum splash screen display time of 1.2s for clean branding feel
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(1200 - elapsed, 100);

      setTimeout(() => {
        if (isMounted && !isNavigatedRef.current) {
          isNavigatedRef.current = true;
          router.replace(destination as any);
        }
      }, remainingTime);
    };

    void checkAuthAndRoute();

    return () => {
      isMounted = false;
    };
  }, [opacity, scale, router]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    alignItems: "center",
    justifyContent: "center",
  }));

  const handleSkip = () => {
    if (!isNavigatedRef.current) {
      isNavigatedRef.current = true;
      router.replace((targetRouteRef.current || "/(auth)/login") as any);
    }
  };

  return (
    <Pressable
      onPress={handleSkip}
      className="flex-1 items-center justify-center bg-[#00B37A]"
      style={{ flex: 1, backgroundColor: "#00B37A" }}
    >
      <StatusBar style="light" />

      <Animated.View style={animatedStyle}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: 220, height: 75 }}
          contentFit="contain"
          tintColor="#ffffff"
          transition={200}
        />
      </Animated.View>
    </Pressable>
  );
}
