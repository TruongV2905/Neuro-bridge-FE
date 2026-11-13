"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Bot, Loader2, MessageSquareText, Sparkles } from "lucide-react"
import { useSelector } from "react-redux"

import Header from "@/components/layout/Header"
import { useChatSocket } from "@/hooks/useChatSocket"
import type { RootState } from "@/redux/store"
import {
  useAiChatSession,
  useChatMessages,
  useSendChatMessage,
  useWorkspaceChatSession,
} from "@/services/chat.service"
import { useWorkspaceDetail } from "@/services/workspace.service"
import type {
  ChatMessage as ChatMessageItem,
  ChatMessageDto,
  ChatUser,
} from "@/types/chat.types"
import { UserRole } from "@/types/user/user.type"
import type { UserResponse } from "@/types/user/user.type"

import { ClientProjectSubmissionPanel } from "../submission/components/ClientProjectSubmissionPanel"
import { ProjectSubmissionPanel } from "../submission/components/ProjectSubmissionPanel"
import { ChatComposer } from "./components/ChatComposer"
import { ChatHeader } from "./components/ChatHeader"
import { ChatMessage } from "./components/ChatMessage"
import { ChatProfilePanel } from "./components/ChatProfilePanel"
import {
  chatMedia,
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
  "Tư vấn lộ trình & tiến độ cho dự án này",
  "Hướng dẫn quy trình nộp bài & nghiệm thu Submission Package",
  "Giải thích cơ chế bảo vệ thanh toán qua Escrow",
]

type WorkspaceChatRoomViewProps = {
  workspaceId: string
}

