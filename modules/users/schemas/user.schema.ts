import { z } from "zod"
import { UserGender, UserRole, UserStatus } from "../types/user.type"

const optionalUrlSchema = z
  .string()
  .url("Invalid URL")
  .optional()
  .or(z.literal(""))

const optionalStringSchema = z.string().optional().or(z.literal(""))

const userGenderValues = Object.values(UserGender) as [
  UserGender,
  ...UserGender[]
]

const userRoleValues = Object.values(UserRole) as [
  UserRole,
  ...UserRole[]
]

const userStatusValues = Object.values(UserStatus) as [
  UserStatus,
  ...UserStatus[]
]

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),

  userName: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),

  gender: z.enum(userGenderValues).optional(),

  avatarUrl: optionalUrlSchema,

  phoneNumber: z
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
})

export const updateUserSchema = createUserSchema.extend({
  userId: z.string().min(1, "User ID is required"),
})

export const userSchema = updateUserSchema.extend({
  createdAt: optionalStringSchema,
  updatedAt: optionalStringSchema,
})

export type CreateUserSchema = z.infer<typeof createUserSchema>
export type UpdateUserSchema = z.infer<typeof updateUserSchema>
export type UserSchema = z.infer<typeof userSchema>