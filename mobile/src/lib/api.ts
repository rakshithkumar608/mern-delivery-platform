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
  hasAddress: boolean;
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

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  cloudinaryPublicId?: string;
  backgroundColor?: string;
  textColor?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface CategoriesResponse {
  success: boolean;
  count: number;
  categories: Category[];
}

export interface CategoryResponse {
  success: boolean;
  category: Category;
}

export interface SizeOption {
  label: string;
  price: number;
}

export interface ToppingOption {
  label: string;
  price: number;
}

export interface MenuItem {
  _id: string;
  id?: string;
  restaurantId?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  isPopular?: boolean;
  isAvailable?: boolean;
  sizes?: SizeOption[];
  toppings?: ToppingOption[];
  allergens?: string[];
  displayOrder?: number;
}

export interface Restaurant {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  cuisineType: string[];
  coverImage: string;
  logo?: string;
  rating: number;
  totalReviews: number;
  deliveryTime: string;
  distance: string;
  deliveryFee: number;
  minOrder: number;
  currency: string;
  openingHours: string;
  offer?: string;
  offerSubtitle?: string;
  allergensInfo?: string;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface RestaurantsResponse {
  success: boolean;
  count: number;
  total: number;
  restaurants: Restaurant[];
}

export interface RestaurantDetailResponse {
  success: boolean;
  restaurant: Restaurant;
  items: MenuItem[];
  categories: string[];
  popularItems: MenuItem[];
}

/**
 * Resolves an image URL: returns Cloudinary / absolute URL as-is,
 * or prepends the API host URL for local static assets.
 */
export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const root = API.defaults.baseURL ? API.defaults.baseURL.replace(/\/api\/v1\/?$/, "") : "";
  return `${root}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

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
  hasAddress: boolean;
}> => {
  const response = await API.get<{
    success: boolean;
    user: User;
    hasAddress: boolean;
  }>("/auth/me");
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

/**
 * Fetch all food categories
 * Used in: useQuery({ queryKey: ['categories'], queryFn: fetchCategoriesQueryFn })
 */
export const fetchCategoriesQueryFn = async (): Promise<CategoriesResponse> => {
  const response = await API.get<CategoriesResponse>("/categories");
  return response.data;
};

/**
  * Fetch restaurants with optional filters (category, cuisine, isFeatured, search)
  * Used in: useQuery({ queryKey: ['restaurants', filter], queryFn: () => fetchRestaurantsQueryFn(...) })
  */
export const fetchRestaurantsQueryFn = async (params?: {
  isFeatured?: boolean;
  category?: string;
  cuisine?: string;
  search?: string;
}): Promise<RestaurantsResponse> => {
  const response = await API.get<RestaurantsResponse>("/restaurants", {
    params,
  });
  return response.data;
};

/**
  * Fetch full restaurant details and menu items by ID or slug
  * Used in: useQuery({ queryKey: ['restaurant', id], queryFn: () => fetchRestaurantByIdQueryFn(id) })
  */
export const fetchRestaurantByIdQueryFn = async (
  idOrSlug: string
): Promise<RestaurantDetailResponse> => {
  const response = await API.get<RestaurantDetailResponse>(
    `/restaurants/${idOrSlug}`
  );
  return response.data;
};

