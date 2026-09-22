import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  KeyboardAvoidingView,
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
import { ActivityIndicator } from "react-native";

import { loginMutationFn } from "@/lib/api";
import { saveAuthToken, saveStoredUser } from "@/lib/auth-storage";
import { toast } from "@/lib/sonner";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const { mutate: loginUser, isPending } = useMutation({
    mutationFn: loginMutationFn,
    onSuccess: async (data) => {
      await saveAuthToken(data.token);
      await saveStoredUser(data.user);
      toast.success("Welcome back to Chowly! 🍔");
      router.replace("/home");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid email or password");
    },
  });

  const handleLogin = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    loginUser({
      email: email.trim(),
      password,
    });
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      toast.info("Enter your email address above first to reset your password 🔑");
    } else {
      toast.success(`Password reset link sent to ${email} 📩`);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/welcome");
    }
  };

  const iconColor = isDark ? "#9ca3af" : "#9ca3af";
  const activeBorderColor = "#00B37A";
  const defaultBorderColor = isDark ? "#2d2d4a" : "#e5e7eb";

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
          {/* Top Back Navigation */}
          <View>
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
            <View className="mt-5 mb-8">
              <Text className="text-[28px] font-bold tracking-tight text-foreground">
                Welcome back
              </Text>
              <Text className="mt-1.5 text-sm text-muted-foreground">
                Log in to continue ordering your favorite dishes.
              </Text>
            </View>

            {/* Input Fields */}
            <View className="gap-4">
              {/* Email Field */}
              <View
                className="h-13 flex-row items-center rounded-2xl bg-card px-4 border"
                style={{
                  borderColor:
                    activeField === "email" ? activeBorderColor : defaultBorderColor,
                }}
              >
                <Feather
                  name="mail"
                  size={20}
                  color={activeField === "email" ? "#00B37A" : iconColor}
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setActiveField("email")}
                  onBlur={() => setActiveField(null)}
                  placeholder="Email address"
                  placeholderTextColor="#9ca3af"
                  className="ml-3 flex-1 text-base text-foreground font-sans"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password Field */}
              <View
                className="h-13 flex-row items-center rounded-2xl bg-card px-4 border"
                style={{
                  borderColor:
                    activeField === "password" ? activeBorderColor : defaultBorderColor,
                }}
              >
                <Feather
                  name="lock"
                  size={20}
                  color={activeField === "password" ? "#00B37A" : iconColor}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setActiveField("password")}
                  onBlur={() => setActiveField(null)}
                  placeholder="Password"
                  placeholderTextColor="#9ca3af"
                  className="ml-3 flex-1 text-base text-foreground font-sans"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="p-1"
                >
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#9ca3af"
                  />
                </Pressable>
              </View>

              {/* Forgot Password Link */}
              <View className="items-end pt-1">
                <Pressable onPress={handleForgotPassword}>
                  <Text className="text-sm font-semibold text-[#00B37A]">
                    Forgot password?
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Bottom Actions */}
          <View className="w-full pt-8">
            <Pressable
              onPress={handleLogin}
              disabled={isPending}
              className={`h-13 w-full items-center justify-center rounded-full bg-[#00B37A] active:bg-primary-dark shadow-sm ${
                isPending ? "opacity-80" : ""
              }`}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  Log In
                </Text>
              )}
            </Pressable>

            {/* Footer link to Sign Up */}
            <View className="mt-4 flex-row items-center justify-center">
              <Text className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
              </Text>
              <Pressable onPress={() => router.push("/(auth)/signup")}>
                <Text className="text-sm font-bold text-[#00B37A]">
                  Sign Up
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
