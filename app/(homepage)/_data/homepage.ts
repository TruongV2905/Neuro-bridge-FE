import type {
  HomepageActivity,
  HomepageArticle,
  HomepageBenefit,
  HomepageGalleryImage,
  HomepageGroup,
} from "@/types/homepage"

export const aboutImages: HomepageGalleryImage[] = [
  { src: "/figma/homepage/about-1.jpg", alt: "Guests climbing an adventure ropes course" },
  { src: "/figma/homepage/about-2.jpg", alt: "Family enjoying an outdoor activity" },
  { src: "/figma/homepage/about-3.jpg", alt: "Adventurer crossing a high rope bridge" },
]

export const activities: HomepageActivity[] = [
  {
    name: "AI Automation Workflow",
    status: "Available",
    type: "AI Automation",
    successScore: 88,
    description:
      "End-to-end workflow automation using AI to streamline business processes and reduce repetitive work.",
    techStacks: ["Python", "Make.com", "Zapier", "OpenAI API"],
    author: { name: "Alex Automation", checked: true },
    budget: "From $1,500",
  },
  {
    name: "AI Automation Workflow",
    status: "Available",
    type: "AI Automation",
    successScore: 88,
    description:
      "End-to-end workflow automation using AI to streamline business processes and reduce repetitive work.",
    techStacks: ["Python", "Make.com", "Zapier", "OpenAI API"],
    author: { name: "Alex Automation", checked: true },
    budget: "From $1,500",
  },
  {
    name: "AI Automation Workflow",
    status: "Available",
    type: "AI Automation",
    successScore: 88,
    description:
      "End-to-end workflow automation using AI to streamline business processes and reduce repetitive work.",
    techStacks: ["Python", "Make.com", "Zapier", "OpenAI API"],
    author: { name: "Alex Automation", checked: true },
    budget: "From $1,500",
  },
]

export const groups: HomepageGroup[] = [
  { title: "Corporate Events & Team Building", image: "/figma/homepage/group-corporate.jpg" },
  { title: "Junior groups", image: "/figma/homepage/group-junior.jpg" },
  { title: "Family adventures", image: "/figma/homepage/group-family.jpg" },
  { title: "Schools & colleges activities", image: "/figma/homepage/group-school.jpg" },
]

export const benefits: HomepageBenefit[] = [
  {
    icon: "*",
    title: "Improve your strength and endurance",
    description: "Adventure courses are designed to be accessible while still challenging.",
  },
  {
    icon: "+",
    title: "Have fun and reduce stress",
    description: "Spending time outdoors and in nature helps reduce stress and anxiety.",
  },
  {
    icon: "?",
    title: "Improved problem-solving skills",
    description: "Activities require adventurers to think outside of the box.",
  },
  {
    icon: "+",
    title: "Bond with friends and family",
    description: "Adventures are sweeter when they are shared.",
  },
]

export const articles: HomepageArticle[] = [
  {
    title: "Local pupils swing by Go Ape Normanby Hall",
    image: "/figma/homepage/blog-1.jpg",
  },
  {
    title: "Planning a Microadventure with Alastair Humphreys",
    image: "/figma/homepage/blog-2.jpg",
  },
  {
    title: "Reaching New Heights: The Benefits of High Ropes Courses",
    image: "/figma/homepage/group-corporate.jpg",
  },
]
