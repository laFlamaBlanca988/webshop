import { Prisma, Product as PrismaProduct } from "@prisma/client";

// Convert Prisma Decimal to number for the API
export type Product = Omit<PrismaProduct, "price"> & {
  price: number;
};

// Input types
export type ProductCreateInput = {
  name: string;
  price: number;
  description?: string | null;
  images: string[];
};

export type ProductUpdateInput = Partial<ProductCreateInput>;

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    pages: number;
    current: number;
    limit: number;
  };
}

// Service interface
export interface ProductService {
  findMany(params: ProductQueryParams): Promise<PaginatedResponse<Product>>;
  findById(id: string): Promise<Product | null>;
  create(data: ProductCreateInput): Promise<Product>;
  update(id: string, data: ProductUpdateInput): Promise<Product>;
  delete(id: string): Promise<void>;
}
