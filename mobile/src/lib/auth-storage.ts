import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "chowly_auth_token";
const USER_KEY = "chowly_auth_user";

// In-memory fallback
let memoryToken: string | null = null;
let memoryUser: string | null = null;

export const saveAuthToken = async (token: string): Promise<void> => {
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

export const getAuthToken = async (): Promise<string | null> => {
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

export const clearAuthStorage = async (): Promise<void> => {
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

export const saveStoredUser = async <T>(user: T): Promise<void> => {
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

export const getStoredUser = async <T>(): Promise<T | null> => {
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
