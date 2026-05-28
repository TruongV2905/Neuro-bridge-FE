import type { ColumnConfig } from "@/types/crud"
import type { User } from "../types/user.type"
import { UserRole, UserStatus } from "../types/user.type"

export const userColumns: ColumnConfig<User>[] = [
  {
    key: "userId",
    label: "User ID",
  },
  {
    key: "name",
    label: "Name",
  },
  {
    key: "userName",
    label: "Username",
  },
  {
    key: "email",
    label: "Email",
  },
  {
    key: "role",
    label: "Role",
    type: "badge",
    badgeMap: {
      [UserRole.ADMINISTRATOR]: {
        label: "Administrator",
        className: "bg-destructive text-destructive-foreground",
      },
      [UserRole.AI_EXPERT]: {
        label: "AI Expert",
        className: "bg-primary text-primary-foreground",
      },
      [UserRole.CLIENT]: {
        label: "Client",
        className: "bg-secondary text-secondary-foreground",
      },
    },
  },
  {
    key: "status",
    label: "Status",
    type: "badge",
    badgeMap: {
      [UserStatus.ACTIVE]: {
        label: "Active",
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      },
      [UserStatus.INACTIVE]: {
        label: "Inactive",
        className:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      },
      [UserStatus.BANNED]: {
        label: "Banned",
        className:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      },
    },
  },
]