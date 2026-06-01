// modules/jobpost/constants/jobpost.constants.ts

export const JOBPOST_STEPS = [
  {
    id: 1,
    title: "Business Overview",
    description: "Your project context",
  },
  {
    id: 2,
    title: "AI Analysis",
    description: "Smart recommendations",
  },
  {
    id: 3,
    title: "Configuration",
    description: "Project specifications",
  },
  {
    id: 4,
    title: "Review & Launch",
    description: "Final review",
  },
] as const

export const BUSINESS_GOALS = [
  "Reduce customer support costs",
  "Automate repetitive workflows",
  "Improve decision making with data",
  "Scale without hiring more staff",
  "Launch an AI-powered product feature",
  "Extract insights from documents or data",
  "Build internal AI tools for the team",
  "Create personalized user experiences",
  "Others",
] as const

export const JOB_CATEGORIES = [
  {
    id: "ai-chatbot",
    name: "AI Chatbot & Conversational AI",
    icon: "🤖",
  },
  {
    id: "document-ai",
    name: "Document AI & Data Extraction",
    icon: "📄",
  },
  {
    id: "workflow-automation",
    name: "Workflow Automation",
    icon: "⚙️",
  },
  {
    id: "predictive-analytics",
    name: "Predictive Analytics",
    icon: "📊",
  },
  {
    id: "computer-vision",
    name: "Computer Vision",
    icon: "👁️",
  },
  {
    id: "recommendation-system",
    name: "Recommendation System",
    icon: "🎯",
  },
] as const

export const SKILL_OPTIONS = [
  "Python",
  "LangChain",
  "OpenAI API",
  "FastAPI",
  "Vector Databases",
  "React",
  "Next.js",
  "Node.js",
  "PostgreSQL",
  "Computer Vision",
  "TensorFlow",
  "PyTorch",
  "Data Analysis",
  "Automation",
] as const

export const DEFAULT_DELIVERABLES = [
  "Source code",
  "Video demo",
  "User guide document",
] as const

export const PROJECT_DESCRIPTION_MAX_LENGTH = 1000

export const CUSTOM_BUSINESS_GOAL_MAX_LENGTH = 50

export const ATTACHMENT_MAX_SIZE_MB = 25

export const BUDGET_RANGE_LIMIT = {
  min: 1000,
  max: 50000,
  step: 500,
} as const

export const TIMELINE_RANGE_LIMIT = {
  min: 1,
  max: 12,
  step: 1,
  unit: "weeks",
} as const