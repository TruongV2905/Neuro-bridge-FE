"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { useGetClientJobPosts } from "@/services/job-post.service";

import {
  DEFAULT_DIRECTION,
  DEFAULT_FILTER,
  DEFAULT_PAGE,
  DEFAULT_SIZE,
  DEFAULT_SORT_BY,
} from "./constants/myJobPost.constants";
import { MyJobPostHeader } from "./components/MyJobPostHeader";
import { MyJobPostFilterBar } from "./components/MyJobPostFilterBar";
import {
  JobPostCard,
  JobPostCardSkeleton,
} from "./components/JobPostCard";
import { JobPostPagination } from "./components/JobPostPagination";
import { EmptyState } from "./components/EmptyState";
import { JobPostDirection, JobPostFilter, JobPostListItem, JobPostStatus } from "@/types/job-post.type";

type FilterState = {
  status: JobPostStatus;
  sortBy: string;
  direction: JobPostDirection;
  page: number;
  size: number;
  search: string;
  minBudget: number;
  maxBudget: number;
  estimatedDaysFrom: number;
  estimatedDaysTo: number;
};

const DEFAULT_STATE: FilterState = {
  status: DEFAULT_FILTER.status,
  sortBy: DEFAULT_SORT_BY,
  direction: DEFAULT_DIRECTION,
  page: DEFAULT_PAGE,
  size: DEFAULT_SIZE,
  search: "",
  minBudget: 0,
  maxBudget: 0,
  estimatedDaysFrom: 0,
  estimatedDaysTo: 0,
};

export function MyJobPostsView() {
  const [state, setState] = useState<FilterState>(DEFAULT_STATE);

  const filter = useMemo<JobPostFilter>(
    () => ({
      requiredSkillIds: [],
      preferredSkillIds: [],
      minBudget: state.minBudget,
      maxBudget: state.maxBudget,
      estimatedDaysFrom: state.estimatedDaysFrom,
      estimatedDaysTo: state.estimatedDaysTo,
      status: state.status,
    }),
    [state.minBudget, state.maxBudget, state.estimatedDaysFrom, state.estimatedDaysTo, state.status],
  );

  // Build query params in the exact shape produced by the API spec:
  // ?page=0&size=9&sortBy=createdAt&direction=ASCENDING&search=&filter[requiredSkillIds]=0&...
  const queryParams = useMemo(() => {
    return {
      page: state.page,
      size: state.size,
      sortBy: state.sortBy,
      direction: state.direction,
      search: state.search || undefined,
  
      "filter.requiredSkillIds": filter.requiredSkillIds?.length
        ? filter.requiredSkillIds
        : undefined,
  
      "filter.preferredSkillIds": filter.preferredSkillIds?.length
        ? filter.preferredSkillIds
        : undefined,
  
      "filter.minBudget": filter.minBudget || undefined,
      "filter.maxBudget": filter.maxBudget || undefined,
      "filter.estimatedDaysFrom": filter.estimatedDaysFrom || undefined,
      "filter.estimatedDaysTo": filter.estimatedDaysTo || undefined,
      "filter.status": filter.status || undefined,
    };
  }, [
    state.page,
    state.size,
    state.sortBy,
    state.direction,
    state.search,
    filter,
  ]);

  const { data, isLoading, isError, isFetching, error, refetch } =
    useGetClientJobPosts(queryParams);

  const result = data?.result;
  const jobs = useMemo<JobPostListItem[]>(
    () => result?.data ?? [],
    [result],
  );
  const metadata = result?.metadata;
  const totalElements = metadata?.totalElements ?? 0;
  const totalPages = metadata?.totalPages ?? 0;

  // Compute KPIs (across the entire current dataset, not just this page slice)
  const visibleJobPosts = useMemo(
    () => jobs.filter((j) => j.status === "PUBLIC").length,
    [jobs],
  );
  const totalApplicants = useMemo(
    () =>
      jobs.reduce(
        (sum, j) => sum + (j.expertApplyCodes?.length ?? 0),
        0,
      ),
    [jobs],
  );

  const handleStateChange = useCallback((next: FilterState) => {
    setState(next);
  }, []);

  const handleResetFilters = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setState((prev) => ({ ...prev, page }));
  }, []);

  const isInitialLoading = isLoading && jobs.length === 0;
  const isNoResults = !isLoading && jobs.length === 0;

  return (
    <div className="min-h-screen space-y-8 bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <MyJobPostHeader
        totalJobPosts={totalElements}
        visibleJobPosts={visibleJobPosts}
        totalApplicants={totalApplicants}
      />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6"
      >
        <MyJobPostFilterBar
          value={state}
          onChange={handleStateChange}
          onReset={handleResetFilters}
          totalElements={totalElements}
          isLoading={isFetching}
        />

        <div className="mt-6">
          {isError && (
            <ErrorBanner
              message={
                (error as { message?: string })?.message ||
                "Unable to load job posts. Please try again."
              }
              onRetry={() => refetch()}
            />
          )}

          {isInitialLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <JobPostCardSkeleton key={`skel-${i}`} />
              ))}
            </div>
          ) : isNoResults ? (
            <EmptyState
              variant={totalElements === 0 && state.search === "" ? "empty" : "no-results"}
              onReset={handleResetFilters}
            />
          ) : (
            <>
              <motion.div
                layout
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {jobs.map((job, idx) => (
                  <JobPostCard
                    key={job.id ?? `${idx}`}
                    job={job}
                    index={idx}
                  />
                ))}
              </motion.div>

              <div className="mt-8">
                <JobPostPagination
                  page={state.page}
                  totalPages={totalPages}
                  hasNext={metadata?.hasNext ?? false}
                  hasPrevious={metadata?.hasPrevious ?? false}
                  totalElements={totalElements}
                  size={state.size}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>
      </motion.section>
    </div>
  );
}

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-600">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-rose-700">Failed to load job posts</p>
          <p className="text-xs text-rose-500">{message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
      >
        Retry
      </button>
    </div>
  );
}
