"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CircleDollarSign,
  Filter,
  Loader2,
  RefreshCw,
  Search as SearchIcon,
  Sliders,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  JOB_POST_STATUS_META,
  SORT_OPTIONS,
  PAGE_SIZE_OPTIONS,
  type SortOption,
} from "../_constants/my-job-post.constants";

import { cn } from "@/lib/utils";
import { JobPostDirection, JobPostStatus } from "@/types/job-post.type";

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

type Props = {
  value: FilterState;
  onChange: (value: FilterState) => void;
  onReset: () => void;
  totalElements: number;
  isLoading: boolean;
};

const formatCompact = (value: number) =>
  value >= 1000 ? `$${(value / 1000).toFixed(0)}K` : `$${value}`;

const fingerprint = (v: FilterState) =>
  `${v.status}|${v.sortBy}|${v.direction}|${v.size}|${v.search}|${v.minBudget}|${v.maxBudget}|${v.estimatedDaysFrom}|${v.estimatedDaysTo}`;

const areFiltersEqual = (a: FilterState, b: FilterState) =>
  a.status === b.status &&
  a.sortBy === b.sortBy &&
  a.direction === b.direction &&
  a.size === b.size &&
  a.search === b.search &&
  a.minBudget === b.minBudget &&
  a.maxBudget === b.maxBudget &&
  a.estimatedDaysFrom === b.estimatedDaysFrom &&
  a.estimatedDaysTo === b.estimatedDaysTo;

export function MyJobPostFilterBar({
  value,
  onChange,
  onReset,
  totalElements,
  isLoading,
}: Props) {
  const [searchInput, setSearchInput] = useState(value.search);
  const [filterOpen, setFilterOpen] = useState(false);

  // Debounce search input → push to filter state after 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== value.search) {
        onChange({ ...value, search: searchInput, page: 0 });
      }
    }, 400);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (value.minBudget > 0 || value.maxBudget > 0) count++;
    if (value.estimatedDaysFrom > 0 || value.estimatedDaysTo > 0) count++;
    if (value.status && value.status !== "PRIVATE") count++;
    return count;
  }, [value]);

  const isDirty = !areFiltersEqual(value, {
    ...value,
    status: "PRIVATE",
    search: "",
    minBudget: 0,
    maxBudget: 0,
    estimatedDaysFrom: 0,
    estimatedDaysTo: 0,
  });

  return (
    <div className="space-y-4">
      {/* Top row: search + controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, description…"
            className="h-11 rounded-xl border-slate-200 bg-white pl-10 pr-10 text-sm shadow-sm shadow-slate-200/50 transition-all focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-100"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sort */}
          <Select
            value={value.sortBy}
            onValueChange={(v) => onChange({ ...value, sortBy: v, page: 0 })}
          >
            <SelectTrigger className="h-10 min-w-[170px] rounded-xl border-slate-200 bg-white text-sm shadow-sm shadow-slate-200/50">
              <Sliders className="mr-1.5 h-4 w-4 text-slate-400" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt: SortOption) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Direction */}
          <Select
            value={value.direction}
            onValueChange={(v) =>
              onChange({
                ...value,
                direction: v as JobPostDirection,
                page: 0,
              })
            }
          >
            <SelectTrigger className="h-10 w-[120px] rounded-xl border-slate-200 bg-white text-sm capitalize shadow-sm shadow-slate-200/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASCENDING">Ascending</SelectItem>
              <SelectItem value="DESCENDING">Descending</SelectItem>
            </SelectContent>
          </Select>

          {/* Page size */}
          <Select
            value={String(value.size)}
            onValueChange={(v) =>
              onChange({ ...value, size: Number(v), page: 0 })
            }
          >
            <SelectTrigger className="h-10 w-[110px] rounded-xl border-slate-200 bg-white text-sm shadow-sm shadow-slate-200/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((s: number) => (
                <SelectItem key={s} value={String(s)}>
                  {s} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter popover */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="relative h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200/50 hover:bg-indigo-50/50 hover:text-indigo-600"
              >
                <Filter className="mr-1.5 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-1.5 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-[360px] rounded-2xl border-slate-200/80 bg-white p-0 shadow-xl shadow-slate-200/60"
            >
              <FilterPanel
                key={fingerprint(value)}
                value={value}
                onApply={(next) => {
                  onChange({ ...next, page: 0 });
                  setFilterOpen(false);
                }}
                onReset={() => {
                  onReset();
                  setFilterOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>

          {isDirty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-10 rounded-xl px-3 text-xs font-semibold text-rose-500 hover:bg-rose-50 hover:text-rose-600"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Active status pill row + total count */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusChips
          current={value.status}
          onChange={(status) => onChange({ ...value, status, page: 0 })}
        />
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          {isLoading && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
          )}
          <span>
            Showing{" "}
            <span className="font-bold text-slate-700">
              {totalElements.toLocaleString()}
            </span>{" "}
            job post{totalElements === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatusChips({
  current,
  onChange,
}: {
  current: JobPostStatus;
  onChange: (value: JobPostStatus) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {JOB_POST_STATUS_META.map((status: typeof JOB_POST_STATUS_META[number]) => {
        const isActive = current === status.value;
        const Icon = status.icon;
        return (
          <motion.button
            key={status.value}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(status.value)}
            className={cn(
              "group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
              isActive
                ? "border-transparent bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/30"
                : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-600",
            )}
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5 transition-transform group-hover:scale-110",
                isActive && "drop-shadow",
              )}
            />
            {status.label}
          </motion.button>
        );
      })}
    </div>
  );
}

