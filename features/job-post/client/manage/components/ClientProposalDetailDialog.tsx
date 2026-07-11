"use client";

import { isAxiosError } from "axios";
import {
  CalendarDays,
  CheckCircle2,
  Clock4,
  CreditCard,
  LockKeyhole,
  User,
  WalletCards,
} from "lucide-react";

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
import { useGetMyWallet } from "@/services/payment.service";
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
  const hasProposal = Boolean(proposalSummary && proposal);
  const shouldLoadProtectedDetail = open && proposalId.length > 0;
  const unlockQuery = useGetProposalUnlockByProposalId(
    { proposalId },
    {
      enabled: shouldLoadProtectedDetail,
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
  );
  const proposalUnlock = shouldLoadProtectedDetail
    ? unlockQuery.data?.result
    : undefined;
  const isUnlocked = Boolean(proposalUnlock?.strategyDetail);
  const proposalUnlockErrorStatus = unlockQuery.isError
    ? getResponseStatus(unlockQuery.error)
    : undefined;
  const hasBlockingProposalUnlockError =
    unlockQuery.isError && proposalUnlockErrorStatus !== 400;
  const walletQuery = useGetMyWallet({
    enabled: open && hasProposal && !isUnlocked && !hasBlockingProposalUnlockError,
  });
  const wallet = walletQuery.data?.result;
  const unlockCost = proposal
    ? resolveApplicantUnlockCost(proposal)
    : { value: null, source: "unavailable" as const };
  const unlockCostValue = unlockCost.value;
  const hasValidUnlockCost =
    typeof unlockCostValue === "number" &&
    Number.isFinite(unlockCostValue) &&
    unlockCostValue >= 0;
  const walletBalance =
    typeof wallet?.walletBalance === "number" &&
    Number.isFinite(wallet.walletBalance)
      ? wallet.walletBalance
      : null;
  const hasSufficientBalance =
    walletBalance !== null &&
    hasValidUnlockCost &&
    walletBalance >= unlockCostValue;
  const unlockReadinessState = getUnlockReadinessState({
    hasProposal,
    hasSufficientBalance,
    hasValidUnlockCost,
    hasBlockingProposalUnlockError,
    isUnlocked,
    isWalletError:
      walletQuery.isError || (walletQuery.isSuccess && walletBalance === null),
    isWalletLoading: walletQuery.isLoading || walletQuery.isFetching,
  });

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

            <UnlockReadinessSection
              state={unlockReadinessState}
              unlockCost={hasValidUnlockCost ? unlockCostValue : null}
              proposalUnlockError={unlockQuery.error}
              walletBalance={walletBalance}
              walletError={walletQuery.error}
              onRetryWallet={() => {
                void walletQuery.refetch();
              }}
            />
          </div>
        ) : (
          <div className="px-6 py-8 text-sm font-semibold text-slate-500">
            Proposal details are unavailable.
          </div>
        )}

        <DialogFooter className="m-0 px-6 py-4">
          {hasProposal && (
            <Button type="button" variant="outline" disabled>
              Unlock with Wallet
            </Button>
          )}
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type UnlockReadinessState =
  | "NO_PROPOSAL"
  | "UNLOCKED"
  | "WALLET_LOADING"
  | "WALLET_ERROR"
  | "INVALID_UNLOCK_COST"
  | "INSUFFICIENT_BALANCE"
  | "READY_TO_UNLOCK"
  | "PROPOSAL_UNLOCK_ERROR";

function getUnlockReadinessState({
  hasProposal,
  hasSufficientBalance,
  hasValidUnlockCost,
  hasBlockingProposalUnlockError,
  isUnlocked,
  isWalletError,
  isWalletLoading,
}: {
  hasProposal: boolean;
  hasSufficientBalance: boolean;
  hasValidUnlockCost: boolean;
  hasBlockingProposalUnlockError: boolean;
  isUnlocked: boolean;
  isWalletError: boolean;
  isWalletLoading: boolean;
}): UnlockReadinessState {
  if (!hasProposal) return "NO_PROPOSAL";
  if (isUnlocked) return "UNLOCKED";
  if (hasBlockingProposalUnlockError) return "PROPOSAL_UNLOCK_ERROR";
  if (isWalletLoading) return "WALLET_LOADING";
  if (isWalletError) return "WALLET_ERROR";
  if (!hasValidUnlockCost) return "INVALID_UNLOCK_COST";

  return hasSufficientBalance ? "READY_TO_UNLOCK" : "INSUFFICIENT_BALANCE";
}

