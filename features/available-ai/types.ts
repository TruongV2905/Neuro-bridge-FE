export type AIStatus = "Available" | "Trending" | "Sold"

export type AIType =
  | "AI Automation"
  | "Computer Vision"
  | "AI Agent"
  | "NLP"
  | "Recommendation System"
  | "Deep Learning"

export interface AIReview {
  name: string
  rating: number
  comment: string
  time: string
}

export interface AIAuthor {
  name: string
  avatarUrl?: string
  checked?: boolean
  completedProjects?: number
}

export interface AvailableAI {
  id: string

  name: string
  status: AIStatus
  type: AIType

  successScore: number

  description: string

  techStacks: string[]

  capabilities: string[]

  timeline: string

  budget: string

  author: AIAuthor

  reviews: AIReview[]

  hasGlow?: boolean
}