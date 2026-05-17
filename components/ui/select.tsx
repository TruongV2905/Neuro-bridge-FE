"use client";

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "@/lib/utils"

export function Select({
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>
}

export function SelectTrigger({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "h-9 w-full rounded-md border border-input px-3 text-sm flex items-center justify-between",
        className
      )}
      {...props}
    />
  )
}

export const SelectContent = SelectPrimitive.Content
export const SelectItem = SelectPrimitive.Item
export const SelectValue = SelectPrimitive.Value