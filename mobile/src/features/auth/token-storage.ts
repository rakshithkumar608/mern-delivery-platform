import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "chowly_auth_token";
const USER_KEY = "chowly_auth_user";

// In-memory cache for ultra-fast access and web fallback
let memoryToken: string | null = null;
let memoryUser: string | null = null;

/**
 * Persist the JWT token to secure hardware storage (or localStorage on Web)
 */
export const setToken = async (token: string): Promise<void> => {
  memoryToken = token;
  if (Platform.OS === "web") {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(TOKEN_KEY, token);
      }
    } catch {}
    return;
  }
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {}
};

/**
 * Retrieve the saved JWT token from secure storage
 */
export const getToken = async (): Promise<string | null> => {
  if (memoryToken) return memoryToken;
  if (Platform.OS === "web") {
    try {
      if (typeof window !== "undefined") {
        memoryToken = window.localStorage.getItem(TOKEN_KEY);
        return memoryToken;
      }
    } catch {
      return null;
    }
  }
  try {
    memoryToken = await SecureStore.getItemAsync(TOKEN_KEY);
    return memoryToken;
  } catch {
    return null;
  }
};

/**
 * Remove the JWT token and user details from secure storage (Logout)
 */
export const removeToken = async (): Promise<void> => {
  memoryToken = null;
  memoryUser = null;
  if (Platform.OS === "web") {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
      }
    } catch {}
    return;
  }
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch {}
};

/**
 * Store user profile information
 */
export const setUser = async <T>(user: T): Promise<void> => {
  const json = JSON.stringify(user);
  memoryUser = json;
  if (Platform.OS === "web") {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(USER_KEY, json);
      }
    } catch {}
    return;
  }
  try {
    await SecureStore.setItemAsync(USER_KEY, json);
  } catch {}
};

/**
 * Retrieve stored user profile information
 */
export const getUser = async <T>(): Promise<T | null> => {
  if (memoryUser) {
    try {
      return JSON.parse(memoryUser) as T;
    } catch {}
  }
  let str: string | null = null;
  if (Platform.OS === "web") {
    try {
      if (typeof window !== "undefined") {
        str = window.localStorage.getItem(USER_KEY);
      }
    } catch {}
  } else {
    try {
      str = await SecureStore.getItemAsync(USER_KEY);
    } catch {}
  }
  if (!str) return null;
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
};

// Aliases for flexibility and backward-compatibility
export const saveToken = setToken;
export const clearToken = removeToken;
export const clearAuth = removeToken;
export const saveUser = setUser;
export const saveAuthToken = setToken;
export const getAuthToken = getToken;
export const clearAuthStorage = removeToken;
export const saveStoredUser = setUser;
export const getStoredUser = getUser;
