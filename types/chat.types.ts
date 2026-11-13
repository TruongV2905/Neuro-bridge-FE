export type ChatUserRole = "client" | "expert" | "ai"

export type ChatUserStatus = "Online" | "Offline" | "Connecting..."

export type ChatMessageType = "text" | "image" | "file"

export type ChatUser = {
  id: string
  code?: string
  name: string
  avatarUrl: string
  role: ChatUserRole
  status: ChatUserStatus
}

export type ChatAttachment = {
  id: string
  name: string
  url: string
  size?: string
  mimeType?: string
}

export type ChatMessage = {
  id: string
  senderId: string
  type: ChatMessageType
  content?: string
  imageUrl?: string
  attachment?: ChatAttachment
  time: string
}

// ── Real Backend Chat Service DTOs ──────────────────────────────────────────

export type ChatSessionStatus = "ACTIVE" | "CLOSED" | "BLOCKED"

export type ChatType = "DIRECT" | "PROJECT" | "AI"

export type SenderRole = "CLIENT" | "EXPERT" | "SYSTEM" | "AI_BOT"

export type ParticipantDetail = {
  id?: string | null
  code: string
  fullName: string
  avatarUrl?: string | null
  role?: string | null
}

export type ChatMessageDto = {
  id: string
  chatSessionId: string
  senderCode: string
  senderRole: SenderRole
  content: string
  createdAt: string
}

export type ChatSessionDto = {
  id: string
  workspaceId?: string | null
  status: ChatSessionStatus
  type: ChatType
  createdAt: string
  participantCodes: string[]
  participants: ParticipantDetail[]
  lastMessage?: ChatMessageDto | null
}

export type ChatPageResponse<T> = {
  currentPage: number
  totalPages: number
  pageSize: number
  totalElements: number
  content: T[]
}

export type CreateChatSessionRequestDto = {
  workspaceId?: string | null
  type: ChatType
  participantCodes?: string[]
}

export type SendChatMessageRequestDto = {
  chatSessionId: string
  content: string
}
