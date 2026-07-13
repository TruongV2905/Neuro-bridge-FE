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
  CreateWorkspaceChatSessionRequest,
  SendChatMessageRequest,
} from "@/types/private-chat.type"

const CHAT_ENDPOINT = "/chat/chat"

type PrivateChatApiError = AxiosError<APIResponse<null>>

export const privateChatKeys = {
  all: ["private-chat"] as const,

  user: (userCode: string) =>
    [...privateChatKeys.all, "user", userCode] as const,

  sessions: (userCode: string) =>
    [...privateChatKeys.user(userCode), "sessions"] as const,

  session: (userCode: string, sessionId: string) =>
    [
      ...privateChatKeys.user(userCode),
      "session",
      sessionId,
    ] as const,

  messages: (
    userCode: string,
    sessionId: string,
    page: number,
    size: number,
  ) =>
    [
      ...privateChatKeys.all,
      "user",
      userCode,
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

export function useMyChatSessions(
  userCode?: string | null,
) {
  const normalizedUserCode = normalizeUserCode(userCode)

  return useQuery<
    APIResponse<ChatSession[]>,
    PrivateChatApiError
  >({
    queryKey: privateChatKeys.sessions(
      normalizedUserCode,
    ),
    queryFn: getMyChatSessions,
    enabled: Boolean(normalizedUserCode),
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
  userCode?: string | null,
) {
  const normalizedSessionId =
    sessionId?.trim() ?? ""
  const normalizedUserCode = normalizeUserCode(userCode)

  return useQuery<
    APIResponse<ChatSession>,
    PrivateChatApiError
  >({
    queryKey: privateChatKeys.session(
      normalizedUserCode,
      normalizedSessionId,
    ),
    queryFn: () =>
      getChatSessionById(normalizedSessionId),
    enabled:
      Boolean(normalizedUserCode) &&
      Boolean(normalizedSessionId),
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
  userCode?: string | null,
) {
  const normalizedSessionId =
    sessionId?.trim() ?? ""
  const normalizedUserCode = normalizeUserCode(userCode)

  return useQuery<
    APIResponse<ChatMessagesResult>,
    PrivateChatApiError
  >({
    queryKey: privateChatKeys.messages(
      normalizedUserCode,
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
    enabled:
      Boolean(normalizedUserCode) &&
      Boolean(normalizedSessionId),
    retry: 0,
  })
}

export async function createWorkspaceChatSession(
  payload: CreateWorkspaceChatSessionRequest,
): Promise<APIResponse<ChatSession>> {
  const normalizedWorkspaceId = payload.workspaceId.trim()

  if (!normalizedWorkspaceId) {
    throw new Error("Workspace ID is required")
  }

  const { data } = await api.post<
    APIResponse<ChatSession>
  >(`${CHAT_ENDPOINT}/sessions`, {
    workspaceId: normalizedWorkspaceId,
  })

  return data
}

export function useCreateWorkspaceChatSession(
  userCode?: string | null,
) {
  const queryClient = useQueryClient()
  const normalizedUserCode = normalizeUserCode(userCode)

  return useMutation<
    APIResponse<ChatSession>,
    PrivateChatApiError,
    CreateWorkspaceChatSessionRequest
  >({
    mutationFn: createWorkspaceChatSession,
    retry: 0,

    onSuccess: (response) => {
      if (normalizedUserCode) {
        queryClient.invalidateQueries({
          queryKey: privateChatKeys.sessions(
            normalizedUserCode,
          ),
        })
      }

      if (response.result?.id && normalizedUserCode) {
        queryClient.setQueryData(
          privateChatKeys.session(
            normalizedUserCode,
            response.result.id,
          ),
          response,
        )
      }
    },
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

export function useSendChatMessage(
  userCode?: string | null,
) {
  const queryClient = useQueryClient()
  const normalizedUserCode = normalizeUserCode(userCode)

  return useMutation<
    APIResponse<ChatApiMessage>,
    PrivateChatApiError,
    SendChatMessageRequest
  >({
    mutationFn: sendChatMessage,

    onSuccess: (_response, variables) => {
      if (normalizedUserCode) {
        queryClient.invalidateQueries({
          queryKey: privateChatKeys.messages(
            normalizedUserCode,
            variables.chatSessionId,
            0,
            30,
          ),
        })
      }
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

export function useBlockChatSession(
  userCode?: string | null,
) {
  const queryClient = useQueryClient()
  const normalizedUserCode = normalizeUserCode(userCode)

  return useMutation<
    APIResponse<ChatSession>,
    PrivateChatApiError,
    string
  >({
    mutationFn: blockChatSession,

    onSuccess: (response, sessionId) => {
      if (!normalizedUserCode) {
        return
      }

      queryClient.setQueryData(
        privateChatKeys.session(
          normalizedUserCode,
          sessionId,
        ),
        response,
      )

      queryClient.setQueryData<
        APIResponse<ChatSession[]> | undefined
      >(
        privateChatKeys.sessions(normalizedUserCode),
        (current) => {
          if (!current?.result) {
            return current
          }

          return {
            ...current,
            result: current.result.map((chatSession) =>
              chatSession.id === sessionId
                ? response.result
                : chatSession,
            ),
          }
        },
      )

      queryClient.invalidateQueries({
        queryKey: privateChatKeys.sessions(
          normalizedUserCode,
        ),
      })
    },
  })
}

function normalizeUserCode(userCode?: string | null) {
  return userCode?.trim() ?? ""
}

