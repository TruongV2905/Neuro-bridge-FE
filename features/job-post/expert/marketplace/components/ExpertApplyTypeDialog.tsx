"use client";

import * as React from "react";
import { CheckCircle2, FileText, Lock, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApplyJobPost } from "@/services/job-post.service";
import type { ApplyJobPostRequest, JobPost } from "@/types/job-post.type";
import { ExpertApplyWithProposalForm } from "./ExpertApplyWithProposalForm";

type ExpertApplyTypeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobPost;
  expertCode: string;
  onSuccess: () => void;
};

type DialogStep = "choice" | "proposal";

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
  onSuccess,
}: ExpertApplyTypeDialogProps) {
  const [step, setStep] = React.useState<DialogStep>("choice");
  const [serverError, setServerError] = React.useState<string>();
  const applyJobPost = useApplyJobPost();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && applyJobPost.isPending) return;

    onOpenChange(nextOpen);

    if (!nextOpen) {
      setStep("choice");
      setServerError(undefined);
      applyJobPost.reset();
    }
  };

  const handleSubmit = (payload: ApplyJobPostRequest) => {
    setServerError(undefined);

    applyJobPost.mutate(
      { data: payload },
      {
        onSuccess: () => {
          toast.success("Application submitted successfully.");
          onSuccess();
          handleOpenChange(false);
        },
        onError: (error) => {
          setServerError(getApplyErrorMessage(error));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl shadow-slate-900/10 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950">
            Choose Application Type
          </DialogTitle>
          <DialogDescription className="leading-6 text-slate-500">
            Choose how you want to apply for this jobpost.
          </DialogDescription>
        </DialogHeader>

        {step === "choice" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl border-slate-200 bg-slate-50/80 shadow-none">
              <CardHeader className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                    <Lock className="h-5 w-5" />
                  </span>
                  <Badge
                    variant="outline"
                    className="border-slate-200 bg-white text-slate-500"
                  >
                    Coming soon
                  </Badge>
                </div>
                <CardTitle className="text-base font-extrabold text-slate-950">
                  Basic Apply
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pb-5">
                <p className="text-sm leading-6 text-slate-500">
                  Apply with only budget and timeline. This is disabled until a
                  basic-only backend endpoint is confirmed.
                </p>
                <Button
                  type="button"
                  disabled
                  className="h-10 w-full rounded-xl bg-slate-200 text-sm font-bold text-slate-500"
                >
                  Coming soon
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-indigo-200 bg-indigo-50/60 shadow-none">
              <CardHeader className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <Badge
                    variant="outline"
                    className="border-indigo-200 bg-white text-indigo-700"
                  >
                    Recommended
                  </Badge>
                </div>
                <CardTitle className="text-base font-extrabold text-slate-950">
                  Apply with Proposal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pb-5">
                <p className="text-sm leading-6 text-slate-600">
                  Include budget, timeline, proposal summary, detailed strategy,
                  and unlock cost.
                </p>
                <Button
                  type="button"
                  onClick={() => setStep("proposal")}
                  className="h-10 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-sm font-bold text-white hover:from-indigo-600 hover:to-sky-600"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Create Proposal
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-1">
            <div className="mb-4 flex items-start gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-semibold leading-6">
                Your proposal will be submitted with this jobpost application.
              </p>
            </div>
            <ExpertApplyWithProposalForm
              job={job}
              expertCode={expertCode}
              isSubmitting={applyJobPost.isPending}
              serverError={serverError}
              onCancel={() => {
                setServerError(undefined);
                setStep("choice");
              }}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getApplyErrorMessage(error: unknown) {
  const apiError = error as ApiErrorLike;

  return (
    apiError.response?.data?.message ||
    apiError.message ||
    "Unable to submit your application. Please try again."
  );
}
