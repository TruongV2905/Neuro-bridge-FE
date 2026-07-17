"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useState } from "react"
import { useSelector } from "react-redux"
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Loader2,
  RefreshCw,
  Star,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { RootState } from "@/redux/store"
import { useProjectRating } from "@/services/rating.service"
import { useProjectDetailByWorkspace } from "@/services/submission-package.service"
import { useWorkspaceDashboard } from "@/services/workspace.service"
import { UserRole, type UserResponse } from "@/types/user/user.type"
import type { WorkspaceDashboardItem } from "@/types/workspace.type"

const PAGE_SIZE = 10

type WorkspaceProjectsListViewProps = {
  role: UserRole.CLIENT | UserRole.EXPERT
}

export function WorkspaceProjectsListView({
  role,
}: WorkspaceProjectsListViewProps) {
  const currentUser = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null
  const [pageNo, setPageNo] = useState(0)
  const dashboardQuery = useWorkspaceDashboard({
    pageNo,
    pageSize: PAGE_SIZE,
  })
  const page = dashboardQuery.data
  const projects = page?.content ?? []
  const isRoleMismatch = currentUser?.role && currentUser.role !== role
  const canGoPrevious = pageNo > 0
  const canGoNext = Boolean(page && !page.last)
  const totalPages = page?.totalPages ?? 0
  const totalElements = page?.totalElements ?? 0
  const displayPage = (page?.pageNo ?? pageNo) + 1
  const detailBasePath =
    role === UserRole.CLIENT
      ? "/client/dashboard/projects"
      : "/expert/dashboard/projects"
  const emptyAction =
    role === UserRole.CLIENT
      ? {
          href: "/client/dashboard/hiring",
          label: "Open Hiring",
        }
      : {
          href: "/expert/dashboard/browse-job-posts",
          label: "Browse Jobposts",
        }
  const title = role === UserRole.CLIENT ? "Client Projects" : "Expert Projects"
  const partnerLabel =
    role === UserRole.CLIENT ? "Expert partner" : "Client partner"

  if (!currentUser?.code || isRoleMismatch) {
    return (
      <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
        <StatePanel
          icon="warning"
          title="Projects unavailable"
          message="Sign in with the matching workspace role to view project Workspaces."
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-md shadow-indigo-500/20">
                Workspace Dashboard
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Authenticated projects
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              View project Workspaces returned for your signed-in account.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm shadow-slate-200/50">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total projects
            </p>
            <p className="mt-1 text-3xl font-extrabold text-slate-950">
              {totalElements.toLocaleString()}
            </p>
          </div>
        </section>

        {dashboardQuery.isError ? (
          <StatePanel
            icon="error"
            title="Unable to load projects"
            message={getErrorMessage(dashboardQuery.error)}
            action={
              <Button
                type="button"
                onClick={() => dashboardQuery.refetch()}
                className="mt-5 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-5 text-sm font-bold text-white"
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
            icon="empty"
            title="No project Workspaces yet"
            message="This account does not have any project Workspaces right now."
            action={
              <Button
                asChild
                className="mt-5 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-5 text-sm font-bold text-white"
              >
                <Link href={emptyAction.href}>{emptyAction.label}</Link>
              </Button>
            }
          />
        ) : (
          <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.workspaceId}
                project={project}
                detailBasePath={detailBasePath}
                partnerLabel={partnerLabel}
                showRating={role === UserRole.EXPERT}
              />
            ))}
          </section>
        )}

        <ProjectPagination
          pageNo={displayPage}
          totalPages={totalPages}
          isFetching={dashboardQuery.isFetching && !dashboardQuery.isLoading}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onPrevious={() => setPageNo((current) => Math.max(0, current - 1))}
          onNext={() => setPageNo((current) => current + 1)}
        />
      </div>
    </main>
  )
}

