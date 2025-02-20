import { z } from "zod";
import { Role } from "@prisma/client";

// Schema for query parameters
export const userQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
});

// Schema for creating users
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  role: z.nativeEnum(Role).optional(),
});

// Schema for updating users
export const updateUserSchema = createUserSchema
  .partial()
  .extend({
    currentPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If setting new password, current password is required
      if (data.password && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Current password is required to set new password",
      path: ["currentPassword"],
    }
  );
