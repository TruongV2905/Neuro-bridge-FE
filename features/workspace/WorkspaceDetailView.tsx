"use client"

import type { ComponentType, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { RootState } from "@/redux/store"
import { useWorkspaceDetail } from "@/services/workspace.service"
import type {
  WorkspaceDetail,
  WorkspaceParticipant,
} from "@/types/workspace.type"
import { UserRole, type UserResponse } from "@/types/user/user.type"

import { ClientProjectSubmissionPanel } from "./submission/components/ClientProjectSubmissionPanel"
import { ProjectSubmissionPanel } from "./submission/components/ProjectSubmissionPanel"

type WorkspaceDetailViewProps = {
  workspaceId: string
}

type WorkspaceAction = {
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  state: string
}

export function WorkspaceDetailView({
  workspaceId,
}: WorkspaceDetailViewProps) {
  const router = useRouter()
  const normalizedWorkspaceId = workspaceId.trim()
  const user = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null
  const role = user?.role

  const workspaceQuery = useWorkspaceDetail(normalizedWorkspaceId)
  const workspace = workspaceQuery.data
  const handleBack = () => {
    const projectBaseRoute = getProjectBaseRoute(role)

    if (projectBaseRoute) {
      router.push(projectBaseRoute)
      return
    }

    router.back()
  }

  if (!normalizedWorkspaceId) {
    return (
      <WorkspacePageShell>
        <WorkspaceStateCard
          tone="warning"
          title="Invalid workspace"
          message="The workspace link is missing a valid workspace ID."
          onBack={handleBack}
        />
      </WorkspacePageShell>
    )
  }

  if (workspaceQuery.isLoading) {
    return (
      <WorkspacePageShell>
        <WorkspaceLoadingState />
      </WorkspacePageShell>
    )
  }

  if (workspaceQuery.isError) {
    return (
      <WorkspacePageShell>
        <WorkspaceStateCard
          tone="error"
          title="Unable to load workspace"
          message={
            workspaceQuery.error.response?.data?.message ??
            workspaceQuery.error.message ??
            "Please try again."
          }
          actionLabel="Retry"
          onAction={() => workspaceQuery.refetch()}
          onBack={handleBack}
        />
      </WorkspacePageShell>
    )
  }

  if (!workspace) {
    return (
      <WorkspacePageShell>
        <WorkspaceStateCard
          tone="warning"
          title="Workspace unavailable"
          message="No workspace detail was returned for this ID."
          onBack={handleBack}
        />
      </WorkspacePageShell>
    )
  }

  const progress = getProgressMeta(workspace.progressPercentage)

  return (
    <WorkspacePageShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <WorkspaceHeader
          workspace={workspace}
          progress={progress}
          onBack={handleBack}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
          <div className="space-y-6">
            <WorkspaceOverview
              workspace={workspace}
              progress={progress}
            />
            <WorkspaceMembers workspace={workspace} />
            <WorkspaceStrategySection />
            <WorkspaceFinancialSection
              escrowId={workspace.escrowId}
            />
          </div>

          <div className="space-y-6">
            <WorkspaceQuickActions />
            <WorkspaceSubmissionSection
              workspaceId={workspace.workspaceId}
              role={role}
            />
          </div>
        </div>
      </div>
    </WorkspacePageShell>
  )
}

function WorkspacePageShell({
  children,
}: {
  children: ReactNode
}) {
  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      {children}
    </main>
  )
}

function WorkspaceHeader({
  workspace,
  progress,
  onBack,
}: {
  workspace: WorkspaceDetail
  progress: ProgressMeta
  onBack: () => void
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm shadow-slate-200/40">
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400" />
      <div className="p-6 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1 transition hover:text-indigo-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <span>/</span>
              <span className="text-slate-800">Workspace</span>
            </div>

            <h1 className="mt-3 max-w-4xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {workspace.projectName || "Untitled workspace"}
            </h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge
                label={`Workspace ${formatStatus(workspace.status)}`}
                tone="indigo"
              />
              <StatusBadge
                label={`Project ${formatStatus(workspace.projectStatus)}`}
                tone="sky"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
            <HeaderMetric
              icon={CalendarDays}
              label="Start"
              value={formatDate(workspace.startDate) ?? "Not available"}
            />
            <HeaderMetric
              icon={CalendarDays}
              label="Deadline"
              value={formatDate(workspace.deadline) ?? "Not available"}
            />
            <HeaderMetric
              icon={Activity}
              label="Progress"
              value={progress.label}
              highlight
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <MemberInline
            participant={workspace.client}
            roleLabel="Client"
          />
          <MemberInline
            participant={workspace.expert}
            roleLabel="Expert"
          />
        </div>
      </div>
    </section>
  )
}

