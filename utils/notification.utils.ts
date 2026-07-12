import { UserRole } from "@/types/user/user.type";
import type { NotificationItem } from "@/types/notification.type";

export function formatNotificationTime(value: string) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) return "";

  const diffInSeconds = Math.max(Math.floor((Date.now() - timestamp) / 1000), 0);
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (diffInSeconds < minute) return "Just now";
  if (diffInSeconds < hour) return `${Math.floor(diffInSeconds / minute)}m ago`;
  if (diffInSeconds < day) return `${Math.floor(diffInSeconds / hour)}h ago`;

  return `${Math.floor(diffInSeconds / day)}d ago`;
}

export function getNotificationSocketUrl(userId: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const normalizedBaseUrl = apiBaseUrl.replace(/\/$/, "");

  return `${normalizedBaseUrl}/notification/ws/notifications?userId=${encodeURIComponent(userId)}`;
}

export function resolveNotificationHref(
  notification: NotificationItem,
  role?: UserRole | null,
) {
  const deeplink = notification.deeplink?.trim();

  if (deeplink) {
    const contractId = extractIdFromDeeplink(deeplink, "contracts");

    if (contractId) {
      return getContractHref(contractId, role);
    }

    const workspaceId =
      extractIdFromDeeplink(deeplink, "workspaces") ??
      extractIdFromDeeplink(deeplink, "workspace");

    if (workspaceId) {
      return getWorkspaceHref(workspaceId, role);
    }

    if (deeplink.startsWith("/client/") || deeplink.startsWith("/expert/")) {
      return deeplink;
    }
  }

  if (notification.workspaceId) {
    return getWorkspaceHref(notification.workspaceId, role);
  }

  return null;
}

function extractIdFromDeeplink(deeplink: string, segment: string) {
  const normalized = deeplink.startsWith("/") ? deeplink : `/${deeplink}`;
  const match = normalized.match(new RegExp(`^/${segment}/([^/?#]+)`));

  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function getContractHref(contractId: string, role?: UserRole | null) {
  if (role === UserRole.EXPERT) {
    return `/expert/dashboard/contracts/${encodeURIComponent(contractId)}`;
  }

  if (role === UserRole.CLIENT) {
    return `/client/dashboard/contracts/${encodeURIComponent(contractId)}`;
  }

  return null;
}

function getWorkspaceHref(workspaceId: string, role?: UserRole | null) {
  if (role === UserRole.EXPERT) {
    return `/expert/dashboard/projects/${encodeURIComponent(workspaceId)}`;
  }

  if (role === UserRole.CLIENT) {
    return `/client/dashboard/projects/${encodeURIComponent(workspaceId)}`;
  }

  return `/chat-room/${encodeURIComponent(workspaceId)}`;
}
