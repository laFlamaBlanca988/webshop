import { NextRequest } from "next/server";
import { productService } from "@/lib/services/product.service";
import { createProductSchema, querySchema } from "@/lib/validations/product";
import {
  createApiResponse,
  createErrorResponse,
  createPaginatedResponse,
} from "@/lib/api/response";

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    if (!parsed.success) {
      return createErrorResponse(
        "Invalid query parameters",
        400,
        parsed.error.errors
      );
    }

    const result = await productService.findMany(parsed.data);
    return createPaginatedResponse(result);
  } catch (error) {
    console.error("GET /products error:", error);
    return createErrorResponse("Failed to fetch products");
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return createErrorResponse(
        "Invalid product data",
        400,
        parsed.error.errors
      );
    }

    const product = await productService.create(parsed.data);
    return createApiResponse(product, 201);
  } catch (error) {
    console.error("POST /products error:", error);
    return createErrorResponse("Failed to create product");
  }
}
