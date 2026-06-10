import type { ColumnDef } from "@tanstack/react-table";

import type { User } from "@/types/user/user.type";
import { UserGender, UserRole, UserStatus } from "@/types/user/user.type";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

const getInitials = (name?: string) => {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const genderLabelMap: Record<UserGender, string> = {
  [UserGender.MALE]: "Male",
  [UserGender.FEMALE]: "Female",
  [UserGender.OTHER]: "Other",
};

const roleBadgeMap: Record<UserRole, { label: string; className: string }> = {
  [UserRole.ADMINISTRATOR]: {
    label: "Admin",
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
};

const statusBadgeMap: Record<UserStatus, { label: string; className: string }> =
  {
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
  };

export const userColumns: ColumnDef<User>[] = [
  {
    id: "no",
    header: "No.",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.index + 1}</span>
    ),
    size: 56,
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: "user",
    header: "User",
    accessorFn: (row) => row.fullName,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex items-center m-auto w-fit gap-3">
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
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="min-w-55 text-muted-foreground">
        {row.original.email}
      </span>
    ),
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      const gender = row.original.gender;

      if (!gender) {
        return <span className="text-muted-foreground">—</span>;
      }

      return <span>{genderLabelMap[gender]}</span>;
    },
    meta: {
      align: "center",
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="min-w-55 text-muted-foreground">
        {row.original.phone || "—"}
      </span>
    ),
    meta: {
      align: "center",
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      const badge = roleBadgeMap[role];

      return (
        <Badge variant="outline" className={badge.className}>
          {badge.label}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      align: "center",
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const badge = statusBadgeMap[status];

      return (
        <Badge variant="outline" className={badge.className}>
          {badge.label}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      align: "center",
    },
  },
];
