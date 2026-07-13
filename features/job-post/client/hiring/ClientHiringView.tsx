"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Handshake,
  Loader2,
  RefreshCw,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { saveContractHireContext } from "@/features/contract/contractStorage";
import { cn } from "@/lib/utils";
import {
  useGetClientJobPosts,
  useGetJobPostApplicants,
  useHireExpert,
} from "@/services/job-post.service";
import { useGetUserByCode } from "@/services/user.service";
import type {
  JobPostApplicant,
  JobPostListItem,
  JobPostStatus,
} from "@/types/job-post.type";
import {
  formatApplicantMoney,
  resolveApplicantUnlockCost,
} from "../manage/components/ClientApplicantCard";
import {
  formatBudgetRange,
  formatTimeline,
  getStatusMeta,
} from "../manage/constants/myJobPost.constants";
import {
  HIRING_DEFAULT_DIRECTION,
  HIRING_DEFAULT_PAGE,
  HIRING_DEFAULT_SORT_BY,
  HIRING_DEFAULT_STATUS,
  HIRING_PAGE_SIZE,
  HIRING_STATUS_OPTIONS,
} from "./constants/clientHiring.constants";

type HiringFilterState = {
  page: number;
  search: string;
  status: JobPostStatus;
};

const DEFAULT_STATE: HiringFilterState = {
  page: HIRING_DEFAULT_PAGE,
  search: "",
  status: HIRING_DEFAULT_STATUS,
};

