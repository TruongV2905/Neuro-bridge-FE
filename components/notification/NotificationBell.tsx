"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ROUTES } from "@/constants/routes";
import {
  useGetNotifications,
  useGetUnreadCount,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/services/notification.service";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import type { NotificationResponse } from "@/types/notification.types";

interface Props {
  userId: string;
}

const MAX_BADGE = 9;

export default function NotificationBell({ userId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useNotificationSocket(userId);

  const { data: unreadCount = 0 } = useGetUnreadCount(userId);
  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useGetNotifications(open ? userId : undefined);

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const sorted = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [notifications]);

  const badgeLabel =
    unreadCount > MAX_BADGE ? `${MAX_BADGE}+` : String(unreadCount);

  const handleItemClick = (item: NotificationResponse) => {
    if (!item.read) {
      markRead.mutate({ pathParams: { notificationId: item.id } });
    }

    if (item.workspaceId) {
      router.push(ROUTES.CHAT_ROOM(item.workspaceId));
      setOpen(false);
    }
  };

  const handleMarkAll = () => {
    if (unreadCount === 0) return;
    markAllRead.mutate({ pathParams: { userId } });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Thông báo"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/20 text-background shadow-sm outline-none transition-colors hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
              {badgeLabel}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={12}
        className="z-[999] w-[380px] max-w-[92vw] gap-0 p-0"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              Thông báo
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={unreadCount === 0 || markAllRead.isPending}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Đọc hết
          </button>
        </header>

        <div className="max-h-[420px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải...
            </div>
          ) : isError ? (
            <div className="px-4 py-10 text-center text-sm text-destructive">
              Không tải được thông báo.
            </div>
          ) : sorted.length === 0 ? (
            <EmptyNotifications />
          ) : (
            <ul className="divide-y divide-slate-100">
              {sorted.map((item) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-slate-200 px-4 py-2 text-center">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Đóng
          </button>
        </footer>
      </PopoverContent>
    </Popover>
  );
}

function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-muted-foreground">
        <Bell className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-foreground">
        Chưa có thông báo nào
      </p>
      <p className="max-w-[240px] text-xs leading-5 text-muted-foreground">
        Bạn sẽ nhận được thông báo khi có hoạt động mới trên tài khoản.
      </p>
    </div>
  );
}

interface ItemProps {
  item: NotificationResponse;
  onClick: () => void;
}

function NotificationItem({ item, onClick }: ItemProps) {
  const isClickable = !item.read || !!item.workspaceId;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={!isClickable}
        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
          item.read ? "bg-white" : "bg-primary/[0.04]"
        } ${isClickable ? "hover:bg-slate-50" : "cursor-default"}`}
      >
        <div
          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
            item.read ? "bg-transparent" : "bg-red-500"
          }`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm ${
              item.read ? "text-foreground/80" : "font-semibold text-foreground"
            }`}
          >
            {item.title}
          </p>
          {item.message && (
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground line-clamp-2">
              {item.message}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            {moment(item.createdAt).fromNow()}
          </p>
        </div>
      </button>
    </li>
  );
}