function UnlockReadinessSection({
  state,
  unlockCost,
  proposalUnlockError,
  walletBalance,
  walletError,
  onRetryWallet,
}: {
  state: UnlockReadinessState;
  unlockCost: number | null;
  proposalUnlockError: unknown;
  walletBalance: number | null;
  walletError: unknown;
  onRetryWallet: () => void;
}) {
  const copy = getUnlockReadinessCopy(state, walletError, proposalUnlockError);
  const toneClassName = getUnlockReadinessToneClassName(copy.tone);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
            <WalletCards className="h-4 w-4" />
            Wallet unlock readiness
          </div>
          <p className="mt-2 text-sm font-bold text-slate-950">
            {copy.title}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {copy.description}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled
          className="h-10 rounded-xl border-slate-200 px-4 text-sm font-bold"
        >
          Unlock with Wallet
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <DetailMetric
          icon={<LockKeyhole className="h-4 w-4" />}
          label="Unlock cost"
          value={
            unlockCost === null
              ? "Unlock cost unavailable"
              : formatApplicantMoney(unlockCost)
          }
        />
        <DetailMetric
          icon={<CreditCard className="h-4 w-4" />}
          label="Wallet balance"
          value={
            walletBalance === null
              ? getWalletBalancePlaceholder(state)
              : formatApplicantMoney(walletBalance)
          }
        />
      </div>

      <div className={toneClassName}>
        <div className="flex items-start gap-2">
          {copy.tone === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <p>{copy.status}</p>
        </div>

        {state === "WALLET_ERROR" && (
          <Button
            type="button"
            variant="outline"
            onClick={onRetryWallet}
            className="mt-3 h-9 rounded-xl border-rose-200 bg-white text-xs font-bold text-rose-700"
          >
            Retry wallet
          </Button>
        )}
      </div>
    </section>
  );
}

function getUnlockReadinessCopy(
  state: UnlockReadinessState,
  walletError: unknown,
  proposalUnlockError: unknown,
) {
  switch (state) {
    case "NO_PROPOSAL":
      return {
        description: "No proposal is available for wallet unlock.",
        status: "Unlock with Wallet is unavailable.",
        title: "No proposal",
        tone: "neutral" as const,
      };
    case "UNLOCKED":
      return {
        description:
          "Protected proposal detail is already available from the authorized unlock read.",
        status: "No additional wallet payment is needed.",
        title: "Already unlocked",
        tone: "success" as const,
      };
    case "WALLET_LOADING":
      return {
        description: "Reading the current wallet balance...",
        status: "Unlock with Wallet is disabled while wallet data loads.",
        title: "Checking wallet",
        tone: "neutral" as const,
      };
    case "WALLET_ERROR":
      return {
        description: getWalletErrorMessage(
          walletError,
          "Unable to load current wallet balance.",
        ),
        status: "Wallet balance is unavailable, so payment cannot be prepared.",
        title: "Wallet unavailable",
        tone: "danger" as const,
      };
    case "INVALID_UNLOCK_COST":
      return {
        description:
          "The proposal unlock cost is missing or invalid in the proposal summary.",
        status: "Payment information is unavailable.",
        title: "Unlock cost unavailable",
        tone: "danger" as const,
      };
    case "INSUFFICIENT_BALANCE":
      return {
        description:
          "The current wallet balance is below the proposal unlock cost.",
        status: "Unlock with Wallet will stay disabled until a later top-up flow exists.",
        title: "Insufficient wallet balance",
        tone: "warning" as const,
      };
    case "READY_TO_UNLOCK":
      return {
        description:
          "The current wallet balance is sufficient for this proposal unlock.",
        status: "The payment action is prepared but remains inactive until Phase 2D.",
        title: "Ready to unlock",
        tone: "success" as const,
      };
    case "PROPOSAL_UNLOCK_ERROR":
      return {
        description: getProposalUnlockErrorMessage(
          proposalUnlockError,
          "Unable to check protected proposal detail.",
        ),
        status: "Unlock with Wallet is disabled because this is not a normal locked Proposal state.",
        title: getProposalUnlockBlockingTitle(proposalUnlockError),
        tone: "danger" as const,
      };
  }
}

function getUnlockReadinessToneClassName(
  tone: "danger" | "neutral" | "success" | "warning",
) {
  const baseClassName = "mt-4 rounded-2xl px-4 py-3 text-sm font-semibold";

  switch (tone) {
    case "danger":
      return `${baseClassName} border border-rose-200 bg-rose-50 text-rose-700`;
    case "success":
      return `${baseClassName} border border-emerald-200 bg-emerald-50 text-emerald-700`;
    case "warning":
      return `${baseClassName} border border-amber-200 bg-amber-50 text-amber-700`;
    case "neutral":
      return `${baseClassName} border border-slate-200 bg-slate-50 text-slate-600`;
  }
}

function getWalletBalancePlaceholder(state: UnlockReadinessState) {
  if (state === "WALLET_LOADING") return "Loading wallet...";
  if (state === "UNLOCKED") return "Not required";
  if (state === "PROPOSAL_UNLOCK_ERROR") return "Not checked";

  return "Wallet unavailable";
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

function isProtectedDetailLocked(error: unknown) {
  const status = getResponseStatus(error);

  return status === 400;
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

function getProposalUnlockBlockingTitle(error: unknown) {
  const status = getResponseStatus(error);

  if (status === 401) return "Authentication required";
  if (status === 403) return "Access not authorized";

  return "Unlock status unavailable";
}

function getWalletErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  return fallback;
}
