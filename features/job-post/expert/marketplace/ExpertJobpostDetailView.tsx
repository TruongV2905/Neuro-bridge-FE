"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock4,
  FileText,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetJobPostById } from "@/services/job-post.service";
import type { JobPost } from "@/types/job-post.type";
import type { RootState } from "@/redux/store";
import type { UserResponse } from "@/types/user/user.type";
import { cn } from "@/lib/utils";
import {
  formatBudgetRange,
  formatTimeline,
  getSkillLabel,
  getStatusLabel,
  getStatusTone,
} from "./marketplace.utils";
import { ExpertApplyTypeDialog } from "./components/ExpertApplyTypeDialog";

export function ExpertJobpostDetailView() {
  const params = useParams<{ id?: string | string[] }>();
  const jobId = Array.isArray(params.id) ? params.id[0] : params.id ?? "";
  const currentUser = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null;
  const expertCode = currentUser?.code ?? "";
  const [applyDialogOpen, setApplyDialogOpen] = React.useState(false);
  const [hasSubmittedApply, setHasSubmittedApply] = React.useState(false);

  const { data, isLoading, isError, error, refetch } = useGetJobPostById(
    { id: jobId },
    { enabled: !!jobId },
  );

  const job = data?.result;
  const hasAlreadyApplied = Boolean(
    hasSubmittedApply ||
      (job && expertCode && job.expertApplyCodes?.includes(expertCode)),
  );
  const isPublicJob = job?.status === "PUBLIC";
  const applyDisabledReason = !isPublicJob
    ? "This jobpost is no longer public."
    : !expertCode
      ? "Unable to apply because expert profile code is missing."
      : hasAlreadyApplied
        ? "Already applied"
        : "";

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!jobId || isError || !job) {
    return (
      <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700">
          <p className="text-lg font-extrabold">Unable to load jobpost</p>
          <p className="mt-2 text-sm">
            {error?.response?.data?.message ||
              "The selected jobpost could not be found."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              className="rounded-xl border-rose-200 bg-white text-rose-600 hover:bg-rose-100"
            >
              Retry
            </Button>
            <Button asChild className="rounded-xl">
              <Link href="/expert/dashboard">Back to Marketplace</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
              <Link
                href="/expert/dashboard"
                className="transition hover:text-indigo-600"
              >
                Marketplace
              </Link>
              <span>/</span>
              <span className="truncate text-slate-800">{job.title}</span>
            </div>
            <h1 className="mt-3 line-clamp-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {job.title}
            </h1>
          </div>

          <Button
            variant="outline"
            asChild
            className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Link href="/expert/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <HeroCard job={job} />
            <DetailsCard job={job} />
          </section>

          <aside className="space-y-6">
            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
              <CardHeader className="border-b border-slate-100 px-6 py-5">
                <CardTitle className="text-base font-extrabold tracking-tight text-slate-950">
                  Opportunity Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <SummaryRow
                  icon={Briefcase}
                  label="Budget"
                  value={formatBudgetRange(job.budgetFrom, job.budgetTo)}
                />
                <SummaryRow
                  icon={CalendarDays}
                  label="Estimated duration"
                  value={formatTimeline(job.estimatedDays)}
                />
                <SummaryRow
                  icon={Users}
                  label="Applications recorded"
                  value={String(job.expertApplyCodes?.length ?? 0)}
                />

                {hasAlreadyApplied ? (
                  <ApplyStatusMessage
                    tone="success"
                    title="Already applied"
                    message="Your application has been recorded for this jobpost."
                  />
                ) : applyDisabledReason ? (
                  <ApplyStatusMessage
                    tone="warning"
                    title="Application unavailable"
                    message={applyDisabledReason}
                  />
                ) : (
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                    <p className="text-sm font-extrabold text-slate-950">
                      Ready to apply?
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Submit a proposal with your budget, timeline, and
                      strategy for this jobpost.
                    </p>
                  </div>
                )}

                <Button
                  type="button"
                  disabled={!!applyDisabledReason}
                  onClick={() => setApplyDialogOpen(true)}
                  className={cn(
                    "h-11 w-full rounded-xl text-sm font-bold",
                    applyDisabledReason
                      ? "bg-slate-200 text-slate-500"
                      : "bg-gradient-to-r from-indigo-500 to-sky-500 text-white hover:from-indigo-600 hover:to-sky-600",
                  )}
                >
                  {hasAlreadyApplied ? "Already applied" : "Apply Now"}
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <ExpertApplyTypeDialog
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
        job={job}
        expertCode={expertCode}
        onVerifyApplied={async () => {
          const refreshedJob = await refetch();
          const hasApplied = Boolean(
            expertCode &&
              refreshedJob.data?.result.expertApplyCodes?.includes(expertCode),
          );

          if (hasApplied) {
            setHasSubmittedApply(true);
          }

          return hasApplied;
        }}
        onSuccess={() => {
          setHasSubmittedApply(true);
          refetch();
        }}
      />
    </main>
  );
}

function ApplyStatusMessage({
  tone,
  title,
  message,
}: {
  tone: "success" | "warning";
  title: string;
  message: string;
}) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border p-4",
        tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700",
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-extrabold">{title}</p>
        <p className="mt-1 text-xs font-semibold leading-5">{message}</p>
      </div>
    </div>
  );
}

