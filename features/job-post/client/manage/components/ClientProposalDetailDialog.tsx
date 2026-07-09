"use client";

import { CalendarDays, Clock4, LockKeyhole, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { JobPostApplicant } from "@/types/job-post.type";
import {
  formatApplicantMoney,
  resolveApplicantUnlockCost,
} from "./ClientApplicantCard";

type ClientProposalDetailDialogProps = {
  applicant: JobPostApplicant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ClientProposalDetailDialog({
  applicant,
  open,
  onOpenChange,
}: ClientProposalDetailDialogProps) {
  const proposal = applicant?.proposal;
  const proposalUnlock = applicant?.proposalUnlock;
  const unlockCost = applicant
    ? resolveApplicantUnlockCost(applicant)
    : { value: null, source: "unavailable" as const };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950">
            {proposal?.title || "Proposal details"}
          </DialogTitle>
          <DialogDescription>
            Read-only proposal submitted by{" "}
            <span className="font-bold text-slate-700">
              {applicant?.expertApply.expertCode || "Unknown expert"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        {applicant && proposal ? (
          <div className="space-y-5 px-6 py-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <DetailMetric
                icon={<User className="h-4 w-4" />}
                label="Expert code"
                value={applicant.expertApply.expertCode}
              />
              <DetailMetric
                icon={<LockKeyhole className="h-4 w-4" />}
                label="Proposed budget"
                value={formatApplicantMoney(
                  applicant.expertApply.proposedBudget,
                )}
              />
              <DetailMetric
                icon={<Clock4 className="h-4 w-4" />}
                label="Estimated time"
                value={`${applicant.expertApply.estimatedDays} days`}
              />
            </div>

            <section>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Strategy summary
              </h3>
              <p className="mt-2 whitespace-pre-line rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm leading-7 text-slate-600">
                {proposal.strategySummary ||
                  "No strategy summary was provided."}
              </p>
            </section>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailMetric
                icon={<LockKeyhole className="h-4 w-4" />}
                label="Unlock cost"
                value={
                  unlockCost.value === null
                    ? "Unlock cost unavailable"
                    : formatApplicantMoney(unlockCost.value)
                }
                detail={`Cost source: ${unlockCost.source}`}
              />
              <DetailMetric
                icon={<CalendarDays className="h-4 w-4" />}
                label="Unlock created"
                value={
                  proposalUnlock?.createdAt
                    ? formatDateTime(proposalUnlock.createdAt)
                    : "Unavailable"
                }
              />
            </div>

            {proposalUnlock?.strategyDetail && (
              <section>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Detailed strategy
                </h3>
                <p className="mt-2 whitespace-pre-line rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm leading-7 text-slate-700">
                  {proposalUnlock.strategyDetail}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Detailed strategy is shown because the applicants API returned
                  it. Payment/unlock access is not implemented yet.
                </p>
              </section>
            )}

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-bold text-amber-800">
                Unlock/payment unavailable
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-700">
                A safe payment or proposal-purchase endpoint is not available.
              </p>
            </div>
          </div>
        ) : (
          <div className="px-6 py-8 text-sm font-semibold text-slate-500">
            Proposal details are unavailable.
          </div>
        )}

        <DialogFooter className="m-0 px-6 py-4">
          <Button type="button" variant="outline" disabled>
            Unlock/payment unavailable
          </Button>
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailMetric({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-extrabold text-slate-950">{value}</p>
      {detail && <p className="mt-1 text-[11px] text-slate-400">{detail}</p>}
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
