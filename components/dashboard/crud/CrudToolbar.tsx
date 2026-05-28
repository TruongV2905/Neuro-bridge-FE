"use client";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react" 

interface Props {
  entityName?: string
  onCreate?: () => void
}

export function CrudToolbar({
  entityName = "data",
  onCreate,
}: Props) {
  return (
    <div className="flex items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
      {/* LEFT: Tìm kiếm */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${entityName.toLowerCase()}...`}
          className="pl-9 bg-background focus-visible:ring-primary"
        />
      </div>

      {/* RIGHT: Hành động */}
      <div className="flex items-center gap-3">
        <Button onClick={onCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
          <Plus className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>
    </div>
  )
}