"use client";

import { useEffect, useState } from "react";
import { Client, ReconnectionTimeMode } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";

import { NOTIFICATION_SOCKET_DESTINATION } from "@/features/notification/constants/notification.constants";
import { getNotificationSocketUrl } from "@/utils/notification.utils";
import { notificationKeys } from "@/services/notification.service";
import type { NotificationItem } from "@/types/notification.type";

export type NotificationSocketState = "idle" | "connecting" | "connected" | "reconnecting" | "paused";

const MAX_CONSECUTIVE_DISCONNECTS = 6;

export function useNotificationSocket(userId: string): NotificationSocketState {
  const queryClient = useQueryClient();
  const [connectionState, setConnectionState] = useState<NotificationSocketState>("idle");

  useEffect(() => {
    if (!userId) {
      return;
    }

    let isDisposed = false;
    let terminalError = false;
    let consecutiveDisconnects = 0;
    let socketUrl: string;

    try {
      socketUrl = getNotificationSocketUrl(userId);
    } catch (error) {
      console.warn("Notifications are unavailable: socket URL is not configured.", error);
      return;
    }

    const stompClient = new Client({
      // Notification Service speaks raw WebSocket/STOMP. It is not a SockJS server.
      webSocketFactory: () => new WebSocket(socketUrl),
      connectionTimeout: 10_000,
      reconnectDelay: 1_000,
      maxReconnectDelay: 30_000,
      reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
      debug: () => undefined,
      onConnect: () => {
        if (isDisposed) return;

        consecutiveDisconnects = 0;
        setConnectionState("connected");

        stompClient.subscribe(NOTIFICATION_SOCKET_DESTINATION, (message) => {
          let notification: NotificationItem;

          try {
            notification = JSON.parse(message.body) as NotificationItem;
          } catch (error) {
            console.warn("Ignoring an invalid notification socket payload.", error);
            return;
          }

          let shouldIncrementUnreadCount = false;
          queryClient.setQueryData<NotificationItem[]>(
            [...notificationKeys.userList, userId],
            (current = []) => {
              const alreadyPresent = current.some((item) => item.id === notification.id);

              shouldIncrementUnreadCount = !alreadyPresent && !notification.isRead;

              return [
                notification,
                ...current.filter((item) => item.id !== notification.id),
              ];
            },
          );

          if (shouldIncrementUnreadCount) {
            queryClient.setQueryData<number>(
              [...notificationKeys.unreadCount, userId],
              (count = 0) => count + 1,
            );
          }
        });
      },
      onStompError: (frame) => {
        console.warn("Notification STOMP error; reconnecting is stopped.", frame.headers["message"] ?? frame.body);
        terminalError = true;
        setConnectionState("paused");
        void stompClient.deactivate();
      },
      onWebSocketError: () => {
        if (!isDisposed && !terminalError) {
          setConnectionState("reconnecting");
          console.warn("Notification WebSocket error; retrying with backoff.");
        }
      },
      onWebSocketClose: (event) => {
        if (isDisposed || terminalError) return;

        consecutiveDisconnects += 1;
        if (consecutiveDisconnects >= MAX_CONSECUTIVE_DISCONNECTS) {
          console.warn("Notification connection is paused after repeated failures. Refresh or remount notifications to retry.");
          setConnectionState("paused");
          void stompClient.deactivate();
          return;
        }

        setConnectionState("reconnecting");
        console.warn(`Notification WebSocket closed (${event.code}); retrying with backoff.`);
      },
    });

    stompClient.activate();

    return () => {
      isDisposed = true;
      void stompClient.deactivate();
    };
  }, [queryClient, userId]);

  return userId ? connectionState : "idle";
}
