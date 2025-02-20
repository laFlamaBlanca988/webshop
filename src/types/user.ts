import { Role } from "@prisma/client";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}

export interface UserWithCart extends UserProfile {
  cart: {
    id: string;
    items: CartItem[];
  } | null;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    images: string[];
  };
}
