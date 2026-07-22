"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Loader2,
  MessageCircle,
  Send,
  Save,
  Sparkles,
  Star,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useChatSocket } from "@/hooks/useChatSocket";
import type { RootState } from "@/redux/store";
import { useProjectEscrowPayment } from "@/services/payment.service";
import {
  findCanonicalProjectChatSession,
  useChatMessages,
  useChatSessionById,
  useCreateWorkspaceChatSession,
  useMyChatSessions,
  useSendChatMessage,
} from "@/services/private-chat.service";
import {
  useUpdateWorkspaceDocument,
  useWorkspaceDocument,
  useWorkspaceDetail,
} from "@/services/workspace.service";
import { useProjectRating, useRateProject } from "@/services/rating.service";
import {
  useProjectDetailByWorkspace,
  useSubmissionPackagesByWorkspace,
} from "@/services/submission-package.service";
import type { ChatMessage, ChatUser } from "@/types/chat.types";
import type {
  ChatApiMessage,
  ChatSession,
  ChatSessionParticipant,
} from "@/types/private-chat.type";
import type { RatingResponse } from "@/types/rating.type";
import type { SubmissionPackageSummary } from "@/types/submission-package.type";
import type {
  WorkspaceDetail,
  WorkspaceParticipant,
} from "@/types/workspace.type";
import { UserRole, type UserResponse } from "@/types/user/user.type";
import { formatMoney, formatPlatformFee } from "@/utils/formatMoney";
import { isRichTextEmpty } from "@/utils/richText";

import { PrivateChatMessage } from "../private-chat/components/PrivateChatMessage";
import { ExpertSubmissionPackagePanel } from "./submission/components/ExpertSubmissionPackagePanel";
import { SubmissionPackageReviewPanel } from "./submission/components/SubmissionPackageReviewPanel";

type WorkspaceDetailViewProps = {
  workspaceId: string;
};

const ALLOWED_RICH_TEXT_TAGS = new Set([
  "B",
  "BR",
  "EM",
  "I",
  "LI",
  "OL",
  "P",
  "STRONG",
  "UL",
]);

export function WorkspaceDetailView({ workspaceId }: WorkspaceDetailViewProps) {
  const router = useRouter();
  const normalizedWorkspaceId = workspaceId.trim();
  const user = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null;
  const role = user?.role;
  const currentUserCode = user?.code?.trim() ?? "";

  const workspaceQuery = useWorkspaceDetail(normalizedWorkspaceId);
  const projectDetailQuery = useProjectDetailByWorkspace(normalizedWorkspaceId);
  const packageListQuery = useSubmissionPackagesByWorkspace(
    currentUserCode,
    normalizedWorkspaceId,
  );
  const latestPackage = useMemo(
    () => getLatestSubmissionPackage(packageListQuery.data ?? []),
    [packageListQuery.data],
  );
  const workspace = workspaceQuery.data;
  const handleBack = () => {
    const projectBaseRoute = getProjectBaseRoute(role);

    if (projectBaseRoute) {
      router.push(projectBaseRoute);
      return;
    }

    router.back();
  };

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
    );
  }

  if (workspaceQuery.isLoading) {
    return (
      <WorkspacePageShell>
        <WorkspaceLoadingState />
      </WorkspacePageShell>
    );
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
    );
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
    );
  }

  const progress = getProgressMeta(
    workspace.progressPercentage,
    latestPackage?.status,
  );

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
            <WorkspaceOverview workspace={workspace} progress={progress} />
            <WorkspaceMembers workspace={workspace} />
            <WorkspaceStrategySection
              workspaceId={workspace.workspaceId}
              role={role}
            />
            <WorkspaceFinancialSection escrowId={workspace.escrowId} />
            <WorkspaceRatingSection
              workspace={workspace}
              role={role}
              projectId={projectDetailQuery.data?.result?.projectId ?? ""}
              isProjectIdLoading={projectDetailQuery.isLoading}
            />
          </div>

          <div className="space-y-6">
            {role === UserRole.EXPERT ? (
              <ExpertSubmissionPackagePanel
                workspaceId={workspace.workspaceId}
              />
            ) : (
              <SubmissionPackageReviewPanel
                workspaceId={workspace.workspaceId}
                escrowId={workspace.escrowId}
                onCompleted={() => workspaceQuery.refetch()}
              />
            )}
          </div>
        </div>

        <WorkspaceChatPopup
          workspace={workspace}
          role={role}
          currentUserCode={currentUserCode}
        />
      </div>
    </WorkspacePageShell>
  );
}

function WorkspacePageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      {children}
    </main>
  );
}

function WorkspaceHeader({
  workspace,
  progress,
  onBack,
}: {
  workspace: WorkspaceDetail;
  progress: ProgressMeta;
  onBack: () => void;
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
          <MemberInline participant={workspace.client} roleLabel="Client" />
          <MemberInline participant={workspace.expert} roleLabel="Expert" />
        </div>
      </div>
    </section>
  );
}

