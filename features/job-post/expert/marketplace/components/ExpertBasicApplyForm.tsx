"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApplyJobPostRequest, JobPost } from "@/types/job-post.type";

type ExpertBasicApplyFormProps = {
  job: JobPost;
  expertCode: string;
  isSubmitting: boolean;
  serverError?: string;
  onCancel: () => void;
  onSubmit: (payload: ApplyJobPostRequest) => void;
};

type BasicApplyFormState = {
  proposedBudget: string;
  estimatedDays: string;
};

type BasicApplyFormErrors = Partial<Record<keyof BasicApplyFormState, string>>;

export function ExpertBasicApplyForm({
  job,
  expertCode,
  isSubmitting,
  serverError,
  onCancel,
  onSubmit,
}: ExpertBasicApplyFormProps) {
  const [form, setForm] = React.useState<BasicApplyFormState>({
    proposedBudget: String(job.budgetFrom > 0 ? job.budgetFrom : 0),
    estimatedDays: String(job.estimatedDays > 0 ? job.estimatedDays : 1),
  });
  const errors = validateBasicApplyForm(form);
  const hasErrors = Object.keys(errors).length > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (hasErrors || isSubmitting) return;

    onSubmit({
      expertApplyRequest: {
        jobPostId: job.id,
        proposedBudget: Number(form.proposedBudget),
        estimatedDays: Number(form.estimatedDays),
        expertCode,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-lg font-extrabold tracking-tight text-slate-950">
          Basic Apply
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Submit only your proposed budget and delivery timeline.
        </p>
      </div>

      {serverError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {serverError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldErrorMessage
          label="Proposed budget"
          error={errors.proposedBudget}
        >
          <Input
            type="number"
            min={0}
            value={form.proposedBudget}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                proposedBudget: event.target.value,
              }))
            }
            className="h-10 rounded-xl border-slate-200"
          />
        </FieldErrorMessage>

        <FieldErrorMessage
          label="Estimated days"
          error={errors.estimatedDays}
        >
          <Input
            type="number"
            min={1}
            value={form.estimatedDays}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                estimatedDays: event.target.value,
              }))
            }
            className="h-10 rounded-xl border-slate-200"
          />
        </FieldErrorMessage>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-10 rounded-xl border-slate-200"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={hasErrors || isSubmitting}
          className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-5 text-sm font-bold text-white hover:from-indigo-600 hover:to-sky-600"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Basic Apply
        </Button>
      </div>
    </form>
  );
}

function FieldErrorMessage({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

function validateBasicApplyForm(
  form: BasicApplyFormState,
): BasicApplyFormErrors {
  const errors: BasicApplyFormErrors = {};
  const proposedBudget = Number(form.proposedBudget);
  const estimatedDays = Number(form.estimatedDays);

  if (!form.proposedBudget.trim()) {
    errors.proposedBudget = "Budget is required.";
  } else if (!Number.isFinite(proposedBudget) || proposedBudget < 0) {
    errors.proposedBudget = "Budget must be 0 or greater.";
  }

  if (!form.estimatedDays.trim()) {
    errors.estimatedDays = "Estimated days are required.";
  } else if (!Number.isFinite(estimatedDays) || estimatedDays < 1) {
    errors.estimatedDays = "Estimated days must be at least 1.";
  }

  return errors;
}
