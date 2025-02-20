import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, PaginatedResponse } from "@/types";
import { productApi } from "@/lib/api/products";
import { handleApiError } from "@/lib/api/axios";

interface UseProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
}

// Query keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: UseProductsOptions) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export function useProducts(options: UseProductsOptions = {}) {
  const queryClient = useQueryClient();

  // Query for fetching products
  const {
    data,
    isLoading,
    error,
    refetch: refreshProducts,
  } = useQuery({
    queryKey: productKeys.list(options),
    queryFn: () => productApi.getProducts(options),
    staleTime: 1000 * 60, // Consider data stale after 1 minute
    gcTime: 1000 * 60 * 5, // Keep unused data in cache for 5 minutes
  });

  // Mutation for creating products
  const createMutation = useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      // Invalidate all product lists
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
  });

  // Mutation for updating products
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productApi.updateProduct(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific product and all lists
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(id),
      });
    },
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: productKeys.detail(id),
      });

      // Snapshot the previous value
      const previousProduct = queryClient.getQueryData<Product>(
        productKeys.detail(id)
      );

      // Optimistically update to the new value
      if (previousProduct) {
        queryClient.setQueryData<Product>(productKeys.detail(id), {
          ...previousProduct,
          ...data,
        });
      }

      return { previousProduct };
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProduct) {
        queryClient.setQueryData<Product>(
          productKeys.detail(id),
          context.previousProduct
        );
      }
    },
  });

  // Mutation for deleting products
  const deleteMutation = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      // Invalidate all product lists
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
    // Optimistic update
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: productKeys.lists(),
      });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData<
        PaginatedResponse<Product>
      >(productKeys.lists());

      // Optimistically remove the product from lists
      if (previousProducts) {
        queryClient.setQueriesData<PaginatedResponse<Product>>(
          { queryKey: productKeys.lists() },
          (old) => {
            if (!old) return previousProducts;
            return {
              ...old,
              data: old.data.filter((product) => product.id !== id),
            };
          }
        );
      }

      return { previousProducts };
    },
    onError: (_, __, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProducts) {
        queryClient.setQueriesData(
          { queryKey: productKeys.lists() },
          context.previousProducts
        );
      }
    },
  });

  return {
    // Query results
    products: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    error: error ? handleApiError(error as unknown) : null,
    refreshProducts,

    // Mutations
    createProduct: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error
      ? handleApiError(createMutation.error as unknown)
      : null,

    updateProduct: (id: string, data: Partial<Product>) =>
      updateMutation.mutateAsync({ id, data }),
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error
      ? handleApiError(updateMutation.error as unknown)
      : null,

    deleteProduct: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error
      ? handleApiError(deleteMutation.error as unknown)
      : null,

    // Combined loading state
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