function WorkspaceOverview({
  workspace,
  progress,
}: {
  workspace: WorkspaceDetail
  progress: ProgressMeta
}) {
  return (
    <WorkspaceCard
      icon={BriefcaseBusiness}
      title="Project Overview"
      description="Verified workspace details from the active project."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailTile label="Project" value={workspace.projectName} />
        <DetailTile label="Workspace status" value={formatStatus(workspace.status)} />
        <DetailTile label="Project status" value={formatStatus(workspace.projectStatus)} />
        <DetailTile label="Created" value={formatDate(workspace.createdAt) ?? "Not available"} />
        <DetailTile label="Start date" value={formatDate(workspace.startDate) ?? "Not available"} />
        <DetailTile label="Deadline" value={formatDate(workspace.deadline) ?? "Not available"} />
        <DetailTile label="Workspace ref" value={shortId(workspace.workspaceId)} />
        <DetailTile label="Job ref" value={shortId(workspace.jobId)} />
        <DetailTile label="Escrow ref" value={shortId(workspace.escrowId)} />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-slate-900">
              Project progress
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Progress is provided by the Workspace API and is not calculated from submission files.
            </p>
          </div>
          <span className="text-lg font-extrabold text-indigo-600">
            {progress.label}
          </span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500"
            style={{ width: `${progress.clamped}%` }}
          />
        </div>
        <p className="mt-3 text-xs font-semibold text-slate-500">
          Current project status: {formatStatus(workspace.projectStatus)}
        </p>
      </div>
    </WorkspaceCard>
  )
}

function WorkspaceMembers({
  workspace,
}: {
  workspace: WorkspaceDetail
}) {
  return (
    <WorkspaceCard
      icon={Users}
      title="Members"
      description="Workspace participants confirmed by the Workspace Detail API."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <MemberCard participant={workspace.client} roleLabel="Client" />
        <MemberCard participant={workspace.expert} roleLabel="Expert" />
      </div>
    </WorkspaceCard>
  )
}