function FilterPanel({
  value,
  onApply,
  onReset,
}: {
  value: FilterState;
  onApply: (next: FilterState) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState<FilterState>(value);

  const budgetMax = 100000;
  const daysMax = 180;

  return (
    <div className="space-y-5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-800">Advanced filters</p>
          <p className="text-xs text-slate-500">Refine the listings shown</p>
        </div>
        <Badge
          variant="outline"
          className="rounded-full border-indigo-200 bg-indigo-50 text-[10px] uppercase tracking-wider text-indigo-600"
        >
          Fine-tune
        </Badge>
      </div>

      {/* Budget range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <CircleDollarSign className="h-3.5 w-3.5 text-emerald-500" />
            Budget range (USD)
          </Label>
          <span className="text-xs font-semibold text-slate-700">
            {formatCompact(draft.minBudget)} –{" "}
            {draft.maxBudget >= budgetMax
              ? `${formatCompact(budgetMax)}+`
              : formatCompact(draft.maxBudget)}
          </span>
        </div>
        <div className="px-1">
          <Slider
            min={0}
            max={budgetMax}
            step={1000}
            value={[draft.minBudget, draft.maxBudget]}
            onValueChange={(v) =>
              setDraft({ ...draft, minBudget: v[0], maxBudget: v[1] })
            }
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={draft.minBudget}
            onChange={(e) =>
              setDraft({
                ...draft,
                minBudget: Math.max(0, Number(e.target.value || 0)),
              })
            }
            className="h-8 rounded-lg border-slate-200 text-xs"
            placeholder="Min"
          />
          <span className="text-xs text-slate-400">–</span>
          <Input
            type="number"
            min={0}
            value={draft.maxBudget}
            onChange={(e) =>
              setDraft({
                ...draft,
                maxBudget: Math.max(0, Number(e.target.value || 0)),
              })
            }
            className="h-8 rounded-lg border-slate-200 text-xs"
            placeholder="Max"
          />
        </div>
      </div>

      {/* Timeline range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
            Timeline (days)
          </Label>
          <span className="text-xs font-semibold text-slate-700">
            {draft.estimatedDaysFrom || 0} –{" "}
            {draft.estimatedDaysTo >= daysMax
              ? `${daysMax}+`
              : draft.estimatedDaysTo || 0}
            {" days"}
          </span>
        </div>
        <div className="px-1">
          <Slider
            min={0}
            max={daysMax}
            step={1}
            value={[draft.estimatedDaysFrom, draft.estimatedDaysTo]}
            onValueChange={(v) =>
              setDraft({
                ...draft,
                estimatedDaysFrom: v[0],
                estimatedDaysTo: v[1],
              })
            }
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={0}
            value={draft.estimatedDaysFrom}
            onChange={(e) =>
              setDraft({
                ...draft,
                estimatedDaysFrom: Math.max(0, Number(e.target.value || 0)),
              })
            }
            className="h-8 rounded-lg border-slate-200 text-xs"
            placeholder="From"
          />
          <Input
            type="number"
            min={0}
            value={draft.estimatedDaysTo}
            onChange={(e) =>
              setDraft({
                ...draft,
                estimatedDaysTo: Math.max(0, Number(e.target.value || 0)),
              })
            }
            className="h-8 rounded-lg border-slate-200 text-xs"
            placeholder="To"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-9 rounded-lg px-3 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          Reset all
        </Button>
        <Button
          type="button"
          onClick={() => onApply(draft)}
          className="h-9 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-5 text-xs font-bold text-white shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-violet-600"
        >
          Apply filters
        </Button>
      </div>
    </div>
  );
}
