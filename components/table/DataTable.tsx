"use client";

import type { ColumnConfig, ActionConfig } from "@/types/crud"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Card,
  CardContent,
} from "@/components/ui/card"

interface DataTableProps<T> {
  columns: ColumnConfig<T>[]
  data: T[]
  actions?: ActionConfig<T>[]

  // Pagination props
  paginationInfo?: {
    startItem: number
    endItem: number
    totalItems: number
  }
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void
}

export function DataTable<T extends object>({
  columns,
  data,
  actions,
  paginationInfo,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
}: DataTableProps<T>) {
  return (
    <div className="space-y-3">
      {/* {paginationInfo && (
        <div className="flex justify-end px-2">
          <span className="text-sm text-muted-foreground px-3 py-1 rounded-sm">
            Showing {paginationInfo.startItem} to {paginationInfo.endItem} of {paginationInfo.totalItems} entries
          </span>
        </div>
      )} */}
      {/* Container chứa cả Show entries (trái) và Showing info (phải) */}
      <div className="flex items-center justify-between px-1">
        {/* BÊN TRÁI: Show entries */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {pageSize !== undefined && pageSizeOptions && onPageSizeChange && (
            <>
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="h-8 rounded-md border bg-transparent px-2 focus:outline-none"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>entries</span>
            </>
          )}
        </div>

        {/* BÊN PHẢI: Showing info */}
        {paginationInfo && (
          <span className="text-sm text-muted-foreground">
            Showing {paginationInfo.startItem} to {paginationInfo.endItem} of {paginationInfo.totalItems} entries
          </span>
        )}
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                {columns.map((col) => (
                  <TableHead
                    key={String(col.key)}
                    className="font-semibold"
                  >
                    {col.label}
                  </TableHead>
                ))}

                {actions && <TableHead className="font-semibold" text-right>
                  Actions
                </TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((row, i) => (
                <TableRow
                  key={i}
                  className="hover:bg-muted/30"
                >
                  {columns.map((col) => {
                    const value = row[col.key as keyof T]

                    return (
                      <TableCell key={String(col.key)}>
                        {col.render
                          ? col.render(value, row)
                          : String(value ?? "")}
                      </TableCell>
                    )
                  })}

                  {actions && (
                    <TableCell className="space-x-2">
                      {actions.map((action) => (
                        <Button
                          key={action.type}
                          size="sm"
                          variant={
                            action.type === "delete"
                              ? "destructive"
                              : "outline"
                          }
                          onClick={() => action.onClick?.(row)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}