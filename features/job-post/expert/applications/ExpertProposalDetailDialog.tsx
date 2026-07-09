"use client";

import * as React from "react";
import {
  CalendarDays,
  FileText,
  Loader2,
  LockKeyhole,
  Pencil,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetProposalById,
  useGetProposalUnlockByProposalId,
  useUpdateProposal,
  useUpdateProposalUnlock,
} from "@/services/job-post.service";
import type {
  ExpertProposal,
  ProposalUnlock,
  UpdateProposalRequest,
  UpdateProposalUnlockRequest,
} from "@/types/job-post.type";
import { formatMoney } from "./ExpertProposalCard";

type ExpertProposalDetailDialogProps = {
  proposal: ExpertProposal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExpertProposalDetailDialog({
  proposal,
  open,
  onOpenChange,
}: ExpertProposalDetailDialogProps) {
  const proposalId = proposal?.id ?? "";
  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState<EditFormState>(
    EMPTY_EDIT_FORM,
  );
  const [saveError, setSaveError] = React.useState<string>();
  const proposalQuery = useGetProposalById(
    { id: proposalId },
    { enabled: open && !!proposalId },
  );

  const unlockQuery = useGetProposalUnlockByProposalId(
    { proposalId },
    { enabled: open && !!proposalId },
  );

  const updateProposal = useUpdateProposal();
  const updateProposalUnlock = useUpdateProposalUnlock();
  const proposalData = proposalQuery.data;
  const unlockData = unlockQuery.data;
  const isProposalLoading = proposalQuery.isLoading;
  const isProposalError = proposalQuery.isError;
  const isUnlockLoading = unlockQuery.isLoading;
  const isUnlockError = unlockQuery.isError;
  const detail = proposalData?.result ?? proposal;
  const unlock = unlockData?.result;
  const displayedUnlockCost = getDisplayUnlockCost(detail, unlock);
  const errors = validateEditForm(editForm);
  const hasErrors = Object.keys(errors).length > 0;
  const isSaving = updateProposal.isPending || updateProposalUnlock.isPending;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSaving) return;

    onOpenChange(nextOpen);

    if (!nextOpen) {
      setIsEditing(false);
      setSaveError(undefined);
      updateProposal.reset();
      updateProposalUnlock.reset();
    }
  };

  const handleStartEdit = () => {
    if (!detail) return;

    setEditForm(createEditFormState(detail, unlock));
    setSaveError(undefined);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (isSaving) return;

    setEditForm(detail ? createEditFormState(detail, unlock) : EMPTY_EDIT_FORM);
    setSaveError(undefined);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!detail || hasErrors || isSaving) return;

    if (!unlock?.id) {
      setSaveError(
        "Unable to save because proposal unlock detail is missing. Please try again after the detail loads.",
      );
      return;
    }

    setSaveError(undefined);

    const proposalPayload: UpdateProposalRequest = {
      title: editForm.title.trim(),
      strategySummary: editForm.strategySummary.trim(),
    };
    const unlockPayload: UpdateProposalUnlockRequest = {
      strategyDetail: editForm.strategyDetail.trim(),
      unlockCost: Number(editForm.unlockCost),
    };

    try {
      await updateProposal.mutateAsync({
        pathParams: { id: detail.id },
        data: proposalPayload,
      });
      await updateProposalUnlock.mutateAsync({
        pathParams: { id: unlock.id },
        data: unlockPayload,
      });
      await Promise.all([proposalQuery.refetch(), unlockQuery.refetch()]);
      setIsEditing(false);
      toast.success("Proposal updated successfully.");
    } catch (error) {
      setSaveError(getMutationErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="z-[200] flex max-h-[calc(100vh-2rem)] flex-col gap-0 overflow-hidden rounded-2xl bg-white p-0 shadow-2xl shadow-slate-900/10 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-slate-100 px-6 py-5 pr-12">
          <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950">
            {isEditing ? "Edit Proposal" : "Proposal Detail"}
          </DialogTitle>
          <DialogDescription className="leading-6 text-slate-500">
            {isEditing
              ? "Update your submitted proposal and unlock strategy."
              : "Read-only view of your submitted proposal and unlock strategy."}
          </DialogDescription>
        </DialogHeader>

        {isProposalLoading && !detail ? (
          <div className="min-h-0 space-y-4 overflow-y-auto px-6 py-5">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>
        ) : detail && isEditing ? (
          <EditProposalForm
            form={editForm}
            errors={errors}
            serverError={saveError}
            isSaving={isSaving}
            onChange={(field, value) =>
              setEditForm((current) => ({ ...current, [field]: value }))
            }
            onCancel={handleCancelEdit}
            onSave={handleSave}
          />
        ) : detail ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
              {isProposalError && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                  The latest proposal detail is unavailable right now. Showing
                  the list summary instead.
                </div>
              )}

              <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Proposal title
                    </p>
                    <h3 className="mt-1 text-lg font-extrabold text-slate-950">
                      {detail.title}
                    </h3>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                  Strategy summary
                </h4>
                <p className="mt-3 whitespace-pre-line rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600">
                  {detail.strategySummary ||
                    "No strategy summary was provided."}
                </p>
              </section>

              <div className="grid gap-4 sm:grid-cols-2">
                <MetaBlock
                  icon={LockKeyhole}
                  label="Unlock cost"
                  value={formatMoney(displayedUnlockCost)}
                />
                <MetaBlock
                  icon={CalendarDays}
                  label="Unlock created"
                  value={
                    unlock?.createdAt
                      ? formatDateTime(unlock.createdAt)
                      : "Unavailable"
                  }
                />
              </div>

              <section>
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                  Detailed strategy
                </h4>
                {isUnlockLoading ? (
                  <Skeleton className="mt-3 h-32 rounded-2xl" />
                ) : unlock?.strategyDetail ? (
                  <p className="mt-3 whitespace-pre-line rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600">
                    {unlock.strategyDetail}
                  </p>
                ) : (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                    {isUnlockError
                      ? "Detailed strategy is unavailable right now."
                      : "No detailed strategy is available."}
                  </div>
                )}
              </section>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="h-10 rounded-xl border-slate-200"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={handleStartEdit}
                className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 text-sm font-bold text-white hover:from-indigo-600 hover:to-sky-600"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit proposal
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-0 overflow-y-auto px-6 py-5">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              Unable to load proposal detail.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

type EditFormState = {
  title: string;
  strategySummary: string;
  strategyDetail: string;
  unlockCost: string;
};

type EditFormErrors = Partial<Record<keyof EditFormState, string>>;

const EMPTY_EDIT_FORM: EditFormState = {
  title: "",
  strategySummary: "",
  strategyDetail: "",
  unlockCost: "0",
};

function EditProposalForm({
  form,
  errors,
  serverError,
  isSaving,
  onChange,
  onCancel,
  onSave,
}: {
  form: EditFormState;
  errors: EditFormErrors;
  serverError?: string;
  isSaving: boolean;
  onChange: (field: keyof EditFormState, value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {serverError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {serverError}
          </div>
        )}

        <FormField label="Proposal title" error={errors.title}>
          <Input
            value={form.title}
            onChange={(event) => onChange("title", event.target.value)}
            className="h-10 rounded-xl border-slate-200"
          />
        </FormField>

        <FormField label="Strategy summary" error={errors.strategySummary}>
          <Textarea
            value={form.strategySummary}
            onChange={(event) =>
              onChange("strategySummary", event.target.value)
            }
            className="min-h-28 rounded-xl border-slate-200"
          />
        </FormField>

        <FormField label="Detailed strategy" error={errors.strategyDetail}>
          <Textarea
            value={form.strategyDetail}
            onChange={(event) =>
              onChange("strategyDetail", event.target.value)
            }
            className="min-h-36 rounded-xl border-slate-200"
          />
        </FormField>

        <FormField label="Unlock cost" error={errors.unlockCost}>
          <Input
            type="number"
            min={0}
            value={form.unlockCost}
            onChange={(event) => onChange("unlockCost", event.target.value)}
            className="h-10 rounded-xl border-slate-200"
          />
        </FormField>
      </div>

      <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="h-10 rounded-xl border-slate-200"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={hasErrors || isSaving}
          className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-5 text-sm font-bold text-white hover:from-indigo-600 hover:to-sky-600"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save changes
        </Button>
      </div>
    </form>
  );
}

function FormField({
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

function MetaBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-extrabold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function createEditFormState(
  detail: ExpertProposal,
  unlock?: ProposalUnlock,
): EditFormState {
  const unlockCost = getDisplayUnlockCost(detail, unlock);

  return {
    title: detail.title ?? "",
    strategySummary: detail.strategySummary ?? "",
    strategyDetail: unlock?.strategyDetail ?? "",
    unlockCost: String(unlockCost),
  };
}

function getDisplayUnlockCost(
  detail?: ExpertProposal | null,
  unlock?: ProposalUnlock,
) {
  if (Number.isFinite(unlock?.unlockCost)) {
    return Number(unlock?.unlockCost);
  }

  if (Number.isFinite(detail?.unlockCost)) {
    return Number(detail?.unlockCost);
  }

  return 0;
}

function validateEditForm(form: EditFormState): EditFormErrors {
  const errors: EditFormErrors = {};
  const unlockCost = Number(form.unlockCost);

  if (!form.title.trim()) {
    errors.title = "Proposal title is required.";
  }

  if (!form.strategySummary.trim()) {
    errors.strategySummary = "Strategy summary is required.";
  }

  if (!form.strategyDetail.trim()) {
    errors.strategyDetail = "Detailed strategy is required.";
  }

  if (!Number.isFinite(unlockCost) || unlockCost < 0) {
    errors.unlockCost = "Unlock cost must be 0 or greater.";
  }

  return errors;
}

type ApiErrorLike = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

function getMutationErrorMessage(error: unknown) {
  const apiError = error as ApiErrorLike;

  return (
    apiError.response?.data?.message ||
    apiError.message ||
    "Unable to save proposal changes. Please try again."
  );
}
