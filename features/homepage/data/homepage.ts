import type {
  HomepageActivity,
  HomepageArticle,
  HomepageBenefit,
  HomepageGalleryImage,
} from "@/types/homepage";
import { availableAIData } from "@/features/available-ai/mocks/availableAIData";

export const aboutImages: HomepageGalleryImage[] = [
  { src: "/figma/homepage/about-1.jpg", alt: "AI solution discovery preview" },
  {
    src: "/figma/homepage/about-2.jpg",
    alt: "Team reviewing automation ideas",
  },
  {
    src: "/figma/homepage/about-3.jpg",
    alt: "AI expert project collaboration",
  },
];

const trendingActivities = availableAIData.filter(
  (activity) => activity.status === "Trending"
);

const featuredActivities =
  trendingActivities.length >= 3
    ? trendingActivities.slice(0, 3)
    : availableAIData.slice(0, 3);

export const activities: HomepageActivity[] = featuredActivities.map(
  (activity, index) => ({
    ...activity,
    status: "Trending" as const,
    hasGlow: index === 1,
  })
);

export const benefits: HomepageBenefit[] = [
  {
    icon: "*",
    title: "Validate ideas before you build",
    description:
      "Compare real AI use cases and understand what is practical before investing in development.",
  },
  {
    icon: "+",
    title: "Reduce repetitive work",
    description:
      "Use automation and AI agents to handle routine tasks while your team focuses on decisions.",
  },
  {
    icon: "?",
    title: "Match with the right expert",
    description:
      "Review skills, budgets, and delivery fit before starting an AI project.",
  },
  {
    icon: "+",
    title: "Ship faster with clear scope",
    description:
      "Turn a broad AI request into milestones, deliverables, and realistic implementation plans.",
  },
];

export const articles: HomepageArticle[] = [
  {
    title: "AI explained: Why the world needs to act now",
    source: "UN News",
    kind: "Governance",
    description:
      "A global perspective on why AI governance, safety, and international cooperation matter as artificial intelligence develops faster than policy can keep up.",
    image: "/figma/homepage/blog-1.jpg",
    href: "https://www.un.org/sustainabledevelopment/blog/2026/07/ai-explained-why-the-world-needs-to-act-now/",
  },
  {
    title: "The 2025 AI Index Report",
    source: "Stanford HAI",
    kind: "Research Report",
    description:
      "A data-driven report tracking AI progress, adoption, investment, policy, and the broader impact of artificial intelligence across society.",
    image: "/figma/homepage/blog-2.jpg",
    href: "https://hai.stanford.edu/ai-index/2025-ai-index-report",
  },
  {
    title: "What are the risks and benefits of AI agents?",
    source: "World Economic Forum",
    kind: "AI Agents",
    description:
      "An overview of how AI agents can create business value while raising questions around reliability, security, accountability, and human oversight.",
    image: "/figma/homepage/group-corporate.jpg",
    href: "https://www.weforum.org/stories/2024/12/ai-agents-risks-artificial-intelligence/",
  },
  {
    title: "OECD AI Principles",
    source: "OECD.AI",
    kind: "Responsible AI",
    description:
      "Practical principles for trustworthy AI that respects human rights, democratic values, transparency, robustness, and accountability.",
    image: "/figma/homepage/about-1.jpg",
    href: "https://oecd.ai/en/ai-principles",
  },
  {
    title: "The state of AI in 2025: Agents, innovation, and transformation",
    source: "McKinsey",
    kind: "Enterprise AI",
    description:
      "A global survey on how organizations are adopting AI and AI agents, and why many are still early in capturing enterprise-level value.",
    image: "/figma/homepage/about-2.jpg",
    href: "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai",
  },
  {
    title: "2025 Work Trend Index Annual Report",
    source: "Microsoft",
    kind: "Future of Work",
    description:
      "Research on how AI, agents, and human-agent teams are reshaping knowledge work, leadership, and organizational design.",
    image: "/figma/homepage/about-3.jpg",
    href: "https://news.microsoft.com/annual-work-trend-index-2025/",
  },
  {
    title: "The ROI of AI: Agents are delivering for business now",
    source: "Google Cloud",
    kind: "Business Value",
    description:
      "A business-focused view of how AI agents are moving from experimentation to measurable value across enterprise workflows.",
    image: "/figma/homepage/blog-1.jpg",
    href: "https://cloud.google.com/transform/roi-of-ai-how-agents-help-business",
  },
  {
    title: "How People Are Really Using Gen AI in 2025",
    source: "Harvard Business Review",
    kind: "GenAI Adoption",
    description:
      "A look at real-world generative AI use cases across personal and business contexts, showing how adoption patterns are evolving.",
    image: "/figma/homepage/blog-2.jpg",
    href: "https://hbr.org/2025/04/how-people-are-really-using-gen-ai-in-2025",
  },
  {
    title: "Artificial Intelligence Risk Management Framework: Generative AI Profile",
    source: "NIST",
    kind: "AI Risk",
    description:
      "A cross-sector companion to the AI Risk Management Framework focused on identifying and managing risks from generative AI systems.",
    image: "/figma/homepage/group-corporate.jpg",
    href: "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence",
  },
];
