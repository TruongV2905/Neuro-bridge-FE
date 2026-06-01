// modules/jobpost/schemas/configuration.schema.ts

import { z } from "zod"

export const configurationSchema = z
  .object({
    categoryId: z.string().min(1, "Project category is required."),

    requiredSkills: z
      .array(z.string())
      .min(1, "Please select at least one required skill."),

    budgetMin: z
      .number()
      .min(1, "Minimum budget must be greater than 0."),

    budgetMax: z
      .number()
      .min(1, "Maximum budget must be greater than 0."),

    timelineMin: z
      .number()
      .min(1, "Minimum timeline must be greater than 0."),

    timelineMax: z
      .number()
      .min(1, "Maximum timeline must be greater than 0."),

    timelineUnit: z.enum(["weeks", "months"]),
  })
  .superRefine((values, ctx) => {
    if (values.budgetMax <= values.budgetMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["budgetMax"],
        message: "Maximum budget must be greater than minimum budget.",
      })
    }

    if (values.timelineMax <= values.timelineMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["timelineMax"],
        message: "Maximum timeline must be greater than minimum timeline.",
      })
    }
  })

export type ConfigurationSchema = z.infer<typeof configurationSchema>