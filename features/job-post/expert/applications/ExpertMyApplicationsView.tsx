"use client";

import * as React from "react";
import { useQueries } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchJobPostApplicants,
  jobPostKeys,
  useGetExpertAppliedJobPosts,
} from "@/services/job-post.service";
import type { RootState } from "@/redux/store";
import type {
  ExpertApplicationViewItem,
  ExpertAppliedJobPostsResponse,
  ExpertProposal,
} from "@/types/job-post.type";
import type { UserResponse } from "@/types/user/user.type";
import { ExpertApplicationCard } from "./ExpertApplicationCard";
import { ExpertProposalDetailDialog } from "./ExpertProposalDetailDialog";

const DEFAULT_STATE = {
  page: 0,
  size: 6,
  search: "",
};

export function ExpertMyApplicationsView() {
  const currentUser = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null;
  const expertCode = currentUser?.code ?? "";
  const [state, setState] = React.useState(DEFAULT_STATE);
  const [searchInput, setSearchInput] = React.useState(DEFAULT_STATE.search);
  const [selectedProposal, setSelectedProposal] =
    React.useState<ExpertProposal | null>(null);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setState((current) =>
        current.search === searchInput
          ? current
          : { ...current, search: searchInput, page: 0 },
      );
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const appliedJobPostsQuery = useGetExpertAppliedJobPosts(undefined, {
    enabled: !!expertCode,
  });
  const appliedJobPosts = React.useMemo(
    () => normalizeAppliedJobPosts(appliedJobPostsQuery.data?.result),
    [appliedJobPostsQuery.data?.result],
  );

  const applicantQueries = useQueries({
    queries: appliedJobPosts.map((jobPost) => ({
      queryKey: [...jobPostKeys.applicants, jobPost.id],
      queryFn: () => fetchJobPostApplicants(jobPost.id),
      enabled: !!expertCode,
      retry: 0,
    })),
  });

  const applications = React.useMemo<ExpertApplicationViewItem[]>(() => {
    return appliedJobPosts.flatMap((jobPost, index) => {
      const applicants = applicantQueries[index]?.data?.result ?? [];

      return applicants
        .filter(
          (applicant) => applicant.expertApply.expertCode === expertCode,
        )
        .map((applicant) => ({
          jobPost,
          expertApply: applicant.expertApply,
          proposal: applicant.proposal,
          proposalUnlock: applicant.proposalUnlock,
        }));
    });
  }, [applicantQueries, appliedJobPosts, expertCode]);

  const filteredApplications = React.useMemo(
    () => filterApplications(applications, state.search),
    [applications, state.search],
  );
  const totalElements = filteredApplications.length;
  const totalPages = Math.ceil(totalElements / state.size);
  const pageApplications = React.useMemo(() => {
    const start = state.page * state.size;

    return filteredApplications.slice(start, start + state.size);
  }, [filteredApplications, state.page, state.size]);
  const hasPrevious = state.page > 0;
  const hasNext = state.page + 1 < totalPages;
  const isInitialLoading =
    appliedJobPostsQuery.isLoading && appliedJobPosts.length === 0;
  const isAppliesLoading = applicantQueries.some((query) => query.isLoading);
  const isApplicationListLoading =
    isInitialLoading || (isAppliesLoading && applications.length === 0);
  const isFetching =
    appliedJobPostsQuery.isFetching ||
    applicantQueries.some((query) => query.isFetching);
  const failedApplicantQueries = applicantQueries.filter(
    (query) => query.isError,
  );
  const isEmpty =
    !isInitialLoading &&
    !isAppliesLoading &&
    !appliedJobPostsQuery.isError &&
    filteredApplications.length === 0;
  const isDirty = state.search !== DEFAULT_STATE.search;

  const resetSearch = () => {
    setState(DEFAULT_STATE);
    setSearchInput(DEFAULT_STATE.search);
  };

  const refetchApplications = () => {
    appliedJobPostsQuery.refetch();
    applicantQueries.forEach((query) => {
      query.refetch();
    });
  };

  if (!expertCode) {
    return (
      <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-700">
          <p className="text-lg font-extrabold">Applications unavailable</p>
          <p className="mt-2 text-sm font-semibold leading-6">
            Unable to load applications because expert profile code is missing.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-md shadow-indigo-500/20">
                Expert Workspace
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Submitted work
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              My Applications
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Track every jobpost application you have submitted, with or
              without proposal details.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm shadow-slate-200/50">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Submitted applications
            </p>
            <p className="mt-1 text-3xl font-extrabold text-slate-950">
              {totalElements.toLocaleString()}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search applications..."
                className="h-11 rounded-xl border-slate-200 bg-white pl-10 text-sm shadow-sm focus-visible:border-indigo-400 focus-visible:ring-indigo-100"
              />
            </div>

            {isDirty && (
              <Button
                type="button"
                variant="ghost"
                onClick={resetSearch}
                className="h-10 rounded-xl px-3 text-xs font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>

          <div className="mt-4 flex min-h-5 items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Showing{" "}
              <span className="font-bold text-slate-700">
                {pageApplications.length.toLocaleString()}
              </span>{" "}
              on this page
            </span>
            {isFetching && (
              <span className="flex items-center gap-1.5 font-semibold text-indigo-600">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Updating
              </span>
            )}
          </div>
        </section>

        {appliedJobPostsQuery.isError && (
          <ErrorState
            message={
              getQueryErrorMessage(appliedJobPostsQuery.error) ||
              "Unable to load submitted applications."
            }
            onRetry={() => appliedJobPostsQuery.refetch()}
          />
        )}

        {failedApplicantQueries.length > 0 && (
          <WarningState
            count={failedApplicantQueries.length}
            onRetry={refetchApplications}
          />
        )}

        {isApplicationListLoading ? (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ApplicationCardSkeleton key={index} />
            ))}
          </div>
        ) : appliedJobPostsQuery.isError ? null : isEmpty ? (
          <EmptyState onReset={resetSearch} />
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {pageApplications.map((application) => (
                <ExpertApplicationCard
                  key={`${application.jobPost.id}-${application.expertApply.id}`}
                  application={application}
                  onViewProposal={setSelectedProposal}
                />
              ))}
            </div>

            <ApplicationPagination
              page={state.page}
              size={state.size}
              totalPages={totalPages}
              totalElements={totalElements}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              onPageChange={(page) =>
                setState((current) => ({ ...current, page }))
              }
            />
          </>
        )}
      </div>

      <ExpertProposalDetailDialog
        proposal={selectedProposal}
        open={!!selectedProposal}
        onOpenChange={(open) => {
          if (!open) setSelectedProposal(null);
        }}
      />
    </main>
  );
}

