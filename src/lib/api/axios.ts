import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { getSession } from "next-auth/react";
import { API_MESSAGES } from "@/constants/api";

// Extend Session type to include accessToken
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

// Type for retry request
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Type for API error data
interface ApiErrorData {
  error?: string;
  details?: unknown;
}

// Type for API error responses
export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

// Create a custom axios instance
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get session from NextAuth
    const session = await getSession();

    // If session exists, add token to request
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError<ApiErrorData>) => {
    const originalRequest = error.config as RetryConfig;

    // Handle token expiration
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // NextAuth will handle token refresh automatically
        const session = await getSession();

        if (session?.accessToken) {
          originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        // Handle refresh token failure
        window.location.href = "/login";
      }
    }

    // Standardize error response
    const errorResponse: ApiError = {
      message: error.response?.data?.error || API_MESSAGES.SERVER_ERROR,
      status: error.response?.status || 500,
      details: error.response?.data?.details,
    };

    return Promise.reject(errorResponse);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorData>;
    return {
      message: axiosError.response?.data?.error || API_MESSAGES.SERVER_ERROR,
      status: axiosError.response?.status || 500,
      details: axiosError.response?.data?.details,
    };
  }

  return {
    message: error instanceof Error ? error.message : API_MESSAGES.SERVER_ERROR,
    status: 500,
  };
};
