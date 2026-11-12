import { BellIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { resolveNotificationDestination } from "@/utils/notification-destination";
import { formatNotificationTime } from "@/utils/notification.utils";
import type { NotificationItem } from "@/types/notification.type";
import type { UserRole } from "@/types/user/user.type";

type NotificationRowProps = {
  notification: NotificationItem;
  onMarkAsRead: (notificationId: string) => void;
  isMarking: boolean;
  currentRole?: UserRole;
};

export function NotificationRow({
  notification,
  onMarkAsRead,
  isMarking,
  currentRole,
}: NotificationRowProps) {
  const router = useRouter();
  const createdAtLabel = formatNotificationTime(notification.createdAt);
  const destination = resolveNotificationDestination(notification, currentRole);

  return (
    <button
      type="button"
      className="flex w-full gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-slate-50"
      onClick={() => {
        if (!notification.isRead) {
          onMarkAsRead(notification.id);
        }

        if (destination) {
          router.push(destination);
        }
      }}
      aria-busy={isMarking}
    >
      <span
        className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          notification.isRead
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
      </span>

      {!notification.isRead && (
        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
      )}
    </button>
  );
}
