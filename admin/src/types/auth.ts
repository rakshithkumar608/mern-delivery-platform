export type UserRole = "admin" | "restaurant_owner" | "rider" | "customer";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
  hasAddress?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "admin" | "restaurant_owner";
}
