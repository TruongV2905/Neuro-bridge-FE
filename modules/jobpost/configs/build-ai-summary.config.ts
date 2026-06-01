// modules/jobpost/configs/build-ai-summary.config.ts

import type { AIAnalysisResult } from "../types/ai-analysis.type"
import type {
  BudgetRange,
  JobCategory,
  TimelineRange,
} from "../types/jobpost.type"

export type BuildAISummaryInput = {
  projectTitle: string
  category: JobCategory | null
  budgetRange: BudgetRange
  timelineRange: TimelineRange
  aiAnalysis?: AIAnalysisResult | null
}

export function formatBudgetAmount(value: number) {
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`
  }

  return `$${value}`
}

export function formatBudgetRange(budgetRange: BudgetRange) {
  return `${formatBudgetAmount(budgetRange.min)} – ${formatBudgetAmount(
    budgetRange.max
  )}`
}

export function formatTimelineRange(timelineRange: TimelineRange) {
  return `${timelineRange.min} ${timelineRange.unit} – ${timelineRange.max} ${timelineRange.unit}`
}

export function buildAISummary(input: BuildAISummaryInput) {
  const {
    projectTitle,
    category,
    budgetRange,
    timelineRange,
    aiAnalysis,
  } = input

  const title = projectTitle.trim() || "Untitled AI Project"
  const categoryName = category?.name ?? "AI Solution"
  const budgetText = formatBudgetRange(budgetRange)
  const timelineText = formatTimelineRange(timelineRange)
  const confidenceScore = aiAnalysis?.confidenceScore ?? 0

  return `${title} — an AI project focused on ${categoryName}. Budget range ${budgetText} over ${timelineText}. AI Confidence Score: ${confidenceScore}%.`
}