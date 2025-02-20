import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { UserService } from "@/lib/services/user.service";
import { createApiResponse, createErrorResponse } from "@/lib/api/response";
import { Role } from "@prisma/client";
import { updateUserSchema } from "@/lib/validations/user";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma/client";

const userService = UserService.getInstance();

// GET /api/users/[id] - Get user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Users can only access their own data unless they're admin
    if (session.user.role !== Role.ADMIN && session.user.id !== params.id) {
      return createErrorResponse("Forbidden", 403);
    }

    const user = await userService.findById(params.id);
    if (!user) {
      return createErrorResponse("User not found", 404);
    }

    return createApiResponse(user);
  } catch (error) {
    console.error("GET /users/[id] error:", error);
    return createErrorResponse("Failed to fetch user");
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Users can only update their own data unless they're admin
    if (session.user.role !== Role.ADMIN && session.user.id !== params.id) {
      return createErrorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return createErrorResponse("Invalid user data", 400, parsed.error.errors);
    }

    // If updating email, check if it's already taken
    if (parsed.data.email) {
      const existingUser = await userService.findByEmail(parsed.data.email);
      if (existingUser && existingUser.id !== params.id) {
        return createErrorResponse("Email already exists", 400);
      }
    }

    // If updating password, verify current password
    if (parsed.data.password) {
      const user = await prisma.user.findUnique({
        where: { id: params.id },
        select: { password: true },
      });

      if (!user?.password) {
        return createErrorResponse("Invalid password", 400);
      }

      const isValid = await compare(
        parsed.data.currentPassword!,
        user.password
      );

      if (!isValid) {
        return createErrorResponse("Invalid current password", 400);
      }

      // Remove currentPassword from data before updating
      delete parsed.data.currentPassword;
    }

    // Non-admins cannot change roles
    if (
      session.user.role !== Role.ADMIN &&
      parsed.data.role &&
      parsed.data.role !== session.user.role
    ) {
      return createErrorResponse("Cannot change role", 403);
    }

    const user = await userService.update(params.id, parsed.data);
    return createApiResponse(user);
  } catch (error) {
    console.error("PUT /users/[id] error:", error);
    return createErrorResponse("Failed to update user");
  }
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Only admins can delete users
    if (session.user.role !== Role.ADMIN) {
      return createErrorResponse("Forbidden", 403);
    }

    // Prevent deleting the last admin
    if (session.user.id === params.id) {
      const adminCount = await prisma.user.count({
        where: { role: Role.ADMIN },
      });

      if (adminCount <= 1) {
        return createErrorResponse("Cannot delete the last admin account", 400);
      }
    }

    await userService.delete(params.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /users/[id] error:", error);
    return createErrorResponse("Failed to delete user");
  }
}
