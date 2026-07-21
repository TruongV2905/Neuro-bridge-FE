"use client";

import * as React from "react";
import { FileText, Loader2 } from "lucide-react";

import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ApplyJobPostRequest, JobPost } from "@/types/job-post.type";
import { formatMoney } from "@/utils/formatMoney";
import { isRichTextEmpty } from "@/utils/richText";

type ExpertUnifiedApplyFormProps = {
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

export function ExpertUnifiedApplyForm({
  job,
  expertCode,
  isSubmitting,
  serverError,
  onCancel,
  onSubmit,
}: ExpertUnifiedApplyFormProps) {
  const [includeProposal, setIncludeProposal] = React.useState(false);
  const [form, setForm] = useFormState({
    proposedBudget: String(job.budgetFrom > 0 ? job.budgetFrom : ""),
    estimatedDays: String(job.estimatedDays > 0 ? job.estimatedDays : ""),
    proposalTitle: `Proposal for ${job.title}`,
    strategySummary: "",
    strategyDetail: "",
    unlockCost: "0",
  });
  const errors = validateForm(form, includeProposal);
  const hasErrors = Object.keys(errors).length > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (hasErrors || isSubmitting) return;

    const payload: ApplyJobPostRequest = {
      expertApplyRequest: {
        jobPostId: job.id,
        proposedBudget: Number(form.proposedBudget),
        estimatedDays: Number(form.estimatedDays),
        expertCode,
      },
    };

    if (includeProposal) {
      payload.proposalRequest = {
        title: form.proposalTitle.trim(),
        strategySummary: form.strategySummary.trim(),
      };
      payload.proposalUnlockRequest = {
        strategyDetail: form.strategyDetail.trim(),
        unlockCost: Number(form.unlockCost),
      };
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-h-full flex-col">
      <div className="flex-1 space-y-5">
        {serverError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {serverError}
          </div>
        )}

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-950">
              Budget & Timeline
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Share your proposed cost and delivery estimate.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldErrorMessage
              label="Proposed budget (VND)"
              error={errors.proposedBudget}
              helperText={`Preview: ${formatMoney(form.proposedBudget, "Enter an amount")}`}
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
                onChange={(event) =>
                  setForm("estimatedDays", event.target.value)
                }
                className="h-10 rounded-xl border-slate-200"
              />
            </FieldErrorMessage>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <Label
                  htmlFor="include-proposal"
                  className="text-sm font-extrabold text-slate-950"
                >
                  Add proposal details
                </Label>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Include a proposal summary, detailed strategy, and unlock cost
                  for the client.
                </p>
              </div>
            </div>
            <Switch
              id="include-proposal"
              checked={includeProposal}
              onCheckedChange={setIncludeProposal}
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>

          {includeProposal && (
            <div className="space-y-4 border-t border-indigo-100 pt-4">
              <FieldErrorMessage
                label="Proposal title"
                error={errors.proposalTitle}
              >
                <Input
                  value={form.proposalTitle}
                  onChange={(event) =>
                    setForm("proposalTitle", event.target.value)
                  }
                  className="h-10 rounded-xl border-slate-200 bg-white"
                />
              </FieldErrorMessage>

              <FieldErrorMessage
                label="Strategy summary"
                error={errors.strategySummary}
              >
                <RichTextEditor
                  value={form.strategySummary}
                  onChange={(value) => setForm("strategySummary", value)}
                  placeholder="Summarize your approach in a few sentences."
                  variant="job-post"
                />
              </FieldErrorMessage>

              <FieldErrorMessage
                label="Strategy detail"
                error={errors.strategyDetail}
              >
                <RichTextEditor
                  value={form.strategyDetail}
                  onChange={(value) => setForm("strategyDetail", value)}
                  placeholder="Describe the deeper implementation plan the client can unlock."
                  variant="job-post"
                />
              </FieldErrorMessage>

              <FieldErrorMessage
                label="Unlock cost (VND)"
                error={errors.unlockCost}
                helperText={`Preview: ${formatMoney(form.unlockCost, "Enter an amount")}`}
              >
                <Input
                  type="number"
                  min={0}
                  value={form.unlockCost}
                  onChange={(event) =>
                    setForm("unlockCost", event.target.value)
                  }
                  className="h-10 rounded-xl border-slate-200 bg-white"
                />
              </FieldErrorMessage>
            </div>
          )}
        </section>
      </div>

      <div className="sticky bottom-0 -mx-6 mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-10 rounded-xl border-slate-200"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={hasErrors || isSubmitting}
          className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-5 text-sm font-bold text-white hover:from-indigo-600 hover:to-sky-600"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {includeProposal
            ? "Submit Application with Proposal"
            : "Submit Application"}
        </Button>
      </div>
    </form>
  );
}

function FieldErrorMessage({
  label,
  error,
  helperText,
  children,
}: {
  label: string;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </Label>
      {children}
      {helperText && (
        <p className="text-xs font-semibold text-slate-500">{helperText}</p>
      )}
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

function validateForm(
  form: FormState,
  includeProposal: boolean,
): FormErrors {
  const errors: FormErrors = {};
  const proposedBudget = Number(form.proposedBudget);
  const estimatedDays = Number(form.estimatedDays);
  const unlockCost = Number(form.unlockCost);

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

  if (!includeProposal) {
    return errors;
  }

  if (!form.proposalTitle.trim()) {
    errors.proposalTitle = "Proposal title is required.";
  }

  if (isRichTextEmpty(form.strategySummary)) {
    errors.strategySummary = "Strategy summary is required.";
  }

  if (isRichTextEmpty(form.strategyDetail)) {
    errors.strategyDetail = "Strategy detail is required.";
  }

  if (!form.unlockCost.trim()) {
    errors.unlockCost = "Unlock cost is required.";
  } else if (!Number.isFinite(unlockCost) || unlockCost < 0) {
    errors.unlockCost = "Unlock cost must be 0 or greater.";
  }

  return errors;
}
