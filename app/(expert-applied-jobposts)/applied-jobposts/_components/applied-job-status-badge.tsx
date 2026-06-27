import type { AppliedJobStatus } from "@/types/applied-job.type"
import { APPLIED_JOB_STATUS_LABEL } from "../_constants/applied-job.constant"

type Props = {
  status: AppliedJobStatus
}

export function AppliedJobStatusBadge({ status }: Props) {
  const className =
    status === "ACCEPTED"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : status === "REJECTED"
        ? "border-rose-100 bg-rose-50 text-rose-700"
        : "border-amber-100 bg-amber-50 text-amber-700"

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold shadow-sm ${className}`}
    >
      {APPLIED_JOB_STATUS_LABEL[status]}
    </span>
  )
}