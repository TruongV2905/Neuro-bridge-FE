import type { AvailableAI } from "@/features/available-ai/types"

export interface HomepageGalleryImage {
  src: string
  alt: string
}

export type HomepageActivity = AvailableAI

export interface HomepageBenefit {
  icon: string
  title: string
  description: string
}

export interface HomepageArticle {
  title: string
  source: string
  description?: string
  image: string
  href: string
  kind?: string
}
