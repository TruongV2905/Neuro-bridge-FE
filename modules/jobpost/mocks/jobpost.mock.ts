// modules/jobpost/mocks/jobpost.mock.ts

import { JobPostStatus, type JobPost } from "../types/jobpost.type"

export const mockJobPosts: JobPost[] = [
  {
    jobId: "job-001",
    clientId: "client-001",
    categoryId: "ai-chatbot",

    title: "AI Customer Support Chatbot",
    businessGoal: "Reduce customer support costs",
    description:
      "We need an AI chatbot that can answer common customer questions and escalate complex cases to human support.",

    requiredSkills: [
      "Python",
      "LangChain",
      "OpenAI API",
      "FastAPI",
      "Vector Databases",
    ],

    attachments: [],

    budgetRange: {
      min: 5000,
      max: 12000,
      currency: "USD",
    },

    timelineRange: {
      min: 2,
      max: 4,
      unit: "weeks",
    },

    deliverables: [
      {
        id: "deliverable-001",
        title: "Source code",
        isRequired: true,
      },
      {
        id: "deliverable-002",
        title: "Video demo",
        isRequired: true,
      },
      {
        id: "deliverable-003",
        title: "User guide document",
        isRequired: true,
      },
    ],

    status: JobPostStatus.DRAFT,

    createdAt: new Date().toISOString(),
  },
]