function WorkspaceOverview({
  workspace,
  progress,
}: {
  workspace: WorkspaceDetail;
  progress: ProgressMeta;
}) {
  return (
    <WorkspaceCard
      icon={BriefcaseBusiness}
      title="Project Overview"
      description="Verified workspace details from the active project."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailTile label="Project" value={workspace.projectName} />
        <DetailTile
          label="Workspace status"
          value={formatStatus(workspace.status)}
        />
        <DetailTile
          label="Project status"
          value={formatStatus(workspace.projectStatus)}
        />
        <DetailTile
          label="Created"
          value={formatDate(workspace.createdAt) ?? "Not available"}
        />
        <DetailTile
          label="Start date"
          value={formatDate(workspace.startDate) ?? "Not available"}
        />
        <DetailTile
          label="Deadline"
          value={formatDate(workspace.deadline) ?? "Not available"}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-slate-900">
              Project progress
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Progress uses the Workspace API and becomes complete when the
              latest submission package is approved.
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
  );
}

function WorkspaceMembers({ workspace }: { workspace: WorkspaceDetail }) {
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
  );
}

function WorkspaceChatPopup({
  workspace,
  role,
  currentUserCode,
}: {
  workspace: WorkspaceDetail;
  role?: UserRole;
  currentUserCode: string;
}) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [isPreparingChat, setIsPreparingChat] = useState(false);
  const normalizedWorkspaceId = workspace.workspaceId.trim();
  const isSupportedRole = role === UserRole.CLIENT || role === UserRole.EXPERT;
  const previewPartner = getWorkspaceChatPartner(workspace, role);
  const previewPartnerUser = previewPartner
    ? mapWorkspaceParticipantToChatUser(previewPartner, role)
    : null;
  const sessionsQuery = useMyChatSessions(currentUserCode, {
    enabled: false,
  });
  const createWorkspaceChatSessionMutation =
    useCreateWorkspaceChatSession(currentUserCode);
  const sessionQuery = useChatSessionById(sessionId, currentUserCode);
  const session = sessionQuery.data?.result;
  const canLoadMessages = Boolean(sessionId) && session?.id === sessionId;
  const messagesQuery = useChatMessages(
    canLoadMessages ? sessionId : null,
    0,
    30,
    currentUserCode,
  );
  const sendMessageMutation = useSendChatMessage(currentUserCode);

  const currentUser = useMemo<ChatUser | null>(() => {
    if (!session || !currentUserCode) {
      return null;
    }

    const participant = getAuthenticatedChatParticipant(
      session,
      currentUserCode,
    );

    return participant
      ? mapChatParticipantToChatUser(participant, session.status)
      : null;
  }, [session, currentUserCode]);

  const partner = useMemo<ChatUser | null>(() => {
    if (!session || !currentUserCode) {
      return previewPartnerUser;
    }

    const participant = getPartnerChatParticipant(session, currentUserCode);

    return participant
      ? mapChatParticipantToChatUser(participant, session.status)
      : previewPartnerUser;
  }, [session, currentUserCode, previewPartnerUser]);

  const messages = useMemo<ChatMessage[]>(() => {
    const apiMessages = messagesQuery.data?.result?.data ?? [];

    return [...apiMessages]
      .sort((left, right) => {
        return getTimeValue(left.createdAt) - getTimeValue(right.createdAt);
      })
      .map((message) => ({
        id: message.id,
        senderId: resolveWorkspaceChatMessageSenderId({
          message,
          session,
          currentUserCode,
          currentUserRole: role,
        }),
        type: "text",
        content: message.content,
        time: formatMessageTime(message.createdAt),
      }));
  }, [messagesQuery.data, session, currentUserCode, role]);

  const handleRealtimeMessage = useCallback(() => {
    void messagesQuery.refetch();
  }, [messagesQuery]);

  useChatSocket({
    enabled: isOpen && Boolean(sessionId) && Boolean(currentUserCode),
    sessionId,
    userCode: currentUserCode,
    onMessage: handleRealtimeMessage,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [isOpen, messages.length]);

  if (!isSupportedRole || !previewPartnerUser) {
    return null;
  }

  async function ensureChatSession() {
    if (isPreparingChat || createWorkspaceChatSessionMutation.isPending) {
      return;
    }

    if (!currentUserCode || !normalizedWorkspaceId) {
      setChatError("Sign in again to open this workspace chat.");
      return;
    }

    setChatError(null);
    createWorkspaceChatSessionMutation.reset();

    try {
      setIsPreparingChat(true);

      const sessionsResult = await sessionsQuery.refetch();

      if (sessionsResult.isError) {
        setChatError(getChatErrorMessage(sessionsResult.error));
        return;
      }

      const existingSession = findCanonicalProjectChatSession(
        sessionsResult.data?.result ?? [],
        normalizedWorkspaceId,
      );

      if (existingSession?.id?.trim()) {
        setSessionId(existingSession.id.trim());
        return;
      }

        if (role !== UserRole.CLIENT) {
          setChatError("The Client needs to start this workspace chat first.");
          return;
        }

        const response = await createWorkspaceChatSessionMutation.mutateAsync({
          workspaceId: normalizedWorkspaceId,
        });

        const nextSessionId = response.result?.id?.trim();

        if (!nextSessionId) {
          setChatError(
            "Chat session was created, but no usable session ID was returned.",
          );
          return;
        }

        setSessionId(nextSessionId);
      } catch (error) {
        setChatError(getChatErrorMessage(error));
      } finally {
        setIsPreparingChat(false);
      }
    }

    async function handleToggleChat() {
      const nextOpen = !isOpen;
      setIsOpen(nextOpen);
      console.log(sessionId);
      if (nextOpen && !sessionId) {
        await ensureChatSession();
      }
    }

  async function handleSendMessage() {
    const normalizedMessage = draftMessage.trim();

    if (
      !normalizedMessage ||
      !session ||
      !currentUser ||
      session.status !== "ACTIVE" ||
      sendMessageMutation.isPending
    ) {
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        chatSessionId: session.id,
        content: normalizedMessage,
      });
      setDraftMessage("");
      await messagesQuery.refetch();
    } catch (error) {
      toast.error(getWorkspaceApiErrorMessage(error));
    }
  }

  const isChatLoading =
    isPreparingChat ||
    createWorkspaceChatSessionMutation.isPending ||
    (Boolean(sessionId) && sessionQuery.isLoading);
  const canSendMessage =
    Boolean(draftMessage.trim()) &&
    Boolean(session) &&
    session?.status === "ACTIVE" &&
    !sendMessageMutation.isPending;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex max-w-[calc(100vw-3rem)] flex-col items-end gap-3">
      {isOpen && (
        <section className="flex h-[560px] max-h-[calc(100vh-7rem)] w-[380px] max-w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/20">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={partner?.avatarUrl}
                    alt={partner?.name ?? "Chat partner"}
                  />
                  <AvatarFallback className="bg-indigo-50 font-bold text-indigo-600">
                    {getInitials(partner?.name ?? "Chat")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-900">
                    {partner?.name ?? "Workspace chat"}
                  </p>
                  <p className="text-xs font-semibold text-emerald-500">
                    Project chat
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 px-4 py-4">
              {isChatLoading ? (
                <ChatPopupState message="Opening chat..." />
              ) : chatError ? (
                <ChatPopupState
                  message={chatError}
                  actionLabel="Try again"
                  onAction={ensureChatSession}
                />
              ) : sessionQuery.isError ? (
                <ChatPopupState
                  message={getWorkspaceApiErrorMessage(sessionQuery.error)}
                  actionLabel="Reload"
                  onAction={() => sessionQuery.refetch()}
                />
              ) : messagesQuery.isLoading ? (
                <ChatPopupState message="Loading messages..." />
              ) : messagesQuery.isError ? (
                <ChatPopupState
                  message={getWorkspaceApiErrorMessage(messagesQuery.error)}
                  actionLabel="Reload"
                  onAction={() => messagesQuery.refetch()}
                />
              ) : session && currentUser && partner ? (
                <div className="flex flex-col gap-4">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <PrivateChatMessage
                        key={message.id}
                        message={message}
                        currentUser={currentUser}
                        partner={partner}
                      />
                    ))
                  ) : (
                    <ChatPopupState message="No messages yet. Send the first message to start." />
                  )}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <ChatPopupState message="Chat session is not ready yet." />
              )}
            </div>

            {session?.status && session.status !== "ACTIVE" && (
              <div className="border-t border-amber-100 bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-700">
                This conversation is currently {session.status.toLowerCase()}.
              </div>
            )}

            <div className="shrink-0 border-t border-slate-100 bg-white p-3">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-indigo-300 focus-within:bg-white">
                <input
                  value={draftMessage}
                  onChange={(event) => setDraftMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSendMessage();
                    }
                  }}
                  disabled={!session || session.status !== "ACTIVE"}
                  placeholder={
                    session?.status && session.status !== "ACTIVE"
                      ? "This chat is unavailable"
                      : "Type a message..."
                  }
                  className="h-9 min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => void handleSendMessage()}
                  disabled={!canSendMessage}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => void handleToggleChat()}
        className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl shadow-slate-900/20 ring-4 ring-white transition hover:-translate-y-0.5 hover:shadow-2xl"
        aria-label="Open workspace chat"
      >
        <Avatar className="h-14 w-14">
          <AvatarImage
            src={previewPartnerUser.avatarUrl}
            alt={previewPartnerUser.name}
          />
          <AvatarFallback className="bg-indigo-50 font-bold text-indigo-600">
            {getInitials(previewPartnerUser.name)}
          </AvatarFallback>
        </Avatar>
        <span className="absolute -right-0.5 -top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
          {isPreparingChat || createWorkspaceChatSessionMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <MessageCircle className="h-3.5 w-3.5" />
          )}
        </span>
      </button>
    </div>
  );
}