export function WorkspaceChatRoomView({
  workspaceId,
}: WorkspaceChatRoomViewProps) {
  const normalizedWorkspaceId = workspaceId.trim()
  const [activeMode, setActiveMode] = useState<"PROJECT" | "AI">("PROJECT")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const user = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null

  const userContext = useMemo(
    () => ({
      userCode: user?.code ?? user?.id ?? null,
      userRole: user?.role ?? null,
    }),
    [user?.code, user?.id, user?.role],
  )

  const {
    data: workspace,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
    error: workspaceError,
  } = useWorkspaceDetail(normalizedWorkspaceId)

  const projectSessionQuery = useWorkspaceChatSession(
    normalizedWorkspaceId,
    userContext,
    activeMode === "PROJECT",
  )

  const aiSessionQuery = useAiChatSession(
    userContext,
    activeMode === "AI",
  )

  const activeSession =
    activeMode === "AI" ? aiSessionQuery.data : projectSessionQuery.data
  const activeSessionId = activeSession?.id ?? null
  const isSessionLoading =
    activeMode === "AI" ? aiSessionQuery.isLoading : projectSessionQuery.isLoading

  const messagesQuery = useChatMessages(activeSessionId, Boolean(activeSessionId))
  const socketState = useChatSocket(activeSessionId)
  const sendMessageMutation = useSendChatMessage(userContext)

  const isExpert = user?.role === UserRole.EXPERT
  const isClient = user?.role === UserRole.CLIENT
  const canRenderClientSubmissionPanel =
    isClient &&
    Boolean(normalizedWorkspaceId) &&
    Boolean(workspace) &&
    !isWorkspaceLoading &&
    !isWorkspaceError

  const partnerFromWorkspace = isExpert ? workspace?.client : workspace?.expert

  const partnerFromSession = useMemo(() => {
    if (!activeSession?.participants?.length) return null
    const myCode = user?.code?.toLowerCase()
    const myId = user?.id?.toLowerCase()

    return (
      activeSession.participants.find((p) => {
        const pCode = p.code?.toLowerCase()
        const pId = p.id?.toLowerCase()
        if (activeMode === "AI") {
          return p.code === "NEURO_BOT" || p.role === "AI_BOT"
        }
        return pCode !== myCode && (!myId || pId !== myId)
      }) ?? null
    )
  }, [activeMode, activeSession?.participants, user?.code, user?.id])

  const partnerUser: ChatUser = useMemo(() => {
    if (activeMode === "AI") {
      return NEURO_BOT_USER
    }

    const name =
      partnerFromWorkspace?.name ||
      partnerFromSession?.fullName ||
      chatPartner.name
    const avatarUrl =
      partnerFromWorkspace?.avatarUrl ||
      partnerFromSession?.avatarUrl ||
      `https://ui-avatars.com/api/?background=4f46e5&color=fff&name=${encodeURIComponent(name)}`

    return {
      id:
        partnerFromSession?.code ||
        partnerFromWorkspace?.userId ||
        chatPartner.id,
      code: partnerFromSession?.code,
      name,
      avatarUrl,
      role: isExpert ? "client" : "expert",
      status: "Online",
    }
  }, [activeMode, isExpert, partnerFromSession, partnerFromWorkspace])

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
    return rawList.map((dto) =>
      mapDtoToUiMessage(dto, signedInChatUser, partnerUser, user, activeMode),
    )
  }, [activeMode, messagesQuery.data, partnerUser, signedInChatUser, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [uiMessages.length, activeMode])

  const handleSendMessage = async (content: string) => {
    let targetSessionId = activeSessionId

    if (!targetSessionId) {
      if (activeMode === "AI") {
        const res = await aiSessionQuery.refetch()
        targetSessionId = res.data?.id ?? null
      } else {
        const res = await projectSessionQuery.refetch()
        targetSessionId = res.data?.id ?? null
      }
    }

    if (!targetSessionId) return

    await sendMessageMutation.mutateAsync({
      chatSessionId: targetSessionId,
      content,
    })
  }

  const workspaceStatusMessage = getWorkspaceStatusMessage({
    isInvalidWorkspaceId: !normalizedWorkspaceId,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
    error: workspaceError,
  })

  const backHref = isClient
    ? `/client/dashboard/projects/${encodeURIComponent(normalizedWorkspaceId)}`
    : `/expert/dashboard/projects/${encodeURIComponent(normalizedWorkspaceId)}`

  return (
    <div className="relative min-h-screen bg-[#eaf3ff]">
      <div className="fixed inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-[#eef5ff] via-[#f7fbff] to-transparent" />

      <div className="fixed inset-x-0 top-0 z-10 h-24 bg-indigo-950/15 backdrop-blur-xl border-b border-white/20" />

      <Header />

      <main className="relative z-10 px-4 pb-6 pt-24">
        <div className="mx-auto mt-4 flex h-[calc(100vh-128px)] max-w-[1600px] gap-4 min-h-0">
          <section className="flex flex-1 max-w-[2000px] min-w-0 overflow-hidden rounded-2xl border border-white/70 bg-white/95 backdrop-blur-sm shadow-md transition-all">
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <ChatHeader
                user={partnerUser}
                socketState={socketState}
                activeMode={activeMode}
                onModeChange={setActiveMode}
              />

              <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={backHref}
                      className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Workspace
                    </Link>
                    <span className="text-slate-300">|</span>
                    <span className="font-semibold text-slate-800">
                      {workspace?.projectName ?? workspaceStatusMessage}
                    </span>

                    <span>Status: {workspace?.projectStatus ?? "-"}</span>

                    <span>
                      Progress: {workspace?.progressPercentage ?? 0}%
                    </span>
                  </div>

                  {activeSessionId && (
                    <span className="text-[11px] text-slate-400">
                      Session: #{activeSessionId.slice(0, 8)}
                    </span>
                  )}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
                <div className="mx-auto flex flex-col gap-5 pb-4">
                  <div className="flex justify-center my-1">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                      {activeMode === "AI"
                        ? "NeuroBot AI Assistant • Real-time Session"
                        : "Workspace Project Chat • Real-time"}
                    </span>
                  </div>

                  {isSessionLoading || messagesQuery.isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
                      <p className="mt-3 text-xs font-medium">
                        Đang kết nối phòng chat và tải lịch sử tin nhắn...
                      </p>
                    </div>
                  ) : uiMessages.length === 0 ? (
                    <div className="mx-auto my-8 flex max-w-md flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
                      {activeMode === "AI" ? (
                        <Bot className="h-10 w-10 text-indigo-600" />
                      ) : (
                        <MessageSquareText className="h-10 w-10 text-indigo-600" />
                      )}
                      <h3 className="mt-3 text-sm font-bold text-slate-800">
                        {activeMode === "AI"
                          ? "Bắt đầu trò chuyện với NeuroBot AI"
                          : `Bắt đầu trao đổi dự án với ${partnerUser.name}`}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                        {activeMode === "AI"
                          ? "Hỏi bất kỳ điều gì về yêu cầu kỹ thuật, tiến độ Workspace hoặc quy trình bàn giao dự án."
                          : "Mọi tin nhắn được lưu trữ trực tiếp trên hệ thống và đồng bộ thời gian thực giữa Client & Expert."}
                      </p>

                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {(activeMode === "AI"
                          ? AI_QUICK_PROMPTS
                          : [
                              `Chào ${partnerUser.name}, mình trao đổi về tiến độ dự án nhé!`,
                              "Bạn cập nhật giúp mình tiến độ hiện tại của dự án nha.",
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

                      {activeMode === "AI" && (
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
                  activeMode === "AI"
                    ? "Nhập câu hỏi cho NeuroBot AI và nhấn Enter..."
                    : `Nhắn tin cho ${partnerUser.name}...`
                }
              />
            </div>

            <ChatProfilePanel user={partnerUser} media={chatMedia} />
          </section>

          {isExpert && normalizedWorkspaceId && (
            <ProjectSubmissionPanel workspaceId={normalizedWorkspaceId} />
          )}

          {canRenderClientSubmissionPanel && (
            <ClientProjectSubmissionPanel workspaceId={normalizedWorkspaceId} />
          )}
        </div>
      </main>
    </div>
  )
}

function mapDtoToUiMessage(
  dto: ChatMessageDto,
  signedInChatUser: ChatUser,
  partnerUser: ChatUser,
  user: UserResponse | null,
  activeMode: "PROJECT" | "AI",
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
      (activeMode === "AI" && dto.senderRole !== "AI_BOT") ||
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

function getWorkspaceStatusMessage({
  isInvalidWorkspaceId,
  isLoading,
  isError,
  error,
}: {
  isInvalidWorkspaceId: boolean
  isLoading: boolean
  isError: boolean
  error: { response?: { status?: number; data?: { message?: string } } } | null
}) {
  if (isInvalidWorkspaceId) {
    return "Invalid workspace ID"
  }

  if (isLoading) {
    return "Loading project..."
  }

  if (isError) {
    const status = error?.response?.status
    const message = error?.response?.data?.message

    if (message) return message
    if (status === 401 || status === 403) return "Workspace access denied"
    if (status === 404) return "Workspace not found"

    return "Unable to load workspace"
  }

  return "Workspace unavailable"
}
