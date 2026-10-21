"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceDashboard } from "@/services/workspace.service";
import type { WorkspaceDashboardItem } from "@/types/workspace.type";

const PAGE_SIZE = 10;

type WorkspaceRole = "CLIENT" | "EXPERT";

export function WorkspaceProjectsListView({ role = "EXPERT" }: { role?: WorkspaceRole }) {
  const [pageNo, setPageNo] = useState(0);
  const dashboardQuery = useWorkspaceDashboard({ pageNo, pageSize: PAGE_SIZE });
  const page = dashboardQuery.data;
  const projects = page?.content ?? [];

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Workspace dashboard
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {role === "CLIENT" ? "Client Projects" : "Expert Projects"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Project workspaces assigned to your signed-in {role === "CLIENT" ? "Client" : "Expert"} account.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total projects
            </p>
            <p className="mt-1 text-3xl font-extrabold text-slate-950">
              {(page?.totalElements ?? 0).toLocaleString()}
            </p>
          </div>
        </section>

        {dashboardQuery.isError ? (
          <StatePanel
            title="Unable to load projects"
            message={getErrorMessage(dashboardQuery.error)}
            action={
              <Button
                type="button"
                onClick={() => dashboardQuery.refetch()}
                className="mt-5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            }
          />
        ) : dashboardQuery.isLoading ? (
          <ProjectGridSkeleton />
        ) : projects.length === 0 ? (
          <StatePanel
            title="No project workspaces yet"
            message="This account does not have any project workspaces right now."
          />
        ) : (
          <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.workspaceId} project={project} role={role} />
            ))}
          </section>
        )}

        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-500">
            Page <span className="font-extrabold text-slate-950">{(page?.pageNo ?? pageNo) + 1}</span>
            {(page?.totalPages ?? 0) > 0 && (
              <> of <span className="font-extrabold text-slate-950">{page?.totalPages}</span></>
            )}
            {dashboardQuery.isFetching && !dashboardQuery.isLoading && (
              <span className="ml-3 inline-flex items-center gap-1.5 text-indigo-600">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pageNo === 0}
              onClick={() => setPageNo((current) => Math.max(0, current - 1))}
              className="rounded-xl"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!page || page.last}
              onClick={() => setPageNo((current) => current + 1)}
              className="rounded-xl"
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProjectCard({ project, role }: { project: WorkspaceDashboardItem; role: WorkspaceRole }) {
  const partnerName = project.partner?.name?.trim() || "Workspace partner";
  const progress = clamp(project.progressPercentage);

  return (
    <article className="flex min-h-[280px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            {formatLabel(project.projectStatus)}
          </p>
          <h2 className="mt-3 line-clamp-2 text-lg font-extrabold text-slate-950">
            {project.projectName || "Untitled project"}
          </h2>
        </div>
        <FolderKanban className="h-6 w-6 shrink-0 text-slate-500" />
      </div>
      <div className="mt-5">
        <div className="flex justify-between text-xs font-bold text-slate-500">
          <span>Progress</span><span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-indigo-600" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
        <Avatar className="h-10 w-10">
          {project.partner?.avatarUrl && <AvatarImage src={project.partner.avatarUrl} alt={partnerName} />}
          <AvatarFallback>{getInitials(partnerName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{role === "CLIENT" ? "Expert" : "Client"} partner</p>
          <p className="truncate text-sm font-extrabold text-slate-950">{partnerName}</p>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
        <CalendarDays className="h-4 w-4" /> {formatDate(project.deadline)}
      </p>
      <Button asChild className="mt-auto rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
        <Link href={`/${role.toLowerCase()}/dashboard/projects/${encodeURIComponent(project.workspaceId)}`}>
          Open workspace <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </article>
  );
}

function StatePanel({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><AlertTriangle className="mx-auto h-7 w-7 text-amber-600" /><h2 className="mt-4 text-xl font-extrabold text-slate-950">{title}</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{message}</p>{action}</section>;
}

function ProjectGridSkeleton() {
  return <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5"><Skeleton className="h-6 w-28" /><Skeleton className="mt-4 h-6 w-3/4" /><Skeleton className="mt-8 h-2" /><Skeleton className="mt-5 h-16" /></div>)}</section>;
}

function clamp(value: number) { return Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 0; }
function formatLabel(value?: string | null) { return value?.trim().replace(/[_-]+/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Unknown"; }
function formatDate(value?: string | null) { const date = value ? new Date(value) : null; return date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(date) : "No deadline"; }
function getInitials(value: string) { return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "NB"; }
function getErrorMessage(error: unknown) { const apiError = error as { response?: { data?: { message?: string } }; message?: string }; return apiError.response?.data?.message || apiError.message || "The project workspace list could not be loaded. Please try again."; }
