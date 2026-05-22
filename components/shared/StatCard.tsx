import * as React from "react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  className?: string
}

export function StatCard({
  icon,
  value,
  label,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:border-[#5470FF]/30 hover:bg-white/[0.07]",
        className
      )}
    >
      <div className="flex shrink-0 items-center justify-center">
        {icon}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-bold text-white sm:text-base">
          {value}
        </span>

        <span className="text-xs text-slate-400">
          {label}
        </span>
      </div>
    </div>
  )
}