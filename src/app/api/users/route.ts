import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { UserService } from "@/lib/services/user.service";
import { createApiResponse, createErrorResponse } from "@/lib/api/response";
import { Role } from "@prisma/client";
import { createUserSchema, userQuerySchema } from "@/lib/validations/user";

const userService = UserService.getInstance();

// GET /api/users - List users (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (session?.user.role !== Role.ADMIN) {
      return createErrorResponse("Unauthorized", 403);
    }

    const { searchParams } = new URL(request.url);
    const parsed = userQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      role: searchParams.get("role") ?? undefined,
    });

    if (!parsed.success) {
      return createErrorResponse(
        "Invalid query parameters",
        400,
        parsed.error.errors
      );
    }

    const result = await userService.findMany(parsed.data);
    return createApiResponse(result);
  } catch (error) {
    console.error("GET /users error:", error);
    return createErrorResponse("Failed to fetch users");
  }
}

// POST /api/users - Create user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (session?.user.role !== Role.ADMIN) {
      return createErrorResponse("Unauthorized", 403);
    }

    const body = await request.json();

    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return createErrorResponse("Invalid user data", 400, parsed.error.errors);
    }

    // Check if email already exists
    const existingUser = await userService.findByEmail(parsed.data.email);
    if (existingUser) {
      return createErrorResponse("Email already exists", 400);
    }

    const user = await userService.create(parsed.data);
    return createApiResponse(user, 201);
  } catch (error) {
    console.error("POST /users error:", error);
    return createErrorResponse("Failed to create user");
  }
}
