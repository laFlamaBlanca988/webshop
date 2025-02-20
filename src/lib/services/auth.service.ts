import { signIn, signOut } from "next-auth/react";
import { CreateUserInput } from "@/types/user";
import { Session } from "next-auth";
import { createUser } from "@/app/api/auth/actions";

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login with credentials
   */
  async login(credentials: { email: string; password: string }): Promise<{
    error?: string;
  }> {
    try {
      const result = await signIn("credentials", {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        return { error: result.error };
      }

      return {};
    } catch {
      return { error: "Failed to sign in" };
    }
  }

  /**
   * Register new user
   */
  async register(data: CreateUserInput) {
    try {
      // Use server action to create user
      const user = await createUser(data);

      // Login after registration
      await this.login({
        email: data.email,
        password: data.password,
      });

      return user;
    } catch (error) {
      throw error instanceof Error ? error : new Error("Failed to register");
    }
  }

  /**
   * Logout user
   */
  async logout(callbackUrl?: string) {
    await signOut({
      redirect: Boolean(callbackUrl),
      callbackUrl,
    });
  }

  /**
   * Validate session on protected routes
   */
  async validateSession(session: Session | null, requiredRole?: string) {
    if (!session) {
      throw new Error("Unauthorized");
    }

    if (requiredRole && session.user.role !== requiredRole) {
      throw new Error("Forbidden");
    }

    return true;
  }
}
