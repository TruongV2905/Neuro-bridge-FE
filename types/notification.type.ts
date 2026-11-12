export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  resourceId: string | null;
  workspaceId: string | null;
  purchaseId?: string | null;
  deeplink?: string | null;
  createdAt: string;
  isRead: boolean;
};
