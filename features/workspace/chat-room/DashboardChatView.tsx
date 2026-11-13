"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  Bot,
  ExternalLink,
  FolderKanban,
  Loader2,
  MessageSquarePlus,
  MessageSquareText,
  Sparkles,
  UserRound,
} from "lucide-react"
import { useSelector } from "react-redux"

import { Button } from "@/components/ui/button"
import { useChatSocket } from "@/hooks/useChatSocket"
import type { RootState } from "@/redux/store"
import {
  useAiChatSession,
  useChatMessages,
  useCreateDirectChatSession,
  useMyChatSessions,
  useSendChatMessage,
  useWorkspaceChatSession,
} from "@/services/chat.service"
import { useWorkspaceDashboard } from "@/services/workspace.service"
import type {
  ChatMessage as ChatMessageItem,
  ChatMessageDto,
  ChatSessionDto,
  ChatUser,
} from "@/types/chat.types"
import { UserRole } from "@/types/user/user.type"
import type { UserResponse } from "@/types/user/user.type"

import { ChatComposer } from "./components/ChatComposer"
import { ChatHeader } from "./components/ChatHeader"
import { ChatMessage } from "./components/ChatMessage"
import {
  chatPartner,
  currentUser as fallbackCurrentUser,
} from "./data/mock-chat-room"

const NEURO_BOT_USER: ChatUser = {
  id: "NEURO_BOT",
  code: "NEURO_BOT",
  name: "NeuroBot (AI Assistant)",
  avatarUrl: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png",
  role: "ai",
  status: "Online",
}

const AI_QUICK_PROMPTS = [
  "Tư vấn lộ trình & tiến độ cho dự án trên Neuro Bridge",
  "Hướng dẫn quy trình nộp bài & nghiệm thu Submission Package",
  "Giải thích cơ chế bảo vệ thanh toán qua Escrow",
]

type SelectedConversation =
  | { kind: "AI" }
  | { kind: "WORKSPACE"; workspaceId: string; projectName: string; partnerName?: string; partnerAvatar?: string | null }
  | { kind: "DIRECT"; session: ChatSessionDto }

