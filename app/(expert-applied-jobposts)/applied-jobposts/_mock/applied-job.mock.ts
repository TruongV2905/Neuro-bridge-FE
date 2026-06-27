import type { AppliedJob } from "@/types/applied-job.type"

export const appliedJobMock: AppliedJob[] = [
  {
    id: "1",
    title: "AI Chatbot for E-commerce",
    companyName: "Nova Commerce",
    description:
      "Build an AI assistant that helps customers find products, answer FAQs, and support order tracking.",
    budget: "$1,500 - $2,500",
    timeline: "3 weeks",
    appliedAt: "Applied 2 days ago",
    status: "PENDING",
    skills: ["Next.js", "OpenAI", "Chatbot", "API"],
  },
  {
    id: "2",
    title: "Invoice OCR Automation System",
    companyName: "FinEdge Solutions",
    description:
      "Create an OCR workflow to extract invoice data and export structured results into the finance dashboard.",
    budget: "$3,000 - $4,200",
    timeline: "1 month",
    appliedAt: "Applied 1 week ago",
    status: "ACCEPTED",
    skills: ["OCR", "Python", "FastAPI", "Automation"],
  },
  {
    id: "3",
    title: "AI Resume Screening Tool",
    companyName: "TalentBridge",
    description:
      "Develop a resume matching system that ranks candidates based on job requirements and skill relevance.",
    budget: "$1,000 - $1,800",
    timeline: "2 weeks",
    appliedAt: "Applied 5 days ago",
    status: "REJECTED",
    skills: ["NLP", "Matching", "Machine Learning"],
  },
]