export type AppliedJobStatus = "PENDING" | "ACCEPTED" | "REJECTED"

export type AppliedJob = {
  id: string
  title: string
  companyName: string
  description: string
  budget: string
  timeline: string
  appliedAt: string
  status: AppliedJobStatus
  skills: string[]
}