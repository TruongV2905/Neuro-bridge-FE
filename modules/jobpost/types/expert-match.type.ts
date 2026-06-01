// modules/jobpost/types/expert-match.type.ts

export type ExpertMatch = {
  expertId: string
  fullName: string
  title: string
  avatarUrl?: string

  matchedSkills: string[]

  rating: number
  completedProjects: number
  successRate: number

  matchScore: number
}