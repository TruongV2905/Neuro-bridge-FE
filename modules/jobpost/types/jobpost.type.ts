// modules/jobpost/types/jobpost.type.ts

export type JobPostId = string
export type UserId = string
export type CategoryId = string

export enum JobPostStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  LOCKED = "LOCKED",
  UNLOCKED = "UNLOCKED",
  ASSIGNED = "ASSIGNED",
}

export type BudgetRange = {
  min: number
  max: number
  currency: "USD"
}

export type TimelineRange = {
  min: number
  max: number
  unit: "weeks" | "months"
}

export type JobCategory = {
  id: CategoryId
  name: string
  icon: string
}

export type Deliverable = {
  id: string
  title: string
  isRequired: boolean
}

export type JobPostAttachment = {
  id: string
  name: string
  url?: string
  size?: number
  type?: string
}

export type JobPost = {
  jobId: JobPostId
  clientId: UserId
  categoryId: CategoryId

  title: string
  businessGoal: string
  customBusinessGoal?: string
  description?: string

  requiredSkills: string[]
  attachments: JobPostAttachment[]

  budgetRange: BudgetRange
  timelineRange: TimelineRange

  deliverables: Deliverable[]

  status: JobPostStatus

  createdAt: string
  updatedAt?: string
}