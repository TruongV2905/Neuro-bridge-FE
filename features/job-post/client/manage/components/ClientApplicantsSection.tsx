"use client";

import { useState } from "react";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetJobPostApplicants } from "@/services/job-post.service";
import type { ClientProposalDialogSummary } from "@/types/job-post.type";
import { ClientApplicantCard } from "./ClientApplicantCard";
import { ClientProposalDetailDialog } from "./ClientProposalDetailDialog";

type ClientApplicantsSectionProps = {
  jobPostId: string;
};

export function ClientApplicantsSection({
  jobPostId,
}: ClientApplicantsSectionProps) {
  const [selectedProposal, setSelectedProposal] =
    useState<ClientProposalDialogSummary | null>(null);
  const { data, isLoading, isError, error, refetch } =
    useGetJobPostApplicants(
      { jobPostId },
      { enabled: Boolean(jobPostId) },
    );
  const applicants = data?.result ?? [];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <ApplicantSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
        <p className="font-extrabold text-rose-700">
          Unable to load applicants
        </p>
        <p className="mt-1 text-sm text-rose-600">
          {getErrorMessage(error)}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => refetch()}
          className="mt-4 border-rose-200 bg-white text-rose-700"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (applicants.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Users className="h-6 w-6" />
        </span>
        <p className="mt-4 font-extrabold text-slate-900">No applicants yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Applications and proposal summaries will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-sm font-semibold text-slate-500">
        {applicants.length}{" "}
        {applicants.length === 1 ? "applicant" : "applicants"}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {applicants.map((applicant) => (
          <ClientApplicantCard
            key={applicant.expertApply.id}
            applicant={applicant}
            onViewProposal={setSelectedProposal}
          />
        ))}
      </div>
      <ClientProposalDetailDialog
        proposalSummary={selectedProposal}
        open={Boolean(selectedProposal)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setSelectedProposal(null);
        }}
      />
    </>
  );
}

function ApplicantSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <Skeleton className="mt-5 h-32 rounded-2xl" />
      <Skeleton className="mt-4 h-10 rounded-xl" />
    </div>
  );
}

function getErrorMessage(error: unknown) {
  const apiError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return (
    apiError.response?.data?.message ||
    apiError.message ||
    "Please try again."
  );
}
