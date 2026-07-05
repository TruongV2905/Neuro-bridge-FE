"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "react-toastify";

import { notificationKeys } from "@/services/notification.service";
import type { NotificationResponse } from "@/types/notification.types";

const RECONNECT_DELAY_MS = 5_000;

const buildSocketUrl = (userId: string) => {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
  const url = `${base}/notification/ws/notifications`;
  return `${url}?userId=${encodeURIComponent(userId)}`;
};

export function useNotificationSocket(userId: string | undefined) {
  const queryClient = useQueryClient();
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!userId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(buildSocketUrl(userId)),
      reconnectDelay: RECONNECT_DELAY_MS,
      onConnect: () => {
        client.subscribe("/user/queue/notifications", (message: IMessage) => {
          try {
            const payload = JSON.parse(message.body) as NotificationResponse;

            queryClient.invalidateQueries({
              queryKey: notificationKeys.unreadCount,
              exact: false,
            });
            queryClient.invalidateQueries({
              queryKey: notificationKeys.list,
              exact: false,
            });

            if (payload?.title) {
              toast.info(payload.title, { autoClose: 4000 });
            }
          } catch {
            // Bỏ qua message không parse được, tránh crash listener.
          }
        });
      },
      onStompError: () => {
        // Gateway/BE lỗi STOMP frame - im lặng, StompClient sẽ tự reconnect.
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      const current = clientRef.current;
      clientRef.current = null;
      current?.deactivate();
    };
  }, [userId, queryClient]);
}
