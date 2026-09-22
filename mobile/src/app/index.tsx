import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    // Smooth logo reveal animation
    opacity.value = withTiming(1, { duration: 700 });
    scale.value = withSpring(1, { damping: 12, stiffness: 90 });

    // 1.5s automatic transition to Welcome screen
    const timer = setTimeout(() => {
      router.replace("/(auth)/welcome");
    }, 1500);

    return () => clearTimeout(timer);
  }, [opacity, scale, router]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    alignItems: "center",
    justifyContent: "center",
  }));

  const handleSkip = () => {
    router.replace("/(auth)/welcome");
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
