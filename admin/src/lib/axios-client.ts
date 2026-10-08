import axios from "axios";

// Determine the most appropriate base URL for the admin web app
const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
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
  (config) => {
    try {
      const token = localStorage.getItem("chowly_admin_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Storage access failed
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Format and normalize API error responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, purge stale token from storage
    if (error.response?.status === 401) {
      localStorage.removeItem("chowly_admin_token");
      localStorage.removeItem("chowly_admin_user");
    }

    let backendMessage =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message;

    if (!backendMessage) {
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        backendMessage = "Server connection timed out. Please check if the backend is running.";
      } else if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
        backendMessage = `Network Error: Cannot connect to API at ${API.defaults.baseURL || API_BASE_URL}. Ensure your backend server is running.`;
      } else {
        backendMessage = error.message || "An unexpected error occurred. Please try again.";
      }
    }

    // Enhance Error object with clean backend message
    const customError = new Error(backendMessage);
    (customError as any).statusCode = error.response?.status;
    (customError as any).data = error.response?.data;

    return Promise.reject(customError);
  },
);

export default API;
