"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetJobPostApplicants } from "@/services/job-post.service";
import { hireExpert } from "@/services/hire-contract.service";
import { saveContractHireContext } from "@/features/contract";
import type { ClientProposalDialogSummary, JobPostApplicant } from "@/types/job-post.type";
import type { HireResponse } from "@/types/contract.types";
import { ClientApplicantCard } from "./ClientApplicantCard";
import { ClientProposalDetailDialog } from "./ClientProposalDetailDialog";
import { ContractSignModal } from "./ContractSignModal";

type ClientApplicantsSectionProps = {
  jobPostId: string;
};

export function ClientApplicantsSection({
  jobPostId,
}: ClientApplicantsSectionProps) {
  const [selectedProposal, setSelectedProposal] =
    useState<ClientProposalDialogSummary | null>(null);

  // State cho luồng Hire & Ký Hợp Đồng
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [activeHireApplicant, setActiveHireApplicant] =
    useState<JobPostApplicant | null>(null);
  const [initialHireResponse, setInitialHireResponse] =
    useState<HireResponse | null>(null);
  const [isHiring, setIsHiring] = useState(false);

  const { data, isLoading, isError, error, refetch } =
    useGetJobPostApplicants(
      { jobPostId },
      { enabled: Boolean(jobPostId) },
    );
  const applicants = data?.result ?? [];

  // Bấm nút Thuê Expert lần 1
  const handleHireApplicant = async (applicant: JobPostApplicant) => {
    setIsHiring(true);
    try {
      const res = await hireExpert(jobPostId, applicant.expertApply.id);
      if (res.contractId) {
        saveContractHireContext(res.contractId, {
          jobPostId,
          expertApplyId: applicant.expertApply.id,
          expertCode: applicant.expertApply.expertCode,
        });
      }
      setActiveHireApplicant(applicant);
      setInitialHireResponse(res);
      setContractModalOpen(true);
      toast.info(
        res.message ||
          "Đã gửi yêu cầu thuê! Vui lòng ký hợp đồng để tiếp tục.",
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Không thể thực hiện thuê Expert. Vui lòng thử lại.",
      );
    } finally {
      setIsHiring(false);
    }
  };

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
            onHire={handleHireApplicant}
            isHiring={isHiring && activeHireApplicant?.expertApply.id === applicant.expertApply.id}
          />
        ))}
      </div>

      <ClientProposalDetailDialog
        proposalSummary={selectedProposal}
        open={Boolean(selectedProposal)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setSelectedProposal(null);
        }}
        onHire={() => {
          if (selectedProposal) {
            const matched = applicants.find(
              (a) => a.expertApply.id === selectedProposal.expertApply.id,
            );
            if (matched) {
              setSelectedProposal(null);
              void handleHireApplicant(matched);
            }
          }
        }}
      />

      {/* Modal Ký Hợp Đồng & Ký Quỹ Escrow */}
      {activeHireApplicant && (
        <ContractSignModal
          open={contractModalOpen}
          onOpenChange={setContractModalOpen}
          jobPostId={jobPostId}
          expertApplyId={activeHireApplicant.expertApply.id}
          initialHireResponse={initialHireResponse}
          onSuccess={() => {
            void refetch();
          }}
        />
      )}
    </>
  );
}

function ApplicantSkeleton() {
  return (
    <div className="h-48 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="mt-3 h-8 w-40" />
      <Skeleton className="mt-4 h-12 w-full rounded-xl" />
    </div>
  );
}

function getErrorMessage(error: unknown) {
  const apiError = error as { response?: { data?: { message?: string } }; message?: string } | undefined;
  return apiError?.response?.data?.message || apiError?.message || "Failed to load applicants.";
}
