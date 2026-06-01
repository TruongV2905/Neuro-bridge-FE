// modules/jobpost/schemas/create-jobpost.schema.ts

import { z } from "zod"

import {
  BUSINESS_GOALS,
  CUSTOM_BUSINESS_GOAL_MAX_LENGTH,
  PROJECT_DESCRIPTION_MAX_LENGTH,
} from "../constants/jobpost.constants"

export const createJobpostSchema = z
  .object({
    projectTitle: z
      .string()
      .trim()
      .min(1, "Project title is required.")
      .min(5, "Project title must be at least 5 characters.")
      .max(120, "Project title must be at most 120 characters."),

    businessGoal: z.enum(BUSINESS_GOALS, {
      message: "Business goal is required.",
    }),

    customBusinessGoal: z
      .string()
      .trim()
      .max(
        CUSTOM_BUSINESS_GOAL_MAX_LENGTH,
        `Custom business goal must be at most ${CUSTOM_BUSINESS_GOAL_MAX_LENGTH} characters.`
      )
      .optional(),

    description: z
      .string()
      .trim()
      .max(
        PROJECT_DESCRIPTION_MAX_LENGTH,
        `Description must be at most ${PROJECT_DESCRIPTION_MAX_LENGTH} characters.`
      )
      .optional(),

    attachments: z.array(z.instanceof(File)).optional().default([]),
  })
  .superRefine((values, ctx) => {
    if (
      values.businessGoal === "Others" &&
      (!values.customBusinessGoal || values.customBusinessGoal.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customBusinessGoal"],
        message: "Please describe your custom business goal.",
      })
    }
  })

export type CreateJobpostSchema = z.infer<typeof createJobpostSchema>