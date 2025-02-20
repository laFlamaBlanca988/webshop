import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { AuthService } from "@/lib/services/auth.service";
import {
  LoginFormData,
  RegisterFormData,
  loginSchema,
  registerSchema,
} from "@/lib/validations/auth";

const authService = AuthService.getInstance();

export function useLogin() {
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data),
    onSuccess: (data) => {
      if (!data.error) {
        router.push("/");
        router.refresh(); // Refresh server components
      }
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    loginMutation.mutate(data);
  });

  return {
    form,
    onSubmit,
    isLoading: loginMutation.isPending,
    error: loginMutation.error
      ? (loginMutation.error as Error).message
      : loginMutation.data?.error,
  };
}

export function useRegister() {
  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) =>
      authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    onSuccess: () => {
      router.push("/");
      router.refresh(); // Refresh server components
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    registerMutation.mutate(data);
  });

  return {
    form,
    onSubmit,
    isLoading: registerMutation.isPending,
    error: registerMutation.error
      ? (registerMutation.error as Error).message
      : null,
  };
}

export function useLogout() {
  const router = useRouter();

  const logoutMutation = useMutation({
    mutationFn: (callbackUrl?: string) => authService.logout(callbackUrl),
    onSuccess: () => {
      router.push("/auth");
      router.refresh(); // Refresh server components
    },
  });

  return {
    logout: (callbackUrl?: string) => logoutMutation.mutate(callbackUrl),
    isLoading: logoutMutation.isPending,
  };
}

// Hook for protected routes
export function useProtectedRoute(requiredRole?: string) {
  const router = useRouter();

  return useMutation({
    mutationFn: (session: Session | null) =>
      authService.validateSession(session, requiredRole),
    onError: () => {
      router.push("/auth");
    },
  });
}
