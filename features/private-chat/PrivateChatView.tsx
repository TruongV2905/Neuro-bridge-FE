"use client"

import { useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"

import {
  useBlockChatSession,
  useChatMessages,
  useChatSessionById,
  useMyChatSessions,
  useSendChatMessage,
} from "@/services/private-chat.service"
import type {
  ChatMessage,
  ChatUser,
} from "@/types/chat.types"
import type {
  ChatSession,
  ChatSessionParticipant,
  PrivateConversation,
} from "@/types/private-chat.type"
import type { RootState } from "@/redux/store"
import type { UserResponse } from "@/types/user/user.type"

import { ConversationList } from "./components/ConversationList"
import { PrivateChatComposer } from "./components/PrivateChatComposer"
import { PrivateChatHeader } from "./components/PrivateChatHeader"
import { PrivateChatMessage } from "./components/PrivateChatMessage"
import { PrivateChatProfilePanel } from "./components/PrivateChatProfilePanel"

const privateChatMedia = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop",
]

type PrivateChatViewProps = {
  sessionId?: string
}

export function PrivateChatView({
  sessionId,
}: PrivateChatViewProps) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const authenticatedUser = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null
  const currentUserCode =
    authenticatedUser?.code?.trim() ?? ""
  const selectedSessionId = sessionId?.trim() ?? ""

  const sessionsQuery = useMyChatSessions()
  const sessionQuery =
    useChatSessionById(selectedSessionId)
  const session = sessionQuery.data?.result
  const canLoadMessages =
    Boolean(selectedSessionId) &&
    session?.id === selectedSessionId
  const messagesQuery =
    useChatMessages(
      canLoadMessages ? selectedSessionId : null,
      0,
      30,
    )

  const sendMessageMutation = useSendChatMessage()
  const blockSessionMutation = useBlockChatSession()

  const conversations = useMemo<PrivateConversation[]>(() => {
    const sessions = sessionsQuery.data?.result ?? []

    return [...sessions]
      .filter((chatSession) => chatSession.type === "DIRECT")
      .sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        )
      })
      .map((chatSession) => {
        const partnerParticipant =
          getPartnerParticipant(
            chatSession,
            currentUserCode,
          )

        const participant =
          partnerParticipant
            ? mapParticipantToChatUser(
                partnerParticipant,
                chatSession.status,
              )
            : getUnavailableChatUser(
                chatSession.status,
              )

        return {
          id: chatSession.id,
          participant,
          status: chatSession.status,
          createdAt: chatSession.createdAt,
          lastMessage: "Open conversation",
          lastMessageTime: formatConversationDate(
            chatSession.createdAt,
          ),
          unreadCount: 0,
        }
      })
  }, [sessionsQuery.data, currentUserCode])

  const authenticatedParticipant = useMemo(() => {
    if (!session || !currentUserCode) {
      return null
    }

    return (
      session.participants.find(
        (participant) =>
          participant.code?.trim() === currentUserCode,
      ) ?? null
    )
  }, [session, currentUserCode])

  const currentUser = useMemo<ChatUser | null>(() => {
    if (!authenticatedParticipant || !session) {
      return null
    }

    return mapParticipantToChatUser(
      authenticatedParticipant,
      session.status,
    )
  }, [authenticatedParticipant, session])

  const partner = useMemo<ChatUser | null>(() => {
    if (!session || !currentUserCode) {
      return null
    }

    const partnerParticipant = getPartnerParticipant(
      session,
      currentUserCode,
    )

    if (!partnerParticipant) {
      return null
    }

    return mapParticipantToChatUser(
      partnerParticipant,
      session.status,
    )
  }, [session, currentUserCode])

  const messages = useMemo<ChatMessage[]>(() => {
    if (!selectedSessionId || !currentUserCode) {
      return []
    }

    const apiMessages =
      messagesQuery.data?.result?.data ?? []

    return [...apiMessages]
      .sort((a, b) => {
        const timeA = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0

        const timeB = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0

        return timeA - timeB
      })
      .map((message) => ({
        id: message.id,
        senderId: message.senderCode,
        type: "text",
        content: message.content,
        time: formatMessageTime(message.createdAt),
      }))
  }, [
    messagesQuery.data,
    selectedSessionId,
    currentUserCode,
  ])

  useEffect(() => {
    if (!selectedSessionId) {
      return
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages.length, selectedSessionId])

  function handleSelectConversation(
    conversationId: string,
  ) {
    if (conversationId === selectedSessionId) {
      return
    }

    router.push(
      `/client/dashboard/chat/${conversationId}`,
    )
  }

  async function handleSendMessage(
    content: string,
  ): Promise<boolean> {
    if (
      !session ||
      !currentUser ||
      !partner ||
      session.status !== "ACTIVE"
    ) {
      return false
    }

    try {
      await sendMessageMutation.mutateAsync({
        chatSessionId: session.id,
        content,
      })

      return true
    } catch (error) {
      console.error(
        "Send private message failed:",
        error,
      )

      window.alert(
        "Khong the gui tin nhan. Vui long thu lai.",
      )

      return false
    }
  }

  function handleBlockSession() {
    if (!session || session.status === "BLOCKED") {
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to block the conversation with ${
        partner?.name ?? "this user"
      }?`,
    )

    if (!confirmed) {
      return
    }

    blockSessionMutation.mutate(session.id, {
      onError: (error) => {
        const message =
          error.response?.data?.message ??
          error.message ??
          "Failed to block chat session"

        window.alert(message)
      },
    })
  }

  const isConversationDisabled =
    session?.status !== "ACTIVE"

  return (
    <div className="h-[93vh] min-h-0 bg-[#eaf3ff] p-4">
      <div className="mx-auto flex h-full max-w-[1600px] min-h-0 overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-md backdrop-blur-sm">
        <ConversationList
          conversations={conversations}
          selectedConversationId={
            selectedSessionId || null
          }
          onSelectConversation={handleSelectConversation}
          isLoading={sessionsQuery.isLoading}
        />

        <section className="flex min-w-0 flex-1 overflow-hidden">
          {!selectedSessionId ? (
            <ChatContentState message="Select a conversation to start chatting." />
          ) : sessionQuery.isLoading ? (
            <ChatContentState message="Loading chat session..." />
          ) : sessionQuery.isError ? (
            <ChatErrorState
              title="Failed to load chat session"
              message={
                sessionQuery.error.response?.data?.message ??
                sessionQuery.error.message ??
                "Failed to load chat session"
              }
              onRetry={() => sessionQuery.refetch()}
            />
          ) : !session ? (
            <ChatContentState message="Chat session not found." />
          ) : !currentUser || !partner ? (
            <ChatContentState message="Chat participants could not be determined." />
          ) : (
            <>
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <PrivateChatHeader user={partner} />

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
                  <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-4">
                    <div className="my-2 flex justify-center">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Today
                      </span>
                    </div>

                    {messagesQuery.isLoading ? (
                      <ChatMessagesState message="Loading messages..." />
                    ) : messagesQuery.isError ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <p className="text-sm font-medium text-red-500">
                          Failed to load messages
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            messagesQuery.refetch()
                          }
                          className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                        >
                          Try again
                        </button>
                      </div>
                    ) : messages.length > 0 ? (
                      messages.map((message) => (
                        <PrivateChatMessage
                          key={message.id}
                          message={message}
                          currentUser={currentUser}
                          partner={partner}
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-14 text-center">
                        <p className="text-sm font-medium text-slate-500">
                          No messages yet
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Send the first message to start the
                          conversation.
                        </p>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {session.status !== "ACTIVE" && (
                  <div
                    className={`border-t px-4 py-2 text-center text-xs font-medium ${
                      session.status === "BLOCKED"
                        ? "border-red-100 bg-red-50 text-red-700"
                        : "border-amber-100 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {session.status === "BLOCKED"
                      ? "This conversation has been blocked. You can no longer send messages."
                      : `This conversation is currently ${session.status.toLowerCase()}.`}
                  </div>
                )}

                <PrivateChatComposer
                  disabled={isConversationDisabled}
                  isSending={sendMessageMutation.isPending}
                  onSendMessage={handleSendMessage}
                />
              </div>

              <PrivateChatProfilePanel
                user={partner}
                media={privateChatMedia}
                isBlocked={session.status === "BLOCKED"}
                isBlocking={
                  blockSessionMutation.isPending
                }
                onBlock={handleBlockSession}
              />
            </>
          )}
        </section>
      </div>
    </div>
  )
}

