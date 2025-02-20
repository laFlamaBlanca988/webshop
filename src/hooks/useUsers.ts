import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/lib/services/user.service";
import { handleApiError } from "@/lib/api/axios";
import { Role } from "@prisma/client";
import { CreateUserInput, UpdateUserInput, UserProfile } from "@/types/user";

const userService = UserService.getInstance();

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
  }) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

interface UseUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
}

interface UsersResponse {
  users: UserProfile[];
  total: number;
  pages: number;
}

export function useUsers(options: UseUsersOptions = {}) {
  const queryClient = useQueryClient();

  // Query for fetching users
  const {
    data,
    isLoading,
    error,
    refetch: refreshUsers,
  } = useQuery({
    queryKey: userKeys.list(options),
    queryFn: () => userService.findMany(options),
  });

  // Query for fetching a single user
  const useUser = (id: string, includeCart = false) => {
    return useQuery({
      queryKey: userKeys.detail(id),
      queryFn: () => userService.findById(id, includeCart),
    });
  };

  // Mutation for creating users
  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });

  // Mutation for updating users
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      userService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(id),
      });
    },
    // Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: userKeys.detail(id),
      });

      const previousUser = queryClient.getQueryData<UserProfile>(
        userKeys.detail(id)
      );

      if (previousUser) {
        queryClient.setQueryData<UserProfile>(userKeys.detail(id), {
          ...previousUser,
          ...data,
        });
      }

      return { previousUser };
    },
    onError: (_, { id }, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.detail(id), context.previousUser);
      }
    },
  });

  // Mutation for deleting users
  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
    // Optimistic update
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: userKeys.lists(),
      });

      const previousUsers = queryClient.getQueryData<UsersResponse>(
        userKeys.lists()
      );

      if (previousUsers) {
        queryClient.setQueriesData<UsersResponse>(
          { queryKey: userKeys.lists() },
          (old) => {
            if (!old) return previousUsers;
            return {
              ...old,
              users: old.users.filter((user) => user.id !== id),
              total: old.total - 1,
            };
          }
        );
      }

      return { previousUsers };
    },
    onError: (_, __, context) => {
      if (context?.previousUsers) {
        queryClient.setQueriesData(
          { queryKey: userKeys.lists() },
          context.previousUsers
        );
      }
    },
  });

  return {
    // Query results
    users: data?.users ?? [],
    total: data?.total ?? 0,
    pages: data?.pages ?? 0,
    isLoading,
    error: error ? handleApiError(error as unknown) : null,
    refreshUsers,

    // Single user query
    useUser,

    // Mutations
    createUser: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error
      ? handleApiError(createMutation.error as unknown)
      : null,

    updateUser: (id: string, data: UpdateUserInput) =>
      updateMutation.mutateAsync({ id, data }),
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error
      ? handleApiError(updateMutation.error as unknown)
      : null,

    deleteUser: deleteMutation.mutateAsync,
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