function ChatPopupState({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <p className="text-sm font-semibold leading-5 text-slate-500">
        {message}
      </p>
      {onAction && (
        <Button
          type="button"
          variant="outline"
          onClick={onAction}
          className="mt-3 h-9 rounded-xl"
        >
          {actionLabel ?? "Try again"}
        </Button>
      )}
    </div>
  );
}

function WorkspaceStrategySection({
  workspaceId,
  role,
}: {
  workspaceId: string;
  role?: UserRole;
}) {
  const normalizedWorkspaceId = workspaceId.trim();
  const isExpert = role === UserRole.EXPERT;
  const isClient = role === UserRole.CLIENT;
  const documentQuery = useWorkspaceDocument(normalizedWorkspaceId);
  const updateDocumentMutation = useUpdateWorkspaceDocument();
  const [isStrategyDialogOpen, setIsStrategyDialogOpen] = useState(false);
  const [draftDocument, setDraftDocument] = useState("");
  const [hasEditedDraft, setHasEditedDraft] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const workspaceDocument = documentQuery.data;
  const documentDetail = workspaceDocument?.document?.trim() ?? "";
  const renderedDocumentDetail = useMemo(
    () => normalizeRichTextHtml(documentDetail),
    [documentDetail],
  );
  const formValue = hasEditedDraft ? draftDocument : documentDetail;
  const isDocumentRequired = Boolean(workspaceDocument?.documentRequired);
  const canEdit = isExpert && Boolean(normalizedWorkspaceId);
  const isSavingDocument = updateDocumentMutation.isPending;
  const saveDocumentError = updateDocumentMutation.error;

  useEffect(() => {
    if (isExpert && isDocumentRequired) {
      const timeoutId = window.setTimeout(() => {
        setIsStrategyDialogOpen(true);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [isExpert, isDocumentRequired]);

  const handleSubmitStrategy = async () => {
    if (!canEdit || isSavingDocument) {
      return;
    }

    const nextDocument = formValue.trim();

    if (isRichTextEmpty(nextDocument)) {
      setFormError("Workspace document is required.");
      return;
    }

    setFormError(null);

    try {
      await updateDocumentMutation.mutateAsync({
        workspaceId: normalizedWorkspaceId,
        request: {
          document: nextDocument,
        },
      });

      setHasEditedDraft(false);
      setDraftDocument("");
      setIsStrategyDialogOpen(false);
      toast.success("Workspace document updated.");
    } catch {
      // Error message is rendered from the mutation state below.
    }
  };

  return (
    <WorkspaceCard
      icon={Sparkles}
      title="Proposal Strategy"
      description={
        isExpert
          ? "Complete the required workspace document before continuing delivery."
          : "Read the expert's workspace document for this project."
      }
    >
      {isExpert && isDocumentRequired && (
        <div className="mb-4">
          <SectionNotice
            tone="warning"
            title="Workspace document required"
            message="This step is mandatory. Open the editor and submit the workspace document before continuing."
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsStrategyDialogOpen(true)}
        className={cn(
          "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition",
          isExpert && isDocumentRequired
            ? "border-amber-300 bg-amber-50/90 shadow-sm shadow-amber-100 hover:border-amber-400 hover:bg-amber-100/80"
            : "border-slate-200/70 bg-slate-50/70 hover:border-indigo-200 hover:bg-indigo-50/50",
        )}
      >
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm",
            isExpert && isDocumentRequired
              ? "text-amber-700"
              : "text-indigo-600",
          )}
        >
          <Sparkles className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-3">
            <span
              className={cn(
                "text-sm font-extrabold",
                isExpert && isDocumentRequired
                  ? "text-amber-950"
                  : "text-slate-900",
              )}
            >
              {isExpert ? "Edit document" : "View document"}
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                isExpert && isDocumentRequired
                  ? "bg-amber-600 text-white shadow-sm shadow-amber-200"
                  : "bg-white text-slate-400",
              )}
            >
              {isExpert && isDocumentRequired
                ? "Required"
                : isExpert
                  ? "Editor"
                  : "Viewer"}
            </span>
          </span>
          <span
            className={cn(
              "mt-1 block text-xs font-semibold leading-5",
              isExpert && isDocumentRequired
                ? "text-amber-700"
                : "text-slate-500",
            )}
          >
            {isExpert
              ? "Open the workspace document editor required for expert delivery."
              : "Open the workspace document viewer for this project."}
          </span>
        </span>
      </button>

      <Dialog
        open={isStrategyDialogOpen}
        onOpenChange={setIsStrategyDialogOpen}
      >
        <DialogContent className="max-h-[min(760px,calc(100vh-2rem))] overflow-hidden rounded-3xl bg-white p-0 shadow-2xl shadow-slate-900/10 sm:max-w-3xl">
          <div className="max-h-[calc(100vh-2rem)] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950">
                Workspace Document
              </DialogTitle>
              <DialogDescription className="leading-6 text-slate-500">
                {isExpert
                  ? "Create or update the required document for this workspace."
                  : "Read the expert's workspace document for this project."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5">
              {documentQuery.isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-28 rounded-2xl" />
                  <Skeleton className="h-10 w-36 rounded-xl" />
                </div>
              ) : canEdit ? (
                <div className="space-y-4">
                  {isDocumentRequired && (
                    <SectionNotice
                      tone="warning"
                      title="Required before continuing"
                      message=""
                    />
                  )}

                  {documentQuery.isError && (
                    <SectionNotice
                      tone="warning"
                      title="Unable to load workspace document"
                      message={getWorkspaceApiErrorMessage(documentQuery.error)}
                    />
                  )}

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Workspace document
                    </label>
                    <div className="mt-2">
                      <RichTextEditor
                        value={formValue}
                        onChange={(value) => {
                          setDraftDocument(value);
                          setHasEditedDraft(true);
                          setFormError(null);
                        }}
                        placeholder="Enter the required project document, implementation details, notes, and delivery plan..."
                        variant="job-post"
                      />
                    </div>
                    {formError && (
                      <p className="mt-2 text-xs font-semibold text-rose-600">
                        {formError}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 sm:items-end">
                    <Button
                      type="button"
                      onClick={handleSubmitStrategy}
                      disabled={isSavingDocument || isRichTextEmpty(formValue)}
                      className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 text-sm font-bold text-white"
                    >
                      {isSavingDocument ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save document
                    </Button>
                  </div>

                  {saveDocumentError && (
                    <SectionNotice
                      tone="warning"
                      title="Document could not be saved"
                      message={getWorkspaceApiErrorMessage(saveDocumentError)}
                    />
                  )}
                </div>
              ) : isClient ? (
                workspaceDocument ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Workspace document
                      </p>
                      {renderedDocumentDetail ? (
                        <div
                          className={cn(
                            "prose prose-sm mt-3 max-w-none text-slate-700",
                            "[&_p]:my-2 [&_li_p]:m-0",
                            "[&_ul]:my-2 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:pl-2",
                            "[&_ol]:my-2 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:pl-2",
                          )}
                          dangerouslySetInnerHTML={{
                            __html: renderedDocumentDetail,
                          }}
                        />
                      ) : (
                        <p className="mt-3 text-sm leading-6 text-slate-700">
                          No workspace document is available.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <SectionNotice
                    tone={documentQuery.isError ? "warning" : "neutral"}
                    title={
                      documentQuery.isError
                        ? "Unable to load workspace document"
                        : "No workspace document yet"
                    }
                    message={
                      documentQuery.isError
                        ? getWorkspaceApiErrorMessage(documentQuery.error)
                        : "The expert has not shared a workspace document for this project yet."
                    }
                  />
                )
              ) : (
                <SectionNotice
                  tone="warning"
                  title="Workspace document unavailable"
                  message="Sign in as the Client or Expert of this workspace to view the document."
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </WorkspaceCard>
  );
}

function WorkspaceFinancialSection({ escrowId }: { escrowId?: string | null }) {
  const normalizedEscrowId = escrowId?.trim() ?? "";
  const projectEscrowQuery = useProjectEscrowPayment(normalizedEscrowId, {
    enabled: Boolean(normalizedEscrowId),
  });
  const projectEscrow = projectEscrowQuery.data;
  const isExpertPayoutReleased = projectEscrow
    ? isZeroMoneyValue(projectEscrow.heldAmount)
    : false;

  return (
    <WorkspaceCard
      icon={WalletCards}
      title="Escrow & Payout"
      description="Escrow release credits the Expert Wallet. Withdrawal is a separate wallet-to-bank request."
    >
      {!normalizedEscrowId ? (
        <SectionNotice
          tone="warning"
          title="Project escrow unavailable"
          message="The escrow ID could not be resolved from this workspace yet."
        />
      ) : projectEscrowQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : projectEscrowQuery.isError ? (
        <SectionNotice
          tone="warning"
          title="Unable to load project escrow"
          message={getWorkspaceApiErrorMessage(projectEscrowQuery.error)}
        />
      ) : projectEscrow ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <DetailTile
            label="Project escrow"
            value={formatMoney(projectEscrow.amount, "Not available")}
          />
          <DetailTile
            label="Expert payout"
            value={formatMoney(projectEscrow.heldAmount, "Not available")}
            helperText={
              isExpertPayoutReleased ? "Paid out to expert" : undefined
            }
            tone={isExpertPayoutReleased ? "success" : "default"}
          />
          <DetailTile
            label="Platform fee"
            value={formatPlatformFee(
              projectEscrow.platformFee,
              "Not available",
            )}
          />
        </div>
      ) : (
        <SectionNotice
          title="No escrow data"
          message="No project escrow detail was returned for this escrow."
        />
      )}
    </WorkspaceCard>
  );
}

function WorkspaceRatingSection({
  workspace,
  role,
  projectId,
  isProjectIdLoading,
}: {
  workspace: WorkspaceDetail;
  role?: UserRole;
  projectId: string;
  isProjectIdLoading: boolean;
}) {
  const isCompleted = isProjectCompleted(workspace.projectStatus);
  const ratingQuery = useProjectRating(projectId, {
    enabled: isCompleted && Boolean(projectId),
  });
  const rateProjectMutation = useRateProject();
  const [score, setScore] = useState<number>(5);
  const [comment, setComment] = useState("");
  const isRatingMissing =
    ratingQuery.isError && getErrorStatus(ratingQuery.error) === 404;
  const existingRating = ratingQuery.data;
  const canSubmitRating =
    role === UserRole.CLIENT &&
    isCompleted &&
    Boolean(projectId) &&
    !existingRating &&
    (isRatingMissing || !ratingQuery.isLoading);

  if (!isCompleted) {
    return null;
  }

  const handleSubmitRating = async () => {
    if (!canSubmitRating || rateProjectMutation.isPending) return;

    try {
      await rateProjectMutation.mutateAsync({
        projectId,
        request: {
          score,
          comment: comment.trim() || undefined,
        },
      });
      setScore(5);
      setComment("");
      toast.success("Project rating submitted.");
      await ratingQuery.refetch();
    } catch (error) {
      toast.error(getWorkspaceApiErrorMessage(error));
    }
  };

  return (
    <WorkspaceCard
      icon={Star}
      title="Project Rating"
      description="Client feedback for the expert after project completion."
    >
      {isProjectIdLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-11 rounded-xl" />
        </div>
      ) : !projectId ? (
        <SectionNotice
          tone="warning"
          title="Project ID unavailable"
          message="The workspace is completed, but the project ID could not be resolved yet."
        />
      ) : ratingQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
      ) : existingRating ? (
        <ProjectRatingSummary rating={existingRating} />
      ) : canSubmitRating ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-slate-50 p-5 shadow-sm shadow-amber-100/60">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-extrabold text-slate-900">
                  Rate the expert
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  Click the left or right half of a star to choose 0.5
                  increments.
                </p>
              </div>
              <div className="inline-flex h-10 items-center rounded-full border border-amber-200 bg-white px-3 text-sm font-extrabold text-amber-700 shadow-sm">
                {formatScore(score)} / 5
              </div>
            </div>

            <div className="mt-5">
              <RatingStarsInput value={score} onChange={setScore} />
              <p className="mt-3 text-xs font-semibold text-slate-500">
                {getRatingLabel(score)}
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="project-rating-feedback"
              className="text-xs font-bold uppercase tracking-wider text-slate-400"
            >
              Feedback
            </label>
            <Textarea
              id="project-rating-feedback"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share optional feedback for the expert..."
              className="mt-2 min-h-28 rounded-2xl border-slate-200 bg-slate-50/70 text-sm leading-6 shadow-none focus-visible:border-indigo-300 focus-visible:ring-indigo-100"
            />
          </div>

          <Button
            type="button"
            onClick={handleSubmitRating}
            disabled={rateProjectMutation.isPending}
            className="h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-5 text-sm font-bold text-white"
          >
            {rateProjectMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Star className="mr-2 h-4 w-4" />
            )}
            Submit rating
          </Button>
        </div>
      ) : ratingQuery.isError ? (
        <SectionNotice
          tone="warning"
          title="Unable to load rating"
          message={getWorkspaceApiErrorMessage(ratingQuery.error)}
        />
      ) : (
        <SectionNotice
          title="No rating yet"
          message="This completed project has not been rated yet."
        />
      )}
    </WorkspaceCard>
  );
}

function ProjectRatingSummary({ rating }: { rating: RatingResponse }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-slate-900">
              Client rating
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Submitted {formatDate(rating.createdAt) ?? "recently"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RatingStars value={rating.score} />
            <span className="text-sm font-extrabold text-amber-700">
              {formatScore(rating.score)} / 5
            </span>
          </div>
        </div>
      </div>

      {rating.comment?.trim() ? (
        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Feedback
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {rating.comment.trim()}
          </p>
        </div>
      ) : (
        <SectionNotice
          title="No written feedback"
          message="The client submitted a star rating without additional feedback."
        />
      )}
    </div>
  );
}

function WorkspaceCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: ReactNode;
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
  );
}

