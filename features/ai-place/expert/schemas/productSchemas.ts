import { z } from "zod";

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required.`);

const positiveWholeVnd = z
  .number({ error: "Price VND is required." })
  .finite("Price VND must be a number.")
  .int("Price VND must be a whole VND amount.")
  .positive("Price VND must be greater than zero.");

export const createAiProductSchema = z.object({
  name: requiredText("Name"),
  categoryCode: requiredText("Category code"),
  priceVnd: positiveWholeVnd,
});

export const updateAiProductSchema = z.object({
  name: requiredText("Name"),
  description: z.string(),
  categoryCode: requiredText("Category code"),
  technologies: z.array(z.string().trim().min(1)),
  aiCapabilities: z.array(z.string().trim().min(1)),
  priceVnd: positiveWholeVnd,
});

export type CreateAiProductFormValues = z.infer<typeof createAiProductSchema>;
export type UpdateAiProductFormValues = z.infer<typeof updateAiProductSchema>;
