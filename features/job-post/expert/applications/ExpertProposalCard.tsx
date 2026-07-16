"use client";

import { ArrowUpRight, FileText, LockKeyhole } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ExpertProposal } from "@/types/job-post.type";
import { formatMoney as formatVndMoney } from "@/utils/formatMoney";

type ExpertProposalCardProps = {
  proposal: ExpertProposal;
  onView: (proposal: ExpertProposal) => void;
};

export function ExpertProposalCard({
  proposal,
  onView,
}: ExpertProposalCardProps) {
  return (
    <article className="group flex h-full min-h-[250px] flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-lg font-extrabold tracking-tight text-slate-950 transition-colors group-hover:text-indigo-600">
            {proposal.title}
          </h2>
          <Badge
            variant="outline"
            className="mt-3 h-6 rounded-full border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-bold text-emerald-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Submitted
          </Badge>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <FileText className="h-5 w-5" />
        </span>
      </div>

      <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-500">
        {proposal.strategySummary || "No strategy summary was provided."}
      </p>

      <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <LockKeyhole className="h-3.5 w-3.5" />
          Unlock cost
        </div>
        <p className="mt-1 text-lg font-extrabold text-slate-950">
          {formatMoney(proposal.unlockCost)}
        </p>
      </div>

      <div className="mt-auto flex justify-end pt-5">
        <Button
          type="button"
          onClick={() => onView(proposal)}
          className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 text-sm font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-sky-600"
        >
          View proposal
          <ArrowUpRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Button>
      </div>
    </article>
  );
}

export function formatMoney(value?: number | null) {
  if (!Number.isFinite(value)) return "Unlock cost unavailable";

  return formatVndMoney(Number(value), "Unlock cost unavailable");
}
