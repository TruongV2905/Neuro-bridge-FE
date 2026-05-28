import type {
  HomepageActivity,
  HomepageArticle,
  HomepageBenefit,
  HomepageGalleryImage,
  HomepageGroup,
} from "@/types/homepage"

export const aboutImages: HomepageGalleryImage[] = [
  { src: "/figma/homepage/about-1.jpg", alt: "AI solution discovery preview" },
  { src: "/figma/homepage/about-2.jpg", alt: "Team reviewing automation ideas" },
  { src: "/figma/homepage/about-3.jpg", alt: "AI expert project collaboration" },
]

export const activities: HomepageActivity[] = [
  {
    name: "Customer Support AI Agent",
    status: "Available",
    type: "AI Agent",
    successScore: 92,
    description:
      "A chatbot and ticket triage agent that answers common questions, summarizes issues, and routes urgent cases.",
    techStacks: ["Next.js", "OpenAI API", "Supabase", "n8n"],
    author: { name: "Maya Chen", checked: true },
    budget: "From $1,200",
  },
  {
    name: "Document Intelligence Pipeline",
    status: "Trending",
    type: "NLP",
    successScore: 89,
    description:
      "Extracts key data from contracts, invoices, and reports, then sends structured results into your workflow.",
    techStacks: ["Python", "OCR", "LangChain", "Postgres"],
    author: { name: "Daniel Vo", checked: true },
    budget: "From $1,800",
  },
  {
    name: "Sales Forecasting Model",
    status: "Available",
    type: "Recommendation System",
    successScore: 86,
    description:
      "Predicts demand, highlights high-value segments, and recommends next actions for revenue teams.",
    techStacks: ["Python", "Pandas", "Scikit-learn", "Power BI"],
    author: { name: "An Nguyen", checked: true },
    budget: "From $2,000",
  },
]

export const groups: HomepageGroup[] = [
  { title: "Business automation for operations teams", image: "/figma/homepage/group-corporate.jpg" },
  { title: "AI learning paths for junior developers", image: "/figma/homepage/group-junior.jpg" },
  { title: "Personal productivity agents", image: "/figma/homepage/group-family.jpg" },
  { title: "AI labs for schools and colleges", image: "/figma/homepage/group-school.jpg" },
]

export const benefits: HomepageBenefit[] = [
  {
    icon: "*",
    title: "Validate ideas before you build",
    description: "Compare real AI use cases and understand what is practical before investing in development.",
  },
  {
    icon: "+",
    title: "Reduce repetitive work",
    description: "Use automation and AI agents to handle routine tasks while your team focuses on decisions.",
  },
  {
    icon: "?",
    title: "Match with the right expert",
    description: "Review skills, budgets, and delivery fit before starting an AI project.",
  },
  {
    icon: "+",
    title: "Ship faster with clear scope",
    description: "Turn a broad AI request into milestones, deliverables, and realistic implementation plans.",
  },
]

export const articles: HomepageArticle[] = [
  {
    title: "How AI agents help small teams answer customers faster",
    image: "/figma/homepage/blog-1.jpg",
  },
  {
    title: "Choosing between automation, chatbots, and custom AI models",
    image: "/figma/homepage/blog-2.jpg",
  },
  {
    title: "What to prepare before hiring an AI expert",
    image: "/figma/homepage/group-corporate.jpg",
  },
]