function ProjectCard({
  project,
  detailBasePath,
  partnerLabel,
  showRating,
}: {
  project: WorkspaceDashboardItem
  detailBasePath: string
  partnerLabel: string
  showRating: boolean
}) {
  const progressValue = getFiniteNumber(project.progressPercentage)
  const visualProgress = clamp(progressValue, 0, 100)
  const statusLabel = formatStatus(project.projectStatus)
  const partnerName = normalizeText(project.partner?.name) || "Workspace partner"
  const partnerRole = formatStatus(project.partner?.role)
  const detailHref = `${detailBasePath}/${encodeURIComponent(project.workspaceId)}`

  return (
    <article className="flex min-h-[280px] flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Badge className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50">
            {statusLabel}
          </Badge>
          <h2 className="mt-3 line-clamp-2 text-lg font-extrabold tracking-tight text-slate-950">
            {project.projectName || "Untitled project"}
          </h2>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <FolderKanban className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Progress</span>
          <span className="text-slate-800">{formatProgress(progressValue)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500"
            style={{ width: `${visualProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
        <Avatar className="h-11 w-11">
          {project.partner?.avatarUrl && (
            <AvatarImage src={project.partner.avatarUrl} alt={partnerName} />
          )}
          <AvatarFallback className="bg-indigo-100 text-xs font-extrabold text-indigo-600">
            {getInitials(partnerName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {partnerLabel}
          </p>
          <p className="truncate text-sm font-extrabold text-slate-950">
            {partnerName}
          </p>
          <p className="text-xs font-semibold text-slate-500">{partnerRole}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
        <CalendarDays className="h-4 w-4 text-slate-400" />
        <span>{formatDeadline(project.deadline)}</span>
      </div>

      {showRating && (
        <ProjectCardRating
          workspaceId={project.workspaceId}
          projectStatus={project.projectStatus}
        />
      )}

      <Button
        asChild
        className="mt-auto h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-sm font-bold text-white"
      >
        <Link href={detailHref}>
          Open Workspace
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </article>
  )
}

function ProjectCardRating({
  workspaceId,
  projectStatus,
}: {
  workspaceId: string
  projectStatus?: string | null
}) {
  const isCompleted = isProjectCompleted(projectStatus)
  const projectDetailQuery = useProjectDetailByWorkspace(
    isCompleted ? workspaceId : "",
  )
  const projectId = projectDetailQuery.data?.result?.projectId ?? ""
  const ratingQuery = useProjectRating(projectId, {
    enabled: isCompleted && Boolean(projectId),
  })
  const isRatingMissing =
    ratingQuery.isError && getErrorStatus(ratingQuery.error) === 404

  if (!isCompleted) {
    return (
      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs font-bold text-slate-500">
        Rating available after completion
      </div>
    )
  }

  if (projectDetailQuery.isLoading || ratingQuery.isLoading) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs font-bold text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
        Loading rating
      </div>
    )
  }

  if (!projectId || isRatingMissing) {
    return (
      <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/80 px-3 py-2 text-xs font-bold text-amber-700">
        No rating yet
      </div>
    )
  }

  if (ratingQuery.isError) {
    return (
      <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/80 px-3 py-2 text-xs font-bold text-rose-700">
        Rating unavailable
      </div>
    )
  }

  const rating = ratingQuery.data

  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50/80 px-3 py-2">
      <div className="flex items-center gap-2">
        <RatingStars value={rating?.score ?? 0} />
        <span className="text-xs font-extrabold text-amber-700">
          {formatScore(rating?.score)} / 5
        </span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
        Rating
      </span>
    </div>
  )
}

function ProjectPagination({
  pageNo,
  totalPages,
  isFetching,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: {
  pageNo: number
  totalPages: number
  isFetching: boolean
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm shadow-slate-200/50 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm font-semibold text-slate-500">
        Page <span className="font-extrabold text-slate-950">{pageNo}</span>
        {totalPages > 0 && (
          <>
            {" "}
            of{" "}
            <span className="font-extrabold text-slate-950">
              {totalPages}
            </span>
          </>
        )}
        {isFetching && (
          <span className="ml-3 inline-flex items-center gap-1.5 text-indigo-600">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Updating
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!canGoPrevious}
          onClick={onPrevious}
          className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!canGoNext}
          onClick={onNext}
          className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </section>
  )
}

function ProjectGridSkeleton() {
  return (
    <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-56" />
            </div>
            <Skeleton className="h-11 w-11 rounded-xl" />
          </div>
          <Skeleton className="mt-6 h-2 rounded-full" />
          <Skeleton className="mt-6 h-20 rounded-2xl" />
          <Skeleton className="mt-5 h-4 w-40" />
          <Skeleton className="mt-6 h-10 rounded-xl" />
        </div>
      ))}
    </section>
  )
}

function StatePanel({
  icon,
  title,
  message,
  action,
}: {
  icon: "empty" | "error" | "warning"
  title: string
  message: string
  action?: ReactNode
}) {
  const Icon = icon === "empty" ? FolderKanban : AlertTriangle
  const tone =
    icon === "error"
      ? "bg-rose-50 text-rose-600"
      : icon === "warning"
        ? "bg-amber-50 text-amber-600"
        : "bg-indigo-50 text-indigo-600"

  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-sm shadow-slate-200/50">
      <span
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${tone}`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-xl font-extrabold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {message}
      </p>
      {action}
    </section>
  )
}

function formatStatus(value?: string | null) {
  const normalized = normalizeText(value)

  if (!normalized) return "Unknown"

  return normalized
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDeadline(value?: string | null) {
  const normalized = normalizeText(value)

  if (!normalized) return "No deadline"

  const timestamp = Date.parse(normalized)

  if (Number.isNaN(timestamp)) return "No deadline"

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(timestamp))
}

function formatProgress(value: number) {
  if (!Number.isFinite(value)) return "0%"

  return `${value}%`
}

function getInitials(value: string) {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  return initials || "NB"
}

function getFiniteNumber(value: number) {
  return Number.isFinite(value) ? value : 0
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function RatingStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1
        const isFilled = value >= starValue
        const isHalfFilled = !isFilled && value >= starValue - 0.5

        return (
          <Star
            key={starValue}
            className={
              isFilled
                ? "h-3.5 w-3.5 fill-amber-400 text-amber-400"
                : isHalfFilled
                  ? "h-3.5 w-3.5 fill-amber-200 text-amber-400"
                  : "h-3.5 w-3.5 text-amber-200"
            }
          />
        )
      })}
    </div>
  )
}

function formatScore(value?: number | null) {
  if (!Number.isFinite(value ?? NaN)) return "0"

  return Number(value).toFixed(1).replace(/\.0$/, "")
}

function isProjectCompleted(value?: string | null) {
  const normalized = value?.trim().toUpperCase()

  return normalized === "COMPLETED" || normalized === "COMPLETE"
}

function normalizeText(value?: string | null) {
  return typeof value === "string" ? value.trim() : ""
}

function getErrorStatus(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    return (
      error as {
        response?: {
          status?: number
        }
      }
    ).response?.status
  }

  return undefined
}

function getErrorMessage(error: unknown) {
  const apiError = error as {
    response?: { data?: { message?: string } }
    message?: string
  }

  return (
    apiError.response?.data?.message ||
    apiError.message ||
    "The project Workspace list could not be loaded. Please try again."
  )
}
