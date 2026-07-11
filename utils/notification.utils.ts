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
