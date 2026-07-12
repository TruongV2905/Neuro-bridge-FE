import { BellIcon, ExternalLink } from "lucide-react";

import { formatNotificationTime } from "@/utils/notification.utils";
import type { NotificationItem } from "@/types/notification.type";

type NotificationRowProps = {
  notification: NotificationItem;
  onOpen: (notification: NotificationItem) => void;
  isMarking: boolean;
};

export function NotificationRow({
  notification,
  onOpen,
  isMarking,
}: NotificationRowProps) {
  const createdAtLabel = formatNotificationTime(notification.createdAt);
  const hasDeeplink = Boolean(notification.deeplink?.trim());

  return (
    <button
      type="button"
      className="flex w-full gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
      onClick={() => onOpen(notification)}
      disabled={isMarking}
    >
      <span
        className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          notification.read
            ? "bg-slate-100 text-slate-500"
            : "bg-indigo-50 text-indigo-600"
        }`}
      >
        <BellIcon className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className="line-clamp-1 text-sm font-semibold text-slate-950">
            {notification.title || "Notification"}
          </span>

          {createdAtLabel && (
            <span className="shrink-0 text-[11px] font-medium text-slate-400">
              {createdAtLabel}
            </span>
          )}
        </span>

        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500">
          {notification.message || "You have a new notification."}
        </span>

        {hasDeeplink && (
          <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600">
            Open related page
            <ExternalLink className="h-3 w-3" />
          </span>
        )}
      </span>

      {!notification.read && (
        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
      )}
    </button>
  );
}