function HeaderMetric({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
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
  );
}

function DetailTile({
  label,
  value,
  helperText,
  tone = "default",
}: {
  label: string;
  value?: string | null;
  helperText?: string;
  tone?: "default" | "success";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        tone === "success"
          ? "border-emerald-200 bg-emerald-50/80"
          : "border-slate-200/70 bg-slate-50/70",
      )}
    >
      <p
        className={cn(
          "text-xs font-bold uppercase tracking-wider",
          tone === "success" ? "text-emerald-600" : "text-slate-400",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-2 break-words text-sm font-extrabold",
          tone === "success" ? "text-emerald-800" : "text-slate-900",
        )}
      >
        {value?.trim() || "Not available"}
      </p>
      {helperText && (
        <p className="mt-1 text-xs font-semibold text-emerald-700">
          {helperText}
        </p>
      )}
    </div>
  );
}

function MemberInline({
  participant,
  roleLabel,
}: {
  participant: WorkspaceParticipant;
  roleLabel: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
      <ParticipantAvatar participant={participant} />
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold text-slate-900">
          {participant.name || "Unknown member"}
        </p>
        <p className="text-xs font-semibold text-slate-400">{roleLabel}</p>
      </div>
    </div>
  );
}

function MemberCard({
  participant,
  roleLabel,
}: {
  participant: WorkspaceParticipant;
  roleLabel: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-5">
      <div className="flex items-center gap-4">
        <ParticipantAvatar participant={participant} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-base font-extrabold text-slate-950">
            {participant.name || "Unknown member"}
          </p>
          <StatusBadge
            label={roleLabel}
            tone={roleLabel === "Client" ? "indigo" : "sky"}
          />
        </div>
      </div>
    </article>
  );
}

