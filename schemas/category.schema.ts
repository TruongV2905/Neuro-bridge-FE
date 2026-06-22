import { z } from "zod";

export const categorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
  categoryDescription: z.string().min(1, "Category description is required"),
});

export type CategorySchema = z.infer<typeof categorySchema>;