function normalizeAppliedJobPosts(
  result?: ExpertAppliedJobPostsResponse,
): ExpertApplicationViewItem["jobPost"][] {
  if (!result) return [];

  if (Array.isArray(result)) return result;

  return result.data ?? [];
}

function filterApplications(
  applications: ExpertApplicationViewItem[],
  search: string,
) {
  const term = search.trim().toLowerCase();

  if (!term) return applications;

  return applications.filter((application) => {
    const searchableText = [
      application.jobPost.title,
      application.expertApply.expertCode,
      application.proposal?.title,
      application.proposal?.strategySummary,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(term);
  });
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-extrabold">Failed to load applications</p>
        <p className="mt-1 text-xs text-rose-600">{message}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="h-9 rounded-xl border-rose-200 bg-white px-4 text-xs font-bold text-rose-600 hover:bg-rose-100"
      >
        Retry
      </Button>
    </div>
  );
}

function WarningState({
  count,
  onRetry,
}: {
  count: number;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-700 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-extrabold">
            Some application details are unavailable
          </p>
          <p className="mt-1 text-xs font-semibold text-amber-600">
            {count} jobpost {count === 1 ? "request" : "requests"} could not be
            loaded. The rest of your applications are still shown.
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="h-9 rounded-xl border-amber-200 bg-white px-4 text-xs font-bold text-amber-700 hover:bg-amber-100"
      >
        Retry
      </Button>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-8 py-14 text-center shadow-sm shadow-slate-200/50">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <BriefcaseBusiness className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-extrabold tracking-tight text-slate-950">
        No submitted applications found
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Jobpost applications you submit will appear here.
      </p>
      <Button
        type="button"
        onClick={onReset}
        className="mt-6 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-5 text-sm font-bold text-white hover:from-indigo-600 hover:to-sky-600"
      >
        Reset search
      </Button>
    </div>
  );
}

function ApplicationCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <div className="mt-5 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="mt-5 h-20 rounded-2xl" />
      <div className="mt-5 flex justify-end">
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}

function ApplicationPagination({
  page,
  size,
  totalPages,
  totalElements,
  hasNext,
  hasPrevious,
  onPageChange,
}: {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalElements === 0) return null;

  const start = page * size + 1;
  const end = Math.min((page + 1) * size, totalElements);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
      <p className="text-xs font-medium text-slate-500">
        Showing{" "}
        <span className="font-bold text-slate-700">
          {start}-{end}
        </span>{" "}
        of{" "}
        <span className="font-bold text-slate-700">
          {totalElements.toLocaleString()}
        </span>{" "}
        submitted applications
      </p>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={!hasPrevious}
          onClick={() => onPageChange(0)}
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-3 text-xs font-bold text-slate-600">
          Page {page + 1} of {Math.max(totalPages, 1)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={!hasNext}
          onClick={() => onPageChange(totalPages - 1)}
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

type ApiErrorLike = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

function getQueryErrorMessage(error: unknown) {
  const apiError = error as ApiErrorLike;

  return apiError.response?.data?.message || apiError.message;
}
