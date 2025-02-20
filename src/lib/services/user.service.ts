import { prisma } from "@/lib/prisma/client";
import { hash } from "bcryptjs";
import {
  CreateUserInput,
  UpdateUserInput,
  UserService as IUserService,
  UserWithoutPassword,
  UserQueryParams,
} from "@/types/user";

export class UserService implements IUserService {
  private static instance: UserService;

  private constructor() {}

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async findById(id: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async create(data: CreateUserInput): Promise<UserWithoutPassword> {
    const hashedPassword = await hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(
    id: string,
    data: UpdateUserInput
  ): Promise<UserWithoutPassword> {
    // If password is being updated, hash it
    const updateData = data.password
      ? { ...data, password: await hash(data.password, 12) }
      : data;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  async findMany(params: UserQueryParams = {}) {
    const { page = 1, limit = 10, search, role } = params;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(role && { role }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    // Remove passwords from users
    const usersWithoutPasswords = users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      users: usersWithoutPasswords,
      total,
    };
  }
}
