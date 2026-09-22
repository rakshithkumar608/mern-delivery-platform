import API from "./axios-client";

// ─── Data Types ───────────────────────────────────────────────────────
export type UserRole = "customer" | "rider" | "restaurant_owner" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  pushToken?: string;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AddressLabel = "Home" | "Work" | "Other";

export interface GeoLocation {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface UserAddress {
  _id: string;
  userId: string;
  label: AddressLabel;
  street: string;
  unit?: string;
  city: string;
  state?: string;
  zipCode?: string;
  formattedAddress: string;
  location?: GeoLocation;
  instructions?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Request Payloads ────────────────────────────────────────────────
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateAddressPayload {
  label: AddressLabel;
  street: string;
  unit?: string;
  city: string;
  state?: string;
  zipCode?: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  instructions?: string;
  isDefault?: boolean;
}

export interface UpdateAddressPayload extends Partial<CreateAddressPayload> {}

// ─── Response Types ──────────────────────────────────────────────────
export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface BaseApiResponse {
  success: boolean;
  message: string;
}

export interface AddressesResponse {
  success: boolean;
  addresses: UserAddress[];
}

export interface AddressResponse {
  success: boolean;
  message: string;
  address: UserAddress;
}

// ─── Centralized API Functions for TanStack React Query ──────────────

/**
 * Register a new user
 * Used in: useMutation({ mutationFn: registerMutationFn })
 */
export const registerMutationFn = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>("/auth/register", payload);
  return response.data;
};

/**
 * Log in an existing user
 * Used in: useMutation({ mutationFn: loginMutationFn })
 */
export const loginMutationFn = async (
  payload: LoginPayload,
): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>("/auth/login", payload);
  return response.data;
};

/**
 * Log out the current user and clear server auth cookie
 * Used in: useMutation({ mutationFn: logoutMutationFn })
 */
export const logoutMutationFn = async (): Promise<BaseApiResponse> => {
  const response = await API.post<BaseApiResponse>("/auth/logout");
  return response.data;
};

/**
 * Get current authenticated user profile
 * Used in: useQuery({ queryKey: ['currentUser'], queryFn: getCurrentUserQueryFn })
 */
export const getCurrentUserQueryFn = async (): Promise<{
  success: boolean;
  user: User;
}> => {
  const response = await API.get<{ success: boolean; user: User }>("/auth/me");
  return response.data;
};

/**
 * Create/Save a user delivery address
 * Used in: useMutation({ mutationFn: createAddressMutationFn })
 */
export const createAddressMutationFn = async (
  payload: CreateAddressPayload,
): Promise<AddressResponse> => {
  const response = await API.post<AddressResponse>("/addresses", payload);
  return response.data;
};

/**
 * Fetch all saved delivery addresses for the authenticated user
 * Used in: useQuery({ queryKey: ['userAddresses'], queryFn: getUserAddressesQueryFn })
 */
export const getUserAddressesQueryFn = async (): Promise<AddressesResponse> => {
  const response = await API.get<AddressesResponse>("/addresses");
  return response.data;
};

/**
 * Set an address as the user's primary default address
 * Used in: useMutation({ mutationFn: setDefaultAddressMutationFn })
 */
export const setDefaultAddressMutationFn = async (
  addressId: string,
): Promise<AddressResponse> => {
  const response = await API.patch<AddressResponse>(
    `/addresses/${addressId}/default`,
  );
  return response.data;
};

/**
 * Update an existing delivery address
 * Used in: useMutation({ mutationFn: updateAddressMutationFn })
 */
export const updateAddressMutationFn = async ({
  addressId,
  payload,
}: {
  addressId: string;
  payload: UpdateAddressPayload;
}): Promise<AddressResponse> => {
  const response = await API.put<AddressResponse>(
    `/addresses/${addressId}`,
    payload,
  );
  return response.data;
};

/**
 * Delete a saved delivery address
 * Used in: useMutation({ mutationFn: deleteAddressMutationFn })
 */
export const deleteAddressMutationFn = async (
  addressId: string,
): Promise<BaseApiResponse> => {
  const response = await API.delete<BaseApiResponse>(`/addresses/${addressId}`);
  return response.data;
};
