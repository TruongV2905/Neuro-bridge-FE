import { z } from "zod"
import { UserGender, UserRole, UserStatus } from "@/types/user/user.type"

const optionalUrlSchema = z
  .string()
  .url("Invalid URL")
  .optional()
  .or(z.literal(""))

const optionalStringSchema = z.string().optional().or(z.literal(""))

const userGenderValues = Object.values(UserGender) as [
  UserGender,
  ...UserGender[],
]

const userRoleValues = Object.values(UserRole) as [
  UserRole,
  ...UserRole[],
]

const userStatusValues = Object.values(UserStatus) as [
  UserStatus,
  ...UserStatus[],
]

export const userSchema = z.object({
  id: z.string().min(1, "User ID is required"),

  code: z.string().min(1, "User code is required"),

  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),

  gender: z.enum(userGenderValues).optional(),

  avatarUrl: optionalUrlSchema,

  phone: z
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .max(255, "Address must be less than 255 characters")
    .optional()
    .or(z.literal("")),

  role: z.enum(userRoleValues, {
    error: "Role is required",
  }),

  status: z.enum(userStatusValues, {
    error: "Status is required",
  }),

  createdAt: optionalStringSchema,
})

export type UserSchema = z.infer<typeof userSchema>