"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProposal } from "@/services/proposal.service";
import {
  proposalSchema,
  type ProposalFormValues,
} from "@/schemas/proposal.schema";
import type { ProposalResponse } from "@/types/proposal.types";

interface Props {
  proposal: ProposalResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProposalDialog({
  proposal,
  open,
  onOpenChange,
}: Props) {
  const updateMutation = useUpdateProposal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: proposal?.title ?? "",
      strategySummary: proposal?.strategySummary ?? "",
    },
  });

  useEffect(() => {
    if (open && proposal) {
      reset({
        title: proposal.title,
        strategySummary: proposal.strategySummary,
      });
    }
  }, [open, proposal, reset]);

  const onSubmit = (values: ProposalFormValues) => {
    if (!proposal) return;

    updateMutation.mutate(
      {
        pathParams: { id: proposal.id },
        data: values,
      },
      {
        onSuccess: () => {
          toast.success("Đã cập nhật đề xuất!");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err?.response?.data?.message ?? "Cập nhật thất bại. Thử lại nhé.",
          );
        },
      },
    );
  };

  const isSubmitting = updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Sửa đề xuất</DialogTitle>
          <DialogDescription>
            Chỉ chỉnh sửa được tiêu đề và tóm tắt chiến lược. Ngân sách và số ngày
            thuộc phần Apply, không đổi tại đây.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          id="edit-proposal-form"
        >
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Tiêu đề</Label>
            <Input
              id="edit-title"
              placeholder="Tiêu đề đề xuất"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-strategy">Tóm tắt chiến lược</Label>
            <Textarea
              id="edit-strategy"
              rows={5}
              placeholder="Cách tiếp cận, deliverables, điểm khác biệt..."
              aria-invalid={!!errors.strategySummary}
              {...register("strategySummary")}
            />
            {errors.strategySummary && (
              <p className="text-xs text-destructive">
                {errors.strategySummary.message}
              </p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="edit-proposal-form"
            disabled={isSubmitting}
            className="disabled:opacity-60"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
