import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CartService } from "@/lib/services/cart.service";
import { handleApiError } from "@/lib/api/axios";
import { CartItem } from "@/types/user";
import { useSession } from "next-auth/react";

const cartService = CartService.getInstance();

// Query keys
export const cartKeys = {
  all: ["cart"] as const,
  details: () => [...cartKeys.all, "details"] as const,
  items: () => [...cartKeys.all, "items"] as const,
  item: (id: string) => [...cartKeys.items(), id] as const,
};

export function useCart() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Query for fetching cart
  const {
    data: cart,
    isLoading,
    error,
    refetch: refreshCart,
  } = useQuery({
    queryKey: cartKeys.details(),
    queryFn: () => {
      if (!userId) throw new Error("User not authenticated");
      return cartService.getCart(userId);
    },
    enabled: !!userId,
  });

  // Mutation for adding item to cart
  const addItemMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      if (!userId) throw new Error("User not authenticated");
      return cartService.addItem(userId, productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cartKeys.all,
      });
    },
  });

  // Mutation for updating item quantity
  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (!userId) throw new Error("User not authenticated");
      return cartService.updateItemQuantity(userId, itemId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cartKeys.all,
      });
    },
    // Optimistic update
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({
        queryKey: cartKeys.details(),
      });

      const previousCart = queryClient.getQueryData<{
        id: string;
        items: CartItem[];
      }>(cartKeys.details());

      if (previousCart) {
        queryClient.setQueryData<{ id: string; items: CartItem[] }>(
          cartKeys.details(),
          {
            ...previousCart,
            items: previousCart.items.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            ),
          }
        );
      }

      return { previousCart };
    },
    onError: (_, __, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.details(), context.previousCart);
      }
    },
  });

  // Mutation for removing item from cart
  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => {
      if (!userId) throw new Error("User not authenticated");
      return cartService.removeItem(userId, itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cartKeys.all,
      });
    },
    // Optimistic update
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({
        queryKey: cartKeys.details(),
      });

      const previousCart = queryClient.getQueryData<{
        id: string;
        items: CartItem[];
      }>(cartKeys.details());

      if (previousCart) {
        queryClient.setQueryData<{ id: string; items: CartItem[] }>(
          cartKeys.details(),
          {
            ...previousCart,
            items: previousCart.items.filter((item) => item.id !== itemId),
          }
        );
      }

      return { previousCart };
    },
    onError: (_, __, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.details(), context.previousCart);
      }
    },
  });

  // Mutation for clearing cart
  const clearCartMutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error("User not authenticated");
      return cartService.clearCart(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cartKeys.all,
      });
    },
  });

  // Query for cart total
  const {
    data: total,
    isLoading: isLoadingTotal,
    error: totalError,
  } = useQuery({
    queryKey: [...cartKeys.details(), "total"],
    queryFn: () => {
      if (!userId) throw new Error("User not authenticated");
      return cartService.getCartTotal(userId);
    },
    enabled: !!userId && !!cart?.items.length,
  });

  return {
    // Cart data
    cart,
    total,
    isLoading: isLoading || isLoadingTotal,
    error: error ? handleApiError(error as unknown) : null,
    totalError: totalError ? handleApiError(totalError as unknown) : null,
    refreshCart,

    // Mutations
    addItem: addItemMutation.mutateAsync,
    isAdding: addItemMutation.isPending,
    addError: addItemMutation.error
      ? handleApiError(addItemMutation.error as unknown)
      : null,

    updateQuantity: updateQuantityMutation.mutateAsync,
    isUpdating: updateQuantityMutation.isPending,
    updateError: updateQuantityMutation.error
      ? handleApiError(updateQuantityMutation.error as unknown)
      : null,

    removeItem: removeItemMutation.mutateAsync,
    isRemoving: removeItemMutation.isPending,
    removeError: removeItemMutation.error
      ? handleApiError(removeItemMutation.error as unknown)
      : null,

    clearCart: clearCartMutation.mutateAsync,
    isClearing: clearCartMutation.isPending,
    clearError: clearCartMutation.error
      ? handleApiError(clearCartMutation.error as unknown)
      : null,

    // Combined loading state
    isMutating:
      addItemMutation.isPending ||
      updateQuantityMutation.isPending ||
      removeItemMutation.isPending ||
      clearCartMutation.isPending,
  };
}
