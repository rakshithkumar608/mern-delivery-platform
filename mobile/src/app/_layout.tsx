import "../global.css";

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUniwind } from "uniwind";

import { AppToaster } from "@/components/app-toaster";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Brand theme constants matching global.css semantic tokens
const CHOWLY_THEME = {
  light: {
    background: "#ffffff",
    card: "#ffffff",
    foreground: "#1a1a2e",
    border: "#e5e7eb",
    primary: "#00b37a",
    notification: "#ff6b35",
    muted: "#6b7280",
  },
  dark: {
    background: "#1a1a2e",
    card: "#222240",
    foreground: "#f0f0f5",
    border: "#2d2d4a",
    primary: "#00d68f",
    notification: "#ff8a5c",
    muted: "#9ca3af",
  },
} as const;

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { theme, hasAdaptiveThemes } = useUniwind();
  const dark = theme === "dark";
  const activePalette = dark ? CHOWLY_THEME.dark : CHOWLY_THEME.light;

  const toasterTheme: "light" | "dark" | "system" = hasAdaptiveThemes
    ? "system"
    : dark
      ? "dark"
      : "light";

  const navigationTheme = useMemo(() => {
    const base = dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: activePalette.background,
        card: activePalette.card,
        text: activePalette.foreground,
        border: activePalette.border,
        primary: activePalette.primary,
        notification: activePalette.notification,
      },
    };
  }, [dark, activePalette]);

  // Hide splash screen safely when fonts load or error
  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontError, fontsLoaded]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={navigationTheme}>
            <View
              className="flex-1 bg-background"
              style={{ flex: 1, backgroundColor: activePalette.background }}
            >
              <StatusBar style={dark ? "light" : "dark"} />
              <Stack screenOptions={{ headerShown: false }} />
              <AppToaster
                background={activePalette.card}
                border={activePalette.border}
                foreground={activePalette.foreground}
                muted={activePalette.muted}
                theme={toasterTheme}
              />
            </View>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
