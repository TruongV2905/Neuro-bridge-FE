import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import api from "@/configs/api"
import type { APIResponse } from "@/types/common.starter"
import type {
  ChatMessageDto,
  ChatPageResponse,
  ChatSessionDto,
  ChatType,
  CreateChatSessionRequestDto,
  SendChatMessageRequestDto,
} from "@/types/chat.types"

const CHAT_ENDPOINT = "/chat"

export type ChatUserContextHeaders = {
  userCode?: string | null
  userRole?: string | null
}

export const chatKeys = {
  all: ["chat"] as const,
  workspaceSession: (workspaceId: string, userCode?: string | null) =>
    [...chatKeys.all, "workspace-session", workspaceId, userCode ?? ""] as const,
  aiSession: (userCode?: string | null) =>
    [...chatKeys.all, "ai-session", userCode ?? ""] as const,
  mySessions: (type: ChatType, userCode?: string | null) =>
    [...chatKeys.all, "my-sessions", type, userCode ?? ""] as const,
  messages: (sessionId: string) =>
    [...chatKeys.all, "messages", sessionId] as const,
}

function unwrapEnvelope<T>(data: T | APIResponse<T>): T {
  if (
    data &&
    typeof data === "object" &&
    "result" in data &&
    "code" in data
  ) {
    return (data as APIResponse<T>).result
  }
  return data as T
}

function buildUserHeaders(ctx?: ChatUserContextHeaders): Record<string, string> {
  const headers: Record<string, string> = {}
  if (ctx?.userCode) {
    headers["X-User-Code"] = ctx.userCode
  }
  if (ctx?.userRole) {
    headers["X-User-Role"] = ctx.userRole
  }
  return headers
}

export async function getOrCreateWorkspaceChatSession(
  workspaceId: string,
  ctx?: ChatUserContextHeaders,
): Promise<ChatSessionDto> {
  const normalizedId = workspaceId.trim()
  const headers = buildUserHeaders(ctx)

  try {
    const { data } = await api.get<ChatSessionDto | APIResponse<ChatSessionDto>>(
      `${CHAT_ENDPOINT}/sessions/workspace/${encodeURIComponent(normalizedId)}`,
      { headers },
    )
    return unwrapEnvelope(data)
  } catch {
    const { data } = await api.post<ChatSessionDto | APIResponse<ChatSessionDto>>(
      `${CHAT_ENDPOINT}/sessions`,
      {
        workspaceId: normalizedId,
        type: "PROJECT",
      } satisfies CreateChatSessionRequestDto,
      { headers },
    )
    return unwrapEnvelope(data)
  }
}

export async function getOrCreateAiChatSession(
  ctx?: ChatUserContextHeaders,
): Promise<ChatSessionDto> {
  const headers = buildUserHeaders(ctx)

  const { data: listData } = await api.get<
    ChatSessionDto[] | APIResponse<ChatSessionDto[]>
  >(`${CHAT_ENDPOINT}/sessions/mine/ai`, { headers })

  const existingList = unwrapEnvelope(listData)
  if (Array.isArray(existingList) && existingList.length > 0) {
    return existingList[0]
  }

  const { data: createdData } = await api.post<
    ChatSessionDto | APIResponse<ChatSessionDto>
  >(
    `${CHAT_ENDPOINT}/sessions`,
    {
      type: "AI",
    } satisfies CreateChatSessionRequestDto,
    { headers },
  )

  return unwrapEnvelope(createdData)
}

export async function getMyChatSessionsByType(
  type: ChatType,
  ctx?: ChatUserContextHeaders,
): Promise<ChatSessionDto[]> {
  const headers = buildUserHeaders(ctx)
  const routeSuffix =
    type === "PROJECT" ? "project" : type === "AI" ? "ai" : "direct"

  const { data } = await api.get<
    ChatSessionDto[] | APIResponse<ChatSessionDto[]>
  >(`${CHAT_ENDPOINT}/sessions/mine/${routeSuffix}`, { headers })

  return unwrapEnvelope(data) ?? []
}

