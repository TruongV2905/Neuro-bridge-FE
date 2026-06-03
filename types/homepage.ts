export interface HomepageGalleryImage {
  src: string
  alt: string
}

export interface HomepageActivity {
  name: string
  status: "Available" | "Trending" | "Sold"
  type:
    | "AI Automation"
    | "Computer Vision"
    | "AI Agent"
    | "NLP"
    | "Recommendation System"
    | "Deep Learning"
  successScore: number
  description: string
  techStacks: string[]
  author: {
    name: string
    avatarUrl?: string
    checked?: boolean
  }
  budget: string
}

export interface HomepageGroup {
  title: string
  image: string
}

export interface HomepageBenefit {
  icon: string
  title: string
  description: string
}

export interface HomepageArticle {
  title: string
  image: string
}
