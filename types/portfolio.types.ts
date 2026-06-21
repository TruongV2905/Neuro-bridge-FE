export interface PortfolioResponse {
  id: string
  title: string
  description: string
  technologies: string
  completedDate: string
  createdAt: string
  roleInProject: string
  projectUrl: string
}

export interface PortfolioRequest {
  title: string
  description: string
  technologies: string
  completedDate: string
  roleInProject: string
  projectUrl: string
}

export interface PortfolioForExpertRequest {
  portfolioIds: string[]
  code: string
}