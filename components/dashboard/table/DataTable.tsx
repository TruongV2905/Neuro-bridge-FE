"use client"

import type { ReactNode } from "react"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ListFilter as Filter,
  MoreHorizontal,
} from "lucide-react"

import type { ColumnConfig } from "@/types/crud"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/dropdown"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type TableActionType = "edit" | "delete" | "view" | "custom"

export type TableAction<TData extends object> = {
  id?: string
  type: TableActionType
  label: string
  onClick?: (row: TData, rowIndex: number) => void
  icon?: ReactNode
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost"
}

type SortDirection = "asc" | "desc"

type DataTableProps<TData extends object> = {
  columns: ColumnConfig<TData>[]
  data: TData[]
  actions?: TableAction<TData>[]

  paginationInfo?: {
    startItem: number
    endItem: number
    totalItems: number
  }

  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void
  getRowKey?: (row: TData, index: number) => string | number

  sortKey?: string | null
  sortDirection?: SortDirection | null
  filters?: Record<string, string>
  onSortChange?: (key: string) => void
  onFilterChange?: (key: string, value: string) => void
}

export function DataTable<TData extends object>({
  columns,
  data,
  actions,
  paginationInfo,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  getRowKey,

  sortKey,
  sortDirection,
  filters,
  onSortChange,
  onFilterChange,
}: DataTableProps<TData>) {
  const renderCell = (
    column: ColumnConfig<TData>,
    row: TData,
    rowIndex: number,
  ) => {
    const value = row[column.key as keyof TData]

    if (column.render) {
      return column.render(value, row, rowIndex)
    }

    if (column.type === "badge") {
      const rawValue = String(value ?? "")
      const badge = column.badgeMap?.[rawValue]

      return (
        <Badge
          variant="outline"
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            badge?.className ??
            "border-transparent bg-muted text-muted-foreground"
          }`}
        >
          {badge?.label ?? rawValue}
        </Badge>
      )
    }

    if (value === null || value === undefined || value === "") {
      return <span className="text-muted-foreground">—</span>
    }

    return String(value)
  }

  const renderSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="h-3.5 w-3.5" />
    }

    if (sortDirection === "asc") {
      return <ArrowUp className="h-3.5 w-3.5" />
    }

    return <ArrowDown className="h-3.5 w-3.5" />
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[44px]">
                <Checkbox aria-label="Select all rows" />
              </TableHead>

              {columns.map((column) => {
                const columnKey = String(column.key)
                const isFiltered = Boolean(filters?.[columnKey])

                return (
                  <TableHead
                    key={columnKey}
                    className={`h-11 text-xs font-semibold text-foreground ${
                      column.headerClassName ?? ""
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{column.label}</span>

                      {column.sortable && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => onSortChange?.(columnKey)}
                        >
                          {renderSortIcon(columnKey)}
                        </Button>
                      )}

                      {column.filterable && column.filterOptions && (
                        <Dropdown>
                          <DropdownTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={`h-6 w-6 ${
                                isFiltered
                                  ? "text-primary"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <Filter className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownTrigger>

                          <DropdownContent align="start">
                            <DropdownItem
                              onClick={() =>
                                onFilterChange?.(columnKey, "all")
                              }
                            >
                              All
                            </DropdownItem>

                            {column.filterOptions.map((option) => (
                              <DropdownItem
                                key={String(option.value)}
                                onClick={() =>
                                  onFilterChange?.(
                                    columnKey,
                                    String(option.value),
                                  )
                                }
                              >
                                {option.label}
                              </DropdownItem>
                            ))}
                          </DropdownContent>
                        </Dropdown>
                      )}
                    </div>
                  </TableHead>
                )
              })}

              {actions && actions.length > 0 && (
                <TableHead className="w-[72px] text-right text-xs font-semibold text-foreground">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions?.length ? 2 : 1)}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow
                  key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}
                  className="border-b transition-colors hover:bg-muted/40"
                >
                  <TableCell className="w-[44px]">
                    <Checkbox aria-label={`Select row ${rowIndex + 1}`} />
                  </TableCell>

                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      className={`h-[58px] py-2 text-sm ${
                        column.className ?? ""
                      }`}
                    >
                      {renderCell(column, row, rowIndex)}
                    </TableCell>
                  ))}

                  {actions && actions.length > 0 && (
                    <TableCell className="pr-4 text-right">
                      <Dropdown>
                        <DropdownTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownTrigger>

                        <DropdownContent align="end">
                          {actions.map((action) => (
                            <DropdownItem
                              key={action.id ?? `${action.type}-${action.label}`}
                              variant={
                                action.type === "delete" || action.variant === "destructive"
                                  ? "destructive"
                                  : "default"
                              }
                              onClick={() => action.onClick?.(row, rowIndex)}
                            >
                              <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
                                {action.icon}
                              </span>
                              {action.label}
                            </DropdownItem>
                          ))}
                        </DropdownContent>
                      </Dropdown>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          {pageSize !== undefined && pageSizeOptions && onPageSizeChange && (
            <>
              <span>Show</span>

              <select
                value={pageSize}
                onChange={(event) =>
                  onPageSizeChange(Number(event.target.value))
                }
                className="h-8 rounded-md border border-input bg-background px-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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

        {paginationInfo && (
          <span className="text-sm font-medium text-muted-foreground">
            Showing{" "}
            <span className="text-foreground">{paginationInfo.startItem}</span>{" "}
            to{" "}
            <span className="text-foreground">{paginationInfo.endItem}</span>{" "}
            of{" "}
            <span className="text-foreground">{paginationInfo.totalItems}</span>
          </span>
        )}
      </div>
    </div>
  )
}