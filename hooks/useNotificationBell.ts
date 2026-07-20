"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";

import { NOTIFICATION_PREVIEW_LIMIT } from "@/features/notification/constants/notification.constants";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import type { RootState } from "@/redux/store";
import {
  useGetUnreadNotificationCount,
  useGetUserNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
} from "@/services/notification.service";
import type { NotificationItem } from "@/types/notification.type";
import type { UserResponse } from "@/types/user/user.type";
import { resolveNotificationHref } from "@/utils/notification.utils";

type CurrentUserWithId = UserResponse & {
  id?: string;
};

export function useNotificationBell() {
  const currentUser = useSelector(
    (state: RootState) => state.user,
  ) as CurrentUserWithId | null;

  const userId = currentUser?.id ?? "";

  const {
    data: notifications = [],
    isLoading: isNotificationsLoading,
    isFetching,
    isError,
    refetch,
  } = useGetUserNotifications(userId, !!userId);

  const { data: unreadCount = 0 } = useGetUnreadNotificationCount(
    userId,
    !!userId,
  );

  useNotificationSocket(userId);

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const visibleNotifications = useMemo(
    () => notifications.slice(0, NOTIFICATION_PREVIEW_LIMIT),
    [notifications],
  );

  const handleMarkAllAsRead = () => {
    if (!userId || unreadCount === 0) return;

    markAllAsReadMutation.mutate(userId);
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleOpenNotification = (notification: NotificationItem) => {
    const href = resolveNotificationHref(notification, currentUser?.role);

    if (!href) {
      if (!notification.read) {
        markAsReadMutation.mutate(notification.id);
      }

      return;
    }

    if (!notification.read) {
      void markAsReadMutation
        .mutateAsync(notification.id)
        .finally(() => navigateWithPageReload(href));
      return;
    }

    navigateWithPageReload(href);
  };

  return {
    unreadCount,
    visibleNotifications,
    isInitialLoading: isNotificationsLoading,
    isProfileMissing: !userId,
    isUserError: false,
    isError,
    isFetching,
    isMarkingOne: markAsReadMutation.isPending,
    isMarkingAll: markAllAsReadMutation.isPending,
    canMarkAllAsRead: !!userId && unreadCount > 0,
    refetch,
    handleMarkAsRead,
    handleOpenNotification,
    handleMarkAllAsRead,
  };
}

function navigateWithPageReload(href: string) {
  if (typeof window === "undefined") return;

  const targetUrl = new URL(href, window.location.origin);
  const currentUrl = new URL(window.location.href);
  const targetPath = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
  const currentPath = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;

  if (targetUrl.origin === currentUrl.origin && targetPath === currentPath) {
    window.location.reload();
    return;
  }

  window.location.assign(targetUrl.toString());
}
