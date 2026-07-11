"use client";

import Link from "next/link";
import { ArrowUpRight, Briefcase, Clock4, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { JobPost } from "@/types/job-post.type";
import { cn } from "@/lib/utils";
import {
  formatBudgetRange,
  formatTimeline,
  getSkillLabel,
  getStatusLabel,
  getStatusTone,
} from "./marketplace.utils";

type ExpertJobpostCardProps = {
  job: JobPost;
};

export function ExpertJobpostCard({ job }: ExpertJobpostCardProps) {
  const requiredSkillIds = job.requiredSkillIds ?? [];
  const preferredSkillIds = job.preferredSkillIds ?? [];
  const visibleSkills = [
    ...requiredSkillIds.map((id) => ({ id, kind: "Required" })),
    ...preferredSkillIds.map((id) => ({ id, kind: "Preferred" })),
  ].slice(0, 5);
  const remainingSkillCount =
    requiredSkillIds.length + preferredSkillIds.length - visibleSkills.length;

  return (
    <article className="group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 opacity-80" />

      <div className="flex items-start justify-between gap-3">
        <h2 className="line-clamp-2 text-lg font-extrabold tracking-tight text-slate-950 transition-colors group-hover:text-indigo-600">
          {job.title}
        </h2>
        <Badge
          variant="outline"
          className={cn(
            "h-6 shrink-0 rounded-full px-2.5 text-[11px] font-bold",
            getStatusTone(job.status),
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {getStatusLabel(job.status)}
        </Badge>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
        {job.description}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-100 py-4">
        <Metric
          icon={Briefcase}
          label="Budget"
          value={formatBudgetRange(job.budgetFrom, job.budgetTo)}
        />
        <Metric
          icon={Clock4}
          label="Duration"
          value={formatTimeline(job.estimatedDays)}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {visibleSkills.length > 0 ? (
          <>
            {visibleSkills.map((skill) => (
              <Badge
                key={`${skill.kind}-${skill.id}`}
                variant="outline"
                className={cn(
                  "h-6 rounded-lg px-2 text-[11px] font-bold",
                  skill.kind === "Required"
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-sky-200 bg-sky-50 text-sky-700",
                )}
              >
                <Sparkles className="h-3 w-3" />
                {getSkillLabel(skill.id)}
              </Badge>
            ))}
            {remainingSkillCount > 0 && (
              <Badge
                variant="outline"
                className="h-6 rounded-lg border-slate-200 bg-slate-50 px-2 text-[11px] font-bold text-slate-500"
              >
                +{remainingSkillCount} more
              </Badge>
            )}
          </>
        ) : (
          <span className="text-xs font-medium text-slate-400">
            No skill requirements listed
          </span>
        )}
      </div>

      <div className="mt-auto flex justify-end pt-5">
        <Button
          asChild
          className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 text-sm font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-sky-600"
        >
          <Link href={`/expert/dashboard/jobpost/${job.id}`}>
            View Details
            <ArrowUpRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-extrabold text-slate-900" title={value}>
        {value}
      </p>
    </div>
  );
}