function ParticipantAvatar({
  participant,
  size = "default",
}: {
  participant: WorkspaceParticipant;
  size?: "default" | "lg";
}) {
  const name = participant.name || "Member";
  const avatarUrl = participant.avatarUrl?.trim() || undefined;

  return (
    <Avatar size={size} className={size === "lg" ? "h-14 w-14" : "h-11 w-11"}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
      <AvatarFallback className="bg-indigo-50 font-bold text-indigo-600">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "indigo" | "sky";
}) {
  const toneClassName =
    tone === "indigo"
      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
      : "border-sky-200 bg-sky-50 text-sky-700";

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
  );
}

function RatingStarsInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  const getScoreFromPointer = (
    event: ReactMouseEvent<HTMLButtonElement>,
    starValue: number,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const isHalfStar = event.clientX - rect.left < rect.width / 2;

    return starValue - (isHalfStar ? 0.5 : 0);
  };

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-200 bg-white p-2 shadow-sm"
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = displayValue >= starValue;
        const isHalfFilled = !isFilled && displayValue >= starValue - 0.5;

        return (
          <button
            key={starValue}
            type="button"
            aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
            onClick={(event) => onChange(getScoreFromPointer(event, starValue))}
            onMouseMove={(event) =>
              setHoverValue(getScoreFromPointer(event, starValue))
            }
            className="flex h-11 w-11 items-center justify-center rounded-xl text-amber-400 transition hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <Star
              className={cn(
                "h-8 w-8 transition",
                isFilled && "fill-amber-400 text-amber-400",
                isHalfFilled && "fill-amber-200 text-amber-400",
                !isFilled &&
                  !isHalfFilled &&
                  "text-slate-300 hover:text-amber-300",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

function RatingStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = value >= starValue;
        const isHalfFilled = !isFilled && value >= starValue - 0.5;

        return (
          <Star
            key={starValue}
            className={cn(
              "h-4 w-4",
              isFilled && "fill-amber-400 text-amber-400",
              isHalfFilled && "fill-amber-200 text-amber-400",
              !isFilled && !isHalfFilled && "text-slate-300",
            )}
          />
        );
      })}
    </div>
  );
}

