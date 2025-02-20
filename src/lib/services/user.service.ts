import { prisma } from "@/lib/prisma/client";
import { Prisma, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import {
  CreateUserInput,
  UpdateUserInput,
  UserProfile,
  UserWithCart,
} from "@/types/user";

export class UserService {
  private static instance: UserService;

  private constructor() {}

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Find users with pagination and filtering
   */
  async findMany(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
  }): Promise<{
    users: UserProfile[];
    total: number;
    pages: number;
  }> {
    const { page = 1, limit = 10, search, role } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(role && { role }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Find user by ID with optional cart data
   */
  async findById(id: string, includeCart = false): Promise<UserWithCart | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        cart: includeCart
          ? {
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
            }
          : false,
      },
    });

    return user as UserWithCart | null;
  }

  /**
   * Create new user
   */
  async create(data: CreateUserInput): Promise<UserProfile> {
    const hashedPassword = await hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        cart: {
          create: {}, // Create empty cart for new user
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserInput): Promise<UserProfile> {
    const updateData: Prisma.UserUpdateInput = {
      ...data,
      ...(data.password && { password: await hash(data.password, 12) }),
    };

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}
