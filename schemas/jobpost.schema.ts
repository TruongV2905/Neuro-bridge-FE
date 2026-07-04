import { z } from "zod";

export const jobPostSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(6, "Tiêu đề tối thiểu 6 ký tự")
      .max(160, "Tiêu đề tối đa 160 ký tự"),
    description: z
      .string()
      .trim()
      .min(20, "Mô tả tối thiểu 20 ký tự")
      .max(4000, "Mô tả tối đa 4000 ký tự"),
    requiredSkillIds: z.array(z.number()).default([]),
    preferredSkillIds: z.array(z.number()).default([]),
    budgetFrom: z
      .number({ error: "Nhập ngân sách tối thiểu hợp lệ" })
      .positive("Ngân sách tối thiểu phải lớn hơn 0"),
    budgetTo: z
      .number({ error: "Nhập ngân sách tối đa hợp lệ" })
      .positive("Ngân sách tối đa phải lớn hơn 0"),
    estimatedDays: z
      .number({ error: "Nhập số ngày hợp lệ" })
      .int("Số ngày phải là số nguyên")
      .positive("Số ngày phải lớn hơn 0"),
  })
  .refine((value) => value.budgetFrom <= value.budgetTo, {
    message: "Ngân sách tối đa phải lớn hơn hoặc bằng ngân sách tối thiểu",
    path: ["budgetTo"],
  });

export type JobPostFormValues = z.infer<typeof jobPostSchema>;