function WorkspaceQuickActions() {
  const actions: WorkspaceAction[] = [
    {
      title: "Open Chat",
      description: "Workspace chat session creation will be connected in the next phase.",
      icon: MessageCircle,
      state: "Not connected",
    },
    {
      title: "Proposal Strategy",
      description: "Collaborative strategy editing needs a Workspace-specific API.",
      icon: Sparkles,
      state: "Pending API",
    },
    {
      title: "View Contract",
      description: "Contract navigation needs a contract ID in Workspace data.",
      icon: FileText,
      state: "Unavailable",
    },
  ]

  return (
    <WorkspaceCard
      icon={ShieldCheck}
      title="Quick Actions"
      description="Prepared integration points without calling unsupported APIs."
    >
      <div className="grid gap-3">
        {actions.map((action) => (
          <button
            key={action.title}
            type="button"
            disabled
            className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 text-left opacity-80"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
              <action.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-extrabold text-slate-900">
                  {action.title}
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {action.state}
                </span>
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {action.description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </WorkspaceCard>
  )
}

function WorkspaceSubmissionSection({
  workspaceId,
  role,
}: {
  workspaceId: string
  role?: UserRole
}) {
  const isClient = role === UserRole.CLIENT
  const isExpert = role === UserRole.EXPERT

  return (
    <WorkspaceCard
      icon={PackageCheck}
      title="Submission Package"
      description="Real submission package tools scoped to this workspace."
    >
      {isExpert ? (
        <SubmissionPanelFrame>
          <ProjectSubmissionPanel workspaceId={workspaceId} />
        </SubmissionPanelFrame>
      ) : isClient ? (
        <SubmissionPanelFrame>
          <ClientProjectSubmissionPanel workspaceId={workspaceId} />
        </SubmissionPanelFrame>
      ) : (
        <SectionNotice
          tone="warning"
          title="Submission unavailable"
          message="This role cannot use submission actions from the frontend."
        />
      )}
    </WorkspaceCard>
  )
}

function WorkspaceStrategySection() {
  return (
    <WorkspaceCard
      icon={Sparkles}
      title="Proposal Strategy"
      description="A Workspace-specific strategy contract has not been connected yet."
    >
      <SectionNotice
        title="Strategy workspace is pending"
        message="This section is reserved for future collaborative strategy updates. No Apply Proposal or Proposal Unlock API is reused here."
      />
    </WorkspaceCard>
  )
}

function WorkspaceFinancialSection({
  escrowId,
}: {
  escrowId: string
}) {
  return (
    <WorkspaceCard
      icon={WalletCards}
      title="Escrow & Payout"
      description="Escrow release credits the Expert Wallet. Withdrawal is a separate wallet-to-bank request."
    >
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <DetailTile label="Escrow ref" value={shortId(escrowId)} />
        <SectionNotice
          title="Financial data pending"
          message="Contract amount, escrow funded amount, released amount, payout, platform fee and release condition are not returned by Workspace Detail yet."
        />
      </div>
    </WorkspaceCard>
  )
}

function SubmissionPanelFrame({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="[&>aside]:!flex [&>aside]:!h-[640px] [&>aside]:!w-full [&>aside]:!rounded-2xl [&>aside]:!border-slate-200/70 [&>aside]:!shadow-sm">
      {children}
    </div>
  )
}

function WorkspaceCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white shadow-sm shadow-slate-200/40">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-slate-950">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  )
}

function HeaderMetric({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p
        className={cn(
          "mt-2 truncate text-sm font-extrabold",
          highlight ? "text-indigo-600" : "text-slate-900",
        )}
        title={value}
      >
        {value}
      </p>
    </div>
  )
}

function DetailTile({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-extrabold text-slate-900">
        {value?.trim() || "Not available"}
      </p>
    </div>
  )
}

function MemberInline({
  participant,
  roleLabel,
}: {
  participant: WorkspaceParticipant
  roleLabel: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
      <ParticipantAvatar participant={participant} />
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold text-slate-900">
          {participant.name || "Unknown member"}
        </p>
        <p className="text-xs font-semibold text-slate-400">
          {roleLabel}
        </p>
      </div>
    </div>
  )
}

function MemberCard({
  participant,
  roleLabel,
}: {
  participant: WorkspaceParticipant
  roleLabel: string
}) {
  return (
    <article className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-5">
      <div className="flex items-center gap-4">
        <ParticipantAvatar participant={participant} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-base font-extrabold text-slate-950">
            {participant.name || "Unknown member"}
          </p>
          <StatusBadge label={roleLabel} tone={roleLabel === "Client" ? "indigo" : "sky"} />
        </div>
      </div>
    </article>
  )
}

function ParticipantAvatar({
  participant,
  size = "default",
}: {
  participant: WorkspaceParticipant
  size?: "default" | "lg"
}) {
  const name = participant.name || "Member"
  const avatarUrl = participant.avatarUrl?.trim() || undefined

  return (
    <Avatar size={size} className={size === "lg" ? "h-14 w-14" : "h-11 w-11"}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
      <AvatarFallback className="bg-indigo-50 font-bold text-indigo-600">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

function StatusBadge({
  label,
  tone,
}: {
  label: string
  tone: "indigo" | "sky"
}) {
  const toneClassName =
    tone === "indigo"
      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
      : "border-sky-200 bg-sky-50 text-sky-700"

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-[11px] font-bold uppercase tracking-wider",
        toneClassName,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

function SectionNotice({
  title,
  message,
  tone = "neutral",
}: {
  title: string
  message: string
  tone?: "neutral" | "warning"
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border p-4",
        tone === "warning"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-slate-200 bg-slate-50 text-slate-600",
      )}
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-extrabold">{title}</p>
        <p className="mt-1 text-xs font-semibold leading-5">
          {message}
        </p>
      </div>
    </div>
  )
}

function WorkspaceStateCard({
  tone,
  title,
  message,
  actionLabel,
  onAction,
  onBack,
}: {
  tone: "warning" | "error"
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  onBack?: () => void
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
      <div
        className={cn(
          "w-full rounded-3xl border bg-white p-8 text-center shadow-sm",
          tone === "error" ? "border-rose-200" : "border-amber-200",
        )}
      >
        <span
          className={cn(
            "mx-auto flex h-12 w-12 items-center justify-center rounded-2xl",
            tone === "error"
              ? "bg-rose-50 text-rose-600"
              : "bg-amber-50 text-amber-600",
          )}
        >
          <AlertCircle className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-extrabold text-slate-950">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {message}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-10 rounded-xl"
            >
              Back
            </Button>
          )}
          {onAction && (
            <Button
              type="button"
              onClick={onAction}
              className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 text-white"
            >
              {actionLabel ?? "Try again"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function WorkspaceLoadingState() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white p-7 shadow-sm">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="mt-4 h-10 w-3/4" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="space-y-6">
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-[640px] rounded-3xl" />
        </div>
      </div>
    </div>
  )
}

type ProgressMeta = {
  label: string
  clamped: number
}

function getProgressMeta(value: number): ProgressMeta {
  if (!Number.isFinite(value)) {
    return {
      label: "Not available",
      clamped: 0,
    }
  }

  const rounded = Math.round(value)
  const clamped = Math.min(100, Math.max(0, rounded))

  return {
    label: `${clamped}%`,
    clamped,
  }
}

function formatStatus(value?: string | null) {
  const normalized = value?.trim()

  if (!normalized) {
    return "Not available"
  }

  return normalized
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDate(value?: string | null) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function shortId(value?: string | null) {
  const normalized = value?.trim()

  if (!normalized) {
    return "Not available"
  }

  if (normalized.length <= 12) {
    return normalized
  }

  return `${normalized.slice(0, 8)}...${normalized.slice(-4)}`
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  return initials || "NB"
}

function getProjectBaseRoute(role?: UserRole) {
  if (role === UserRole.CLIENT) {
    return "/client/dashboard/projects"
  }

  if (role === UserRole.EXPERT) {
    return "/expert/dashboard/projects"
  }

  return null
}
