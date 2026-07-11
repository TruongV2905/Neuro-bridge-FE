"use client";

import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useQueryClient } from "@tanstack/react-query";

import { NOTIFICATION_SOCKET_DESTINATION } from "@/features/notification/constants/notification.constants";
import { getNotificationSocketUrl } from "@/utils/notification.utils";
import { notificationKeys } from "@/services/notification.service";
import type { NotificationItem } from "@/types/notification.type";

export function useNotificationSocket(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const socketUrl = getNotificationSocketUrl(userId);
    const stompClient = new Client({
      reconnectDelay: 5000,
      debug: () => undefined,
      webSocketFactory: () => new SockJS(socketUrl),
      onConnect: () => {
        stompClient.subscribe(NOTIFICATION_SOCKET_DESTINATION, (message) => {
          const notification = JSON.parse(message.body) as NotificationItem;

          queryClient.setQueryData<NotificationItem[]>(
            [...notificationKeys.userList, userId],
            (current = []) => [
              notification,
              ...current.filter((item) => item.id !== notification.id),
            ],
          );

          queryClient.setQueryData<number>(
            [...notificationKeys.unreadCount, userId],
            (current = 0) => current + 1,
          );
        });
      },
    });

    stompClient.activate();

    return () => {
      void stompClient.deactivate();
    };
  }, [queryClient, userId]);
}
