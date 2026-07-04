"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApplyJobPost } from "@/services/proposal.service";
import {
  applyProposalSchema,
  type ApplyProposalFormValues,
} from "@/schemas/proposal.schema";

interface Props {
  jobPostId: string;
  expertCode: string;
  suggestedBudget?: { from: number; to: number };
  suggestedDays?: number;
  disabled?: boolean;
  triggerLabel?: string;
}

export default function ApplyProposalDialog({
  jobPostId,
  expertCode,
  suggestedBudget,
  suggestedDays,
  disabled,
  triggerLabel = "Ứng tuyển",
}: Props) {
  const [open, setOpen] = useState(false);
  const applyMutation = useApplyJobPost();

  const defaultBudget =
    suggestedBudget?.from && suggestedBudget?.to
      ? Math.round((suggestedBudget.from + suggestedBudget.to) / 2)
      : undefined;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ApplyProposalFormValues>({
    resolver: zodResolver(applyProposalSchema),
    defaultValues: {
      title: "",
      strategySummary: "",
      proposedBudget: defaultBudget,
      estimatedDays: suggestedDays,
      unlockCost: undefined,
      strategyDetail: undefined,
    },
  });

  const onSubmit = (values: ApplyProposalFormValues) => {
    const hasUnlock = !!values.strategyDetail && values.unlockCost !== undefined;

    applyMutation.mutate(
      {
        data: {
          expertApplyRequest: {
            jobPostId,
            expertCode,
            proposedBudget: values.proposedBudget,
            estimatedDays: values.estimatedDays,
          },
          proposalRequest: {
            title: values.title,
            strategySummary: values.strategySummary,
          },
          proposalUnlockRequest: hasUnlock
            ? {
                strategyDetail: values.strategyDetail,
                unlockCost: values.unlockCost,
              }
            : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Đã gửi đề xuất ứng tuyển!");
          reset();
          setOpen(false);
        },
        onError: (err) => {
          toast.error(
            err?.response?.data?.message ?? "Ứng tuyển thất bại. Thử lại nhé.",
          );
        },
      },
    );
  };

  const isSubmitting = applyMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="cta" disabled={disabled}>
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-lg max-h-[85vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Ứng tuyển job post</DialogTitle>
          <DialogDescription>
            Tạo đề xuất chiến lược của bạn kèm ngân sách và thời gian dự kiến.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          id="apply-proposal-form"
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">Tiêu đề đề xuất</Label>
            <Input
              id="title"
              placeholder="VD: Fine-tune LLM cho chatbot chăm sóc khách hàng"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="strategySummary">Tóm tắt chiến lược</Label>
            <Textarea
              id="strategySummary"
              rows={4}
              placeholder="Nêu ngắn gọn cách tiếp cận, deliverables, và điểm khác biệt của bạn..."
              aria-invalid={!!errors.strategySummary}
              {...register("strategySummary")}
            />
            {errors.strategySummary && (
              <p className="text-xs text-destructive">
                {errors.strategySummary.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="proposedBudget">Ngân sách đề xuất (VND)</Label>
              <Controller
                control={control}
                name="proposedBudget"
                render={({ field }) => (
                  <Input
                    id="proposedBudget"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="VD: 5000000"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : Number(e.target.value),
                      )
                    }
                    aria-invalid={!!errors.proposedBudget}
                  />
                )}
              />
              {errors.proposedBudget && (
                <p className="text-xs text-destructive">
                  {errors.proposedBudget.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="estimatedDays">Số ngày ước tính</Label>
              <Controller
                control={control}
                name="estimatedDays"
                render={({ field }) => (
                  <Input
                    id="estimatedDays"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder="VD: 14"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : Number(e.target.value),
                      )
                    }
                    aria-invalid={!!errors.estimatedDays}
                  />
                )}
              />
              {errors.estimatedDays && (
                <p className="text-xs text-destructive">
                  {errors.estimatedDays.message}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-3 space-y-3">
            <div>
              <p className="text-sm font-medium">Chi tiết chiến lược (tùy chọn)</p>
              <p className="text-xs text-muted-foreground">
                Client phải trả phí unlock để xem phần này. Bỏ trống nếu không dùng.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="strategyDetail">Nội dung chi tiết</Label>
              <Textarea
                id="strategyDetail"
                rows={3}
                placeholder="Roadmap chi tiết, KPI cam kết, timeline..."
                aria-invalid={!!errors.strategyDetail}
                {...register("strategyDetail")}
              />
              {errors.strategyDetail && (
                <p className="text-xs text-destructive">
                  {errors.strategyDetail.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unlockCost">Chi phí unlock (VND)</Label>
              <Controller
                control={control}
                name="unlockCost"
                render={({ field }) => (
                  <Input
                    id="unlockCost"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="VD: 200000"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : Number(e.target.value),
                      )
                    }
                    aria-invalid={!!errors.unlockCost}
                  />
                )}
              />
              {errors.unlockCost && (
                <p className="text-xs text-destructive">
                  {errors.unlockCost.message}
                </p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="apply-proposal-form"
            disabled={isSubmitting}
            className="disabled:opacity-60"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi ứng tuyển"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
