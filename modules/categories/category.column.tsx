import type { ColumnDef } from "@tanstack/react-table"

import type { CategoryResponse } from "@/types/category.types"

export const categoryColumns: ColumnDef<CategoryResponse>[] = [
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
    accessorKey: "name",
    header: "Category Name",
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">
          {row.original.name}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-[420px] text-sm text-muted-foreground">
        {row.original.description || "—"}
      </span>
    ),
    enableSorting: false,
  },
]