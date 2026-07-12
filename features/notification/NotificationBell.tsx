"use client";

import { BellIcon, CheckCheck, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationEmptyState } from "@/features/notification/components/NotificationEmptyState";
import { NotificationRow } from "@/features/notification/components/NotificationRow";
import { NotificationSkeleton } from "@/features/notification/components/NotificationSkeleton";
import { useNotificationBell } from "@/hooks/useNotificationBell";

export function NotificationBell() {
  const {
    unreadCount,
    visibleNotifications,
    isInitialLoading,
    isProfileMissing,
    isUserError,
    isError,
    isFetching,
    isMarkingOne,
    isMarkingAll,
    canMarkAllAsRead,
    refetch,
    handleOpenNotification,
    handleMarkAllAsRead,
  } = useNotificationBell();

  const hasNotifications = visibleNotifications.length > 0;
  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative h-11 w-11 rounded-full"
          aria-label="Open notifications"
        >
          <BellIcon className="!h-6 !w-6" />

          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-background">
              {badgeLabel}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={12}
        className="z-[999] w-[min(24rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 text-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.16)]"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-sm font-bold text-slate-950">Notifications</p>
            <p className="text-xs text-slate-500">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You are all caught up"}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-slate-500"
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Refresh notifications"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-slate-500"
              onClick={handleMarkAllAsRead}
              disabled={!canMarkAllAsRead || isMarkingAll}
              aria-label="Mark all notifications as read"
            >
              {isMarkingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {isInitialLoading ? (
          <NotificationSkeleton />
        ) : isProfileMissing || isUserError ? (
          <NotificationEmptyState
            tone="error"
            title="Unable to load profile"
            description="Notifications need your user profile before loading."
          />
        ) : isError ? (
          <NotificationEmptyState
            tone="error"
            title="Unable to load notifications"
            action={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3 rounded-full text-indigo-600"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            }
          />
        ) : hasNotifications ? (
          <div className="max-h-[26rem] overflow-y-auto p-2">
            {visibleNotifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onOpen={handleOpenNotification}
                isMarking={isMarkingOne}
              />
            ))}
          </div>
        ) : (
          <NotificationEmptyState
            title="No notifications yet"
            description="New updates will show up here."
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
