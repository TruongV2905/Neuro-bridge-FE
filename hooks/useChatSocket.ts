"use client"

import { useEffect } from "react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"

import { CHAT_SOCKET_DESTINATION } from "@/features/private-chat/constants/private-chat.constants"
import type { ChatApiMessage } from "@/types/private-chat.type"
import { getChatSocketUrl } from "@/utils/private-chat.utils"

type UseChatSocketParams = {
  enabled: boolean
  sessionId: string
  userCode: string
  onMessage: (message: ChatApiMessage) => void
}

export function useChatSocket({
  enabled,
  sessionId,
  userCode,
  onMessage,
}: UseChatSocketParams) {
  useEffect(() => {
    if (!enabled || !sessionId || !userCode) {
      return
    }

    const socketUrl = getChatSocketUrl(userCode)
    const stompClient = new Client({
      reconnectDelay: 5000,
      debug: () => undefined,
      webSocketFactory: () => new SockJS(socketUrl),
      onConnect: () => {
        stompClient.subscribe(CHAT_SOCKET_DESTINATION, (message) => {
          const payload = parseChatSocketMessage(message.body)

          if (
            payload &&
            isSameChatSession(payload.chatSessionId, sessionId)
          ) {
            onMessage(payload)
          }
        })
      },
    })

    stompClient.activate()

    return () => {
      void stompClient.deactivate()
    }
  }, [enabled, onMessage, sessionId, userCode])
}

function parseChatSocketMessage(value: string) {
  try {
    const payload = JSON.parse(value) as unknown

    return isChatApiMessage(payload) ? payload : null
  } catch {
    return null
  }
}

function isChatApiMessage(value: unknown): value is ChatApiMessage {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Partial<ChatApiMessage>

  return (
    typeof candidate.id === "string" &&
    typeof candidate.chatSessionId === "string" &&
    typeof candidate.content === "string"
  )
}

function isSameChatSession(
  left?: string | null,
  right?: string | null,
) {
  return (
    left?.trim().toLowerCase() === right?.trim().toLowerCase()
  )
}
