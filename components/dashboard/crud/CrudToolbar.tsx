"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw, Download, Plus } from "lucide-react"

interface Props {
  entityName?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  onCreate?: () => void
  onRefresh?: () => void
  showCreate?: boolean
  isRefreshing?: boolean
}

export function CrudToolbar({
  searchValue = "",
  onSearchChange,
  onCreate,
  onRefresh,
  showCreate = false,
  isRefreshing = false,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder="Search by name, code, or email"
          className="h-9 rounded-md bg-muted/50 pl-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>

        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>

        {showCreate && (
          <Button size="sm" className="h-9 gap-2" onClick={onCreate}>
            <Plus className="h-4 w-4" />
            Create New
          </Button>
        )}
      </div>
    </div>
  )
}