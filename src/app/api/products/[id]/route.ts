import { NextRequest } from "next/server";
import { productService } from "@/lib/services/product.service";
import { updateProductSchema } from "@/lib/validations/product";
import { createApiResponse, createErrorResponse } from "@/lib/api/response";

// GET /api/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await productService.findById(params.id);

    if (!product) {
      return createErrorResponse("Product not found", 404);
    }

    return createApiResponse(product);
  } catch (error) {
    console.error("GET /products/[id] error:", error);
    return createErrorResponse("Failed to fetch product");
  }
}

// PUT /api/products/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return createErrorResponse(
        "Invalid product data",
        400,
        parsed.error.errors
      );
    }

    const product = await productService.update(params.id, parsed.data);
    return createApiResponse(product);
  } catch (error) {
    console.error("PUT /products/[id] error:", error);
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return createErrorResponse("Product not found", 404);
    }
    return createErrorResponse("Failed to update product");
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await productService.delete(params.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /products/[id] error:", error);
    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return createErrorResponse("Product not found", 404);
    }
    return createErrorResponse("Failed to delete product");
  }
}
