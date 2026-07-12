export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  resourceId: string | null;
  workspaceId: string | null;
  deeplink?: string | null;
  createdAt: string;
  read: boolean;
};
