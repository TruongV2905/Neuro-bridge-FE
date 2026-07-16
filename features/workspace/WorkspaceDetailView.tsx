"use client"

import { useState, type ComponentType, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Loader2,
  MessageCircle,
  Save,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { RootState } from "@/redux/store"
import { useUpdateProposalUnlock } from "@/services/job-post.service"
import {
  findCanonicalProjectChatSession,
  useCreateWorkspaceChatSession,
  useMyChatSessions,
} from "@/services/private-chat.service"
import {
  useProposalStrategy,
  useUpdateProposalStrategy,
  useWorkspaceDetail,
} from "@/services/workspace.service"
import type {
  WorkspaceDetail,
  WorkspaceParticipant,
} from "@/types/workspace.type"
import { UserRole, type UserResponse } from "@/types/user/user.type"
import { formatMoney } from "@/utils/formatMoney"

import { ExpertSubmissionPackagePanel } from "./submission/components/ExpertSubmissionPackagePanel"
import { SubmissionPackageReviewPanel } from "./submission/components/SubmissionPackageReviewPanel"

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
  const currentUserCode = user?.code?.trim() ?? ""

  const workspaceQuery = useWorkspaceDetail(normalizedWorkspaceId)
  const workspaceChatSessionsQuery =
    useMyChatSessions(currentUserCode, {
      enabled: false,
    })
  const createWorkspaceChatSessionMutation =
    useCreateWorkspaceChatSession(currentUserCode)
  const [openChatError, setOpenChatError] =
    useState<string | null>(null)
  const [isCheckingChatSession, setIsCheckingChatSession] =
    useState(false)
  const workspace = workspaceQuery.data
  const handleBack = () => {
    const projectBaseRoute = getProjectBaseRoute(role)

    if (projectBaseRoute) {
      router.push(projectBaseRoute)
      return
    }

    router.back()
  }
  const chatRouteBase = getChatRouteBase(role)
  const canOpenChat =
    Boolean(chatRouteBase) &&
    Boolean(normalizedWorkspaceId) &&
    Boolean(currentUserCode)
  const isOpeningChat =
    isCheckingChatSession ||
    createWorkspaceChatSessionMutation.isPending
  const openChatErrorMessage =
    openChatError ??
    getChatErrorMessage(
      createWorkspaceChatSessionMutation.error,
    )

  const handleOpenChat = async () => {
    if (
      isOpeningChat ||
      !canOpenChat ||
      !chatRouteBase
    ) {
      return
    }

    setOpenChatError(null)
    createWorkspaceChatSessionMutation.reset()

    try {
      setIsCheckingChatSession(true)

      const sessionsResult =
        await workspaceChatSessionsQuery.refetch()

      if (sessionsResult.isError) {
        setOpenChatError(
          getChatErrorMessage(sessionsResult.error),
        )
        return
      }

      const existingSession =
        findCanonicalProjectChatSession(
          sessionsResult.data?.result ?? [],
          normalizedWorkspaceId,
        )

      if (existingSession) {
        const existingSessionId =
          existingSession.id?.trim()

        if (!existingSessionId) {
          setOpenChatError(
            "Workspace chat exists, but no usable session ID was returned. Please try again.",
          )
          return
        }

        router.push(
          `${chatRouteBase}/${encodeURIComponent(
            existingSessionId,
          )}`,
        )
        return
      }

      if (role !== UserRole.CLIENT) {
        setOpenChatError(
          "Workspace chat has not been initialized by the Client yet.",
        )
        return
      }

      const response =
        await createWorkspaceChatSessionMutation.mutateAsync(
          {
            workspaceId: normalizedWorkspaceId,
          },
        )

      const sessionId = response.result?.id?.trim()

      if (!sessionId) {
        setOpenChatError(
          "Chat session was created, but no usable session ID was returned. Please try again.",
        )
        return
      }

      router.push(
        `${chatRouteBase}/${encodeURIComponent(sessionId)}`,
      )
    } catch (error) {
      setOpenChatError(getChatErrorMessage(error))
    } finally {
      setIsCheckingChatSession(false)
    }
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
            <WorkspaceStrategySection
              workspaceId={workspace.workspaceId}
              role={role}
            />
            <WorkspaceFinancialSection />
          </div>
          
          <div className="space-y-6">
            <WorkspaceQuickActions
              canOpenChat={canOpenChat}
              isOpeningChat={isOpeningChat}
              openChatStatus={getOpenChatStatus({
                role,
                isCheckingChatSession,
                isCreatingChatSession:
                  createWorkspaceChatSessionMutation.isPending,
              })}
              openChatError={openChatErrorMessage}
              onOpenChat={handleOpenChat}
            />
            {role === UserRole.EXPERT ? (
              <ExpertSubmissionPackagePanel
                workspaceId={workspace.workspaceId}
              />
            ) : (
              <SubmissionPackageReviewPanel
                workspaceId={workspace.workspaceId}
                onCompleted={() => workspaceQuery.refetch()}
              />
            )}
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

function WorkspaceQuickActions({
  canOpenChat,
  isOpeningChat,
  openChatStatus,
  openChatError,
  onOpenChat,
}: {
  canOpenChat: boolean
  isOpeningChat: boolean
  openChatStatus: string
  openChatError?: string | null
  onOpenChat: () => void
}) {
  const actions: WorkspaceAction[] = [
    {
      title: "Open Chat",
      description: isOpeningChat
        ? openChatStatus
        : canOpenChat
          ? "Open the canonical PROJECT chat session for this workspace."
        : "Workspace chat is available for Client and Expert accounts only.",
      icon: MessageCircle,
      state: canOpenChat ? "Ready" : "Unavailable",
    }
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
            disabled={
              action.title !== "Open Chat" ||
              !canOpenChat ||
              isOpeningChat
            }
            onClick={
              action.title === "Open Chat" ? onOpenChat : undefined
            }
            className={cn(
              "flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 text-left transition",
              action.title === "Open Chat" && canOpenChat
                ? "hover:border-indigo-200 hover:bg-indigo-50/50"
                : "opacity-80",
              isOpeningChat && action.title === "Open Chat"
                ? "cursor-wait opacity-70"
                : "",
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
              <action.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-extrabold text-slate-900">
                  {action.title === "Open Chat" && isOpeningChat
                    ? "Opening Chat..."
                    : action.title}
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {action.title === "Open Chat" && isOpeningChat
                    ? "Opening"
                    : action.state}
                </span>
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {action.description}
              </span>
            </span>
          </button>
        ))}
      </div>
      {openChatError && (
        <div className="mt-4">
          <SectionNotice
            tone="warning"
            title="Chat could not open"
            message={openChatError}
          />
        </div>
      )}
    </WorkspaceCard>
  )
}



function WorkspaceStrategySection({
  workspaceId,
  role,
}: {
  workspaceId: string
  role?: UserRole
}) {
  const normalizedWorkspaceId = workspaceId.trim()
  const isExpert = role === UserRole.EXPERT
  const isClient = role === UserRole.CLIENT
  const strategyQuery = useProposalStrategy(normalizedWorkspaceId)
  const updateStrategyMutation = useUpdateProposalStrategy()
  const updateProposalUnlockMutation = useUpdateProposalUnlock()
  const [isStrategyDialogOpen, setIsStrategyDialogOpen] = useState(false)
  const [draftStrategy, setDraftStrategy] = useState("")
  const [hasEditedDraft, setHasEditedDraft] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const strategy = strategyQuery.data
  const strategyDetail = strategy?.strategyDetail?.trim() ?? ""
  const formValue = hasEditedDraft ? draftStrategy : strategyDetail
  const isMissingStrategy = strategyQuery.isError && getErrorStatus(strategyQuery.error) === 404
  const canEdit = isExpert && Boolean(normalizedWorkspaceId)
  const isSavingStrategy =
    updateStrategyMutation.isPending || updateProposalUnlockMutation.isPending
  const saveStrategyError =
    updateProposalUnlockMutation.error ?? updateStrategyMutation.error

  const handleSubmitStrategy = async () => {
    if (!canEdit || isSavingStrategy) {
      return
    }

    const nextStrategy = formValue.trim()

    if (!nextStrategy) {
      setFormError("Strategy detail is required.")
      return
    }

    setFormError(null)

    try {
      if (strategy?.proposalUnlockId) {
        await updateProposalUnlockMutation.mutateAsync({
          pathParams: {
            id: strategy.proposalUnlockId,
          },
          data: {
            strategyDetail: nextStrategy,
            unlockCost: strategy.unlockCost,
          },
        })
        await strategyQuery.refetch()
      } else {
        await updateStrategyMutation.mutateAsync({
          workspaceId: normalizedWorkspaceId,
          request: {
            strategyDetail: nextStrategy,
          },
        })
      }

      setHasEditedDraft(false)
      setDraftStrategy("")
    } catch {
      // Error message is rendered from the mutation state below.
    }
  }

  return (
    <WorkspaceCard
      icon={Sparkles}
      title="Proposal Strategy"
      description={
        isExpert
          ? "Create or update the detailed strategy for this workspace."
          : "Read the approved proposal strategy for this workspace."
      }
    >
      <button
        type="button"
        onClick={() => setIsStrategyDialogOpen(true)}
        className="flex w-full items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/50"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
          <Sparkles className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-3">
            <span className="text-sm font-extrabold text-slate-900">
              {isExpert ? "Edit strategy" : "View strategy"}
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isExpert ? "Editor" : "Viewer"}
            </span>
          </span>
          <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">
            {isExpert
              ? "Open the proposal-style editor to create or update this workspace strategy."
              : "Open the proposal strategy viewer for this workspace."}
          </span>
        </span>
      </button>

      <Dialog open={isStrategyDialogOpen} onOpenChange={setIsStrategyDialogOpen}>
        <DialogContent className="max-h-[min(760px,calc(100vh-2rem))] overflow-hidden rounded-3xl bg-white p-0 shadow-2xl shadow-slate-900/10 sm:max-w-3xl">
          <div className="max-h-[calc(100vh-2rem)] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950">
                Proposal Strategy
              </DialogTitle>
              <DialogDescription className="leading-6 text-slate-500">
                {isExpert
                  ? "Create or update the detailed strategy for this workspace."
                  : "Read the expert's proposal strategy for this workspace."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5">
              {strategyQuery.isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-28 rounded-2xl" />
                  <Skeleton className="h-10 w-36 rounded-xl" />
                </div>
              ) : canEdit ? (
                <div className="space-y-4">
                  {isMissingStrategy && (
                    <SectionNotice
                      title="No proposal strategy yet"
                      message="Write the first detailed strategy for this workspace. Saving will create or update the strategy through the Workspace API."
                    />
                  )}

                  {strategyQuery.isError && !isMissingStrategy && (
                    <SectionNotice
                      tone="warning"
                      title="Unable to load proposal strategy"
                      message={getWorkspaceApiErrorMessage(strategyQuery.error)}
                    />
                  )}

                  <div>
                    <label
                      htmlFor="proposal-strategy-detail"
                      className="text-xs font-bold uppercase tracking-wider text-slate-400"
                    >
                      Detailed strategy
                    </label>
                    <Textarea
                      id="proposal-strategy-detail"
                      value={formValue}
                      onChange={(event) => {
                        setDraftStrategy(event.target.value)
                        setHasEditedDraft(true)
                        setFormError(null)
                      }}
                      placeholder="Describe the implementation strategy, milestones, risks, and delivery approach..."
                      className="mt-2 min-h-44 rounded-2xl border-slate-200 bg-slate-50/70 text-sm leading-6 shadow-none focus-visible:border-indigo-300 focus-visible:ring-indigo-100"
                    />
                    {formError && (
                      <p className="mt-2 text-xs font-semibold text-rose-600">
                        {formError}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">
                        Unlock cost
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {strategy
                          ? formatMoney(strategy.unlockCost, "Not available")
                          : "Cost will stay unchanged when strategy is saved."}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleSubmitStrategy}
                      disabled={isSavingStrategy || !formValue.trim()}
                      className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 text-sm font-bold text-white"
                    >
                      {isSavingStrategy ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save strategy
                    </Button>
                  </div>

                  {saveStrategyError && (
                    <SectionNotice
                      tone="warning"
                      title="Strategy could not be saved"
                      message={getWorkspaceApiErrorMessage(saveStrategyError)}
                    />
                  )}
                </div>
              ) : isClient ? (
                strategy ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Detailed strategy
                      </p>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {strategyDetail || "No detailed strategy is available."}
                      </p>
                    </div>
                    <DetailTile
                      label="Unlock cost"
                      value={formatMoney(strategy.unlockCost, "Not available")}
                    />
                  </div>
                ) : (
                  <SectionNotice
                    tone={strategyQuery.isError && !isMissingStrategy ? "warning" : "neutral"}
                    title={
                      strategyQuery.isError && !isMissingStrategy
                        ? "Unable to load proposal strategy"
                        : "No proposal strategy yet"
                    }
                    message={
                      strategyQuery.isError && !isMissingStrategy
                        ? getWorkspaceApiErrorMessage(strategyQuery.error)
                        : "The expert has not shared a proposal strategy for this workspace yet."
                    }
                  />
                )
              ) : (
                <SectionNotice
                  tone="warning"
                  title="Proposal strategy unavailable"
                  message="Sign in as the Client or Expert of this workspace to view proposal strategy."
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </WorkspaceCard>
  )
}

function WorkspaceFinancialSection() {
  return (
    <WorkspaceCard
      icon={WalletCards}
      title="Escrow & Payout"
      description="Escrow release credits the Expert Wallet. Withdrawal is a separate wallet-to-bank request."
    >
      <SectionNotice
        title="Financial data pending"
        message="Contract amount, escrow funded amount, released amount, payout, platform fee and release condition are not returned by Workspace Detail yet."
      />
    </WorkspaceCard>
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

function getChatRouteBase(role?: UserRole) {
  if (role === UserRole.CLIENT) {
    return "/client/dashboard/chat"
  }

  if (role === UserRole.EXPERT) {
    return "/expert/dashboard/chat"
  }

  return null
}

function getOpenChatStatus({
  role,
  isCheckingChatSession,
  isCreatingChatSession,
}: {
  role?: UserRole
  isCheckingChatSession: boolean
  isCreatingChatSession: boolean
}) {
  if (isCheckingChatSession) {
    return "Checking existing Chat session..."
  }

  if (
    role === UserRole.CLIENT &&
    isCreatingChatSession
  ) {
    return "Creating Chat session..."
  }

  if (isCreatingChatSession) {
    return "Opening Chat..."
  }

  return "Opening Chat..."
}

function getChatErrorMessage(error: unknown) {
  if (!error) {
    return null
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string
          }
        }
      }
    ).response

    if (response?.data?.message) {
      return response.data.message
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return "Unable to open Workspace chat. Please try again."
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

function getWorkspaceApiErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string
          }
        }
      }
    ).response

    if (response?.data?.message) {
      return response.data.message
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return "Please try again."
}
