"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type TableActionType = "edit" | "delete" | "view" | "custom";

export type TableAction<TData extends object> = {
  id?: string;
  type: TableActionType;
  label: string;
  actionKey?: string;

  onClick?: (row: TData, rowIndex: number) => void | Promise<void>;

  icon?: React.ReactNode;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost";
  className?: string;

  hidden?: boolean | ((row: TData) => boolean);
  disabled?: boolean | ((row: TData) => boolean);
};

type SortDirection = "ASCENDING" | "DESCENDING";

type TableAlign = "left" | "center" | "right";

type ColumnMeta = {
  align?: TableAlign;
};

type DataTableProps<TData extends object> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  actions?: TableAction<TData>[];

  paginationInfo?: {
    startItem: number;
    endItem: number;
    totalItems: number;
  };

  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;

  sortBy?: string | null;
  sortDirection?: SortDirection | null;
  onSortChange?: (
    sortBy?: string,
    sortDirection?: "ASCENDING" | "DESCENDING",
  ) => void;
};

const textAlignClassMap: Record<TableAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const flexAlignClassMap: Record<TableAlign, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

const getColumnAlign = <TData extends object>(
  columnDef: ColumnDef<TData>,
): TableAlign => {
  return (columnDef.meta as ColumnMeta | undefined)?.align ?? "center";
};

const isActionHidden = <TData extends object>(
  action: TableAction<TData>,
  row: TData,
) => {
  if (typeof action.hidden === "function") {
    return action.hidden(row);
  }

  return Boolean(action.hidden);
};

const isActionDisabled = <TData extends object>(
  action: TableAction<TData>,
  row: TData,
) => {
  if (typeof action.disabled === "function") {
    return action.disabled(row);
  }

  return Boolean(action.disabled);
};

export function DataTable<TData extends object>({
  columns,
  data,
  actions = [],
  paginationInfo,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  sortBy,
  sortDirection,
  onSortChange,
}: DataTableProps<TData>) {
  const sorting = useMemo<SortingState>(() => {
    if (!sortBy || !sortDirection) return [];

    return [
      {
        id: sortBy,
        desc: sortDirection === "DESCENDING",
      },
    ];
  }, [sortBy, sortDirection]);

  const tableColumns = useMemo<ColumnDef<TData>[]>(() => {
    if (actions.length === 0) {
      return columns;
    }

    const actionColumn: ColumnDef<TData> = {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const original = row.original;
        const rowIndex = row.index;

        const visibleActions = actions.filter(
          (action) => !isActionHidden(action, original),
        );

        if (visibleActions.length === 0) {
          return null;
        }

        return (
          <div className="flex justify-center">
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
                {visibleActions.map((action) => {
                  const disabled = isActionDisabled(action, original);

                  return (
                    <DropdownItem
                      key={action.id ?? `${action.type}-${action.label}`}
                      variant={
                        action.type === "delete" ||
                        action.variant === "destructive"
                          ? "destructive"
                          : "default"
                      }
                      className={cn(action.className)}
                      disabled={disabled}
                      onClick={() => {
                        if (disabled) return;

                        void action.onClick?.(original, rowIndex);
                      }}
                    >
                      {action.icon && (
                        <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
                          {action.icon}
                        </span>
                      )}

                      {action.label}
                    </DropdownItem>
                  );
                })}
              </DropdownContent>
            </Dropdown>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      meta: {
        align: "center",
      },
    };

    return [...columns, actionColumn];
  }, [columns, actions]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
    },
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),

    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;

      const next = nextSorting[0];

      if (!next) {
        onSortChange?.(undefined, undefined);
        return;
      }

      onSortChange?.(next.id, next.desc ? "DESCENDING" : "ASCENDING");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          {pageSize !== undefined && pageSizeOptions && onPageSizeChange && (
            <>
              <span>Show</span>

              <Select
                value={String(pageSize)}
                onValueChange={(value) => onPageSizeChange(Number(value))}
              >
                <SelectTrigger className="h-8 w-[72px] rounded-lg bg-background px-2 text-sm">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent align="start" className="min-w-[72px]">
                  {pageSizeOptions.map((size) => (
                    <SelectItem
                      key={size}
                      value={String(size)}
                      className="text-sm"
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span>entries</span>
            </>
          )}
        </div>

        {paginationInfo && (
          <span className="text-sm font-medium text-muted-foreground">
            Showing{" "}
            <span className="text-foreground">{paginationInfo.startItem}</span>{" "}
            to <span className="text-foreground">{paginationInfo.endItem}</span>{" "}
            of{" "}
            <span className="text-foreground">{paginationInfo.totalItems}</span>
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b bg-muted/30 hover:bg-muted/30"
              >
                {headerGroup.headers.map((header) => {
                  const align = getColumnAlign(header.column.columnDef);

                  return (
                    <TableHead
                      key={header.id}
                      className={`h-11 bg-primary text-xs text-background ${textAlignClassMap[align]}`}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? `flex cursor-pointer select-none items-center gap-2 ${flexAlignClassMap[align]}`
                              : `flex items-center gap-2 ${flexAlignClassMap[align]}`
                          }
                          onClick={
                            header.column.getCanSort()
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}

                          {header.column.getCanSort() && (
                            <span className="font-light text-background">
                              {header.column.getIsSorted() === "asc"
                                ? "↑"
                                : header.column.getIsSorted() === "desc"
                                  ? "↓"
                                  : "↕"}
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b transition-colors hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => {
                    const align = getColumnAlign(cell.column.columnDef);

                    return (
                      <TableCell
                        key={cell.id}
                        className={`h-[58px] py-2 text-sm ${textAlignClassMap[align]}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}