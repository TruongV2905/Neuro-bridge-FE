"use client";

import type * as React from "react";
import { CalendarDays, FileText, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetProposalById,
  useGetProposalUnlockByProposalId,
} from "@/services/job-post.service";
import type { ExpertProposal } from "@/types/job-post.type";
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
  const {
    data: proposalData,
    isLoading: isProposalLoading,
    isError: isProposalError,
  } = useGetProposalById({ id: proposalId }, { enabled: open && !!proposalId });

  const {
    data: unlockData,
    isLoading: isUnlockLoading,
    isError: isUnlockError,
  } = useGetProposalUnlockByProposalId(
    { proposalId },
    { enabled: open && !!proposalId },
  );

  const detail = proposalData?.result ?? proposal;
  const unlock = unlockData?.result;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl shadow-slate-900/10 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950">
            Proposal Detail
          </DialogTitle>
          <DialogDescription className="leading-6 text-slate-500">
            Read-only view of your submitted proposal and unlock strategy.
          </DialogDescription>
        </DialogHeader>

        {isProposalLoading && !detail ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>
        ) : detail ? (
          <div className="space-y-5">
            {isProposalError && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                The latest proposal detail is unavailable right now. Showing
                the list summary instead.
              </div>
            )}

            <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
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
                {detail.strategySummary || "No strategy summary was provided."}
              </p>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <MetaBlock
                icon={LockKeyhole}
                label="Unlock cost"
                value={formatMoney(detail.unlockCost)}
              />
              <MetaBlock
                icon={CalendarDays}
                label="Unlock created"
                value={unlock?.createdAt ? formatDateTime(unlock.createdAt) : "Unavailable"}
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

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-10 rounded-xl border-slate-200"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            Unable to load proposal detail.
          </div>
        )}
      </DialogContent>
    </Dialog>
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
