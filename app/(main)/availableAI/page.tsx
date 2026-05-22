"use client"

import { AvailableAICard } from "@/components/cards/AvailableAICard"

const aiProducts = [
  {
    id: "ai-1",
    name: "AI Automation Workflow",
    status: "Available" as const,
    type: "AI Automation" as const,
    successScore: 88,
    description: "End-to-end workflow automation using AI to streamline business processes and reduce manual overhead drastically.",
    techStacks: ["Python", "Make.com", "Zapier", "OpenAI API"],
    author: {
      name: "Alex Automation",
      checked: true
    },
    budget: "From $1,500",
    hasGlow: false
  },
  {
    id: "ai-2",
    name: "Computer Vision Tracker",
    status: "Trending" as const,
    type: "Computer Vision" as const,
    successScore: 94,
    description: "Real-time object detection and tracking customized for manufacturing assembly lines to detect defect rates.",
    techStacks: ["Python", "Deep Learning", "Slack API", "Airtable"],
    author: {
      name: "David Vision",
      checked: false
    },
    budget: "$3,500 - $5,000",
    hasGlow: true
  },
  {
    id: "ai-3",
    name: "Autonomous Customer Support Support Agent Agent Agent",
    status: "Available" as const,
    type: "AI Agent" as const,
    successScore: 91,
    description: "Multi-agent system using LangChain to resolve 80% of customer support tickets autonomously with memory.",
    techStacks: ["TypeScript", "LangChain", "OpenAI", "Pinecone"],
    author: {
      name: "Sarah Agent",
      checked: true
    },
    budget: "From $2,200",
    hasGlow: false
  },
  {
    id: "ai-4",
    name: "Semantic Search & NLP Engine",
    status: "Sold" as const,
    type: "NLP" as const,
    successScore: 85,
    description: "Advanced text analysis and semantic search engine for enterprise internal knowledge bases.",
    techStacks: ["Python", "HuggingFace", "Elasticsearch", "FastAPI"],
    author: {
      name: "NLP Master",
      checked: false
    },
    budget: "$4,000",
    hasGlow: false
  },
  {
    id: "ai-5",
    name: "E-Commerce Recommendation System",
    status: "Trending" as const,
    type: "Recommendation System" as const,
    successScore: 96,
    description: "Personalized product recommendation algorithm boosting conversion rates by up to 25% via user behavior.",
    techStacks: ["Python", "PyTorch", "Redis", "AWS Lambda"],
    author: {
      name: "Emma Recs",
      checked: true
    },
    budget: "$5,000 - $7,500",
    hasGlow: true
  },
  {
    id: "ai-6",
    name: "Medical Image Segmentation",
    status: "Available" as const,
    type: "Deep Learning" as const,
    successScore: 89,
    description: "High-precision MRI scan segmentation using customized U-Net architecture for clinical decision support.",
    techStacks: ["Python", "TensorFlow", "Keras", "Docker"],
    author: {
      name: "Dr. Deep",
      checked: true
    },
    budget: "From $6,000",
    hasGlow: false
  },
  {
    id: "ai-7",
    name: "Voice-to-Action Executive Assistant",
    status: "Available" as const,
    type: "AI Agent" as const,
    successScore: 87,
    description: "Voice-activated AI assistant capable of scheduling, drafting emails, and updating CRM systems seamlessly.",
    techStacks: ["Next.js", "Whisper API", "Node.js", "GraphQL"],
    author: {
      name: "Voice Tech",
      checked: false
    },
    budget: "$1,800 - $3,000",
    hasGlow: false
  },
  {
    id: "ai-8",
    name: "Financial Sentiment Predictive Model",
    status: "Sold" as const,
    type: "NLP" as const,
    successScore: 92,
    description: "Real-time news and social media scraper predicting stock fluctuations using fine-tuned FinBERT.",
    techStacks: ["Python", "FinBERT", "PostgreSQL", "React"],
    author: {
      name: "Quant AI",
      checked: true
    },
    budget: "$8,500",
    hasGlow: false
  }
];

export default function CatalogPage() {
  return (
    <div className="w-full max-w-[1640px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-8 justify-items-center">
      {aiProducts.map((product) => (
        <AvailableAICard
          key={product.id}
          name={product.name}
          status={product.status}
          type={product.type}
          successScore={product.successScore}
          description={product.description}
          techStacks={product.techStacks}
          author={product.author}
          budget={product.budget}
          hasGlow={product.hasGlow}
          onViewDetails={() => console.log(`Redirect to detail of ${product.id}`)}
        />
      ))}
    </div>
  )
}