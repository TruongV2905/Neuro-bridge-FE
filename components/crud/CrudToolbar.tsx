"use client";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Props {
  title?: string
  onCreate?: () => void
}

export function CrudToolbar({
  title,
  onCreate,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      {/* LEFT */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {title}
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage all {title?.toLowerCase()}
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <Input
          placeholder={`Search ${title?.toLowerCase()}...`}
          className="w-64"
        />

        <Button onClick={onCreate}>
          Create
        </Button>
      </div>
    </div>
  )
}