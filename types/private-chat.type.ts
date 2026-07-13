import type { ChatUser } from "@/types/chat.types"

export type ChatSessionStatus =
  | "ACTIVE"
  | "CLOSED"
  | "BLOCKED";

export type ChatSessionType = "DIRECT" | "GROUP" | "PROJECT";

export type ChatSessionParticipant = {
  code: string;
  fullName: string;
  avatarUrl: string;
  role: "CLIENT" | "EXPERT" | "ADMIN" | string;
};

export type ChatSession = {
  id: string;
  workspaceId?: string | null;
  status: ChatSessionStatus;
  type: ChatSessionType;
  createdAt: string;
  participantCodes: string[];
  participants: ChatSessionParticipant[];
};

export type ChatApiMessage = {
  id: string
  chatSessionId: string
  senderCode?: string | null
  senderRole: "CLIENT" | "EXPERT" | "ADMIN" | string
  content: string
  createdAt?: string
}

export type ChatMessagesMetadata = {
  page: number
  size: number
  currentElements: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export type ChatMessagesResult = {
  data: ChatApiMessage[]
  metadata: ChatMessagesMetadata
}

export type SendChatMessageRequest = {
  chatSessionId: string
  content: string
}

export type CreateWorkspaceChatSessionRequest = {
  workspaceId: string
}

export type PrivateConversation = {
  id: string
  participant: ChatUser
  status: ChatSessionStatus
  createdAt: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
}
