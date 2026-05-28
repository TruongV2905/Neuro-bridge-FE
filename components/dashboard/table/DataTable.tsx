// "use client"

// import type { ColumnConfig, ActionConfig } from "@/types/crud"

// import { Button } from "@/components/ui/button"
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"

// import { Edit, Trash2 } from "lucide-react"

// interface DataTableProps<T> {
//   columns: ColumnConfig<T>[]
//   data: T[]
//   actions?: ActionConfig<T>[]
//   paginationInfo?: {
//     startItem: number
//     endItem: number
//     totalItems: number
//   }
//   pageSize?: number
//   pageSizeOptions?: number[]
//   onPageSizeChange?: (size: number) => void
// }

// export function DataTable<T extends object>({
//   columns,
//   data,
//   actions,
//   paginationInfo,
//   pageSize,
//   pageSizeOptions,
//   onPageSizeChange,
// }: DataTableProps<T>) {
//   const renderCell = (column: ColumnConfig<T>, row: T) => {
//     const value = row[column.key as keyof T]

//     if (column.render) {
//       return column.render(value, row)
//     }

//     if (column.type === "badge") {
//       const rawValue = String(value ?? "")
//       const badge = column.badgeMap?.[rawValue]

//       return (
//         <span
//           className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
//             badge?.className || "bg-muted text-muted-foreground"
//           }`}
//         >
//           {badge?.label || rawValue}
//         </span>
//       )
//     }

//     return String(value ?? "")
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between px-2">
//         <div className="flex items-center gap-2 text-sm font-medium text-foreground">
//           {pageSize !== undefined && pageSizeOptions && onPageSizeChange && (
//             <>
//               <span>Show</span>
//               <select
//                 value={pageSize}
//                 onChange={(e) => onPageSizeChange(Number(e.target.value))}
//                 className="h-8 rounded-md border border-input bg-background px-2 text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
//               >
//                 {pageSizeOptions.map((size) => (
//                   <option key={size} value={size}>
//                     {size}
//                   </option>
//                 ))}
//               </select>
//               <span>entries</span>
//             </>
//           )}
//         </div>

//         {paginationInfo && (
//           <span className="text-sm font-medium text-muted-foreground">
//             Showing{" "}
//             <span className="text-foreground">
//               {paginationInfo.startItem}
//             </span>{" "}
//             to{" "}
//             <span className="text-foreground">
//               {paginationInfo.endItem}
//             </span>{" "}
//             of{" "}
//             <span className="text-foreground">
//               {paginationInfo.totalItems}
//             </span>
//           </span>
//         )}
//       </div>

//       <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
//         <Table>
//           <TableHeader>
//             <TableRow className="border-b-primary/10 bg-primary/5 hover:bg-primary/5">
//               {columns.map((column) => (
//                 <TableHead
//                   key={String(column.key)}
//                   className="h-12 font-semibold text-foreground"
//                 >
//                   {column.label}
//                 </TableHead>
//               ))}

//               {actions && (
//                 <TableHead className="pr-6 text-right font-semibold text-foreground">
//                   Actions
//                 </TableHead>
//               )}
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {data.length === 0 ? (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length + (actions ? 1 : 0)}
//                   className="h-24 text-center text-muted-foreground"
//                 >
//                   No results found.
//                 </TableCell>
//               </TableRow>
//             ) : (
//               data.map((row, index) => (
//                 <TableRow
//                   key={index}
//                   className="transition-colors hover:bg-muted/50"
//                 >
//                   {columns.map((column) => (
//                     <TableCell
//                       key={String(column.key)}
//                       className="py-3"
//                     >
//                       {renderCell(column, row)}
//                     </TableCell>
//                   ))}

//                   {actions && (
//                     <TableCell className="space-x-2 pr-4 text-right">
//                       {actions.map((action) => (
//                         <Button
//                           key={action.type}
//                           size="icon"
//                           variant={
//                             action.type === "delete"
//                               ? "destructive"
//                               : "outline"
//                           }
//                           className={
//                             action.type === "edit"
//                               ? "h-8 w-8 border-primary/20 hover:bg-primary hover:text-primary-foreground"
//                               : "h-8 w-8"
//                           }
//                           onClick={() => action.onClick?.(row)}
//                           title={action.label}
//                         >
//                           {action.type === "edit" ? (
//                             <Edit className="h-4 w-4" />
//                           ) : (
//                             <Trash2 className="h-4 w-4" />
//                           )}
//                         </Button>
//                       ))}
//                     </TableCell>
//                   )}
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   )
// }

"use client"

import type { ReactNode } from "react"
import { Edit, Trash2 } from "lucide-react"

import type { ColumnConfig } from "@/types/crud"

import { Button } from "@/components/ui/button"
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
  type: TableActionType
  label: string
  onClick?: (row: TData, rowIndex: number) => void
  icon?: ReactNode
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost"
}

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
}: DataTableProps<TData>) {
  const renderCell = (column: ColumnConfig<TData>, row: TData) => {
    const value = row[column.key as keyof TData]

    if (column.render) {
      return column.render(value, row)
    }

    if (column.type === "badge") {
      const rawValue = String(value ?? "")
      const badge = column.badgeMap?.[rawValue]

      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
            badge?.className ?? "bg-muted text-muted-foreground"
          }`}
        >
          {badge?.label ?? rawValue}
        </span>
      )
    }

    return String(value ?? "")
  }

  const renderActionIcon = (action: TableAction<TData>) => {
    if (action.icon) {
      return action.icon
    }

    if (action.type === "edit") {
      return <Edit className="h-4 w-4" />
    }

    if (action.type === "delete") {
      return <Trash2 className="h-4 w-4" />
    }

    return action.label
  }

  const resolveActionVariant = (action: TableAction<TData>) => {
    if (action.variant) {
      return action.variant
    }

    if (action.type === "delete") {
      return "destructive"
    }

    return "outline"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          {pageSize !== undefined && pageSizeOptions && onPageSizeChange && (
            <>
              <span>Show</span>

              <select
                value={pageSize}
                onChange={(event) =>
                  onPageSizeChange(Number(event.target.value))
                }
                className="h-8 rounded-md border border-input bg-background px-2 text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
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
            <span className="text-foreground">
              {paginationInfo.startItem}
            </span>{" "}
            to{" "}
            <span className="text-foreground">{paginationInfo.endItem}</span>{" "}
            of{" "}
            <span className="text-foreground">{paginationInfo.totalItems}</span>
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b-primary/10 bg-primary/5 hover:bg-primary/5">
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className="h-12 font-semibold text-foreground"
                >
                  {column.label}
                </TableHead>
              ))}

              {actions && actions.length > 0 && (
                <TableHead className="pr-6 text-right font-semibold text-foreground">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions?.length ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow
                  key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}
                  className="transition-colors hover:bg-muted/50"
                >
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} className="py-3">
                      {renderCell(column, row)}
                    </TableCell>
                  ))}

                  {actions && actions.length > 0 && (
                    <TableCell className="space-x-2 pr-4 text-right">
                      {actions.map((action) => (
                        <Button
                          key={action.type}
                          size="icon"
                          variant={resolveActionVariant(action)}
                          className={
                            action.type === "edit"
                              ? "h-8 w-8 border-primary/20 hover:bg-primary hover:text-primary-foreground"
                              : "h-8 w-8"
                          }
                          onClick={() => action.onClick?.(row, rowIndex)}
                          title={action.label}
                        >
                          {renderActionIcon(action)}
                        </Button>
                      ))}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}