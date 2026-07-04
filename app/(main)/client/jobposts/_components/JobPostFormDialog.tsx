"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
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
import { MultiSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateJobPost,
  useUpdateJobPost,
} from "@/services/jobpost.service";
import {
  jobPostSchema,
  type JobPostFormValues,
} from "@/schemas/jobpost.schema";
import type { JobPostRequest, JobPostResponse } from "@/types/jobpost.types";
import type { SkillResponse } from "@/types/skill.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobPost?: JobPostResponse | null;
  skills: SkillResponse[];
};

const defaultValues: JobPostFormValues = {
  title: "",
  description: "",
  requiredSkillIds: [],
  preferredSkillIds: [],
  budgetFrom: 0,
  budgetTo: 0,
  estimatedDays: 1,
};

const toFormValues = (jobPost?: JobPostResponse | null): JobPostFormValues => {
  if (!jobPost) return defaultValues;

  return {
    title: jobPost.title,
    description: jobPost.description,
    requiredSkillIds: jobPost.requiredSkillIds ?? [],
    preferredSkillIds: jobPost.preferredSkillIds ?? [],
    budgetFrom: jobPost.budgetFrom,
    budgetTo: jobPost.budgetTo,
    estimatedDays: jobPost.estimatedDays,
  };
};

const toPayload = (values: JobPostFormValues): JobPostRequest => ({
  title: values.title,
  description: values.description,
  requiredSkillIds: values.requiredSkillIds,
  preferredSkillIds: values.preferredSkillIds,
  budgetFrom: values.budgetFrom,
  budgetTo: values.budgetTo,
  estimatedDays: values.estimatedDays,
});

export default function JobPostFormDialog({
  open,
  onOpenChange,
  jobPost,
  skills,
}: Props) {
  const isEdit = Boolean(jobPost);
  const createMutation = useCreateJobPost();
  const updateMutation = useUpdateJobPost();

  const skillOptions = useMemo(
    () =>
      skills.map((skill) => ({
        label: skill.skillName,
        value: String(skill.id),
      })),
    [skills],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<JobPostFormValues>({
    resolver: zodResolver(jobPostSchema) as Resolver<JobPostFormValues>,
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(toFormValues(jobPost));
    }
  }, [jobPost, open, reset]);

  const onSubmit = (values: JobPostFormValues) => {
    const payload = toPayload(values);

    if (jobPost) {
      updateMutation.mutate(
        {
          pathParams: { id: jobPost.id },
          data: payload,
        },
        {
          onSuccess: () => {
            toast.success("Đã cập nhật job post!");
            onOpenChange(false);
          },
          onError: (error) => {
            toast.error(
              error.response?.data?.message ??
                "Cập nhật job post thất bại. Thử lại nhé.",
            );
          },
        },
      );
      return;
    }

    createMutation.mutate(
      { data: payload },
      {
        onSuccess: () => {
          toast.success("Đã tạo job post!");
          onOpenChange(false);
          reset(defaultValues);
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message ??
              "Tạo job post thất bại. Thử lại nhé.",
          );
        },
      },
    );
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[88vh] overflow-y-auto sm:max-w-2xl"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa job post" : "Tạo job post"}</DialogTitle>
          <DialogDescription>
            Mô tả rõ nhu cầu, ngân sách và kỹ năng cần thiết để expert dễ đánh
            giá trước khi gửi proposal.
          </DialogDescription>
        </DialogHeader>

        <form
          id="client-jobpost-form"
          className="space-y-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-1.5">
            <Label htmlFor="jobpost-title">Tiêu đề</Label>
            <Input
              id="jobpost-title"
              placeholder="VD: Cần chatbot AI tư vấn khách hàng"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="jobpost-description">Mô tả</Label>
            <Textarea
              id="jobpost-description"
              rows={7}
              placeholder="Mô tả bài toán, dữ liệu đang có, yêu cầu đầu ra, deadline..."
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="requiredSkillIds"
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label>Kỹ năng bắt buộc</Label>
                  <MultiSelect
                    options={skillOptions}
                    value={field.value.map(String)}
                    onValueChange={(values) =>
                      field.onChange(values.map(Number))
                    }
                    placeholder="Chọn kỹ năng"
                    maxCount={2}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="preferredSkillIds"
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label>Kỹ năng ưu tiên</Label>
                  <MultiSelect
                    options={skillOptions}
                    value={field.value.map(String)}
                    onValueChange={(values) =>
                      field.onChange(values.map(Number))
                    }
                    placeholder="Chọn kỹ năng"
                    maxCount={2}
                  />
                </div>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Controller
              control={control}
              name="budgetFrom"
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="budget-from">Ngân sách từ</Label>
                  <Input
                    id="budget-from"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={field.value || ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ""
                          ? undefined
                          : Number(event.target.value),
                      )
                    }
                    aria-invalid={!!errors.budgetFrom}
                  />
                  {errors.budgetFrom && (
                    <p className="text-xs text-destructive">
                      {errors.budgetFrom.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              control={control}
              name="budgetTo"
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="budget-to">Ngân sách đến</Label>
                  <Input
                    id="budget-to"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={field.value || ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ""
                          ? undefined
                          : Number(event.target.value),
                      )
                    }
                    aria-invalid={!!errors.budgetTo}
                  />
                  {errors.budgetTo && (
                    <p className="text-xs text-destructive">
                      {errors.budgetTo.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              control={control}
              name="estimatedDays"
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="estimated-days">Số ngày</Label>
                  <Input
                    id="estimated-days"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={field.value || ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ""
                          ? undefined
                          : Number(event.target.value),
                      )
                    }
                    aria-invalid={!!errors.estimatedDays}
                  />
                  {errors.estimatedDays && (
                    <p className="text-xs text-destructive">
                      {errors.estimatedDays.message}
                    </p>
                  )}
                </div>
              )}
            />
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
            form="client-jobpost-form"
            disabled={isSubmitting}
            className="disabled:opacity-60"
          >
            {isSubmitting
              ? isEdit
                ? "Đang lưu..."
                : "Đang tạo..."
              : isEdit
                ? "Lưu thay đổi"
                : "Tạo job post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