function SectionNotice({
  title,
  message,
  tone = "neutral",
}: {
  title: string;
  message: string;
  tone?: "neutral" | "warning";
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
        <p className="mt-1 text-xs font-semibold leading-5">{message}</p>
      </div>
    </div>
  );
}

function WorkspaceStateCard({
  tone,
  title,
  message,
  actionLabel,
  onAction,
  onBack,
}: {
  tone: "warning" | "error";
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onBack?: () => void;
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
        <h1 className="mt-4 text-xl font-extrabold text-slate-950">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
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
  );
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
  );
}

type ProgressMeta = {
  label: string;
  clamped: number;
};

function getProgressMeta(
  value: number,
  latestPackageStatus?: string | null,
): ProgressMeta {
  if (normalizeStatusValue(latestPackageStatus) === "APPROVED") {
    return {
      label: "100%",
      clamped: 100,
    };
  }

  if (!Number.isFinite(value)) {
    return {
      label: "Not available",
      clamped: 0,
    };
  }

  const rounded = Math.round(value);
  const clamped = Math.min(100, Math.max(0, rounded));

  return {
    label: `${clamped}%`,
    clamped,
  };
}

function getLatestSubmissionPackage(packages: SubmissionPackageSummary[]) {
  return [...packages]
    .filter((item) => !item.isDelete)
    .sort((left, right) => {
      const versionDelta = (right.version ?? 0) - (left.version ?? 0);

      if (versionDelta !== 0) return versionDelta;

      return getTimeValue(right.submittedAt) - getTimeValue(left.submittedAt);
    })[0];
}

