"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock4,
  FileSignature,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { RootState } from "@/redux/store";
import {
  useGetContractById,
  useSignContract,
} from "@/services/contract.service";
import {
  useGetJobPostById,
  useHireExpert,
} from "@/services/job-post.service";
import { useGetUserByCode } from "@/services/user.service";
import type { ContractResponse, ContractStatus } from "@/types/contract.type";
import type { HireExpertResponse } from "@/types/job-post.type";
import { UserRole, type UserResponse } from "@/types/user/user.type";
import {
  readHireContextFromStorage,
  saveContractHireContext,
  saveContractReferenceFromResponse,
  type ContractHireContext,
} from "./contractStorage";

type ContractSigningViewProps = {
  role: "client" | "expert";
};

const CONTRACT_FLOW_STEPS = [
  "Contract draft",
  "Both parties sign",
  "Escrow funding",
  "Workspace created",
] as const;

export function ContractSigningView({ role }: ContractSigningViewProps) {
  const router = useRouter();
  const params = useParams<{ contractId?: string | string[] }>();
  const searchParams = useSearchParams();
  const contractId = Array.isArray(params.contractId)
    ? params.contractId[0]
    : params.contractId ?? "";
  const currentUser = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null;
  const [finalizeResponse, setFinalizeResponse] =
    useState<HireExpertResponse | null>(null);
  const queryHireContext = readHireContextFromSearch(searchParams);
  const storedHireContext = useMemo(
    () => (contractId ? readHireContextFromStorage(contractId) : null),
    [contractId],
  );
  const hireContext = queryHireContext ?? storedHireContext;

  const contractQuery = useGetContractById(contractId, {
    enabled: Boolean(contractId),
  });
  const contract = contractQuery.data;
  const jobPostId = contract?.jobId ?? hireContext?.jobPostId ?? "";
  const jobPostQuery = useGetJobPostById(
    { id: jobPostId },
    { enabled: Boolean(jobPostId) },
  );
  const signContract = useSignContract();
  const hireExpert = useHireExpert();
  const partnerCode = getPartnerCode(contract, role, hireContext);
  const partnerQuery = useGetUserByCode(
    { code: partnerCode ?? "" },
    { enabled: Boolean(partnerCode) },
  );
  const counterpartyLabel = role === "client" ? "Expert" : "Client";
  const partnerName = partnerQuery.isLoading
    ? "Loading profile..."
    : getPartnerDisplayName(partnerQuery.data?.result?.fullName, role);

  useEffect(() => {
    if (!contractId) return;

    if (queryHireContext) {
      saveHireContext(contractId, queryHireContext);
    }
  }, [contractId, queryHireContext]);

  useEffect(() => {
    if (!contract) return;

    saveContractReferenceFromResponse(contract, role, hireContext);
  }, [contract, hireContext, role]);

  const currentRole = currentUser?.role;
  const roleSigningState = getRoleSigningState(contract, currentRole);
  const statusMeta = getContractStatusMeta(contract?.status);
  const canFinalize =
    currentRole === UserRole.CLIENT &&
    contract?.status === "FULLY_SIGNED" &&
    !contract.workspaceId;
  const canSign =
    Boolean(contract) &&
    (currentRole === UserRole.CLIENT || currentRole === UserRole.EXPERT) &&
    !roleSigningState.hasSigned &&
    contract?.status !== "FULLY_SIGNED";
  const shortfallAmount =
    finalizeResponse?.shortfallAmount ??
    (hireExpert.error?.response?.data as { shortfallAmount?: number } | undefined)
      ?.shortfallAmount;

  const projectSummary = {
    title:
      contract?.projectName ??
      jobPostQuery.data?.result?.title ??
      "Contract project",
    description:
      jobPostQuery.data?.result?.description ??
      "The selected proposal terms are locked into this contract.",
    budget:
      contract?.unlockCost && Number.isFinite(Number(contract.unlockCost))
        ? formatMoney(Number(contract.unlockCost))
        : "Not available",
    timeline: contract?.deadline
      ? formatDate(contract.deadline)
      : jobPostQuery.data?.result?.estimatedDays
      ? `${jobPostQuery.data.result.estimatedDays} days`
      : "Based on selected proposal",
  };

  const handleSignContract = async () => {
    if (!contractId || signContract.isPending) return;

    try {
      const signedContract = await signContract.mutateAsync(contractId);
      toast.success(getSignSuccessMessage(signedContract));
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to sign this contract."));
    }
  };

  const handleFinalizeWorkspace = async () => {
    if (!contract || hireExpert.isPending) return;

    const context = hireContext ?? readHireContextFromStorage(contract.id);

    if (!context?.expertApplyId) {
      toast.error(
        "Missing approved application context. Please open this contract from the hiring flow.",
      );
      return;
    }

    try {
      const response = await hireExpert.mutateAsync({
        jobPostId: contract.jobId,
        expertApplyId: context.expertApplyId,
      });

      setFinalizeResponse(response);

      if (response.workspaceId) {
        toast.success(response.message || "Workspace created successfully.");
        router.push(getWorkspaceHref(response.workspaceId, currentRole, role));
        return;
      }

      if (response.shortfallAmount) {
        toast.error(response.message || "Wallet balance is not enough.");
        return;
      }

      toast.success(response.message || "Contract finalized.");
      await contractQuery.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to finalize this contract."));
    }
  };

  if (!contractId) {
    return (
      <ContractPageState
        title="Invalid contract"
        message="The contract ID is missing from this route."
        role={role}
      />
    );
  }

  if (contractQuery.isLoading) {
    return <ContractLoadingState />;
  }

  if (contractQuery.isError || !contract) {
    return (
      <ContractPageState
        title="Unable to load contract"
        message={getErrorMessage(
          contractQuery.error,
          "Please check the contract link and try again.",
        )}
        role={role}
        onRetry={() => contractQuery.refetch()}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
              <Link
                href={getBackHref(role)}
                className="transition hover:text-indigo-600"
              >
                {role === "client" ? "Client dashboard" : "Expert dashboard"}
              </Link>
              <span>/</span>
              <span className="text-slate-800">Contract signing</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
              Contract details
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {counterpartyLabel}:{" "}
              <span className="text-slate-800">{partnerName}</span>
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
          >
            <Link href={getBackHref(role)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
                  statusMeta.badgeClass,
                )}
              >
                {statusMeta.label}
              </Badge>
              <h2 className="mt-4 text-2xl font-extrabold text-slate-950">
                {projectSummary.title}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                {projectSummary.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <ContractMetric
                icon={LockKeyhole}
                label="Contract amount"
                value={projectSummary.budget}
              />
              <ContractMetric
                icon={Clock4}
                label={contract.deadline ? "Deadline" : "Timeline"}
                value={projectSummary.timeline}
              />
              <ContractMetric
                icon={ShieldCheck}
                label="Escrow"
                value={contract.workspaceId ? "Workspace ready" : "Pending"}
              />
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40">
            <div>
              <h2 className="text-base font-extrabold text-slate-950">
                Contract terms
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                These terms come from the selected proposal and are confirmed by
                both sides before escrow and workspace creation.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TermCard label="Project" value={projectSummary.title} />
              <TermCard label="Contract value" value={projectSummary.budget} />
              <TermCard
                label={contract.deadline ? "Deadline" : "Timeline"}
                value={projectSummary.timeline}
              />
              <TermCard
                label="Workspace"
                value={contract.workspaceId ? "Created" : "Not created yet"}
              />
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Strategy detail
              </p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                {contract.strategyDetail ||
                  "No detailed strategy was attached to this contract."}
              </p>
            </div>

            {shortfallAmount ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-700">
                <p className="text-sm font-extrabold">
                  Wallet needs more balance
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Please top up {formatMoney(Number(shortfallAmount))} before
                  finalizing this contract again.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-4 h-10 rounded-xl border-amber-200 bg-white px-4 text-sm font-bold text-amber-700"
                >
                  <Link href="/client/dashboard/wallet">
                    <WalletCards className="mr-2 h-4 w-4" />
                    Go to wallet
                  </Link>
                </Button>
              </div>
            ) : null}
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40">
              <h2 className="text-base font-extrabold text-slate-950">
                Signing status
              </h2>

              <div className="mt-5 space-y-3">
                <PartySignatureRow
                  label="Client"
                  signed={contract.clientSigned}
                />
                <PartySignatureRow
                  label="Expert"
                  signed={contract.expertSigned}
                />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="text-sm font-extrabold text-slate-950">
                  {statusMeta.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {statusMeta.description}
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {canSign && (
                  <Button
                    type="button"
                    disabled={signContract.isPending}
                    onClick={handleSignContract}
                    className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-sm font-bold text-white hover:from-indigo-600 hover:to-sky-600 disabled:opacity-60"
                  >
                    {signContract.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing...
                      </>
                    ) : (
                      <>
                        <FileSignature className="mr-2 h-4 w-4" />
                        Sign contract
                      </>
                    )}
                  </Button>
                )}

                {!canSign && roleSigningState.hasSigned && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                    You have signed this contract.
                  </div>
                )}

                {canFinalize && (
                  <Button
                    type="button"
                    disabled={hireExpert.isPending}
                    onClick={handleFinalizeWorkspace}
                    className="h-11 w-full rounded-xl bg-slate-950 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {hireExpert.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initialing...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Initialize workspace
                      </>
                    )}
                  </Button>
                )}

                {contract.workspaceId && (
                  <Button
                    asChild
                    className="h-11 w-full rounded-xl bg-slate-950 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    <Link
                      href={getWorkspaceHref(
                        contract.workspaceId,
                        currentRole,
                        role,
                      )}
                    >
                      Open workspace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40">
              <h2 className="text-base font-extrabold text-slate-950">
                Flow
              </h2>
              <div className="mt-5 space-y-4">
                {CONTRACT_FLOW_STEPS.map((step, index) => (
                  <div key={step} className="flex gap-3">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold",
                        getStepState(contract, index)
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-400",
                      )}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {step}
                      </p>
                      <p className="text-xs leading-5 text-slate-500">
                        {getStepDescription(index)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ContractMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 truncate text-sm font-extrabold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function TermCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-extrabold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function PartySignatureRow({
  label,
  signed,
}: {
  label: string;
  signed: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <Badge
        variant="outline"
        className={cn(
          "rounded-full text-[11px] font-bold",
          signed
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-amber-200 bg-amber-50 text-amber-700",
        )}
      >
        {signed ? (
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
        ) : (
          <Clock4 className="mr-1 h-3.5 w-3.5" />
        )}
        {signed ? "Signed" : "Pending"}
      </Badge>
    </div>
  );
}

function ContractLoadingState() {
  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-28 rounded-3xl" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-[560px] rounded-3xl" />
          <Skeleton className="h-[420px] rounded-3xl" />
        </div>
      </div>
    </main>
  );
}

function ContractPageState({
  title,
  message,
  role,
  onRetry,
}: {
  title: string;
  message: string;
  role: "client" | "expert";
  onRetry?: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f1f1] p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <FileSignature className="mx-auto h-10 w-10 text-slate-300" />
        <h1 className="mt-4 text-xl font-extrabold text-slate-950">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          {onRetry && (
            <Button type="button" onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={getBackHref(role)}>Back</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function readHireContextFromSearch(
  searchParams: ReturnType<typeof useSearchParams>,
): ContractHireContext | null {
  const jobPostId = searchParams.get("jobPostId")?.trim() ?? "";
  const expertApplyId = searchParams.get("expertApplyId")?.trim() ?? "";

  if (!jobPostId || !expertApplyId) return null;

  return { jobPostId, expertApplyId };
}

function saveHireContext(contractId: string, context: ContractHireContext) {
  saveContractHireContext(contractId, context);
}

function getRoleSigningState(
  contract: ContractResponse | undefined,
  role: UserRole | undefined,
) {
  if (!contract) return { hasSigned: false };

  if (role === UserRole.CLIENT) {
    return { hasSigned: contract.clientSigned };
  }

  if (role === UserRole.EXPERT) {
    return { hasSigned: contract.expertSigned };
  }

  return { hasSigned: false };
}

function getContractStatusMeta(status?: ContractStatus) {
  switch (status) {
    case "CLIENT_SIGNED":
      return {
        label: "Client signed",
        title: "Waiting for expert",
        description: "The client has signed. The expert still needs to review and sign.",
        badgeClass: "border-sky-200 bg-sky-50 text-sky-700",
      };
    case "EXPERT_SIGNED":
      return {
        label: "Expert signed",
        title: "Waiting for client",
        description: "The expert has signed. The client still needs to review and sign.",
        badgeClass: "border-violet-200 bg-violet-50 text-violet-700",
      };
    case "FULLY_SIGNED":
      return {
        label: "Fully signed",
        title: "Ready for escrow",
        description: "Both sides signed. The client can finalize escrow and create the workspace.",
        badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    case "PENDING":
    default:
      return {
        label: "Pending signatures",
        title: "Signatures required",
        description: "Both client and expert must sign before workspace creation.",
        badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
      };
  }
}

function getStepState(contract: ContractResponse, stepIndex: number) {
  if (stepIndex === 0) return true;
  if (stepIndex === 1) return contract.status === "FULLY_SIGNED";
  if (stepIndex === 2) return Boolean(contract.workspaceId);
  if (stepIndex === 3) return Boolean(contract.workspaceId);

  return false;
}

function getStepDescription(index: number) {
  switch (index) {
    case 0:
      return "Created after the client chooses an expert.";
    case 1:
      return "Client and expert confirm the same terms.";
    case 2:
      return "Client wallet funds are moved into project escrow.";
    case 3:
      return "The project workspace opens for collaboration.";
    default:
      return "";
  }
}

function getSignSuccessMessage(contract: ContractResponse) {
  if (contract.status === "FULLY_SIGNED") {
    return "Contract fully signed. The client can finalize the workspace.";
  }

  return "Contract signed successfully.";
}

function getPartnerCode(
  contract: ContractResponse | undefined,
  role: "client" | "expert",
  hireContext?: ContractHireContext | null,
) {
  if (!contract && !hireContext) return null;

  return role === "client"
    ? contract?.expertCode ?? hireContext?.expertCode
    : contract?.clientCode;
}

function getPartnerDisplayName(
  fullName: string | undefined,
  role: "client" | "expert",
) {
  if (fullName?.trim()) return fullName.trim();

  return role === "client" ? "Expert profile pending" : "Client profile pending";
}

function getBackHref(role: "client" | "expert") {
  return role === "client"
    ? "/client/dashboard/contracts"
    : "/expert/dashboard/contracts";
}

function getWorkspaceHref(
  workspaceId: string,
  authenticatedRole: UserRole | undefined,
  viewRole: "client" | "expert",
) {
  const normalizedWorkspaceId = workspaceId.trim();
  const dashboardRole =
    authenticatedRole === UserRole.CLIENT ||
    authenticatedRole === UserRole.EXPERT
      ? authenticatedRole
      : viewRole === "client"
        ? UserRole.CLIENT
        : UserRole.EXPERT;
  const dashboardBase =
    dashboardRole === UserRole.EXPERT
      ? "/expert/dashboard/projects"
      : "/client/dashboard/projects";

  return `${dashboardBase}/${encodeURIComponent(normalizedWorkspaceId)}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const apiError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return apiError.response?.data?.message || apiError.message || fallback;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
