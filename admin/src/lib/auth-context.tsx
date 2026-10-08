import React, { createContext, useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUserQueryFn, loginMutationFn, logoutMutationFn } from "./api";
import type { LoginCredentials, User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "chowly_admin_token";
const USER_KEY = "chowly_admin_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [fallbackUser, setFallbackUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved) as User;
    } catch {
      return null;
    }
  });

  // Query current user profile when token is present
  const {
    data: userData,
    isLoading: isUserLoading,
    refetch,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUserQueryFn,
    enabled: Boolean(token),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const currentUser = userData?.user ?? fallbackUser;

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginMutationFn,
    onSuccess: (data) => {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setFallbackUser(data.user);
      queryClient.setQueryData(["currentUser"], {
        success: true,
        user: data.user,
        hasAddress: data.hasAddress,
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutMutationFn,
    onSettled: () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setFallbackUser(null);
      queryClient.removeQueries({ queryKey: ["currentUser"] });
    },
  });

  const login = async (credentials: LoginCredentials): Promise<User> => {
    const res = await loginMutation.mutateAsync(credentials);
    return res.user;
  };

  const logout = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  };

  const refreshUser = async (): Promise<void> => {
    if (token) {
      await refetch();
    }
  };

  const value: AuthContextType = {
    user: currentUser,
    token,
    isLoading: Boolean(token && isUserLoading && !fallbackUser),
    isAuthenticated: Boolean(token && currentUser),
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
