"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Briefcase,
  Clock4,
  MoreHorizontal,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatBudgetRange,
  formatTimeline,
  getStatusMeta,
} from "../_constants/my-job-post.constants";
import { cn } from "@/lib/utils";
import { JobPostListItem } from "@/types/job-post.type";

type Props = {
  job: JobPostListItem;
  index?: number;
};

export function JobPostCard({ job, index = 0 }: Props) {
  const meta = getStatusMeta(job.status);
  const StatusIcon = meta.icon;
  const requiredCount = job.requiredSkillIds?.length ?? 0;
  const preferredCount = job.preferredSkillIds?.length ?? 0;
  const applicants = job.expertApplyCodes?.length ?? 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.04, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -4 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40 transition-all duration-300 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10"
    >
      {/* Top gradient strip */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80",
          meta.tone,
        )}
      />

      {/* Status + menu */}
      <header className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
            meta.pill,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
          {meta.label}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
              aria-label="Job actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
              <Link href={`/client/dashboard/my-job-post/${job.id}`}>
                <Briefcase className="h-3.5 w-3.5" />
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Sparkles className="h-3.5 w-3.5" />
              Edit listing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="h-3.5 w-3.5" />
              Manage applicants
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="text-rose-500 data-[variant=destructive]:text-rose-500"
            >
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Title + description */}
      <div className="mt-3 flex-1">
        <h3 className="line-clamp-2 text-base font-extrabold tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-indigo-600">
          {job.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">
          {job.description}
        </p>
      </div>

      {/* Skills summary */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {requiredCount > 0 && (
          <Badge
            variant="outline"
            className="rounded-lg border-indigo-200 bg-indigo-50/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600"
          >
            <Sparkles className="mr-1 h-2.5 w-2.5" />
            {requiredCount} required
          </Badge>
        )}
        {preferredCount > 0 && (
          <Badge
            variant="outline"
            className="rounded-lg border-violet-200 bg-violet-50/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-600"
          >
            {preferredCount} preferred
          </Badge>
        )}
      </div>

      {/* Footer metadata */}
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
        <Metric
          icon={Clock4}
          label="Timeline"
          value={formatTimeline(job.estimatedDays)}
        />
        <Metric
          icon={Users}
          label="Applicants"
          value={String(applicants)}
          highlight
        />
        <Metric
          icon={Briefcase}
          label="Budget"
          value={formatBudgetRange(job.budgetFrom, job.budgetTo)}
        />
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-9 rounded-xl px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          <Link href={`/client/dashboard/my-job-post/${job.id}`}>
            View details
            <ArrowUpRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Button>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold",
            meta.iconBg,
            meta.iconColor,
          )}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {meta.label}
        </div>
      </div>
    </motion.article>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <span
        className={cn(
          "truncate text-xs font-bold",
          highlight ? "text-indigo-600" : "text-slate-800",
        )}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

export function JobPostCardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    </div>
  );
}
