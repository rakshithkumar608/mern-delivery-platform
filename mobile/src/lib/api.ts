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

export interface ExtraOption {
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
  calories?: number;
  image: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  isPopular?: boolean;
  isAvailable?: boolean;
  sizes?: SizeOption[];
  extras?: ExtraOption[];
  toppings?: ToppingOption[];
  removables?: string[];
  allergens?: string[];
  displayOrder?: number;
}

export interface DishDetailResponse {
  success: boolean;
  item: MenuItem;
  restaurant?: Restaurant;
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

export interface DishPriceCalculationPayload {
  sizeLabel?: string;
  extras?: string[];
  quantity?: number;
}

export interface DishPriceCalculationResponse {
  success: boolean;
  dishId: string;
  dishName: string;
  currency: string;
  size: string;
  sizePrice: number;
  extras: Array<{ label: string; price: number }>;
  extrasTotal: number;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

/**
 * Fetch single dish customization details by menu item ID
 * Used in: useQuery({ queryKey: ['dish', id], queryFn: () => fetchDishByIdQueryFn(id) })
 */
export const fetchDishByIdQueryFn = async (
  dishId: string
): Promise<DishDetailResponse> => {
  try {
    const response = await API.get<DishDetailResponse>(`/dishes/${dishId}`);
    return response.data;
  } catch {
    const fallbackResponse = await API.get<DishDetailResponse>(
      `/restaurants/menu/${dishId}`
    );
    return fallbackResponse.data;
  }
};

/**
 * Calculate customized dish price on the backend
 */
export const calculateDishPriceMutationFn = async ({
  dishId,
  payload,
}: {
  dishId: string;
  payload: DishPriceCalculationPayload;
}): Promise<DishPriceCalculationResponse> => {
  const response = await API.post<DishPriceCalculationResponse>(
    `/dishes/${dishId}/calculate`,
    payload
  );
  return response.data;
};

export interface SearchDishItem extends MenuItem {
  restaurantName?: string;
  restaurantSlug?: string;
  currency?: string;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  count: number;
  restaurants: Restaurant[];
  dishes: SearchDishItem[];
}

/**
 * Unified Search across restaurants and dishes
 * Used in: useQuery({ queryKey: ['search', query], queryFn: () => searchQueryFn(query) })
 */
export const searchQueryFn = async (
  query: string,
  limit = 20
): Promise<SearchResponse> => {
  const response = await API.get<SearchResponse>("/search", {
    params: { q: query, limit },
  });
  return response.data;
};

// ─── Basket Types & Endpoints ───────────────────────────────────────────────

export interface BasketItem {
  _id?: string;
  menuItemId?: string;
  name: string;
  subtitle?: string;
  image: string;
  price: number;
  quantity: number;
  selectedSize?: {
    label: string;
    price: number;
  };
  selectedExtras?: Array<{
    label: string;
    price: number;
  }>;
  selectedRemovals?: string[];
  specialInstructions?: string;
  itemTotal: number;
}

export interface Basket {
  userId?: string;
  restaurantId?: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantLogo: string;
  restaurantDeliveryTime: string;
  currency: string;
  items: BasketItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  freeDeliveryThreshold: number;
  includeCutlery: boolean;
  promoCode?: string;
  discount: number;
  orderNotes?: string;
  allergyReminder?: string;
  total: number;
}

export interface BasketResponse {
  success: boolean;
  basket: Basket;
}

export const fetchBasketQueryFn = async (): Promise<BasketResponse> => {
  const response = await API.get<BasketResponse>("/basket");
  return response.data;
};

export const addBasketItemMutationFn = async (
  itemData: Partial<BasketItem>
): Promise<BasketResponse> => {
  const response = await API.post<BasketResponse>("/basket/items", itemData);
  return response.data;
};

export const updateBasketItemQuantityMutationFn = async ({
  itemId,
  quantity,
}: {
  itemId: string;
  quantity: number;
}): Promise<BasketResponse> => {
  const response = await API.patch<BasketResponse>(`/basket/items/${itemId}`, {
    quantity,
  });
  return response.data;
};

export const removeBasketItemMutationFn = async (
  itemId: string
): Promise<BasketResponse> => {
  const response = await API.delete<BasketResponse>(`/basket/items/${itemId}`);
  return response.data;
};

export const updateBasketPreferencesMutationFn = async (
  prefs: {
    includeCutlery?: boolean;
    promoCode?: string;
    orderNotes?: string;
    allergyReminder?: string;
  }
): Promise<BasketResponse> => {
  const response = await API.patch<BasketResponse>("/basket/preferences", prefs);
  return response.data;
};

export const clearBasketMutationFn = async (): Promise<BasketResponse> => {
  const response = await API.delete<BasketResponse>("/basket");
  return response.data;
};

// ─── Order Types & Endpoints ───────────────────────────────────────────────

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "cancelled";

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  title: string;
  note?: string;
  timestamp: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  role?: string;
  phone: string;
  avatar?: string;
  rating: number;
  totalRatings: number;
  vehicleType?: string;
  plateNumber?: string;
}

export interface DriverPayout {
  baseFee: number;
  distanceFee: number;
  grossFee?: number;
  commissionRate?: number;
  commissionFee?: number;
  totalFee: number;
  distanceKm?: number;
  currency: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  items: BasketItem[];
  deliveryAddress: {
    label: string;
    fullAddress: string;
    contactPhone: string;
    instructions?: string;
  };
  arrivalEstimate: string;
  estimatedDeliveryTime: string;
  formattedEta: string;
  pricing: {
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    discount: number;
    total: number;
    currency: string;
  };
  payment: {
    method: "card";
    status: PaymentStatus;
    amountInPaise: number;
    stripePaymentIntentId?: string;
    stripeClientSecret?: string;
    cardBrand?: string;
    cardLast4?: string;
  };
  status: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  driver?: DriverInfo | null;
  driverPayout?: DriverPayout;
  deliveryOtp?: string;
  includeCutlery: boolean;
  orderNotes?: string;
  createdAt: string;
}

export interface CreateCheckoutSessionPayload {
  deliveryAddress?: {
    label?: string;
    fullAddress: string;
    contactPhone: string;
    instructions?: string;
  };
  contactPhone?: string;
  deliveryInstructions?: string;
}

export interface CheckoutSessionData {
  orderId: string;
  orderNumber: string;
  clientSecret: string;
  publishableKey?: string;
  amountInPaise: number;
  amount: number;
  currency: string;
  arrivalEstimate: string;
  estimatedDeliveryTime: string;
  formattedEta: string;
}

export interface CheckoutSessionResponse {
  success: boolean;
  data: CheckoutSessionData;
}

export interface OrderResponse {
  success: boolean;
  order: Order;
}

export const createCheckoutSessionMutationFn = async (
  payload: CreateCheckoutSessionPayload
): Promise<CheckoutSessionResponse> => {
  const response = await API.post<CheckoutSessionResponse>(
    "/orders/checkout-session",
    payload
  );
  return response.data;
};

export const fetchOrderByIdQueryFn = async (
  orderId: string
): Promise<OrderResponse> => {
  const response = await API.get<OrderResponse>(`/orders/${orderId}`);
  return response.data;
};

export const simulateWebhookSuccessMutationFn = async (
  orderId: string
): Promise<any> => {
  const response = await API.post("/payments/simulate-webhook", { orderId });
  return response.data;
};

export interface UserOrdersResponse {
  success: boolean;
  count: number;
  orders: Order[];
}

export const fetchUserOrdersQueryFn = async (): Promise<UserOrdersResponse> => {
  const response = await API.get<UserOrdersResponse>("/orders");
  return response.data;
};

export const fetchReadyOrdersQueryFn = async (): Promise<UserOrdersResponse> => {
  const response = await API.get<UserOrdersResponse>("/orders/ready");
  return response.data;
};

export const claimOrderMutationFn = async (orderId: string): Promise<OrderResponse> => {
  const response = await API.post<OrderResponse>(`/orders/${orderId}/claim`);
  return response.data;
};

export const updateDriverStatusMutationFn = async ({
  orderId,
  status,
  note,
  otp,
}: {
  orderId: string;
  status: string;
  note?: string;
  otp?: string;
}): Promise<OrderResponse> => {
  const response = await API.patch<OrderResponse>(`/orders/${orderId}/driver-status`, {
    status,
    note,
    otp,
  });
  return response.data;
};

export const fetchDriverHistoryQueryFn = async (): Promise<UserOrdersResponse> => {
  const response = await API.get<UserOrdersResponse>("/orders/driver/history");
  return response.data;
};

export interface ActiveDriverOrderResponse {
  success: boolean;
  order: Order | null;
}

export const fetchActiveDriverOrderQueryFn = async (): Promise<ActiveDriverOrderResponse> => {
  const response = await API.get<ActiveDriverOrderResponse>("/orders/driver/active");
  return response.data;
};

export interface DeliveryRule {
  _id?: string;
  driverBasePayout: number;
  driverPerKmRate: number;
  driverMinPayout: number;
  platformCommissionRate: number;
  customerDeliveryFee: number;
  freeDeliveryThreshold?: number;
  currency: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface DeliveryRulesResponse {
  success: boolean;
  rules: DeliveryRule;
}

export const fetchDeliveryRulesQueryFn = async (): Promise<DeliveryRulesResponse> => {
  const response = await API.get<DeliveryRulesResponse>("/delivery-rules");
  return response.data;
};





