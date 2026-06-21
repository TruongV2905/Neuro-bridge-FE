import { z } from "zod";

export const userGenderValues = ["MALE", "FEMALE", "OTHER"] as const;

export const baseRegisterSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .max(100, "Full name must be less than 100 characters"),

    gender: z.enum(userGenderValues),

    address: z
      .string()
      .min(1, "Address is required")
      .max(255, "Address must be less than 255 characters"),

    dateOfBirth: z.string().min(1, "Date of birth is required"),

    avatarUrl: z
      .union([
        z.literal(""),
        z.string().url("Avatar URL is invalid"),
        z
          .custom<File>(
            (value) => typeof File !== "undefined" && value instanceof File,
            {
              message: "Avatar must be a file",
            },
          )
          .refine((file) => file.type.startsWith("image/"), {
            message: "Avatar must be an image",
          })
          .refine((file) => file.size <= 5 * 1024 * 1024, {
            message: "Avatar must be less than 5MB",
          }),
      ])
      .optional()
      .nullable(),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 characters")
      .max(20, "Phone number must be less than 20 characters"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),

    password: z.string().min(6, "Password must be at least 6 characters"),

    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password does not match",
    path: ["confirmPassword"],
  });

export const registerClientSchema = baseRegisterSchema.extend({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(150, "Company name must be less than 150 characters"),

  industry: z
    .string()
    .min(1, "Industry is required")
    .max(100, "Industry must be less than 100 characters"),

  companyDescription: z
    .string()
    .min(1, "Company description is required")
    .max(1000, "Company description must be less than 1000 characters"),
});

export type RegisterClientFormValues = z.infer<typeof registerClientSchema>;

export type RegisterClientPayload = Omit<
  RegisterClientFormValues,
  "confirmPassword"
>;

export const registerExpertSchema = baseRegisterSchema.extend({
  skillIds: z.array(z.number()).min(1, "Expert must have at least one skill"),
});

export type RegisterExpertFormValues = z.infer<typeof registerExpertSchema>;

export type RegisterExpertPayload = Omit<
  RegisterExpertFormValues,
  "confirmPassword"
>;
