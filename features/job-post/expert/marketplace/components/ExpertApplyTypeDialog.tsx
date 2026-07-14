"use client";

import * as React from "react";
import { toast } from "react-toastify";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApplyJobPost } from "@/services/job-post.service";
import type { ApplyJobPostRequest, JobPost } from "@/types/job-post.type";
import { ExpertUnifiedApplyForm } from "./ExpertUnifiedApplyForm";

type ExpertApplyTypeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobPost;
  expertCode: string;
  onVerifyApplied?: () => Promise<boolean>;
  onSuccess: () => void;
};

type ApiErrorLike = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

export function ExpertApplyTypeDialog({
  open,
  onOpenChange,
  job,
  expertCode,
  onVerifyApplied,
  onSuccess,
}: ExpertApplyTypeDialogProps) {
  const [serverError, setServerError] = React.useState<string>();
  const [formResetKey, setFormResetKey] = React.useState(0);
  const [isVerifyingApply, setIsVerifyingApply] = React.useState(false);
  const applyJobPost = useApplyJobPost();
  const isApplyBusy = applyJobPost.isPending || isVerifyingApply;

  const closeAndReset = () => {
    onOpenChange(false);
    setServerError(undefined);
    setFormResetKey((current) => current + 1);
    applyJobPost.reset();
    setIsVerifyingApply(false);
  };

  const handleApplySuccess = () => {
    toast.success("Application submitted successfully.");
    onSuccess();
    closeAndReset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isApplyBusy) return;

    onOpenChange(nextOpen);

    if (!nextOpen) {
      setServerError(undefined);
      setFormResetKey((current) => current + 1);
      applyJobPost.reset();
    }
  };

  const handleSubmit = (payload: ApplyJobPostRequest) => {
    setServerError(undefined);

    applyJobPost.mutate(
      { data: payload },
      {
        onSuccess: () => {
          handleApplySuccess();
        },
        onError: async (error) => {
          if (
            isBasicApplyPayload(payload) &&
            isProposalRequiredError(error) &&
            onVerifyApplied
          ) {
            setIsVerifyingApply(true);

            try {
              const hasApplied = await onVerifyApplied();

              if (hasApplied) {
                handleApplySuccess();
                return;
              }
            } catch {
              // Fall through to the original backend error when verification
              // cannot confirm that the application exists.
            } finally {
              setIsVerifyingApply(false);
            }
          }

          setServerError(getApplyErrorMessage(error));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[min(760px,calc(100vh-2rem))] overflow-hidden rounded-3xl bg-white p-0 shadow-2xl shadow-slate-900/10 sm:max-w-3xl">
        <div className="max-h-[calc(100vh-2rem)] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950">
              Apply to Jobpost
            </DialogTitle>
            <DialogDescription className="leading-6 text-slate-500">
              Submit your budget and timeline. Proposal details are optional.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5">
            <ExpertUnifiedApplyForm
              key={formResetKey}
              job={job}
              expertCode={expertCode}
              isSubmitting={isApplyBusy}
              serverError={serverError}
              onCancel={() => handleOpenChange(false)}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function isBasicApplyPayload(payload: ApplyJobPostRequest) {
  return !payload.proposalRequest && !payload.proposalUnlockRequest;
}

function isProposalRequiredError(error: unknown) {
  return getApplyErrorMessage(error)
    .toLowerCase()
    .includes("proposal request is required");
}

function getApplyErrorMessage(error: unknown) {
  const apiError = error as ApiErrorLike;

  return (
    apiError.response?.data?.message ||
    apiError.message ||
    "Unable to submit your application. Please try again."
  );
}
