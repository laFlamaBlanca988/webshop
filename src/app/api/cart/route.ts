import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { CartService } from "@/lib/services/cart.service";
import { createApiResponse, createErrorResponse } from "@/lib/api/response";
import { z } from "zod";

const cartService = CartService.getInstance();

// Validation schema for adding items
const addItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

// GET /api/cart - Get user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse("Unauthorized", 401);
    }

    const cart = await cartService.getCart(session.user.id);
    if (!cart) {
      return createErrorResponse("Cart not found", 404);
    }

    // Get cart total
    const total = await cartService.getCartTotal(session.user.id);

    return createApiResponse({
      ...cart,
      total,
    });
  } catch (error) {
    console.error("GET /cart error:", error);
    return createErrorResponse("Failed to fetch cart");
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) {
      return createErrorResponse(
        "Invalid cart item data",
        400,
        parsed.error.errors
      );
    }

    const { productId, quantity } = parsed.data;
    const item = await cartService.addItem(
      session.user.id,
      productId,
      quantity
    );

    return createApiResponse(item, 201);
  } catch (error) {
    console.error("POST /cart error:", error);
    if (error instanceof Error) {
      if (error.message === "Product not found") {
        return createErrorResponse("Product not found", 404);
      }
      if (error.message === "Cart not found") {
        return createErrorResponse("Cart not found", 404);
      }
    }
    return createErrorResponse("Failed to add item to cart");
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse("Unauthorized", 401);
    }

    await cartService.clearCart(session.user.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /cart error:", error);
    if (error instanceof Error && error.message === "Cart not found") {
      return createErrorResponse("Cart not found", 404);
    }
    return createErrorResponse("Failed to clear cart");
  }
}
