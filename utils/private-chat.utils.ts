import { LOCAL_CHAT_SOCKET_URL } from "@/features/private-chat/constants/private-chat.constants"

export function getChatSocketUrl(userCode: string) {
  const socketBaseUrl =
    process.env.NEXT_PUBLIC_CHAT_SOCKET_URL?.trim() ||
    getDefaultChatSocketUrl()

  const normalizedSocketBaseUrl = socketBaseUrl.replace(/\/$/, "")

  return `${normalizedSocketBaseUrl}?userCode=${encodeURIComponent(userCode)}`
}

function getDefaultChatSocketUrl() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const normalizedApiBaseUrl = apiBaseUrl.replace(/\/$/, "")

  if (
    normalizedApiBaseUrl.includes("localhost:8080") ||
    normalizedApiBaseUrl.includes("127.0.0.1:8080")
  ) {
    return LOCAL_CHAT_SOCKET_URL
  }

  return `${normalizedApiBaseUrl}/chat/ws/chat`
}