function normalizeRichTextHtml(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue || typeof window === "undefined") {
    return normalizedValue;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(
    decodeHtmlEntities(normalizedValue),
    "text/html",
  );

  sanitizeRichTextNode(document.body);
  removeEmptyRichTextBlocks(document.body);

  return document.body.innerHTML.trim();
}

function decodeHtmlEntities(value: string) {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = value;

  return textArea.value;
}

function sanitizeRichTextNode(parent: ParentNode) {
  Array.from(parent.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.remove();
      return;
    }

    const element = node as HTMLElement;

    if (!ALLOWED_RICH_TEXT_TAGS.has(element.tagName)) {
      const childNodes = Array.from(element.childNodes);
      element.replaceWith(...childNodes);
      sanitizeRichTextNode(parent);
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      element.removeAttribute(attribute.name);
    });
    sanitizeRichTextNode(element);
  });
}

function removeEmptyRichTextBlocks(parent: HTMLElement) {
  let removedBlock = true;

  while (removedBlock) {
    removedBlock = false;

    parent.querySelectorAll("p, li, ul, ol").forEach((element) => {
      const hasLineBreak = Boolean(element.querySelector("br"));
      const hasNestedList = Boolean(element.querySelector("ul, ol"));
      const hasText = Boolean(element.textContent?.trim());
      const isList = element.tagName === "UL" || element.tagName === "OL";

      if (!hasLineBreak && (!hasNestedList || isList) && !hasText) {
        element.remove();
        removedBlock = true;
      }
    });
  }
}

