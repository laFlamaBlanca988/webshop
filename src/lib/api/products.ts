import { Product, PaginatedResponse } from "@/types";
import { axiosInstance } from "./axios";
import { API_ENDPOINTS } from "@/constants/api";

/**
 * Product API client
 * Centralizes all product-related API calls
 */
export const productApi = {
  /**
   * Fetch products with pagination and search
   */
  getProducts: async ({
    page = 1,
    limit = 10,
    search,
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (search) {
      params.append("search", search);
    }

    return axiosInstance.get(`${API_ENDPOINTS.PRODUCTS}?${params.toString()}`);
  },

  /**
   * Get a single product by ID
   */
  getProduct: async (id: string): Promise<Product> => {
    return axiosInstance.get(`${API_ENDPOINTS.PRODUCTS}/${id}`);
  },

  /**
   * Create a new product
   */
  createProduct: async (
    data: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<Product> => {
    return axiosInstance.post(API_ENDPOINTS.PRODUCTS, data);
  },

  /**
   * Update an existing product
   */
  updateProduct: async (
    id: string,
    data: Partial<Product>
  ): Promise<Product> => {
    return axiosInstance.put(`${API_ENDPOINTS.PRODUCTS}/${id}`, data);
  },

  /**
   * Delete a product
   */
  deleteProduct: async (id: string): Promise<void> => {
    return axiosInstance.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`);
  },
};
