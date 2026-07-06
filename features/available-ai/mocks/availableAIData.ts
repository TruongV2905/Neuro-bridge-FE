import type { AvailableAI } from "../types"

export const availableAIData: AvailableAI[] = [
    {
        id: "ai-1",
        name: "AI Automation Workflow",
        status: "Available",
        type: "AI Automation",

        successScore: 88,

        description:
            "Comprehensive automation solution that combines rule-based systems with AI intelligence to automate repetitive tasks, data processing, and decision-making workflows.",

        techStacks: [
            "Python",
            "Make.com",
            "Zapier",
            "OpenAI API",
            "Airtable",
            "Slack API",
        ],

        capabilities: [
            "Process Automation",
            "Data Integration",
            "Smart Routing",
            "Custom Triggers",
            "API Connectivity",
            "Reporting Dashboard",
        ],

        timeline: "3-4 weeks",

        budget: "From $1,500",

        author: {
            name: "Alex Automation",
            checked: true,
            completedProjects: 27,
        },

        reviews: [
            {
                name: "Small Biz Owner",
                rating: 4,
                comment:
                    "Great automation setup. Saved us hours every week.",
                time: "1 week ago",
            },
        ],

        hasGlow: false,
    },

    {
        id: "ai-2",
        name: "Computer Vision Tracker",
        status: "Trending",
        type: "Computer Vision",

        successScore: 94,

        description:
            "Real-time object detection and tracking customized for manufacturing assembly lines to detect defect rates.",

        techStacks: [
            "Python",
            "Deep Learning",
            "Slack API",
            "Airtable",
        ],

        capabilities: [
            "Object Detection",
            "Defect Analysis",
            "Real-Time Tracking",
            "Factory Monitoring",
            "Video Processing",
            "AI Analytics",
        ],

        timeline: "5-6 weeks",

        budget: "$3,500 - $5,000",

        author: {
            name: "David Vision",
            checked: false,
            completedProjects: 14,
        },

        reviews: [
            {
                name: "Factory Manager",
                rating: 5,
                comment:
                    "Detection accuracy is incredibly reliable for production monitoring.",
                time: "3 days ago",
            },
        ],

        hasGlow: true,
    },

    {
        id: "ai-3",
        name: "Autonomous Customer Support Agent",
        status: "Available",
        type: "AI Agent",

        successScore: 91,

        description:
            "Multi-agent system using LangChain to resolve customer support tickets autonomously with memory and contextual understanding.",

        techStacks: [
            "TypeScript",
            "LangChain",
            "OpenAI",
            "Pinecone",
        ],

        capabilities: [
            "Multi-Agent Workflow",
            "Memory System",
            "Customer Support",
            "Knowledge Base Search",
            "Smart Escalation",
            "Conversation Analytics",
        ],

        timeline: "4-5 weeks",

        budget: "From $2,200",

        author: {
            name: "Sarah Agent",
            checked: true,
            completedProjects: 31,
        },

        reviews: [
            {
                name: "Startup Founder",
                rating: 5,
                comment:
                    "Reduced our support workload significantly within the first month.",
                time: "5 days ago",
            },
        ],

        hasGlow: false,
    },

    {
        id: "ai-4",
        name: "Semantic Search & NLP Engine",
        status: "Sold",
        type: "NLP",

        successScore: 85,

        description:
            "Advanced semantic search engine for enterprise knowledge bases with contextual understanding and multilingual support.",

        techStacks: [
            "Python",
            "HuggingFace",
            "Elasticsearch",
            "FastAPI",
            "Redis",
        ],

        capabilities: [
            "Semantic Search",
            "Text Classification",
            "Knowledge Retrieval",
            "Intent Detection",
            "Contextual Embeddings",
            "Multilingual NLP",
        ],

        timeline: "6-7 weeks",

        budget: "$4,000",

        author: {
            name: "NLP Master",
            checked: false,
            completedProjects: 18,
        },

        reviews: [
            {
                name: "Enterprise CTO",
                rating: 4,
                comment:
                    "Excellent semantic accuracy and retrieval speed for internal docs.",
                time: "2 weeks ago",
            },
        ],

        hasGlow: false,
    },

    {
        id: "ai-5",
        name: "E-Commerce Recommendation System",
        status: "Trending",
        type: "Recommendation System",

        successScore: 96,

        description:
            "Personalized recommendation engine using behavioral analytics to increase user engagement and conversion rates.",

        techStacks: [
            "Python",
            "PyTorch",
            "Redis",
            "AWS Lambda",
            "PostgreSQL",
        ],

        capabilities: [
            "Recommendation Engine",
            "Behavior Tracking",
            "Purchase Prediction",
            "Customer Segmentation",
            "AI Analytics",
            "Product Ranking",
        ],

        timeline: "5-6 weeks",

        budget: "$5,000 - $7,500",

        author: {
            name: "Emma Recs",
            checked: true,
            completedProjects: 39,
        },

        reviews: [
            {
                name: "E-Commerce Founder",
                rating: 5,
                comment:
                    "Our conversion rate improved noticeably after integrating this system.",
                time: "4 days ago",
            },
        ],

        hasGlow: true,
    },

    {
        id: "ai-6",
        name: "Medical Image Segmentation",
        status: "Available",
        type: "Deep Learning",

        successScore: 89,

        description:
            "AI-powered medical image segmentation system using custom U-Net models for clinical diagnostics and healthcare workflows.",

        techStacks: [
            "Python",
            "TensorFlow",
            "Keras",
            "Docker",
            "OpenCV",
        ],

        capabilities: [
            "MRI Segmentation",
            "Medical Imaging",
            "Deep Learning",
            "Clinical AI",
            "Object Segmentation",
            "Healthcare Analytics",
        ],

        timeline: "7-9 weeks",

        budget: "From $6,000",

        author: {
            name: "Dr. Deep",
            checked: true,
            completedProjects: 22,
        },

        reviews: [
            {
                name: "Healthcare Startup",
                rating: 5,
                comment:
                    "Impressive segmentation precision and very smooth deployment process.",
                time: "6 days ago",
            },
        ],

        hasGlow: false,
    },

    {
        id: "ai-7",
        name: "Voice-to-Action Executive Assistant",
        status: "Available",
        type: "AI Agent",

        successScore: 87,

        description:
            "Voice-controlled AI executive assistant capable of task management, scheduling, CRM updates, and smart reminders.",

        techStacks: [
            "Next.js",
            "Whisper API",
            "Node.js",
            "GraphQL",
            "Supabase",
        ],

        capabilities: [
            "Voice Commands",
            "Meeting Scheduling",
            "CRM Automation",
            "Task Management",
            "Speech Recognition",
            "Smart Notifications",
        ],

        timeline: "4-6 weeks",

        budget: "$1,800 - $3,000",

        author: {
            name: "Voice Tech",
            checked: false,
            completedProjects: 12,
        },

        reviews: [
            {
                name: "Agency Owner",
                rating: 4,
                comment:
                    "The voice automation features are extremely useful during meetings.",
                time: "1 week ago",
            },
        ],

        hasGlow: false,
    },

    {
        id: "ai-8",
        name: "Financial Sentiment Predictive Model",
        status: "Sold",
        type: "NLP",

        successScore: 92,

        description:
            "Real-time financial sentiment analysis model using news scraping and social media signals for market prediction.",

        techStacks: [
            "Python",
            "FinBERT",
            "PostgreSQL",
            "React",
            "FastAPI",
        ],

        capabilities: [
            "Sentiment Analysis",
            "Stock Prediction",
            "Financial NLP",
            "Real-Time Scraping",
            "Market Analytics",
            "Trend Forecasting",
        ],

        timeline: "6-8 weeks",

        budget: "$8,500",

        author: {
            name: "Quant AI",
            checked: true,
            completedProjects: 44,
        },

        reviews: [
            {
                name: "Investment Analyst",
                rating: 5,
                comment:
                    "Very accurate sentiment signals for short-term market movement analysis.",
                time: "2 days ago",
            },
        ],

        hasGlow: false,
    },

    {
        id: "ai-9",
        name: "AI Content Generation Studio",
        status: "Trending",
        type: "AI Automation",

        successScore: 90,

        description:
            "AI-powered content generation platform for blogs, ads, social posts, and email campaigns with collaborative workflows.",

        techStacks: [
            "Next.js",
            "OpenAI API",
            "TailwindCSS",
            "Prisma",
            "Stripe",
        ],

        capabilities: [
            "Content Generation",
            "SEO Optimization",
            "Campaign Writing",
            "AI Copywriting",
            "Workflow Collaboration",
            "Content Scheduling",
        ],

        timeline: "4-5 weeks",

        budget: "$3,000 - $4,500",

        author: {
            name: "Creative AI",
            checked: true,
            completedProjects: 29,
        },

        reviews: [
            {
                name: "Marketing Team",
                rating: 5,
                comment:
                    "Content generation speed improved massively while keeping quality high.",
                time: "5 days ago",
            },
        ],

        hasGlow: true,
    },

]
