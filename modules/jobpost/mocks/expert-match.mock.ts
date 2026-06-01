// modules/jobpost/mocks/expert-match.mock.ts

import type { ExpertMatch } from "../types/expert-match.type"

export const mockExpertMatches: ExpertMatch[] = [
  {
    expertId: "expert-001",
    fullName: "Alex Nguyen",
    title: "AI Chatbot Engineer",
    avatarUrl: "",
    matchedSkills: ["Python", "LangChain", "OpenAI API"],
    rating: 4.9,
    completedProjects: 42,
    successRate: 96,
    matchScore: 94,
  },
  {
    expertId: "expert-002",
    fullName: "Mia Tran",
    title: "Backend & AI Integration Specialist",
    avatarUrl: "",
    matchedSkills: ["FastAPI", "OpenAI API", "Vector Databases"],
    rating: 4.8,
    completedProjects: 36,
    successRate: 93,
    matchScore: 91,
  },
  {
    expertId: "expert-003",
    fullName: "Daniel Pham",
    title: "Automation Solution Architect",
    avatarUrl: "",
    matchedSkills: ["Python", "Automation", "PostgreSQL"],
    rating: 4.7,
    completedProjects: 28,
    successRate: 90,
    matchScore: 87,
  },
]