function HeroCard({ job }: { job: JobPost }) {
  return (
    <Card className="relative overflow-hidden rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400" />
      <CardContent className="p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "h-7 rounded-full px-3 text-[11px] font-bold",
              getStatusTone(job.status),
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {getStatusLabel(job.status)}
          </Badge>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Read-only marketplace detail
          </span>
        </div>

        <p className="mt-5 max-w-4xl text-sm leading-7 text-slate-500">
          {job.description}
        </p>

        <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <HeroMetric
            icon={Briefcase}
            label="Budget"
            value={formatBudgetRange(job.budgetFrom, job.budgetTo)}
          />
          <HeroMetric
            icon={Clock4}
            label="Estimated days"
            value={formatTimeline(job.estimatedDays)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function DetailsCard({ job }: { job: JobPost }) {
  return (
    <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
      <CardHeader className="border-b border-slate-100 px-6 py-5">
        <CardTitle className="flex items-center gap-2 text-base font-extrabold tracking-tight text-slate-950">
          <FileText className="h-5 w-5 text-indigo-500" />
          Jobpost Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-7 p-6">
        <section>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
            Description
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
            {job.description}
          </p>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <SkillGroup
            title="Required skills"
            ids={job.requiredSkillIds ?? []}
            tone="indigo"
          />
          <SkillGroup
            title="Preferred skills"
            ids={job.preferredSkillIds ?? []}
            tone="sky"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SkillGroup({
  title,
  ids,
  tone,
}: {
  title: string;
  ids: number[];
  tone: "indigo" | "sky";
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
        <Sparkles
          className={cn(
            "h-4 w-4",
            tone === "indigo" ? "text-indigo-500" : "text-sky-500",
          )}
        />
        {title}
      </h3>

      <div className="mt-3 flex flex-wrap gap-2">
        {ids.length > 0 ? (
          ids.map((id) => (
            <Badge
              key={id}
              variant="outline"
              className={cn(
                "h-7 rounded-lg px-2.5 text-xs font-bold",
                tone === "indigo"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-sky-200 bg-sky-50 text-sky-700",
              )}
            >
              {getSkillLabel(id)}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-slate-400">No skills listed</span>
        )}
      </div>
    </section>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-xl font-extrabold text-slate-950">{value}</p>
      </div>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-extrabold text-slate-950">
          {value}
        </p>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-10 w-2/3" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-96 rounded-3xl" />
          </div>
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    </main>
  );
}