function normalizeStatusValue(value?: string | null) {
  return value?.trim().toUpperCase() ?? "";
}

function formatStatus(value?: string | null) {
  const normalized = value?.trim();

  if (!normalized) {
    return "Not available";
  }

  return normalized
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatScore(value?: number | null) {
  if (!Number.isFinite(value ?? NaN)) return "0";

  return Number(value).toFixed(1).replace(/\.0$/, "");
}

function getRatingLabel(value: number) {
  if (value >= 4.5) return "Excellent collaboration and delivery.";
  if (value >= 3.5) return "Good delivery with minor improvements.";
  if (value >= 2.5) return "Average experience.";
  if (value >= 1.5) return "Needs improvement.";

  return "Poor experience.";
}

function isProjectCompleted(value?: string | null) {
  const normalized = value?.trim().toUpperCase();

  return normalized === "COMPLETED" || normalized === "COMPLETE";
}

function isZeroMoneyValue(value?: number | string | null) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value === 0;
  }

  if (typeof value === "string") {
    const normalizedValue = Number(value.trim());

    return Number.isFinite(normalizedValue) && normalizedValue === 0;
  }

  return false;
}

function getWorkspaceChatPartner(workspace: WorkspaceDetail, role?: UserRole) {
  if (role === UserRole.CLIENT) {
    return workspace.expert;
  }

  if (role === UserRole.EXPERT) {
    return workspace.client;
  }

  return null;
}

function mapWorkspaceParticipantToChatUser(
  participant: WorkspaceParticipant,
  currentRole?: UserRole,
): ChatUser {
  return {
    id: participant.userId,
    name: participant.name || "Workspace member",
    avatarUrl: participant.avatarUrl || "/img/default-avatar.png",
    role: currentRole === UserRole.CLIENT ? "expert" : "client",
    status: "Online",
  };
}

function getAuthenticatedChatParticipant(
  session: ChatSession,
  currentUserCode: string,
) {
  return (
    session.participants.find(
      (participant) => participant.code?.trim() === currentUserCode,
    ) ?? null
  );
}

function getPartnerChatParticipant(
  session: ChatSession,
  currentUserCode: string,
) {
  if (!currentUserCode) {
    return null;
  }

  return (
    session.participants.find(
      (participant) => participant.code?.trim() !== currentUserCode,
    ) ?? null
  );
}

function mapChatParticipantToChatUser(
  participant: ChatSessionParticipant,
  sessionStatus: ChatSession["status"],
): ChatUser {
  const normalizedRole = participant.role?.trim().toUpperCase();

  return {
    id: participant.code,
    name: participant.fullName || "Workspace member",
    avatarUrl: participant.avatarUrl || "/img/default-avatar.png",
    role: normalizedRole === "CLIENT" ? "client" : "expert",
    status: sessionStatus === "ACTIVE" ? "Online" : "Offline",
  };
}

function resolveWorkspaceChatMessageSenderId({
  message,
  session,
  currentUserCode,
  currentUserRole,
}: {
  message: ChatApiMessage;
  session?: ChatSession;
  currentUserCode: string;
  currentUserRole?: UserRole;
}) {
  const senderCode = message.senderCode?.trim();

  if (senderCode) {
    return senderCode;
  }

  if (!session || !currentUserCode) {
    return "";
  }

  const normalizedSenderRole = normalizeRole(message.senderRole);
  const normalizedCurrentUserRole = normalizeRole(currentUserRole);

  if (!normalizedSenderRole) {
    return "";
  }

  if (normalizedSenderRole === normalizedCurrentUserRole) {
    return currentUserCode;
  }

  const senderParticipant = session.participants.find(
    (participant) => normalizeRole(participant.role) === normalizedSenderRole,
  );

  return senderParticipant?.code?.trim() ?? "";
}

function normalizeRole(role?: string | null) {
  return role?.trim().toUpperCase() ?? "";
}

function formatMessageTime(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTimeValue(value?: string | null) {
  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? time : 0;
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "NB";
}

function getProjectBaseRoute(role?: UserRole) {
  if (role === UserRole.CLIENT) {
    return "/client/dashboard/projects";
  }

  if (role === UserRole.EXPERT) {
    return "/expert/dashboard/projects";
  }

  return null;
}

function getChatErrorMessage(error: unknown) {
  if (!error) {
    return null;
  }

  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to open Workspace chat. Please try again.";
}

function getErrorStatus(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    return (
      error as {
        response?: {
          status?: number;
        };
      }
    ).response?.status;
  }

  return undefined;
}

function getWorkspaceApiErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Please try again.";
}
