"use client"

import { useEffect, useState } from "react"
import { Client, ReconnectionTimeMode } from "@stomp/stompjs"
import { useQueryClient } from "@tanstack/react-query"

import { appendMessageToCache, chatKeys } from "@/services/chat.service"
import type { ChatMessageDto } from "@/types/chat.types"

export type ChatSocketState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "paused"

const MAX_CONSECUTIVE_DISCONNECTS = 6

export function getChatSocketUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  if (!apiBaseUrl) {
    return "ws://localhost:8080/api/chat/ws/chat"
  }

  const url = new URL(
    apiBaseUrl,
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  )
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
  url.pathname = `${url.pathname.replace(/\/$/, "")}/chat/ws/chat`
  url.search = ""

  return url.toString()
}

export function useChatSocket(sessionId?: string | null): ChatSocketState {
  const queryClient = useQueryClient()
  const [connectionState, setConnectionState] = useState<ChatSocketState>("idle")

  useEffect(() => {
    const normalizedSessionId = sessionId?.trim() ?? ""
    if (!normalizedSessionId) {
      return
    }

    let isDisposed = false
    let terminalError = false
    let consecutiveDisconnects = 0
    const socketUrl = getChatSocketUrl()
    const destination = `/topic/chat/${normalizedSessionId.toLowerCase()}`

    const stompClient = new Client({
      webSocketFactory: () => new WebSocket(socketUrl),
      connectionTimeout: 10_000,
      reconnectDelay: 1_500,
      maxReconnectDelay: 15_000,
      reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
      debug: () => undefined,
      onConnect: () => {
        if (isDisposed) return

        consecutiveDisconnects = 0
        setConnectionState("connected")

        stompClient.subscribe(destination, (frame) => {
          try {
            const incoming = JSON.parse(frame.body) as ChatMessageDto
            if (!incoming || !incoming.id) return

            queryClient.setQueryData<ChatMessageDto[]>(
              chatKeys.messages(normalizedSessionId),
              (current) => appendMessageToCache(current, incoming),
            )
          } catch (error) {
            console.warn("Ignoring invalid chat socket payload:", error)
          }
        })
      },
      onStompError: () => {
        terminalError = true
        setConnectionState("paused")
        void stompClient.deactivate()
      },
      onWebSocketError: () => {
        if (!isDisposed && !terminalError) {
          setConnectionState("reconnecting")
        }
      },
      onWebSocketClose: () => {
        if (isDisposed || terminalError) return

        consecutiveDisconnects += 1
        if (consecutiveDisconnects >= MAX_CONSECUTIVE_DISCONNECTS) {
          setConnectionState("paused")
          void stompClient.deactivate()
          return
        }

        setConnectionState("reconnecting")
      },
    })

    setConnectionState("connecting")
    stompClient.activate()

    return () => {
      isDisposed = true
      void stompClient.deactivate()
    }
  }, [queryClient, sessionId])

  return sessionId?.trim() ? connectionState : "idle"
}

