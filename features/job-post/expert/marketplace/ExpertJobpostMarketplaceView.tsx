"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPublicJobPosts } from "@/services/job-post.service";
import type {
  JobPost,
  JobPostDirection,
  JobPostPublicListParams,
} from "@/types/job-post.type";
import { ExpertJobpostCard } from "./ExpertJobpostCard";

const DEFAULT_STATE = {
  page: 0,
  size: 6,
  sortBy: "createdAt",
  direction: "DESCENDING" as JobPostDirection,
  search: "",
  minBudget: "",
  maxBudget: "",
  estimatedDaysFrom: "",
  estimatedDaysTo: "",
};

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest" },
  { value: "title", label: "Title" },
  { value: "budgetFrom", label: "Budget" },
  { value: "estimatedDays", label: "Duration" },
];

export function ExpertJobpostMarketplaceView() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [searchInput, setSearchInput] = useState(DEFAULT_STATE.search);

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

  const queryParams = useMemo<JobPostPublicListParams>(() => {
    const minBudget = toOptionalNumber(state.minBudget);
    const maxBudget = toOptionalNumber(state.maxBudget);
    const estimatedDaysFrom = toOptionalNumber(state.estimatedDaysFrom);
    const estimatedDaysTo = toOptionalNumber(state.estimatedDaysTo);

    return {
      page: state.page,
      size: state.size,
      sortBy: state.sortBy,
      direction: state.direction,
      search: state.search || undefined,
      "filter.status": "PUBLIC",
      "filter.minBudget": minBudget,
      "filter.maxBudget": maxBudget,
      "filter.estimatedDaysFrom": estimatedDaysFrom,
      "filter.estimatedDaysTo": estimatedDaysTo,
    };
  }, [state]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetPublicJobPosts(queryParams);

  const result = data?.result;
  const jobs = useMemo<JobPost[]>(() => result?.data ?? [], [result]);
  const metadata = result?.metadata;
  const totalElements = metadata?.totalElements ?? 0;
  const totalPages = metadata?.totalPages ?? 0;
  const isInitialLoading = isLoading && jobs.length === 0;
  const isEmpty = !isLoading && !isError && jobs.length === 0;
  const isDirty =
    state.search !== DEFAULT_STATE.search ||
    state.minBudget !== DEFAULT_STATE.minBudget ||
    state.maxBudget !== DEFAULT_STATE.maxBudget ||
    state.estimatedDaysFrom !== DEFAULT_STATE.estimatedDaysFrom ||
    state.estimatedDaysTo !== DEFAULT_STATE.estimatedDaysTo ||
    state.sortBy !== DEFAULT_STATE.sortBy ||
    state.direction !== DEFAULT_STATE.direction;

  const resetFilters = () => {
    setState(DEFAULT_STATE);
    setSearchInput(DEFAULT_STATE.search);
  };

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
                Public opportunities
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Jobpost Marketplace
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Discover public AI project briefs, compare budget and timeline,
              and open the detail view before applying in a later phase.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm shadow-slate-200/50">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Public jobposts
            </p>
            <p className="mt-1 text-3xl font-extrabold text-slate-950">
              {totalElements.toLocaleString()}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search public jobposts..."
                  className="h-11 rounded-xl border-slate-200 bg-white pl-10 text-sm shadow-sm focus-visible:border-indigo-400 focus-visible:ring-indigo-100"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select
                  value={state.sortBy}
                  onValueChange={(sortBy) =>
                    setState((current) => ({ ...current, sortBy, page: 0 }))
                  }
                >
                  <SelectTrigger className="h-10 w-[150px] rounded-xl border-slate-200 bg-white">
                    <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={state.direction}
                  onValueChange={(direction) =>
                    setState((current) => ({
                      ...current,
                      direction: direction as JobPostDirection,
                      page: 0,
                    }))
                  }
                >
                  <SelectTrigger className="h-10 w-[140px] rounded-xl border-slate-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESCENDING">Descending</SelectItem>
                    <SelectItem value="ASCENDING">Ascending</SelectItem>
                  </SelectContent>
                </Select>

                {isDirty && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetFilters}
                    className="h-10 rounded-xl px-3 text-xs font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <FilterInput
                label="Min budget"
                value={state.minBudget}
                onChange={(minBudget) =>
                  setState((current) => ({ ...current, minBudget, page: 0 }))
                }
              />
              <FilterInput
                label="Max budget"
                value={state.maxBudget}
                onChange={(maxBudget) =>
                  setState((current) => ({ ...current, maxBudget, page: 0 }))
                }
              />
              <FilterInput
                label="Min days"
                value={state.estimatedDaysFrom}
                onChange={(estimatedDaysFrom) =>
                  setState((current) => ({
                    ...current,
                    estimatedDaysFrom,
                    page: 0,
                  }))
                }
              />
              <FilterInput
                label="Max days"
                value={state.estimatedDaysTo}
                onChange={(estimatedDaysTo) =>
                  setState((current) => ({
                    ...current,
                    estimatedDaysTo,
                    page: 0,
                  }))
                }
              />
            </div>

            <div className="flex min-h-5 items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                Showing{" "}
                <span className="font-bold text-slate-700">
                  {jobs.length.toLocaleString()}
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
          </div>
        </section>

        {isError && (
          <ErrorState
            message={
              error?.response?.data?.message ||
              "Unable to load public jobposts."
            }
            onRetry={() => refetch()}
          />
        )}

        {isInitialLoading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <JobpostCardSkeleton key={index} />
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-2">
              {jobs.map((job) => (
                <ExpertJobpostCard key={job.id} job={job} />
              ))}
            </div>

            <JobpostPagination
              page={state.page}
              size={state.size}
              totalPages={totalPages}
              totalElements={totalElements}
              hasNext={metadata?.hasNext ?? false}
              hasPrevious={metadata?.hasPrevious ?? false}
              onPageChange={(page) =>
                setState((current) => ({ ...current, page }))
              }
            />
          </>
        )}
      </div>
    </main>
  );
}

function FilterInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border-slate-200 bg-white text-sm shadow-sm focus-visible:border-indigo-400 focus-visible:ring-indigo-100"
      />
    </label>
  );
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
        <p className="text-sm font-extrabold">Failed to load marketplace</p>
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

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-8 py-14 text-center shadow-sm shadow-slate-200/50">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Briefcase className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-extrabold tracking-tight text-slate-950">
        No public jobposts found
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        There are no public jobposts matching the current filters. Try clearing
        the search and filters to broaden the marketplace.
      </p>
      <Button
        type="button"
        onClick={onReset}
        className="mt-6 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-5 text-sm font-bold text-white hover:from-indigo-600 hover:to-sky-600"
      >
        Reset filters
      </Button>
    </div>
  );
}

function JobpostCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="mt-5 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 border-y border-slate-100 py-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-20 rounded-lg" />
        <Skeleton className="h-6 w-24 rounded-lg" />
        <Skeleton className="h-6 w-16 rounded-lg" />
      </div>
    </div>
  );
}

function JobpostPagination({
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
        public jobposts
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

function toOptionalNumber(value: string) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0
    ? numberValue
    : undefined;
}
