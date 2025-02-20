export const API_ENDPOINTS = {
  PRODUCTS: "/api/products",
  ORDERS: "/api/orders",
} as const;

export const API_MESSAGES = {
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized access",
  VALIDATION_ERROR: "Validation error",
  SERVER_ERROR: "Internal server error",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
