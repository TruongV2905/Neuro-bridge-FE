export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  resourceId?: string | null;
  workspaceId?: string | null;
  createdAt: string;
  read: boolean;
}

export enum NotificationType {
  PROPOSAL_APPLIED = "PROPOSAL_APPLIED",
  APPLICATION_RECEIVED = "APPLICATION_RECEIVED",
  HIRED = "HIRED",
  WORKSPACE_MESSAGE = "WORKSPACE_MESSAGE",
  JOB_POST_UPDATED = "JOB_POST_UPDATED",
}
