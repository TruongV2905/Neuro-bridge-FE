// modules/jobpost/types/create-jobpost-wizard.type.ts

import type { AIAnalysisResult } from "./ai-analysis.type"
import type { ExpertMatch } from "./expert-match.type"
import type {
  BudgetRange,
  JobCategory,
  TimelineRange,
} from "./jobpost.type"

export type CreateJobpostStep = 1 | 2 | 3 | 4

export type ProjectBriefFormValues = {
  projectTitle: string
  businessGoal: string
  customBusinessGoal?: string
  description?: string
  attachments: File[]
}

export type JobpostConfigurationValues = {
  category: JobCategory | null
  requiredSkills: string[]
  budgetRange: BudgetRange
  timelineRange: TimelineRange
}

export type CreateJobpostWizardState = {
  currentStep: CreateJobpostStep

  brief: ProjectBriefFormValues

  aiAnalysis: AIAnalysisResult | null

  configuration: JobpostConfigurationValues

  expertMatches: ExpertMatch[]
}