export function DashboardChatView({
  role = "CLIENT",
}: {
  role?: "CLIENT" | "EXPERT"
}) {
  const user = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null

  const isExpert =
    role === "EXPERT" || user?.role === UserRole.EXPERT

  const userContext = useMemo(
    () => ({
      userCode: user?.code ?? user?.id ?? null,
      userRole: user?.role ?? role,
    }),
    [role, user?.code, user?.id, user?.role],
  )

  const workspaceDashboardQuery = useWorkspaceDashboard({
    pageNo: 0,
    pageSize: 20,
  })
  const workspaces = useMemo(
    () => workspaceDashboardQuery.data?.content ?? [],
    [workspaceDashboardQuery.data?.content],
  )

  const directSessionsQuery = useMyChatSessions("DIRECT", userContext, true)
  const directSessions = useMemo(
    () => directSessionsQuery.data ?? [],
    [directSessionsQuery.data],
  )

  const [selected, setSelected] = useState<SelectedConversation | null>(null)
  const [directCodeInput, setDirectCodeInput] = useState("")
  const [showNewDirectInput, setShowNewDirectInput] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Auto-select first workspace project if available, otherwise NeuroBot AI
  useEffect(() => {
    if (selected !== null) return
    if (workspaceDashboardQuery.isLoading) return

    if (workspaces.length > 0) {
      const first = workspaces[0]
      setSelected({
        kind: "WORKSPACE",
        workspaceId: first.workspaceId,
        projectName: first.projectName || "Project Workspace",
        partnerName: first.partner?.name,
        partnerAvatar: first.partner?.avatarUrl,
      })
    } else {
      setSelected({ kind: "AI" })
    }
  }, [selected, workspaceDashboardQuery.isLoading, workspaces])

  const selectedWorkspaceId =
    selected?.kind === "WORKSPACE" ? selected.workspaceId : null

  const workspaceSessionQuery = useWorkspaceChatSession(
    selectedWorkspaceId,
    userContext,
    selected?.kind === "WORKSPACE",
  )

  const aiSessionQuery = useAiChatSession(
    userContext,
    selected?.kind === "AI",
  )

  const activeSession: ChatSessionDto | null = useMemo(() => {
    if (!selected) return null
    if (selected.kind === "AI") return aiSessionQuery.data ?? null
    if (selected.kind === "WORKSPACE") return workspaceSessionQuery.data ?? null
    return selected.session
  }, [aiSessionQuery.data, selected, workspaceSessionQuery.data])

  const activeSessionId = activeSession?.id ?? null
  const isSessionLoading =
    (selected?.kind === "AI" && aiSessionQuery.isLoading) ||
    (selected?.kind === "WORKSPACE" && workspaceSessionQuery.isLoading)

  const messagesQuery = useChatMessages(
    activeSessionId,
    Boolean(activeSessionId),
  )
  const socketState = useChatSocket(activeSessionId)
  const sendMessageMutation = useSendChatMessage(userContext)
  const createDirectMutation = useCreateDirectChatSession(userContext)

  const partnerUser: ChatUser = useMemo(() => {
    if (!selected || selected.kind === "AI") {
      return NEURO_BOT_USER
    }

    const myCode = user?.code?.toLowerCase()
    const myId = user?.id?.toLowerCase()

    const sessionPartner = activeSession?.participants?.find((p) => {
      const pCode = p.code?.toLowerCase()
      const pId = p.id?.toLowerCase()
      return pCode !== myCode && (!myId || pId !== myId)
    })

    const name =
      (selected.kind === "WORKSPACE" ? selected.partnerName : undefined) ||
      sessionPartner?.fullName ||
      sessionPartner?.code ||
      chatPartner.name

    const avatarUrl =
      (selected.kind === "WORKSPACE" ? selected.partnerAvatar : undefined) ||
      sessionPartner?.avatarUrl ||
      `https://ui-avatars.com/api/?background=4f46e5&color=fff&name=${encodeURIComponent(name)}`

    return {
      id: sessionPartner?.code || sessionPartner?.id || chatPartner.id,
      code: sessionPartner?.code,
      name,
      avatarUrl,
      role: isExpert ? "client" : "expert",
      status: "Online",
    }
  }, [activeSession?.participants, isExpert, selected, user?.code, user?.id])

  const signedInChatUser: ChatUser = useMemo(() => {
    const name = user?.fullName || fallbackCurrentUser.name
    const avatarUrl =
      user?.avatarUrl ||
      `https://ui-avatars.com/api/?background=0f172a&color=fff&name=${encodeURIComponent(name)}`

    return {
      id: user?.code || user?.id || fallbackCurrentUser.id,
      code: user?.code,
      name,
      avatarUrl,
      role: isExpert ? "expert" : "client",
      status: "Online",
    }
  }, [isExpert, user?.avatarUrl, user?.code, user?.fullName, user?.id])

  const uiMessages: ChatMessageItem[] = useMemo(() => {
    const rawList = messagesQuery.data ?? []
    const isAi = selected?.kind === "AI"
    return rawList.map((dto) =>
      mapDtoToUiMessage(dto, signedInChatUser, partnerUser, user, isAi),
    )
  }, [messagesQuery.data, partnerUser, selected?.kind, signedInChatUser, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [uiMessages.length, activeSessionId])

  const handleSendMessage = async (content: string) => {
    let targetSessionId = activeSessionId

    if (!targetSessionId) {
      if (selected?.kind === "AI") {
        const res = await aiSessionQuery.refetch()
        targetSessionId = res.data?.id ?? null
      } else if (selected?.kind === "WORKSPACE") {
        const res = await workspaceSessionQuery.refetch()
        targetSessionId = res.data?.id ?? null
      }
    }

    if (!targetSessionId) return

    await sendMessageMutation.mutateAsync({
      chatSessionId: targetSessionId,
      content,
    })
  }

  const handleCreateDirectSession = async () => {
    const code = directCodeInput.trim()
    if (!code) return

    const created = await createDirectMutation.mutateAsync(code)
    setDirectCodeInput("")
    setShowNewDirectInput(false)
    setSelected({ kind: "DIRECT", session: created })
  }

  return (
    <div className="flex h-[calc(100vh-7vh)] min-h-[620px] flex-col bg-[#f4f7fe] p-4 sm:p-6">
      <div className="mx-auto flex h-full w-full max-w-[1600px] min-h-0 gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        {/* Left Sidebar: Conversations List */}
        <aside className="flex w-80 shrink-0 flex-col border-r border-slate-100 bg-slate-50/50">
          <div className="border-b border-slate-100 bg-white px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  {isExpert ? "Expert Messaging" : "Client Messaging"}
                </p>
                <h1 className="mt-0.5 text-lg font-extrabold text-slate-900">
                  Chat & AI Hub
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setShowNewDirectInput((prev) => !prev)}
                title="Chat trực tiếp qua mã User Code"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </button>
            </div>

            {user?.code && (
              <p className="mt-1.5 text-[11px] font-medium text-slate-500">
                Mã của bạn:{" "}
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-bold text-slate-800">
                  {user.code}
                </span>
              </p>
            )}

            {showNewDirectInput && (
              <div className="mt-3 flex gap-1.5">
                <input
                  value={directCodeInput}
                  onChange={(e) => setDirectCodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      void handleCreateDirectSession()
                    }
                  }}
                  placeholder={
                    isExpert
                      ? "Nhập mã Client (VD: CLI-...)"
                      : "Nhập mã Expert (VD: EXP-...)"
                  }
                  className="h-8 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={
                    !directCodeInput.trim() || createDirectMutation.isPending
                  }
                  onClick={() => void handleCreateDirectSession()}
                  className="h-8 rounded-lg bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-700"
                >
                  Chat
                </Button>
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-3">
            {/* Section 1: NeuroBot AI */}
            <div>
              <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                AI Assistant
              </p>
              <button
                type="button"
                onClick={() => setSelected({ kind: "AI" })}
                className={`mt-1.5 flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                  selected?.kind === "AI"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-800 hover:bg-indigo-50/70"
                }`}
              >
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                  <Bot className="h-5 w-5" />
                  <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-xs font-bold">
                      NeuroBot AI Assistant
                    </p>
                    <Sparkles className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  </div>
                  <p
                    className={`mt-0.5 truncate text-[11px] ${
                      selected?.kind === "AI"
                        ? "text-indigo-100"
                        : "text-slate-500"
                    }`}
                  >
                    Tư vấn dự án & kỹ thuật 24/7
                  </p>
                </div>
              </button>
            </div>

            {/* Section 2: Project Workspaces */}
            <div>
              <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Project Workspaces ({workspaces.length})
              </p>

              {workspaceDashboardQuery.isLoading ? (
                <div className="mt-2 flex items-center gap-2 px-3 py-4 text-xs text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải dự án...
                </div>
              ) : workspaces.length === 0 ? (
                <p className="mt-1.5 px-2 text-xs text-slate-400">
                  Chưa có dự án Workspace nào.
                </p>
              ) : (
                <div className="mt-1.5 space-y-1.5">
                  {workspaces.map((ws) => {
                    const isSelected =
                      selected?.kind === "WORKSPACE" &&
                      selected.workspaceId === ws.workspaceId
                    const partnerName =
                      ws.partner?.name ||
                      (isExpert ? "Client Partner" : "Expert Partner")

                    return (
                      <button
                        key={ws.workspaceId}
                        type="button"
                        onClick={() =>
                          setSelected({
                            kind: "WORKSPACE",
                            workspaceId: ws.workspaceId,
                            projectName: ws.projectName || "Untitled Project",
                            partnerName: ws.partner?.name,
                            partnerAvatar: ws.partner?.avatarUrl,
                          })
                        }
                        className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-white text-slate-800 hover:bg-indigo-50/70"
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                          <FolderKanban className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold">
                            {ws.projectName || "Untitled Project"}
                          </p>
                          <p
                            className={`mt-0.5 truncate text-[11px] font-medium ${
                              isSelected ? "text-indigo-100" : "text-slate-500"
                            }`}
                          >
                            {isExpert ? "Client: " : "Expert: "}
                            {partnerName}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Section 3: Direct Chats */}
            {directSessions.length > 0 && (
              <div>
                <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Direct Messages ({directSessions.length})
                </p>
                <div className="mt-1.5 space-y-1.5">
                  {directSessions.map((session) => {
                    const isSelected =
                      selected?.kind === "DIRECT" &&
                      selected.session.id === session.id
                    const otherParticipant = session.participants?.find(
                      (p) =>
                        p.code?.toLowerCase() !== user?.code?.toLowerCase() &&
                        p.id?.toLowerCase() !== user?.id?.toLowerCase(),
                    )
                    const title =
                      otherParticipant?.fullName ||
                      otherParticipant?.code ||
                      `Direct #${session.id.slice(0, 6)}`

                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() =>
                          setSelected({ kind: "DIRECT", session })
                        }
                        className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-white text-slate-800 hover:bg-indigo-50/70"
                        }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold">{title}</p>
                          <p
                            className={`mt-0.5 truncate text-[11px] ${
                              isSelected ? "text-indigo-100" : "text-slate-500"
                            }`}
                          >
                            {session.lastMessage?.content || "Direct chat"}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Main Area: Active Conversation */}
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
          <ChatHeader
            user={partnerUser}
            socketState={socketState}
            activeMode={selected?.kind === "AI" ? "AI" : "PROJECT"}
          />

          {selected?.kind === "WORKSPACE" && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-6 py-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <FolderKanban className="h-4 w-4 text-indigo-600" />
                <span className="font-bold text-slate-800">
                  {selected.projectName}
                </span>
              </div>

              <Link
                href={`/chat-room/${encodeURIComponent(selected.workspaceId)}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1 font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                <span>Open Full Chat & Submission Room</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
            <div className="mx-auto flex max-w-4xl flex-col gap-5 pb-4">
              {isSessionLoading || messagesQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
                  <p className="mt-3 text-xs font-medium">
                    Đang kết nối phòng chat và tải lịch sử tin nhắn...
                  </p>
                </div>
              ) : uiMessages.length === 0 ? (
                <div className="mx-auto my-8 flex max-w-md flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
                  {selected?.kind === "AI" ? (
                    <Bot className="h-10 w-10 text-indigo-600" />
                  ) : (
                    <MessageSquareText className="h-10 w-10 text-indigo-600" />
                  )}
                  <h3 className="mt-3 text-sm font-bold text-slate-800">
                    {selected?.kind === "AI"
                      ? "Trò chuyện với NeuroBot AI"
                      : `Bắt đầu trao đổi với ${partnerUser.name}`}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                    {selected?.kind === "AI"
                      ? "Hỏi bất kỳ điều gì về yêu cầu kỹ thuật, tiến độ dự án hoặc quy trình bàn giao trên Neuro Bridge."
                      : "Tin nhắn được lưu trữ trong PostgreSQL và đồng bộ thời gian thực giữa Client & Expert."}
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {(selected?.kind === "AI"
                      ? AI_QUICK_PROMPTS
                      : [
                          `Chào ${partnerUser.name}, mình trao đổi về tiến độ dự án nhé!`,
                          "Bạn cập nhật giúp mình tiến độ hiện tại nha.",
                        ]
                    ).map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => void handleSendMessage(sample)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 shadow-2xs transition hover:bg-indigo-50"
                      >
                        <Sparkles className="h-3 w-3" />
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {uiMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      currentUser={signedInChatUser}
                      partner={partnerUser}
                    />
                  ))}

                  {selected?.kind === "AI" && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 pl-11">
                      {AI_QUICK_PROMPTS.map((sample) => (
                        <button
                          key={sample}
                          type="button"
                          disabled={sendMessageMutation.isPending}
                          onClick={() => void handleSendMessage(sample)}
                          className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50/60 px-3 py-1 text-[11px] font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
                        >
                          <Sparkles className="h-3 w-3" />
                          {sample}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <ChatComposer
            onSendMessage={handleSendMessage}
            isSending={sendMessageMutation.isPending}
            disabled={isSessionLoading}
            placeholder={
              selected?.kind === "AI"
                ? "Nhập câu hỏi cho NeuroBot AI và nhấn Enter..."
                : `Nhắn tin cho ${partnerUser.name}...`
            }
          />
        </section>
      </div>
    </div>
  )
}

function mapDtoToUiMessage(
  dto: ChatMessageDto,
  signedInChatUser: ChatUser,
  partnerUser: ChatUser,
  user: UserResponse | null,
  isAiMode: boolean,
): ChatMessageItem {
  const isAiBotMessage =
    dto.senderRole === "AI_BOT" || dto.senderCode === "NEURO_BOT"

  const matchesMyCode =
    Boolean(user?.code) &&
    dto.senderCode?.toLowerCase() === user?.code?.toLowerCase()
  const matchesMyId =
    Boolean(user?.id) &&
    dto.senderCode?.toLowerCase() === user?.id?.toLowerCase()
  const matchesMyRoleInProject =
    !isAiBotMessage &&
    Boolean(user?.role) &&
    dto.senderRole === user?.role &&
    dto.senderCode !== partnerUser.code &&
    dto.senderCode !== partnerUser.id

  const isMine =
    !isAiBotMessage &&
    (matchesMyCode ||
      matchesMyId ||
      (isAiMode && dto.senderRole !== "AI_BOT") ||
      matchesMyRoleInProject)

  return {
    id: dto.id,
    senderId: isMine ? signedInChatUser.id : partnerUser.id,
    type: "text",
    content: dto.content,
    time: formatMessageTime(dto.createdAt),
  }
}

function formatMessageTime(value?: string): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

