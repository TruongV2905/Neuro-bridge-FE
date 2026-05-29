"use client";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, RefreshCw, Download } from "lucide-react" 

interface Props {
  entityName?: string
  onCreate?: () => void
}

export function CrudToolbar({ onCreate }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 bg-card p-4 rounded-xl border shadow-sm">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search by name, username, or email"
          className="h-9 rounded-md bg-muted/50 pl-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-9 w-9">
          <RefreshCw className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>

        <Button size="sm" className="h-9 gap-2" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          Create New
        </Button>
      </div>
    </div>
  )
}