export function ClientHiringView() {
  const router = useRouter();
  const [state, setState] = useState<HiringFilterState>(DEFAULT_STATE);
  const [searchInput, setSearchInput] = useState(DEFAULT_STATE.search);
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setState((current) =>
        current.search === searchInput
          ? current
          : { ...current, search: searchInput, page: 0 },
      );
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const queryParams = useMemo(
    () => ({
      page: state.page,
      size: HIRING_PAGE_SIZE,
      sortBy: HIRING_DEFAULT_SORT_BY,
      direction: HIRING_DEFAULT_DIRECTION,
      search: state.search || undefined,
      "filter.status": state.status,
    }),
    [state.page, state.search, state.status],
  );

  const jobPostsQuery = useGetClientJobPosts(queryParams);
  const jobs = useMemo(
    () => jobPostsQuery.data?.result?.data ?? [],
    [jobPostsQuery.data?.result?.data],
  );
  const metadata = jobPostsQuery.data?.result?.metadata;
  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? jobs[0] ?? null,
    [jobs, selectedJobId],
  );

  const applicantsQuery = useGetJobPostApplicants(
    { jobPostId: selectedJob?.id ?? "" },
    { enabled: Boolean(selectedJob?.id) },
  );
  const applicants = applicantsQuery.data?.result ?? [];
  const hireExpert = useHireExpert();

  const resetFilters = () => {
    setSearchInput("");
    setState(DEFAULT_STATE);
  };

  const handleHire = async (applicant: JobPostApplicant) => {
    if (!selectedJob?.id || hireExpert.isPending) return;

    try {
      const response = await hireExpert.mutateAsync({
        jobPostId: selectedJob.id,
        expertApplyId: applicant.expertApply.id,
      });

      toast.success(response.message || "Contract created successfully.");
      await Promise.all([jobPostsQuery.refetch(), applicantsQuery.refetch()]);

      if (response.contractId) {
        saveContractHireContext(response.contractId, {
          jobPostId: selectedJob.id,
          expertApplyId: applicant.expertApply.id,
          expertCode: response.expertCode || applicant.expertApply.expertCode,
        });
        router.push(
          `/client/dashboard/contracts/${response.contractId}?jobPostId=${selectedJob.id}&expertApplyId=${applicant.expertApply.id}`,
        );
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to hire this expert."));
    }
  };

  const isInitialLoading = jobPostsQuery.isLoading && jobs.length === 0;
  const isEmpty =
    !jobPostsQuery.isLoading && !jobPostsQuery.isError && jobs.length === 0;
  const totalApplicants = applicants.length;
  const proposalCount = applicants.filter((item) => item.proposal).length;

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <HiringHeader
          totalJobPosts={metadata?.totalElements ?? 0}
          totalApplicants={totalApplicants}
          proposalCount={proposalCount}
        />

        <section className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(320px,420px)_1fr]">
            <div className="space-y-4">
              <HiringFilterBar
                state={state}
                searchInput={searchInput}
                isFetching={jobPostsQuery.isFetching}
                onSearchChange={setSearchInput}
                onStatusChange={(status) => {
                  setState((current) => ({ ...current, status, page: 0 }));
                }}
                onReset={resetFilters}
              />

              {jobPostsQuery.isError && (
                <HiringErrorState
                  title="Unable to load jobposts"
                  message={getErrorMessage(
                    jobPostsQuery.error,
                    "Please try again.",
                  )}
                  onRetry={() => jobPostsQuery.refetch()}
                />
              )}

              {isInitialLoading ? (
                <JobListSkeleton />
              ) : isEmpty ? (
                <HiringEmptyState onReset={resetFilters} />
              ) : (
                <JobPostSelectionList
                  jobs={jobs}
                  selectedJobId={selectedJob?.id ?? ""}
                  onSelectJob={setSelectedJobId}
                />
              )}

              <HiringPagination
                page={state.page}
                size={HIRING_PAGE_SIZE}
                totalElements={metadata?.totalElements ?? 0}
                hasPrevious={metadata?.hasPrevious ?? false}
                hasNext={metadata?.hasNext ?? false}
                onPageChange={(page) =>
                  setState((current) => ({ ...current, page }))
                }
              />
            </div>

            <div className="min-h-[520px] rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
              {selectedJob ? (
                <SelectedJobHiringPanel
                  job={selectedJob}
                  applicants={applicants}
                  isLoading={applicantsQuery.isLoading}
                  isError={applicantsQuery.isError}
                  errorMessage={getErrorMessage(
                    applicantsQuery.error,
                    "Please try again.",
                  )}
                  pendingExpertApplyId={
                    hireExpert.variables?.expertApplyId
                      ? String(hireExpert.variables.expertApplyId)
                      : ""
                  }
                  isHiring={hireExpert.isPending}
                  onRetry={() => applicantsQuery.refetch()}
                  onHire={handleHire}
                />
              ) : (
                <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center">
                  <div className="max-w-sm px-6">
                    <Handshake className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-extrabold text-slate-900">
                      Select a jobpost to review applicants
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      The hiring action is available after a jobpost has at
                      least one applicant.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function HiringHeader({
  totalJobPosts,
  totalApplicants,
  proposalCount,
}: {
  totalJobPosts: number;
  totalApplicants: number;
  proposalCount: number;
}) {
  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-600">
            <Handshake className="h-4 w-4" />
            Client hiring workspace
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
            Hire an expert
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review applicants by jobpost, compare proposal summaries, then
            confirm the expert you want to hire.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
          <HeaderMetric
            icon={BriefcaseBusiness}
            label="Jobposts"
            value={String(totalJobPosts)}
          />
          <HeaderMetric
            icon={Users}
            label="Applicants"
            value={String(totalApplicants)}
          />
          <HeaderMetric
            icon={CheckCircle2}
            label="With proposals"
            value={String(proposalCount)}
          />
        </div>
      </div>
    </section>
  );
}

function HeaderMetric({
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
      <p className="mt-2 text-xl font-extrabold text-slate-950">{value}</p>
    </div>
  );
}

function HiringFilterBar({
  state,
  searchInput,
  isFetching,
  onSearchChange,
  onStatusChange,
  onReset,
}: {
  state: HiringFilterState;
  searchInput: string;
  isFetching: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: JobPostStatus) => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search jobpost..."
          className="h-11 rounded-xl border-slate-200 bg-white pl-9 text-sm"
        />
      </div>

      <div className="mt-3 grid gap-2">
        {HIRING_STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onStatusChange(option.value)}
            className={cn(
              "rounded-xl border px-3 py-2 text-left transition",
              state.status === option.value
                ? "border-indigo-200 bg-white text-indigo-700 shadow-sm"
                : "border-slate-200 bg-white/70 text-slate-600 hover:border-indigo-100 hover:text-indigo-600",
            )}
          >
            <span className="text-sm font-extrabold">{option.label}</span>
            <span className="mt-0.5 block text-xs leading-5 text-slate-500">
              {option.description}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-500">
          {isFetching ? "Refreshing..." : "Select a jobpost below"}
        </p>
        <Button
          type="button"
          variant="ghost"
          onClick={onReset}
          className="h-9 rounded-xl px-3 text-xs font-bold text-slate-600"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

function JobPostSelectionList({
  jobs,
  selectedJobId,
  onSelectJob,
}: {
  jobs: JobPostListItem[];
  selectedJobId: string;
  onSelectJob: (jobPostId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const statusMeta = getStatusMeta(job.status);
        const isSelected = job.id === selectedJobId;

        return (
          <button
            key={job.id}
            type="button"
            onClick={() => onSelectJob(job.id)}
            className={cn(
              "w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition",
              isSelected
                ? "border-indigo-200 ring-2 ring-indigo-100"
                : "border-slate-200/80 hover:border-indigo-100",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-extrabold text-slate-950">
                  {job.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                  {job.description}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 rounded-full text-[11px]",
                  statusMeta.pill,
                )}
              >
                {statusMeta.label}
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniMetric
                label="Budget"
                value={formatBudgetRange(job.budgetFrom, job.budgetTo)}
              />
              <MiniMetric label="Time" value={formatTimeline(job.estimatedDays)} />
              <MiniMetric
                label="Applies"
                value={String(job.expertApplyCodes?.length ?? 0)}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className="mt-1 truncate text-xs font-extrabold text-slate-900"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function SelectedJobHiringPanel({
  job,
  applicants,
  isLoading,
  isError,
  errorMessage,
  pendingExpertApplyId,
  isHiring,
  onRetry,
  onHire,
}: {
  job: JobPostListItem;
  applicants: JobPostApplicant[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  pendingExpertApplyId: string;
  isHiring: boolean;
  onRetry: () => void;
  onHire: (applicant: JobPostApplicant) => void;
}) {
  const statusMeta = getStatusMeta(job.status);
  const canHire = job.status === "PUBLIC";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn("rounded-full text-[11px]", statusMeta.pill)}
              >
                {statusMeta.label}
              </Badge>
              <span className="text-xs font-bold text-slate-400">
                {applicants.length} applicants
              </span>
            </div>
            <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-950">
              {job.title}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
              {job.description}
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="h-10 shrink-0 rounded-xl border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
          >
            <Link href={`/client/dashboard/my-job-post/${job.id}`}>
              Open detail
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {isError && (
        <HiringErrorState
          title="Unable to load applicants"
          message={errorMessage}
          onRetry={onRetry}
        />
      )}

      {isLoading ? (
        <ApplicantListSkeleton />
      ) : applicants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <Users className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-extrabold text-slate-900">
            No applicants yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Applicants will appear here after experts apply to this jobpost.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {applicants.map((applicant) => {
            const isCurrentHiring =
              isHiring && pendingExpertApplyId === applicant.expertApply.id;

            return (
              <HiringApplicantCard
                key={applicant.expertApply.id}
                applicant={applicant}
                disabled={!canHire || isHiring}
                isHiring={isCurrentHiring}
                onHire={() => onHire(applicant)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function HiringApplicantCard({
  applicant,
  disabled,
  isHiring,
  onHire,
}: {
  applicant: JobPostApplicant;
  disabled: boolean;
  isHiring: boolean;
  onHire: () => void;
}) {
  const { expertApply, proposal } = applicant;
  const unlockCost = resolveApplicantUnlockCost(proposal);
  const expertQuery = useGetUserByCode(
    { code: expertApply.expertCode },
    { enabled: Boolean(expertApply.expertCode) },
  );
  const expertName = getExpertDisplayName(
    expertQuery.data?.result?.fullName,
    expertQuery.isLoading,
  );

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 transition hover:border-indigo-100 hover:shadow-md hover:shadow-slate-200/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Expert
          </p>
          <h3 className="mt-1 truncate text-base font-extrabold text-slate-950">
            {expertName}
          </h3>
          <Button
            asChild
            variant="link"
            className="mt-1 h-auto p-0 text-xs font-bold text-indigo-600"
          >
            <Link href={getExpertProfileHref(expertApply.expertCode)}>
              View profile
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <Badge
          variant="outline"
          className="rounded-full border-indigo-200 bg-indigo-50 text-indigo-700"
        >
          <UserRound className="mr-1 h-3.5 w-3.5" />
          Applied
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniMetric
          label="Budget"
          value={formatApplicantMoney(expertApply.proposedBudget)}
        />
        <MiniMetric
          label="Timeline"
          value={`${expertApply.estimatedDays} days`}
        />
      </div>

      <div className="mt-4 flex-1 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
        {proposal ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Proposal
              </p>
              <Badge
                variant="outline"
                className="rounded-full border-emerald-200 bg-emerald-50 text-[11px] font-bold text-emerald-700"
              >
                Strategy included
              </Badge>
            </div>
            <h4 className="mt-2 line-clamp-2 text-sm font-extrabold text-slate-950">
              {proposal.title}
            </h4>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
              {proposal.strategySummary || "No strategy summary was provided."}
            </p>
            <div className="mt-3 rounded-xl border border-slate-100 bg-white px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Unlock cost
              </p>
              <p className="mt-1 text-xs font-extrabold text-slate-950">
                {unlockCost.value === null
                  ? "Unavailable"
                  : formatApplicantMoney(unlockCost.value)}
              </p>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col justify-center gap-2 text-sm font-semibold text-slate-500">
            <Badge
              variant="outline"
              className="w-fit rounded-full border-slate-200 bg-white text-[11px] font-bold text-slate-600"
            >
              Basic application
            </Badge>
            <p>No proposal supplied yet.</p>
          </div>
        )}
      </div>

      <Button
        type="button"
        onClick={onHire}
        disabled={disabled}
        className="mt-4 h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-sm font-bold text-white shadow-[0_8px_24px_rgba(99,102,241,0.24)] hover:from-indigo-600 hover:to-sky-600 disabled:opacity-60"
      >
        {isHiring ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Hiring...
          </>
        ) : (
          <>
            <Handshake className="mr-2 h-4 w-4" />
            Hire expert
          </>
        )}
      </Button>
    </article>
  );
}

function getExpertDisplayName(fullName: string | undefined, isLoading: boolean) {
  if (fullName?.trim()) return fullName.trim();
  if (isLoading) return "Loading expert...";

  return "Expert applicant";
}

function getExpertProfileHref(expertCode: string) {
  return `/experts/${encodeURIComponent(expertCode)}`;
}

function HiringPagination({
  page,
  size,
  totalElements,
  hasPrevious,
  hasNext,
  onPageChange,
}: {
  page: number;
  size: number;
  totalElements: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalElements === 0) return null;

  const start = page * size + 1;
  const end = Math.min((page + 1) * size, totalElements);

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
      <p className="text-xs font-semibold text-slate-500">
        Showing {start}-{end} of {totalElements}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
          className="h-9 rounded-xl px-3 text-xs font-bold"
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          className="h-9 rounded-xl px-3 text-xs font-bold"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function HiringErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
      <p className="text-sm font-extrabold text-rose-700">{title}</p>
      <p className="mt-1 text-sm text-rose-600">{message}</p>
      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="mt-3 h-9 rounded-xl border-rose-200 bg-white px-3 text-xs font-bold text-rose-700"
      >
        <RefreshCw className="mr-2 h-3.5 w-3.5" />
        Retry
      </Button>
    </div>
  );
}

function HiringEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <BriefcaseBusiness className="mx-auto h-10 w-10 text-slate-300" />
      <p className="mt-3 text-sm font-extrabold text-slate-900">
        No jobposts found
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Try another status or search keyword.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        className="mt-4 h-10 rounded-xl px-4 text-sm font-bold"
      >
        Reset filters
      </Button>
    </div>
  );
}

function JobListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200/80 bg-white p-4"
        >
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-3 h-4 w-full" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ApplicantListSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200/80 bg-white p-5"
        >
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
          <Skeleton className="mt-4 h-32 rounded-2xl" />
          <Skeleton className="mt-4 h-11 rounded-xl" />
        </div>
      ))}
    </div>
  );
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

