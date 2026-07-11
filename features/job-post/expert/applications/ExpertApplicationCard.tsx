"use client";

import {
  ArrowUpRight,
  Briefcase,
  Clock4,
  FileText,
  LockKeyhole,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  ExpertApplicationViewItem,
  ExpertProposal,
} from "@/types/job-post.type";

type ExpertApplicationCardProps = {
  application: ExpertApplicationViewItem;
  onViewProposal: (proposal: ExpertProposal) => void;
};

export function ExpertApplicationCard({
  application,
  onViewProposal,
}: ExpertApplicationCardProps) {
  const hasProposal = Boolean(application.proposal);
  const unlockCost = resolveUnlockCost(application);

  return (
    <article className="group flex h-full min-h-[310px] flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-lg font-extrabold tracking-tight text-slate-950 transition-colors group-hover:text-indigo-600">
            {application.jobPost.title}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="h-6 rounded-full border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-bold text-emerald-700"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              Submitted
            </Badge>
            {application.expertApply.status && (
              <Badge
                variant="outline"
                className="h-6 rounded-full border-slate-200 bg-slate-50 px-2.5 text-[11px] font-bold text-slate-600"
              >
                {application.expertApply.status}
              </Badge>
            )}
          </div>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {hasProposal ? (
            <FileText className="h-5 w-5" />
          ) : (
            <Briefcase className="h-5 w-5" />
          )}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MetaBlock
          icon={Briefcase}
          label="Proposed budget"
          value={formatMoney(application.expertApply.proposedBudget)}
        />
        <MetaBlock
          icon={Clock4}
          label="Estimated days"
          value={`${application.expertApply.estimatedDays} days`}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Expert code
        </p>
        <p className="mt-1 truncate text-sm font-extrabold text-slate-950">
          {application.expertApply.expertCode}
        </p>
      </div>

      {application.proposal ? (
        <>
          <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Proposal
            </p>
            <h3 className="mt-1 line-clamp-2 text-sm font-extrabold text-slate-950">
              {application.proposal.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
              {application.proposal.strategySummary ||
                "No strategy summary was provided."}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <LockKeyhole className="h-3.5 w-3.5" />
              Unlock cost
            </div>
            <p className="mt-1 text-lg font-extrabold text-slate-950">
              {formatUnlockCost(unlockCost)}
            </p>
          </div>

          <div className="mt-auto flex justify-end pt-5">
            <Button
              type="button"
              onClick={() =>
                onViewProposal(createDialogProposal(application, unlockCost))
              }
              className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 text-sm font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-sky-600"
            >
              View proposal
              <ArrowUpRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
          <p className="text-sm font-extrabold text-sky-700">
            Basic application — no proposal supplied
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            This application includes budget and timeline only.
          </p>
        </div>
      )}
    </article>
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

function createDialogProposal(
  application: ExpertApplicationViewItem,
  unlockCost?: number,
): ExpertProposal {
  return {
    id: application.proposal?.id ?? "",
    title: application.proposal?.title ?? "",
    strategySummary: application.proposal?.strategySummary ?? "",
    unlockCost,
  };
}

function resolveUnlockCost(application: ExpertApplicationViewItem) {
  if (Number.isFinite(application.proposalUnlock?.unlockCost)) {
    return Number(application.proposalUnlock?.unlockCost);
  }

  if (Number.isFinite(application.proposal?.unlockCost)) {
    return Number(application.proposal?.unlockCost);
  }

  return undefined;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatUnlockCost(value?: number) {
  if (!Number.isFinite(value)) return "Unlock cost unavailable";

  return formatMoney(Number(value));
}
