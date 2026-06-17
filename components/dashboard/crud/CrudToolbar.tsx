"use client";

import { useRef } from "react";
import { format, parseISO } from "date-fns";
import { Search, RefreshCw, Download, Upload, Plus, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import type { FilterConfig } from "@/types/dasboard";
import { FilterRenderer } from "./FilterRenderer";

type FilterKey<TFilter extends object> = Extract<keyof TFilter, string>;

type FilterValues<TFilter extends object> = Partial<
  Record<FilterKey<TFilter>, unknown>
>;

interface CrudToolbarProps<TFilter extends object = Record<string, unknown>> {
  entityName?: string;

  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  filters?: FilterConfig<TFilter>[];
  filterValues?: FilterValues<TFilter>;
  onFilterChange?: (name: FilterKey<TFilter>, value: unknown) => void;
  onClearFilters?: () => void;

  onCreate?: () => void;
  onRefresh?: () => void | Promise<void>;
  onExport?: () => void | Promise<void>;

  onImport?: (file: File) => void | Promise<void>;
  importAccept?: string;
  isImporting?: boolean;

  showCreate?: boolean;
  isRefreshing?: boolean;
}

export function CrudToolbar<TFilter extends object = Record<string, unknown>>({
  entityName,
  searchValue = "",
  onSearchChange,
  searchPlaceholder,

  filters = [],
  filterValues = {} as FilterValues<TFilter>,
  onFilterChange,
  onClearFilters,

  onCreate,
  onRefresh,
  onExport,

  onImport,
  importAccept = ".xlsx,.xls,.csv",
  isImporting = false,

  showCreate = false,
  isRefreshing = false,
}: CrudToolbarProps<TFilter>) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasFilters = filters.length > 0;
  const showRefresh = Boolean(onRefresh);
  const showExport = Boolean(onExport);
  const showImport = Boolean(onImport);

  const toDateValue = (value: unknown) => {
    if (!value) return undefined;

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === "string") {
      return parseISO(value);
    }

    return undefined;
  };

  const getFilterValue = (
    filter: FilterConfig<TFilter>,
    filterValues: Partial<Record<FilterKey<TFilter>, unknown>>,
  ) => {
    if (filter.type === "date-range" && filter.rangeKeys) {
      const fromValue = filterValues[filter.rangeKeys.from];
      const toValue = filterValues[filter.rangeKeys.to];

      return {
        from: toDateValue(fromValue),
        to: toDateValue(toValue),
      };
    }

    if (filter.type === "number-range" && filter.rangeKeys) {
      const minValue = filterValues[filter.rangeKeys.from];
      const maxValue = filterValues[filter.rangeKeys.to];

      return {
        min: typeof minValue === "number" ? minValue : undefined,
        max: typeof maxValue === "number" ? maxValue : undefined,
      };
    }

    return filterValues[filter.name];
  };

  const handleFilterRendererChange = (
    filter: FilterConfig<TFilter>,
    value: unknown,
  ) => {
    const filterName = filter.name as FilterKey<TFilter>;

    if (filter.type === "date-range" && filter.rangeKeys) {
      const range = value as {
        from?: Date;
        to?: Date;
      };

      onFilterChange?.(
        filter.rangeKeys.from as FilterKey<TFilter>,
        range.from ? format(range.from, "yyyy-MM-dd") : undefined,
      );

      onFilterChange?.(
        filter.rangeKeys.to as FilterKey<TFilter>,
        range.to ? format(range.to, "yyyy-MM-dd") : undefined,
      );

      return;
    }

    if (filter.type === "number-range" && filter.rangeKeys) {
      const range = value as {
        min?: number;
        max?: number;
      };

      onFilterChange?.(filter.rangeKeys.from as FilterKey<TFilter>, range.min);

      onFilterChange?.(filter.rangeKeys.to as FilterKey<TFilter>, range.max);

      return;
    }

    onFilterChange?.(filterName, value);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    await onImport?.(file);

    event.target.value = "";
  };

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={
              searchPlaceholder ??
              `Search ${entityName?.toLowerCase() ?? "items"}`
            }
            className="h-9 rounded-md bg-muted/50 pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {showRefresh && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => void onRefresh?.()}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          )}

          {showImport && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={importAccept}
                className="hidden"
                onChange={(event) => {
                  void handleImportChange(event);
                }}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-2"
                onClick={handleImportClick}
                disabled={isImporting}
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </>
          )}

          {showExport && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-2"
              onClick={() => void onExport?.()}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}

          {showCreate && (
            <Button
              type="button"
              size="sm"
              className="h-9 gap-2"
              onClick={onCreate}
            >
              <Plus className="h-4 w-4" />
              Create New
            </Button>
          )}
        </div>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-end gap-3 border-t pt-3">
          {filters.map((filter) => {
            const filterName = filter.name as FilterKey<TFilter>;

            return (
              <div key={filterName} className="min-w-[180px] flex-1">
                <div className="mb-1 text-sm font-medium text-muted-foreground">
                  {filter.label}
                </div>

                <FilterRenderer<TFilter>
                  config={filter}
                  value={getFilterValue(filter, filterValues)}
                  onChange={(value) => {
                    handleFilterRendererChange(filter, value);
                  }}
                />
              </div>
            );
          })}

          {onClearFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 gap-2"
              onClick={onClearFilters}
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
