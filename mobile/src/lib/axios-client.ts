import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { getToken } from "@/features/auth/token-storage";

// Determine the most appropriate base URL for the current environment
const getBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  // 1. If an explicit remote HTTPS URL or ngrok/tunnel URL is specified, respect it directly
  if (envUrl && (envUrl.startsWith("https://") || envUrl.includes(".ngrok") || envUrl.includes(".loca.lt"))) {
    return envUrl;
  }

  // 2. Extract computer's active LAN IP from Expo Constants (dynamically matches Metro bundler host)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(":")[0];
    if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
      return `http://${ip}:5000/api/v1`;
    }
  }

  // 3. If EXPO_PUBLIC_API_URL is configured (e.g. local IP override), use it
  if (envUrl) {
    return envUrl;
  }

  // 4. Android Emulator loopback alias (10.0.2.2 connects to host computer)
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000/api/v1";
  }

  // 5. iOS Simulator & Web fallback
  return "http://localhost:5000/api/v1";
};

export const API_BASE_URL = getBaseUrl();

if (__DEV__) {
  console.log(`[Chowly API] Base URL initialized to: ${API_BASE_URL}`);
}

export const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach Bearer token to all outgoing requests if present
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  },
  (error) => Promise.reject(error),
);

// Format and normalize API error responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    let backendMessage =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message;

    if (!backendMessage) {
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        backendMessage = "Server connection timed out. Please check if the backend is running.";
      } else if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
        backendMessage = `Network Error: Cannot connect to API at ${API.defaults.baseURL || API_BASE_URL}. Ensure your device and PC are on the same Wi-Fi.`;
      } else {
        backendMessage = error.message || "An unexpected error occurred. Please try again.";
      }
    }

    // Enhance Error object with clean backend message
    const customError = new Error(backendMessage);
    (customError as any).statusCode = error.response?.status;
    (customError as any).data = error.response?.data;

    return Promise.reject(customError);
  },
);

export default API;
