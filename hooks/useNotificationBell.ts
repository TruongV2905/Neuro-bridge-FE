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
import type { UserResponse } from "@/types/user/user.type";

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
    handleMarkAllAsRead,
  };
}
