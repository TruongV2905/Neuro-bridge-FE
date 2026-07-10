export type ChatUserRole = "client" | "expert"

export type ChatUserStatus = "Online" | "Offline"

export type ChatMessageType = "text" | "image" | "file"

export type ChatUser = {
  id: string
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