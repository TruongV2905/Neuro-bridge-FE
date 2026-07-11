import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/configs/api";
import type { APIResponse } from "@/types/common.starter";
import type { NotificationItem } from "@/types/notification.type";

const NOTIFICATION_ENDPOINT = "/notification/api/v1/notifications";

export const notificationKeys = {
  all: ["notifications"],
  userList: ["notifications", "user", "list"],
  unreadCount: ["notifications", "user", "unread-count"],
};

function unwrapResponse<T>(data: T | APIResponse<T>) {
  if (
    data &&
    typeof data === "object" &&
    "result" in data &&
    "code" in data &&
    "message" in data
  ) {
    return (data as APIResponse<T>).result;
  }

  return data as T;
}

export function useGetUserNotifications(userId: string, enabled = true) {
  return useQuery({
    queryKey: [...notificationKeys.userList, userId],
    queryFn: async () => {
      const { data } = await api.get<
        NotificationItem[] | APIResponse<NotificationItem[]>
      >(`${NOTIFICATION_ENDPOINT}/user/${encodeURIComponent(userId)}`);

      return unwrapResponse<NotificationItem[]>(data);
    },
    enabled: enabled && !!userId,
    retry: 0,
  });
}

export function useGetUnreadNotificationCount(userId: string, enabled = true) {
  return useQuery({
    queryKey: [...notificationKeys.unreadCount, userId],
    queryFn: async () => {
      const { data } = await api.get<number | APIResponse<number>>(
        `${NOTIFICATION_ENDPOINT}/user/${encodeURIComponent(userId)}/unread-count`,
      );

      return unwrapResponse<number>(data);
    },
    enabled: enabled && !!userId,
    retry: 0,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.put(
        `${NOTIFICATION_ENDPOINT}/${encodeURIComponent(notificationId)}/read`,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
        exact: false,
      });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await api.put(
        `${NOTIFICATION_ENDPOINT}/user/${encodeURIComponent(userId)}/read-all`,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
        exact: false,
      });
    },
  });
}
