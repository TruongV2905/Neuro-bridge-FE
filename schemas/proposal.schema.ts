import { z } from "zod";

const proposalCoreSchema = z.object({
  title: z
    .string()
    .trim()
    .min(4, "Tiêu đề tối thiểu 4 ký tự")
    .max(120, "Tiêu đề tối đa 120 ký tự"),
  strategySummary: z
    .string()
    .trim()
    .min(20, "Tóm tắt chiến lược tối thiểu 20 ký tự")
    .max(1000, "Tóm tắt chiến lược tối đa 1000 ký tự"),
});

export const proposalSchema = proposalCoreSchema;
export type ProposalFormValues = z.infer<typeof proposalSchema>;

export const applyProposalSchema = proposalCoreSchema
  .extend({
    proposedBudget: z
      .number({ error: "Nhập ngân sách hợp lệ" })
      .positive("Ngân sách phải lớn hơn 0"),
    estimatedDays: z
      .number({ error: "Nhập số ngày hợp lệ" })
      .int("Nhập số ngày nguyên")
      .positive("Số ngày phải lớn hơn 0"),
    unlockCost: z
      .number()
      .nonnegative("Chi phí unlock không âm")
      .optional(),
    strategyDetail: z
      .string()
      .trim()
      .max(3000, "Chi tiết chiến lược tối đa 3000 ký tự")
      .optional(),
  })
  .refine(
    (v) => {
      const hasDetail = !!v.strategyDetail && v.strategyDetail.length > 0;
      const hasCost = v.unlockCost !== undefined;
      return hasDetail === hasCost;
    },
    {
      message:
        "Nếu có chi phí unlock thì phải nhập chi tiết chiến lược, và ngược lại.",
      path: ["strategyDetail"],
    },
  );

export type ApplyProposalFormValues = z.infer<typeof applyProposalSchema>;
