import type {
  HomepageActivity,
  HomepageArticle,
  HomepageBenefit,
  HomepageGalleryImage,
  HomepageGroup,
} from "@/types/homepage";

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

export const activities: HomepageActivity[] = [];

export const groups: HomepageGroup[] = [
  {
    title: "Business automation for operations teams",
    image: "/figma/homepage/group-corporate.jpg",
  },
  {
    title: "AI learning paths for junior developers",
    image: "/figma/homepage/group-junior.jpg",
  },
  {
    title: "Personal productivity agents",
    image: "/figma/homepage/group-family.jpg",
  },
  {
    title: "AI labs for schools and colleges",
    image: "/figma/homepage/group-school.jpg",
  },
];

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
];
