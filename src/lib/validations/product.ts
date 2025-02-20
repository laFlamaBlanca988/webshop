import { z } from "zod";
import { ProductCreateInput, ProductUpdateInput } from "@/types";

// Base product schema
const baseProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  price: z.preprocess(
    (val) => {
      if (typeof val === "string") return Number(val);
      return val;
    },
    z.number().min(0, "Price must be non-negative")
  ),
  description: z.string().optional(),
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required"),
});

// Export the schemas with proper type inference
export const createProductSchema = baseProductSchema.transform((data) => ({
  ...data,
  price: Number(data.price),
}));

export const updateProductSchema = baseProductSchema
  .partial()
  .transform((data) => ({
    ...data,
    price: data.price !== undefined ? Number(data.price) : undefined,
  }));

// Schema for query parameters
export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
});
