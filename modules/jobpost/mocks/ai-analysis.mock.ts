// modules/jobpost/mocks/ai-analysis.mock.ts

import type { AIAnalysisResult } from "../types/ai-analysis.type"

export const mockAIAnalysisResult: AIAnalysisResult = {
  confidenceScore: 94,
  matchedProjects: 10247,

  category: {
    id: "ai-chatbot",
    name: "AI Chatbot & Conversational AI",
    icon: "🤖",
  },

  recommendedSkills: [
    "Python",
    "LangChain",
    "OpenAI API",
    "FastAPI",
    "Vector Databases",
  ],

  estimatedBudget: {
    min: 5000,
    max: 12000,
    currency: "USD",
  },

  estimatedTimeline: {
    min: 2,
    max: 4,
    unit: "weeks",
  },

  complexity: {
    level: "Medium - High",
    score: 72,
  },

  summary:
    "This project is suitable for an AI chatbot solution with API integration, retrieval-based answers, and workflow automation.",
}