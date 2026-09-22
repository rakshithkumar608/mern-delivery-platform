import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { getAuthToken } from "./auth-storage";

// Determine the most appropriate base URL for the current environment
const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // If running in Expo Go on a real device, use computer's LAN IP from hostUri
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    return `http://${ip}:5000/api/v1`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000/api/v1";
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
      const token = await getAuthToken();
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
