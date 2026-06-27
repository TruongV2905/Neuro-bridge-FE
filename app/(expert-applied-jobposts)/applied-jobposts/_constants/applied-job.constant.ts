import type { AppliedJobStatus } from "@/types/applied-job.type"

export const APPLIED_JOB_FILTERS: Array<"ALL" | AppliedJobStatus> = [
  "ALL",
  "PENDING",
  "ACCEPTED",
  "REJECTED",
]

export const APPLIED_JOB_STATUS_LABEL: Record<AppliedJobStatus, string> = {
  PENDING: "Pending Review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
}