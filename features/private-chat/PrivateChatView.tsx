"use client"

import { useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"

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
import type { PrivateConversation } from "@/types/private-chat.type"

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
  sessionId: string
}

export function PrivateChatView({
  sessionId,
}: PrivateChatViewProps) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // GET /api/chat/chat/sessions/mine
  const sessionsQuery = useMyChatSessions()

  // GET /api/chat/chat/sessions/{id}
  const sessionQuery = useChatSessionById(sessionId)

  // GET /api/chat/chat/sessions/{id}/messages
  const messagesQuery = useChatMessages(sessionId, 0, 30)

  const sendMessageMutation = useSendChatMessage()
  const blockSessionMutation = useBlockChatSession()

  const session = sessionQuery.data?.result

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
        const expert = chatSession.participants.find(
          (participant) =>
            participant.role?.toUpperCase() === "EXPERT",
        )

        return {
          id: chatSession.id,
          participant: {
            id: expert?.code ?? "",
            name: expert?.fullName || "Unknown expert",
            avatarUrl:
              expert?.avatarUrl || "/img/default-avatar.png",
            role: "expert",
            status:
              chatSession.status === "ACTIVE"
                ? "Online"
                : "Offline",
          },
          status: chatSession.status,
          createdAt: chatSession.createdAt,

          // API sessions/mine hiện chưa trả lastMessage.
          lastMessage: "Open conversation",
          lastMessageTime: formatConversationDate(
            chatSession.createdAt,
          ),
          unreadCount: 0,
        }
      })
  }, [sessionsQuery.data])

  const currentUser = useMemo<ChatUser | null>(() => {
    const client = session?.participants.find(
      (participant) =>
        participant.role?.toUpperCase() === "CLIENT",
    )

    if (!client) {
      return null
    }

    return {
      id: client.code,
      name: client.fullName || "Client",
      avatarUrl:
        client.avatarUrl || "/img/default-avatar.png",
      role: "client",
      status:
        session?.status === "ACTIVE"
          ? "Online"
          : "Offline",
    }
  }, [session])

  const partner = useMemo<ChatUser | null>(() => {
    const expert = session?.participants.find(
      (participant) =>
        participant.role?.toUpperCase() === "EXPERT",
    )

    if (!expert) {
      return null
    }

    return {
      id: expert.code,
      name: expert.fullName || "Expert",
      avatarUrl:
        expert.avatarUrl || "/img/default-avatar.png",
      role: "expert",
      status:
        session?.status === "ACTIVE"
          ? "Online"
          : "Offline",
    }
  }, [session])

  const messages = useMemo<ChatMessage[]>(() => {
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
      .map((message) => {
        const isClientMessage =
          message.senderRole?.toUpperCase() === "CLIENT"

        return {
          id: message.id,
          senderId: isClientMessage
            ? currentUser?.id ?? message.senderCode
            : message.senderCode,
          type: "text",
          content: message.content,
          time: formatMessageTime(message.createdAt),
        }
      })
  }, [messagesQuery.data, currentUser])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages.length])

  function handleSelectConversation(
    conversationId: string,
  ) {
    if (conversationId === sessionId) {
      return
    }

    router.push(
      `/client/dashboard/chat/${conversationId}`,
    )
  }

  async function handleSendMessage(
    content: string,
  ): Promise<boolean> {
    if (!session || session.status !== "ACTIVE") {
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
        "Không thể gửi tin nhắn. Vui lòng thử lại.",
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
          selectedConversationId={sessionId}
          onSelectConversation={handleSelectConversation}
          isLoading={sessionsQuery.isLoading}
        />

        <section className="flex min-w-0 flex-1 overflow-hidden">
          {sessionQuery.isLoading ? (
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