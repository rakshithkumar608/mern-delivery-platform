import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { getToken } from "@/features/auth/token-storage";

// Determine the most appropriate base URL for the current environment
const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Attempt to extract computer's LAN IP from Expo Constants across Expo Go and custom dev clients
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

  // Fallback for mobile devices (both physical phones and emulators can reach LAN IP)
  const LAN_IP = "192.168.31.122";
  if (Platform.OS === "android" || Platform.OS === "ios") {
    return `http://${LAN_IP}:5000/api/v1`;
  }

  return "http://localhost:5000/api/v1";
};

export const API_BASE_URL = getBaseUrl();

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
    const backendMessage =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      "An unexpected error occurred. Please try again.";

    // Enhance Error object with clean backend message
    const customError = new Error(backendMessage);
    (customError as any).statusCode = error.response?.status;
    (customError as any).data = error.response?.data;

    return Promise.reject(customError);
  },
);

export default API;
