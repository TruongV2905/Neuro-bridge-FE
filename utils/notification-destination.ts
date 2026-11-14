import type { NotificationItem } from "@/types/notification.type";
import type { UserRole } from "@/types/user/user.type";

function isIdentifier(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function workspaceDestination(workspaceId: string, role?: UserRole) {
  if (role === "CLIENT") {
    return `/client/dashboard/projects/${encodeURIComponent(workspaceId)}`;
  }

  if (role === "EXPERT") {
    return `/expert/dashboard/projects/${encodeURIComponent(workspaceId)}`;
  }

  return null;
}

export function resolveNotificationDestination(
  notification: NotificationItem,
  currentRole?: UserRole,
) {
  switch (notification.type) {
    case "WORKSPACE_INVITED":
    case "PACKAGE_SUBMITTED":
    case "PACKAGE_RESUBMITTED":
    case "PACKAGE_APPROVED":
    case "PACKAGE_REJECTED":
      return isIdentifier(notification.workspaceId)
        ? workspaceDestination(notification.workspaceId, currentRole)
        : null;
    case "PROJECT_COMPLETED_PAYMENT_RELEASED":
      return currentRole === "EXPERT" && isIdentifier(notification.workspaceId)
        ? workspaceDestination(notification.workspaceId, currentRole)
        : null;
    case "JOBPOST_APPLIED":
      return currentRole === "CLIENT" && isIdentifier(notification.resourceId)
        ? `/client/dashboard/my-job-post/${encodeURIComponent(notification.resourceId)}`
        : null;
    case "AI_PRODUCT_PURCHASED":
      return currentRole === "CLIENT" && isIdentifier(notification.purchaseId)
        ? `/client/dashboard/ai-place/purchases/${encodeURIComponent(notification.purchaseId)}`
        : null;
    case "CONTRACT_SIGN_REQUIRED":
    case "CONTRACT_FULLY_SIGNED":
      return isIdentifier(notification.resourceId)
        ? `/expert/dashboard/contracts/${encodeURIComponent(notification.resourceId)}`
        : null;
    default:
      return null;
  }
}
