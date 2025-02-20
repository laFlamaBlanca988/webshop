import { prisma } from "@/lib/prisma/client";
import { CartItem } from "@/types/user";
import { Prisma } from "@prisma/client";

// Type for Prisma CartItem with product
type PrismaCartItem = Prisma.CartItemGetPayload<{
  select: {
    id: true;
    productId: true;
    quantity: true;
    product: {
      select: {
        name: true;
        price: true;
        images: true;
      };
    };
  };
}>;

export class CartService {
  private static instance: CartService;

  private constructor() {}

  static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  /**
   * Convert Prisma CartItem to API CartItem
   */
  private toCartItem(item: PrismaCartItem): CartItem {
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        name: item.product.name,
        price: Number(item.product.price),
        images: item.product.images,
      },
    };
  }

  /**
   * Get user's cart with items
   */
  async getCart(userId: string): Promise<{
    id: string;
    items: CartItem[];
  } | null> {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      select: {
        id: true,
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            product: {
              select: {
                name: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!cart) return null;

    return {
      id: cart.id,
      items: cart.items.map(this.toCartItem),
    };
  }

  /**
   * Add item to cart
   */
  async addItem(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<CartItem> {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity if item exists
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        select: {
          id: true,
          productId: true,
          quantity: true,
          product: {
            select: {
              name: true,
              price: true,
              images: true,
            },
          },
        },
      });

      return this.toCartItem(updatedItem);
    }

    // Create new item if it doesn't exist
    const newItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
      select: {
        id: true,
        productId: true,
        quantity: true,
        product: {
          select: {
            name: true,
            price: true,
            images: true,
          },
        },
      },
    });

    return this.toCartItem(newItem);
  }

  /**
   * Update cart item quantity
   */
  async updateItemQuantity(
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<CartItem> {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    const updatedItem = await prisma.cartItem.update({
      where: {
        id: itemId,
        cartId: cart.id, // Ensure item belongs to user's cart
      },
      data: { quantity },
      select: {
        id: true,
        productId: true,
        quantity: true,
        product: {
          select: {
            name: true,
            price: true,
            images: true,
          },
        },
      },
    });

    return this.toCartItem(updatedItem);
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, itemId: string): Promise<void> {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    await prisma.cartItem.delete({
      where: {
        id: itemId,
        cartId: cart.id, // Ensure item belongs to user's cart
      },
    });
  }

  /**
   * Clear all items from cart
   */
  async clearCart(userId: string): Promise<void> {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  /**
   * Get cart total
   */
  async getCartTotal(userId: string): Promise<number> {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      select: {
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                price: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.quantity * Number(item.product.price),
      0
    );

    return total;
  }
}
