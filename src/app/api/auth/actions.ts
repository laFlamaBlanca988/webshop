"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma/client";
import { CreateUserInput } from "@/types/user";

export async function createUser(data: CreateUserInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function findUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