function getPartnerParticipant(
  session: ChatSession,
  currentUserCode: string,
) {
  if (!currentUserCode) {
    return null
  }

  const isCurrentUserParticipant =
    session.participants.some(
      (participant) =>
        participant.code?.trim() === currentUserCode,
    )

  if (!isCurrentUserParticipant) {
    return null
  }

  return (
    session.participants.find(
      (participant) =>
        participant.code?.trim() !== currentUserCode,
    ) ?? null
  )
}

function mapParticipantToChatUser(
  participant: ChatSessionParticipant,
  sessionStatus: ChatSession["status"],
): ChatUser {
  return {
    id: participant.code,
    name:
      participant.fullName ||
      getParticipantFallbackName(participant),
    avatarUrl:
      participant.avatarUrl ||
      "/img/default-avatar.png",
    role:
      participant.role?.toUpperCase() === "CLIENT"
        ? "client"
        : "expert",
    status:
      sessionStatus === "ACTIVE"
        ? "Online"
        : "Offline",
  }
}

function getUnavailableChatUser(
  sessionStatus: ChatSession["status"],
): ChatUser {
  return {
    id: "",
    name: "Unknown participant",
    avatarUrl: "/img/default-avatar.png",
    role: "expert",
    status:
      sessionStatus === "ACTIVE"
        ? "Online"
        : "Offline",
  }
}

function getParticipantFallbackName(
  participant: ChatSessionParticipant,
) {
  const normalizedRole =
    participant.role?.toLowerCase() || "participant"

  return `Unknown ${normalizedRole}`
}

type ChatContentStateProps = {
  message: string
}

function ChatContentState({
  message,
}: ChatContentStateProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center">
      <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-500">
          {message}
        </p>
      </div>
    </div>
  )
}

type ChatErrorStateProps = {
  title: string
  message: string
  onRetry: () => void
}

function ChatErrorState({
  title,
  message,
  onRetry,
}: ChatErrorStateProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white px-6 py-5 text-center shadow-sm">
        <h2 className="font-semibold text-red-600">
          {title}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {message}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

type ChatMessagesStateProps = {
  message: string
}

function ChatMessagesState({
  message,
}: ChatMessagesStateProps) {
  return (
    <div className="flex items-center justify-center py-10">
      <p className="text-sm text-slate-400">
        {message}
      </p>
    </div>
  )
}

function formatMessageTime(value?: string) {
  if (!value) {
    return ""
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatConversationDate(value?: string) {
  if (!value) {
    return ""
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const now = new Date()

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (isToday) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  })
}
