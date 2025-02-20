import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { CartService } from "@/lib/services/cart.service";
import { createApiResponse, createErrorResponse } from "@/lib/api/response";
import { z } from "zod";

const cartService = CartService.getInstance();

// Validation schema for updating quantity
const updateQuantitySchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

// PUT /api/cart/items/[id] - Update item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = updateQuantitySchema.safeParse(body);
    if (!parsed.success) {
      return createErrorResponse("Invalid quantity", 400, parsed.error.errors);
    }

    const { quantity } = parsed.data;
    const item = await cartService.updateItemQuantity(
      session.user.id,
      params.id,
      quantity
    );

    return createApiResponse(item);
  } catch (error) {
    console.error("PUT /cart/items/[id] error:", error);
    if (error instanceof Error) {
      if (error.message === "Cart not found") {
        return createErrorResponse("Cart not found", 404);
      }
      // Prisma will throw if item not found
      if (error.message.includes("Record to update not found")) {
        return createErrorResponse("Cart item not found", 404);
      }
    }
    return createErrorResponse("Failed to update cart item");
  }
}

// DELETE /api/cart/items/[id] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse("Unauthorized", 401);
    }

    await cartService.removeItem(session.user.id, params.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /cart/items/[id] error:", error);
    if (error instanceof Error) {
      if (error.message === "Cart not found") {
        return createErrorResponse("Cart not found", 404);
      }
      // Prisma will throw if item not found
      if (error.message.includes("Record to delete does not exist")) {
        return createErrorResponse("Cart item not found", 404);
      }
    }
    return createErrorResponse("Failed to remove cart item");
  }
}
