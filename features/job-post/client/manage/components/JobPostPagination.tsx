"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  totalElements: number;
  size: number;
  onPageChange: (page: number) => void;
};

const buildPageNumbers = (
  current: number,
  total: number,
): (number | "...")[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const pages: (number | "...")[] = [];
  const windowSize = 1;

  // Always show first page
  pages.push(0);

  // Pages before current
  const start = Math.max(1, current - windowSize);
  if (start > 1) {
    pages.push("...");
  }

  for (let i = start; i <= Math.min(total - 2, current + windowSize); i++) {
    pages.push(i);
  }

  // Pages after current
  const end = Math.min(total - 2, current + windowSize);
  if (end < total - 2) {
    pages.push("...");
  }

  if (total > 1) {
    pages.push(total - 1);
  }

  return pages;
};

export function JobPostPagination({
  page,
  totalPages,
  hasNext,
  hasPrevious,
  totalElements,
  size,
  onPageChange,
}: Props) {
  if (totalElements === 0) return null;

  const start = page * size + 1;
  const end = Math.min((page + 1) * size, totalElements);
  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
      <p className="text-xs font-medium text-slate-500">
        Showing{" "}
        <span className="font-bold text-slate-700">
          {start}–{end}
        </span>{" "}
        of{" "}
        <span className="font-bold text-slate-700">
          {totalElements.toLocaleString()}
        </span>{" "}
        posts
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(0)}
          disabled={!hasPrevious}
          className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="First page"
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevious}
          className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) =>
            p === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-xs text-slate-400"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  "h-8 min-w-8 rounded-lg px-2.5 text-xs font-bold transition-all",
                  p === page
                    ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {p + 1}
              </button>
            ),
          )}
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={!hasNext}
          className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Last page"
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