export async function createDirectChatSession(
  participantCode: string,
  ctx?: ChatUserContextHeaders,
): Promise<ChatSessionDto> {
  const headers = buildUserHeaders(ctx)
  const { data } = await api.post<ChatSessionDto | APIResponse<ChatSessionDto>>(
    `${CHAT_ENDPOINT}/sessions`,
    {
      type: "DIRECT",
      participantCodes: [participantCode.trim()],
    } satisfies CreateChatSessionRequestDto,
    { headers },
  )
  return unwrapEnvelope(data)
}

export async function getChatSessionMessages(
  sessionId: string,
  page = 0,
  size = 100,
): Promise<ChatPageResponse<ChatMessageDto>> {
  const { data } = await api.get<
    ChatPageResponse<ChatMessageDto> | APIResponse<ChatPageResponse<ChatMessageDto>>
  >(`${CHAT_ENDPOINT}/sessions/${encodeURIComponent(sessionId)}/messages`, {
    params: { page, size },
  })

  return unwrapEnvelope(data)
}

export async function sendChatMessage(
  payload: SendChatMessageRequestDto,
  ctx?: ChatUserContextHeaders,
): Promise<ChatMessageDto> {
  const headers = buildUserHeaders(ctx)
  const { data } = await api.post<ChatMessageDto | APIResponse<ChatMessageDto>>(
    `${CHAT_ENDPOINT}/messages`,
    payload,
    { headers },
  )
  return unwrapEnvelope(data)
}

export function appendMessageToCache(
  messages: ChatMessageDto[] | undefined,
  incoming: ChatMessageDto,
): ChatMessageDto[] {
  const list = messages ?? []
  if (list.some((item) => item.id === incoming.id)) {
    return list
  }
  return [...list, incoming].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
}

export function useWorkspaceChatSession(
  workspaceId?: string | null,
  ctx?: ChatUserContextHeaders,
  enabled = true,
) {
  const normalized = workspaceId?.trim() ?? ""
  const isValidGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    normalized,
  )

  return useQuery({
    queryKey: chatKeys.workspaceSession(normalized, ctx?.userCode),
    queryFn: () => getOrCreateWorkspaceChatSession(normalized, ctx),
    enabled: enabled && isValidGuid,
    retry: 1,
  })
}

export function useAiChatSession(
  ctx?: ChatUserContextHeaders,
  enabled = false,
) {
  return useQuery({
    queryKey: chatKeys.aiSession(ctx?.userCode),
    queryFn: () => getOrCreateAiChatSession(ctx),
    enabled,
    retry: 1,
  })
}

export function useMyChatSessions(
  type: ChatType,
  ctx?: ChatUserContextHeaders,
  enabled = true,
) {
  return useQuery({
    queryKey: chatKeys.mySessions(type, ctx?.userCode),
    queryFn: () => getMyChatSessionsByType(type, ctx),
    enabled,
    retry: 1,
  })
}

export function useCreateDirectChatSession(ctx?: ChatUserContextHeaders) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (participantCode: string) =>
      createDirectChatSession(participantCode, ctx),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: chatKeys.mySessions("DIRECT", ctx?.userCode),
      })
    },
  })
}

export function useChatMessages(sessionId?: string | null, enabled = true) {
  const normalized = sessionId?.trim() ?? ""

  return useQuery({
    queryKey: chatKeys.messages(normalized),
    queryFn: async () => {
      const page = await getChatSessionMessages(normalized, 0, 100)
      return page.content ?? []
    },
    enabled: enabled && Boolean(normalized),
    refetchInterval: 4000,
    retry: 1,
  })
}

export function useSendChatMessage(ctx?: ChatUserContextHeaders) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SendChatMessageRequestDto) =>
      sendChatMessage(payload, ctx),
    onSuccess: (createdMessage) => {
      queryClient.setQueryData<ChatMessageDto[]>(
        chatKeys.messages(createdMessage.chatSessionId),
        (current) => appendMessageToCache(current, createdMessage),
      )
    },
  })
}
