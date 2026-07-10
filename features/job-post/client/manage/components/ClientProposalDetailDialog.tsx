"use client";

import { isAxiosError } from "axios";
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
import { useGetProposalUnlockByProposalId } from "@/services/job-post.service";
import type {
  ClientProposalDialogSummary,
  ProposalUnlock,
} from "@/types/job-post.type";
import {
  formatApplicantMoney,
  resolveApplicantUnlockCost,
} from "./ClientApplicantCard";

type ClientProposalDetailDialogProps = {
  proposalSummary: ClientProposalDialogSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ClientProposalDetailDialog({
  proposalSummary,
  open,
  onOpenChange,
}: ClientProposalDetailDialogProps) {
  const proposal = proposalSummary?.proposal;
  const proposalId = proposal?.id.trim() ?? "";
  const shouldLoadProtectedDetail = open && proposalId.length > 0;
  const unlockQuery = useGetProposalUnlockByProposalId(
    { proposalId },
    {
      enabled: shouldLoadProtectedDetail,
      retry: (failureCount, queryError) =>
        shouldRetryProposalUnlockQuery(failureCount, queryError),
    },
  );
  const proposalUnlock = shouldLoadProtectedDetail
    ? unlockQuery.data?.result
    : undefined;
  const unlockCost = proposal
    ? resolveApplicantUnlockCost(proposal)
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
              {proposalSummary?.expertApply.expertCode || "Unknown expert"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        {proposalSummary && proposal ? (
          <div className="space-y-5 px-6 py-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <DetailMetric
                icon={<User className="h-4 w-4" />}
                label="Expert code"
                value={proposalSummary.expertApply.expertCode}
              />
              <DetailMetric
                icon={<LockKeyhole className="h-4 w-4" />}
                label="Proposed budget"
                value={formatApplicantMoney(
                  proposalSummary.expertApply.proposedBudget,
                )}
              />
              <DetailMetric
                icon={<Clock4 className="h-4 w-4" />}
                label="Estimated time"
                value={`${proposalSummary.expertApply.estimatedDays} days`}
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
                detail={`Cost source: ${
                  unlockCost.source === "proposal"
                    ? "proposal summary"
                    : "unavailable"
                }`}
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

            <ProtectedDetailSection
              key={proposalId}
              isLoading={unlockQuery.isLoading || unlockQuery.isFetching}
              isError={unlockQuery.isError}
              error={unlockQuery.error}
              proposalUnlock={proposalUnlock}
              onRetry={() => {
                void unlockQuery.refetch();
              }}
            />

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

function ProtectedDetailSection({
  isLoading,
  isError,
  error,
  proposalUnlock,
  onRetry,
}: {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  proposalUnlock?: ProposalUnlock;
  onRetry: () => void;
}) {
  const isLocked = isError && isProtectedDetailLocked(error);

  return (
    <section>
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
        Detailed strategy
      </h3>

      {isLoading ? (
        <ProtectedDetailMessage tone="neutral">
          Loading protected proposal detail...
        </ProtectedDetailMessage>
      ) : proposalUnlock?.strategyDetail ? (
        <>
          <p className="mt-2 whitespace-pre-line rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm leading-7 text-slate-700">
            {proposalUnlock.strategyDetail}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Detailed strategy is shown from the authorized Proposal Unlock
            endpoint response.
          </p>
        </>
      ) : isLocked ? (
        <ProtectedDetailMessage tone="locked">
          {getProposalUnlockErrorMessage(
            error,
            "Payment is required to view the detailed strategy.",
          )}
        </ProtectedDetailMessage>
      ) : isError ? (
        <div className="mt-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm font-semibold text-rose-700">
            {getProposalUnlockErrorMessage(
              error,
              "Unable to load protected proposal detail.",
            )}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
            className="mt-3 h-9 rounded-xl border-rose-200 bg-white text-xs font-bold text-rose-700"
          >
            Retry detail
          </Button>
        </div>
      ) : (
        <ProtectedDetailMessage tone="locked">
          Protected detail is locked or unavailable.
        </ProtectedDetailMessage>
      )}
    </section>
  );
}

function ProtectedDetailMessage({
  tone,
  children,
}: {
  tone: "neutral" | "locked";
  children: React.ReactNode;
}) {
  const className =
    tone === "neutral"
      ? "mt-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-600"
      : "mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700";

  return <div className={className}>{children}</div>;
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

function shouldRetryProposalUnlockQuery(
  failureCount: number,
  error: unknown,
) {
  const status = getResponseStatus(error);

  if (status === 400 || status === 401 || status === 403) {
    return false;
  }

  if (!status || status >= 500) {
    return failureCount < 2;
  }

  return false;
}

function isProtectedDetailLocked(error: unknown) {
  const status = getResponseStatus(error);

  return status === 400 || status === 401 || status === 403;
}

function getResponseStatus(error: unknown) {
  if (!isAxiosError(error)) {
    return undefined;
  }

  return error.response?.status;
}

function getProposalUnlockErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  return fallback;
}
