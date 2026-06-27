import type { AppliedJobStatus } from "@/types/applied-job.type"
import { APPLIED_JOB_FILTERS } from "../_constants/applied-job.constant"

type FilterValue = "ALL" | AppliedJobStatus

type Props = {
  activeFilter: FilterValue
  onChange: (filter: FilterValue) => void
}

export function AppliedJobFilter({ activeFilter, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {APPLIED_JOB_FILTERS.map((filter) => {
        const isActive = activeFilter === filter

        return (
          <button
            key={filter}
            type="button"
            onClick={() => onChange(filter)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
              isActive
                ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20"
                : "border border-border bg-white text-muted-foreground hover:border-[var(--primary)]/20 hover:bg-[var(--primary)]/5 hover:text-[var(--primary)]"
            }`}
          >
            {filter === "ALL"
              ? "All"
              : filter[0] + filter.slice(1).toLowerCase()}
          </button>
        )
      })}
    </div>
  )
}