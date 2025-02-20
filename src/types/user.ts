import {
  Role,
  Prisma,
  User as PrismaUser,
  Account as PrismaAccount,
  Session as PrismaSession,
} from "@prisma/client";

// Input types
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserInput extends Partial<CreateUserInput> {
  role?: Role;
  emailVerified?: Date | null;
  image?: string | null;
}

// Base types from Prisma
export type User = PrismaUser;
export type Account = PrismaAccount;
export type Session = PrismaSession;

// Utility types
export type UserWithoutPassword = Omit<User, "password">;

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    accounts: true;
    sessions: true;
    cart: true;
  };
}>;

// Service interface
export interface UserService {
  findById(id: string): Promise<UserWithoutPassword | null>;
  findByEmail(email: string): Promise<UserWithoutPassword | null>;
  create(data: CreateUserInput): Promise<UserWithoutPassword>;
  update(id: string, data: UpdateUserInput): Promise<UserWithoutPassword>;
  delete(id: string): Promise<void>;
}

// Response types
export interface UserResponse {
  user: UserWithoutPassword;
}

export interface UsersResponse {
  users: UserWithoutPassword[];
  total: number;
}

// Query params
export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
}
