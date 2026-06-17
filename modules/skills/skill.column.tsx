import type { ColumnDef } from "@tanstack/react-table";

import type { SkillResponse } from "@/types/skill.types";
import { formatDateTimeVietnam, getDifTime } from "@/utils/timeFeature";
import { Badge } from "@/components/ui/badge";

export const skillColumns: ColumnDef<SkillResponse>[] = [
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
    accessorKey: "skillName",
    header: "Skill Name",
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">
          {row.original.skillName}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "skillDescription",
    header: "Description",
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-[420px] text-sm text-muted-foreground">
        {row.original.skillDescription || "—"}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "deleted",
    header: "Active",
    cell: ({ row }) => {
      const isDeleted = row.original.deleted;

      return (
        <Badge
          variant="outline"
          className={
            isDeleted
              ? "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              : "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
          }
        >
          {isDeleted ? "Inactive" : "Active"}
        </Badge>
      );
    },
    meta: {
      align: "center",
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        <div className="text-sm text-foreground">
          {formatDateTimeVietnam(row.original.createdAt)}
        </div>
        <div className="text-xs text-muted-foreground">
          {getDifTime(row.original.createdAt)}
        </div>
      </div>
    ),
    meta: {
      align: "center",
    },
  },
];
