import { Product, PaginatedResponse } from "@/types";
import { API_ENDPOINTS, PAGINATION } from "@/constants/api";

/**
 * Product API client
 */
export const productApi = {
  /**
   * Fetch products with pagination and search
   */
  getProducts: async ({
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    search,
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Product>> => {
    const searchParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (search) {
      searchParams.append("search", search);
    }

    const response = await fetch(
      `${API_ENDPOINTS.PRODUCTS}?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    return response.json();
  },

  /**
   * Create a new product
   */
  createProduct: async (
    data: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<Product> => {
    const response = await fetch(API_ENDPOINTS.PRODUCTS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create product");
    }

    return response.json();
  },

  /**
   * Update an existing product
   */
  updateProduct: async (
    id: string,
    data: Partial<Product>
  ): Promise<Product> => {
    const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update product");
    }

    return response.json();
  },

  /**
   * Delete a product
   */
  deleteProduct: async (id: string): Promise<void> => {
    const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete product");
    }
  },
};
