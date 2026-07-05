import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import api from "@/configs/api";
import { createMutationHook } from "@/hooks/userAPI";
import type { APIResponse } from "@/types/common.starter";
import type { NotificationResponse } from "@/types/notification.types";

const NOTIFICATION_ENDPOINT = "/notification/api/v1/notifications";

export const notificationKeys = {
  all: ["notifications"],
  list: ["notifications", "list"],
  unreadCount: ["notifications", "unread-count"],
};

type ApiError = AxiosError<APIResponse<null>>;

const unwrap = <T,>(payload: unknown): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "result" in payload &&
    (payload as { result: unknown }).result !== undefined
  ) {
    return (payload as { result: T }).result;
  }
  return payload as T;
};

export const useGetNotifications = (userId?: string) => {
  return useQuery<NotificationResponse[], ApiError, NotificationResponse[]>({
    queryKey: [...notificationKeys.list, userId],
    queryFn: async () => {
      const { data } = await api.get(`${NOTIFICATION_ENDPOINT}/user/${userId}`);
      return unwrap<NotificationResponse[]>(data) ?? [];
    },
    enabled: !!userId,
    retry: 0,
  });
};

export const useGetUnreadCount = (userId?: string) => {
  return useQuery<number, ApiError, number>({
    queryKey: [...notificationKeys.unreadCount, userId],
    queryFn: async () => {
      const { data } = await api.get(
        `${NOTIFICATION_ENDPOINT}/user/${userId}/unread-count`,
      );
      const raw = unwrap<number>(data);
      return typeof raw === "number" ? raw : 0;
    },
    enabled: !!userId,
    retry: 0,
  });
};

export const useMarkNotificationRead = createMutationHook<void, void>({
  url: `${NOTIFICATION_ENDPOINT}/:notificationId/read`,
  method: "PUT",
  queryKeyToInvalidate: [
    notificationKeys.list,
    notificationKeys.unreadCount,
  ],
});

export const useMarkAllNotificationsRead = createMutationHook<void, void>({
  url: `${NOTIFICATION_ENDPOINT}/user/:userId/read-all`,
  method: "PUT",
  queryKeyToInvalidate: [
    notificationKeys.list,
    notificationKeys.unreadCount,
  ],
});
