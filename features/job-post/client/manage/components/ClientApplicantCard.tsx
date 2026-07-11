"use client";

import Link from "next/link";
import { ArrowUpRight, Clock4, FileText, LockKeyhole, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  ApplicantProposal,
  ClientProposalDialogSummary,
  JobPostApplicant,
} from "@/types/job-post.type";

type ClientApplicantCardProps = {
  applicant: JobPostApplicant;
  onViewProposal: (summary: ClientProposalDialogSummary) => void;
};

export type UnlockCostSource = "proposal" | "unavailable";

export function ClientApplicantCard({
  applicant,
  onViewProposal,
}: ClientApplicantCardProps) {
  const { expertApply, proposal } = applicant;
  const unlockCost = resolveApplicantUnlockCost(proposal);
  const expertProfileHref = getExpertProfileHref(expertApply.expertCode);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <User className="h-3.5 w-3.5" />
            Applicant
          </div>
          <p className="mt-1 text-base font-extrabold text-slate-950">
            {expertApply.expertCode}
          </p>
        </div>
        <Badge
          variant="outline"
          className="rounded-full border-indigo-200 bg-indigo-50 text-indigo-700"
        >
          Applied
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric
          label="Proposed budget"
          value={formatApplicantMoney(expertApply.proposedBudget)}
        />
        <Metric
          label="Estimated time"
          value={`${expertApply.estimatedDays} days`}
          icon={<Clock4 className="h-3.5 w-3.5" />}
        />
      </div>

      {expertProfileHref && (
        <Button
          asChild
          variant="outline"
          className="mt-4 h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <Link href={expertProfileHref} prefetch={false}>
            View Expert Profile
            <ArrowUpRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      )}

      {proposal ? (
        <>
          <div className="mt-5 flex-1 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <FileText className="h-3.5 w-3.5" />
              Proposal
            </div>
            <h3 className="mt-2 line-clamp-2 font-extrabold text-slate-950">
              {proposal.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
              {proposal.strategySummary || "No strategy summary was provided."}
            </p>
          </div>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <LockKeyhole className="h-3.5 w-3.5" />
                Unlock cost
              </div>
              <p className="mt-1 font-extrabold text-slate-950">
                {unlockCost.value === null
                  ? "Unlock cost unavailable"
                  : formatApplicantMoney(unlockCost.value)}
              </p>
            </div>
            <Button
              type="button"
              onClick={() => onViewProposal({ expertApply, proposal })}
              className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 text-sm font-bold text-white"
            >
              View proposal
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-5 flex flex-1 items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm font-semibold text-slate-500">
          Basic application — no proposal supplied
        </div>
      )}
    </article>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

export function resolveApplicantUnlockCost(proposal?: ApplicantProposal | null): {
  value: number | null;
  source: UnlockCostSource;
} {
  if (
    typeof proposal?.unlockCost === "number" &&
    Number.isFinite(proposal.unlockCost)
  ) {
    return { value: proposal.unlockCost, source: "proposal" };
  }

  return { value: null, source: "unavailable" };
}

export function formatApplicantMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getExpertProfileHref(expertCode: unknown) {
  if (typeof expertCode !== "string") {
    return null;
  }

  const normalizedExpertCode = expertCode.trim();

  if (!normalizedExpertCode) {
    return null;
  }

  return `/experts/${encodeURIComponent(normalizedExpertCode)}`;
}
