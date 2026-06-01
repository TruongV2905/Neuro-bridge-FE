// modules/jobpost/types/ai-analysis.type.ts

import type {
  BudgetRange,
  JobCategory,
  TimelineRange,
} from "./jobpost.type"

export type ProjectComplexityLevel =
  | "Low"
  | "Medium"
  | "Medium - High"
  | "High"

export type ProjectComplexity = {
  level: ProjectComplexityLevel
  score: number
}

export type AIAnalysisResult = {
  confidenceScore: number
  matchedProjects: number

  category: JobCategory

  recommendedSkills: string[]

  estimatedBudget: BudgetRange

  estimatedTimeline: TimelineRange

  complexity: ProjectComplexity

  summary: string
}