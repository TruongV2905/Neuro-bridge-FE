import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import type { AxiosError } from "axios"

import api from "@/configs/api"
import type { APIResponse } from "@/types/common.starter"
import type {
  ChatApiMessage,
  ChatMessagesResult,
  ChatSession,
  SendChatMessageRequest,
} from "@/types/private-chat.type"

const CHAT_ENDPOINT = "/chat/chat"

type PrivateChatApiError = AxiosError<APIResponse<null>>

export const privateChatKeys = {
  all: ["private-chat"] as const,

  sessions: () =>
    [...privateChatKeys.all, "sessions"] as const,

  session: (sessionId: string) =>
    [...privateChatKeys.all, "session", sessionId] as const,

  messages: (
    sessionId: string,
    page: number,
    size: number,
  ) =>
    [
      ...privateChatKeys.all,
      "messages",
      sessionId,
      page,
      size,
    ] as const,
}

export async function getMyChatSessions(): Promise<
  APIResponse<ChatSession[]>
> {
  const { data } = await api.get<
    APIResponse<ChatSession[]>
  >(`${CHAT_ENDPOINT}/sessions/mine`)

  return data
}

export function useMyChatSessions() {
  return useQuery<
    APIResponse<ChatSession[]>,
    PrivateChatApiError
  >({
    queryKey: privateChatKeys.sessions(),
    queryFn: getMyChatSessions,
    retry: 0,
  })
}

export async function getChatSessionById(
  sessionId: string,
): Promise<APIResponse<ChatSession>> {
  const normalizedSessionId = sessionId.trim()

  if (!normalizedSessionId) {
    throw new Error("Chat session ID is required")
  }

  const { data } = await api.get<
    APIResponse<ChatSession>
  >(
    `${CHAT_ENDPOINT}/sessions/${encodeURIComponent(
      normalizedSessionId,
    )}`,
  )

  return data
}

export function useChatSessionById(
  sessionId?: string | null,
) {
  const normalizedSessionId =
    sessionId?.trim() ?? ""

  return useQuery<
    APIResponse<ChatSession>,
    PrivateChatApiError
  >({
    queryKey: privateChatKeys.session(
      normalizedSessionId,
    ),
    queryFn: () =>
      getChatSessionById(normalizedSessionId),
    enabled: Boolean(normalizedSessionId),
    retry: 0,
  })
}

export async function getChatMessages(
  sessionId: string,
  page = 0,
  size = 30,
): Promise<APIResponse<ChatMessagesResult>> {
  const normalizedSessionId = sessionId.trim()

  if (!normalizedSessionId) {
    throw new Error("Chat session ID is required")
  }

  const { data } = await api.get<
    APIResponse<ChatMessagesResult>
  >(
    `${CHAT_ENDPOINT}/sessions/${encodeURIComponent(
      normalizedSessionId,
    )}/messages`,
    {
      params: {
        page,
        size,
      },
    },
  )

  return data
}

export function useChatMessages(
  sessionId?: string | null,
  page = 0,
  size = 30,
) {
  const normalizedSessionId =
    sessionId?.trim() ?? ""

  return useQuery<
    APIResponse<ChatMessagesResult>,
    PrivateChatApiError
  >({
    queryKey: privateChatKeys.messages(
      normalizedSessionId,
      page,
      size,
    ),
    queryFn: () =>
      getChatMessages(
        normalizedSessionId,
        page,
        size,
      ),
    enabled: Boolean(normalizedSessionId),
    retry: 0,
  })
}

export async function sendChatMessage(
  payload: SendChatMessageRequest,
): Promise<APIResponse<ChatApiMessage>> {
  const normalizedContent = payload.content.trim()

  if (!payload.chatSessionId.trim()) {
    throw new Error("Chat session ID is required")
  }

  if (!normalizedContent) {
    throw new Error("Message content is required")
  }

  const { data } = await api.post<
    APIResponse<ChatApiMessage>
  >(`${CHAT_ENDPOINT}/messages`, {
    chatSessionId: payload.chatSessionId,
    content: normalizedContent,
  })

  return data
}

export function useSendChatMessage() {
  const queryClient = useQueryClient()

  return useMutation<
    APIResponse<ChatApiMessage>,
    PrivateChatApiError,
    SendChatMessageRequest
  >({
    mutationFn: sendChatMessage,

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...privateChatKeys.all,
          "messages",
          variables.chatSessionId,
        ],
      })
    },
  })
}

export async function blockChatSession(
  sessionId: string,
): Promise<APIResponse<ChatSession>> {
  const normalizedSessionId = sessionId.trim()

  if (!normalizedSessionId) {
    throw new Error("Chat session ID is required")
  }

  const { data } = await api.post<
    APIResponse<ChatSession>
  >(
    `${CHAT_ENDPOINT}/sessions/${encodeURIComponent(
      normalizedSessionId,
    )}/block`,
  )

  return data
}

export function useBlockChatSession() {
  const queryClient = useQueryClient()

  return useMutation<
    APIResponse<ChatSession>,
    PrivateChatApiError,
    string
  >({
    mutationFn: blockChatSession,

    onSuccess: (response, sessionId) => {
      queryClient.setQueryData(
        privateChatKeys.session(sessionId),
        response,
      )
    },
  })
}

