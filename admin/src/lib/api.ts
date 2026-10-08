import API from "./axios-client";
import type {
  AuthResponse,
  LoginCredentials,
  User,
} from "@/types/auth";

export { API, API_BASE_URL } from "./axios-client";

/**
 * Log in an existing user
 * Used in: useMutation({ mutationFn: loginMutationFn })
 */
export const loginMutationFn = async (
  payload: LoginCredentials
): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>("/auth/login", payload);
  return response.data;
};

/**
 * Log out the current user and clear server auth cookie
 * Used in: useMutation({ mutationFn: logoutMutationFn })
 */
export const logoutMutationFn = async (): Promise<{ success: boolean; message: string }> => {
  const response = await API.post<{ success: boolean; message: string }>("/auth/logout");
  return response.data;
};

/**
 * Get current authenticated user profile
 * Used in: useQuery({ queryKey: ['currentUser'], queryFn: getCurrentUserQueryFn })
 */
export const getCurrentUserQueryFn = async (): Promise<{
  success: boolean;
  user: User;
  hasAddress?: boolean;
}> => {
  const response = await API.get<{
    success: boolean;
    user: User;
    hasAddress?: boolean;
  }>("/auth/me");
  return response.data;
};

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}
