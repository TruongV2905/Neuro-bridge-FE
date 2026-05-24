// "use client";

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

// import {
//   Card,
//   CardContent,
// } from "@/components/ui/card"

// interface DataTableProps<T> {
//   columns: ColumnConfig<T>[]
//   data: T[]
//   actions?: ActionConfig<T>[]

//   // Pagination props
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
//   return (
//     <div className="space-y-3">
//       {/* {paginationInfo && (
//         <div className="flex justify-end px-2">
//           <span className="text-sm text-muted-foreground px-3 py-1 rounded-sm">
//             Showing {paginationInfo.startItem} to {paginationInfo.endItem} of {paginationInfo.totalItems} entries
//           </span>
//         </div>
//       )} */}
//       {/* Container chứa cả Show entries (trái) và Showing info (phải) */}
//       <div className="flex items-center justify-between px-1">
//         {/* BÊN TRÁI: Show entries */}
//         <div className="flex items-center gap-2 text-sm text-muted-foreground">
//           {pageSize !== undefined && pageSizeOptions && onPageSizeChange && (
//             <>
//               <span>Show</span>
//               <select
//                 value={pageSize}
//                 onChange={(e) => onPageSizeChange(Number(e.target.value))}
//                 className="h-8 rounded-md border bg-transparent px-2 focus:outline-none"
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

//         {/* BÊN PHẢI: Showing info */}
//         {paginationInfo && (
//           <span className="text-sm text-muted-foreground">
//             Showing {paginationInfo.startItem} to {paginationInfo.endItem} of {paginationInfo.totalItems} entries
//           </span>
//         )}
//       </div>
//       <Card className="shadow-sm">
//         <CardContent className="p-0">
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-muted/40 hover:bg-muted/40">
//                 {columns.map((col) => (
//                   <TableHead
//                     key={String(col.key)}
//                     className="font-semibold"
//                   >
//                     {col.label}
//                   </TableHead>
//                 ))}

//                 {actions && <TableHead className="font-semibold">
//                   Actions
//                 </TableHead>}
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {data.map((row, i) => (
//                 <TableRow
//                   key={i}
//                   className="hover:bg-muted/30"
//                 >
//                   {columns.map((col) => {
//                     const value = row[col.key as keyof T]

//                     return (
//                       <TableCell key={String(col.key)}>
//                         {col.render
//                           ? col.render(value, row)
//                           : String(value ?? "")}
//                       </TableCell>
//                     )
//                   })}

//                   {actions && (
//                     <TableCell className="space-x-2">
//                       {actions.map((action) => (
//                         <Button
//                           key={action.type}
//                           size="sm"
//                           variant={
//                             action.type === "delete"
//                               ? "destructive"
//                               : "outline"
//                           }
//                           onClick={() => action.onClick?.(row)}
//                         >
//                           {action.label}
//                         </Button>
//                       ))}
//                     </TableCell>
//                   )}
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

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
import { Edit, Trash2 } from "lucide-react"

interface DataTableProps<T> {
  columns: ColumnConfig<T>[]
  data: T[]
  actions?: ActionConfig<T>[]
  paginationInfo?: { startItem: number; endItem: number; totalItems: number }
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
    <div className="space-y-4">
      {/* Khu vực filter phụ */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          {pageSize !== undefined && pageSizeOptions && onPageSizeChange && (
            <>
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="h-8 rounded-md border border-input bg-background px-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-colors"
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
            Showing <span className="text-foreground">{paginationInfo.startItem}</span> to <span className="text-foreground">{paginationInfo.endItem}</span> of <span className="text-foreground">{paginationInfo.totalItems}</span>
          </span>
        )}
      </div>

      {/* Vùng Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {/* Sử dụng biến màu --primary cho header nhẹ nhàng */}
            <TableRow className="bg-primary/5 hover:bg-primary/5 border-b-primary/10">
              {columns.map((col) => (
                <TableHead key={String(col.key)} className="font-semibold text-foreground h-12">
                  {col.label}
                </TableHead>
              ))}
              {actions && <TableHead className="font-semibold text-foreground text-right pr-6">Actions</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center text-muted-foreground">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={i} className="hover:bg-muted/50 transition-colors">
                  {columns.map((col) => {
                    const value = row[col.key as keyof T]
                    return (
                      <TableCell key={String(col.key)} className="py-3">
                        {col.render ? col.render(value, row) : String(value ?? "")}
                      </TableCell>
                    )
                  })}

                  {actions && (
                    <TableCell className="text-right pr-4 space-x-2">
                      {actions.map((action) => (
                        <Button
                          key={action.type}
                          size="icon"
                          variant={action.type === "delete" ? "destructive" : "outline"}
                          className={`h-8 w-8 ${action.type === "edit" ? "hover:bg-primary hover:text-primary-foreground border-primary/20" : ""}`}
                          onClick={() => action.onClick?.(row)}
                          title={action.label}
                        >
                          {action.type === "edit" ? <Edit className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
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