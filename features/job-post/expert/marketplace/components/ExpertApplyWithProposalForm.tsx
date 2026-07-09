"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ApplyJobPostRequest, JobPost } from "@/types/job-post.type";

type ExpertApplyWithProposalFormProps = {
  job: JobPost;
  expertCode: string;
  isSubmitting: boolean;
  serverError?: string;
  onCancel: () => void;
  onSubmit: (payload: ApplyJobPostRequest) => void;
};

type FormState = {
  proposedBudget: string;
  estimatedDays: string;
  proposalTitle: string;
  strategySummary: string;
  strategyDetail: string;
  unlockCost: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export function ExpertApplyWithProposalForm({
  job,
  expertCode,
  isSubmitting,
  serverError,
  onCancel,
  onSubmit,
}: ExpertApplyWithProposalFormProps) {
  const initialState: FormState = {
    proposedBudget: String(job.budgetFrom > 0 ? job.budgetFrom : ""),
    estimatedDays: String(job.estimatedDays > 0 ? job.estimatedDays : ""),
    proposalTitle: `Proposal for ${job.title}`,
    strategySummary: "",
    strategyDetail: "",
    unlockCost: "0",
  };

  const [form, setForm] = useFormState(initialState);
  const errors = validateForm(form);
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
      proposalRequest: {
        title: form.proposalTitle.trim(),
        strategySummary: form.strategySummary.trim(),
      },
      proposalUnlockRequest: {
        strategyDetail: form.strategyDetail.trim(),
        unlockCost: Number(form.unlockCost),
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-lg font-extrabold tracking-tight text-slate-950">
          Apply with Proposal
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Add your budget, delivery timeline, and strategy so the client can
          evaluate your approach.
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
              setForm("proposedBudget", event.target.value)
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
            onChange={(event) => setForm("estimatedDays", event.target.value)}
            className="h-10 rounded-xl border-slate-200"
          />
        </FieldErrorMessage>
      </div>

      <FieldErrorMessage label="Proposal title" error={errors.proposalTitle}>
        <Input
          value={form.proposalTitle}
          onChange={(event) => setForm("proposalTitle", event.target.value)}
          className="h-10 rounded-xl border-slate-200"
        />
      </FieldErrorMessage>

      <FieldErrorMessage
        label="Strategy summary"
        error={errors.strategySummary}
      >
        <Textarea
          value={form.strategySummary}
          onChange={(event) => setForm("strategySummary", event.target.value)}
          className="min-h-24 rounded-xl border-slate-200"
          placeholder="Summarize your approach in a few sentences."
        />
      </FieldErrorMessage>

      <FieldErrorMessage label="Strategy detail" error={errors.strategyDetail}>
        <Textarea
          value={form.strategyDetail}
          onChange={(event) => setForm("strategyDetail", event.target.value)}
          className="min-h-32 rounded-xl border-slate-200"
          placeholder="Describe the deeper implementation plan the client can unlock."
        />
      </FieldErrorMessage>

      <FieldErrorMessage label="Unlock cost" error={errors.unlockCost}>
        <Input
          type="number"
          min={0}
          value={form.unlockCost}
          onChange={(event) => setForm("unlockCost", event.target.value)}
          className="h-10 rounded-xl border-slate-200"
        />
      </FieldErrorMessage>

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
          Submit Proposal
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

function useFormState(initialState: FormState) {
  const [form, setFormState] = React.useState<FormState>(initialState);

  const setForm = (field: keyof FormState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  return [form, setForm] as const;
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  const proposedBudget = Number(form.proposedBudget);
  const estimatedDays = Number(form.estimatedDays);
  const unlockCost = Number(form.unlockCost);

  if (!Number.isFinite(proposedBudget) || proposedBudget < 0) {
    errors.proposedBudget = "Budget must be 0 or greater.";
  }

  if (!Number.isFinite(estimatedDays) || estimatedDays < 1) {
    errors.estimatedDays = "Estimated days must be at least 1.";
  }

  if (!form.proposalTitle.trim()) {
    errors.proposalTitle = "Proposal title is required.";
  }

  if (!form.strategySummary.trim()) {
    errors.strategySummary = "Strategy summary is required.";
  }

  if (!form.strategyDetail.trim()) {
    errors.strategyDetail = "Strategy detail is required.";
  }

  if (!Number.isFinite(unlockCost) || unlockCost < 0) {
    errors.unlockCost = "Unlock cost must be 0 or greater.";
  }

  return errors;
}
