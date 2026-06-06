import type { ColumnConfig } from "@/types/crud"
import type { User } from "@/types/user/user.type"
import { UserGender, UserRole, UserStatus } from "@/types/user/user.type"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

const getInitials = (name?: string) => {
  if (!name) return "U"

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const genderLabelMap: Record<UserGender, string> = {
  [UserGender.MALE]: "Male",
  [UserGender.FEMALE]: "Female",
  [UserGender.OTHER]: "Other",
}

export const userColumns: ColumnConfig<User>[] = [
  {
    key: "no",
    label: "No.",
    className: "w-[56px] text-muted-foreground",
    headerClassName: "w-[56px]",
    render: (_, __, rowIndex) => rowIndex + 1,
  },
  {
    key: "user",
    label: "User",
    sortable: true,
    className: "min-w-[220px]",
    render: (_, user) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.avatarUrl} alt={user.fullName} />
          <AvatarFallback className="text-xs">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground">
            {user.fullName}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            @{user.code}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "email",
    label: "Email",
    className: "min-w-[220px] text-muted-foreground",
  },
  {
    key: "gender",
    label: "Gender",
    filterable: true,
    filterOptions: [
      { label: "Male", value: UserGender.MALE },
      { label: "Female", value: UserGender.FEMALE },
      { label: "Other", value: UserGender.OTHER },
    ],
    className: "min-w-[120px]",
    render: (_, user) => {
      if (!user.gender) {
        return <span className="text-muted-foreground">—</span>
      }

      return genderLabelMap[user.gender]
    },
  },
  {
    key: "phone",
    label: "Phone",
    className: "min-w-[150px] text-muted-foreground",
    render: (_, user) => user.phone || "—",
  },
  {
    key: "role",
    label: "Role",
    filterable: true,
    filterOptions: [
      { label: "Administrator", value: UserRole.ADMINISTRATOR },
      { label: "Expert", value: UserRole.EXPERT },
      { label: "Client", value: UserRole.CLIENT },
    ],
    type: "badge",
    className: "min-w-[130px]",
    badgeMap: {
      [UserRole.ADMINISTRATOR]: {
        label: "Administrator",
        className:
          "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300",
      },
      [UserRole.EXPERT]: {
        label: "Expert",
        className:
          "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
      },
      [UserRole.CLIENT]: {
        label: "Client",
        className:
          "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300",
      },
    },
  },
  {
    key: "status",
    label: "Status",
    filterable: true,
    filterOptions: [
      { label: "Active", value: UserStatus.ACTIVE },
      { label: "Inactive", value: UserStatus.INACTIVE },
      { label: "Banned", value: UserStatus.BANNED },
    ],
    type: "badge",
    className: "min-w-[120px]",
    badgeMap: {
      [UserStatus.ACTIVE]: {
        label: "Active",
        className:
          "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300",
      },
      [UserStatus.INACTIVE]: {
        label: "Inactive",
        className:
          "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
      },
      [UserStatus.BANNED]: {
        label: "Banned",
        className:
          "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
      },
    },
  },
]