"use client"

import * as React from "react"
import Image from "next/image"
import { Sparkles, Eye, Bookmark, MessageSquare, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button" 

export type AIStatus = "Available" | "Trending" | "Sold"
export type AIType = 
  | "AI Automation" 
  | "Computer Vision" 
  | "AI Agent" 
  | "NLP" 
  | "Recommendation System" 
  | "Deep Learning"

interface AvailableAICardProps {
  name: string
  status: AIStatus
  type: AIType
  successScore: number
  description: string
  techStacks: string[]
  author: {
    name: string
    avatarUrl?: string
    checked?: boolean
  }
  budget: string
  hasGlow?: boolean
  onViewDetails?: () => void
  onSave?: () => void
  onComment?: () => void
}

export function AvailableAICard({
  name,
  status,
  type,
  successScore,
  description,
  techStacks,
  author,
  budget,
  hasGlow = false,
  onViewDetails,
  onSave,
  onComment,
}: AvailableAICardProps) {
  
  const getStatusStyle = (status: AIStatus) => {
    switch (status) {
      case "Available":
        return "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30"
      case "Trending":
        return "bg-[#EC4899]/15 text-[#EC4899] border-[#EC4899]/30"
      case "Sold":
        return "bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30"
      default:
        return "bg-slate-500/15 text-slate-400"
    }
  }

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (successScore / 100) * circumference;

  // Khai báo chung mã màu Gradient để dùng cho Avatar
  const customGradient = "radial-gradient(circle at 15% 15%, #5f7bff 0%, #3e5ee0 35%, #8b5cf6 65%, #ec4899 100%)";
  const [saved, setSaved] = React.useState(false)
  return (
    <Card
      // className={cn(
      //   "relative w-full max-w-[400px] overflow-hidden rounded-[24px] border border-[#4a3b68]/40 bg-gradient-to-b from-[#232A6B] to-[#4A1557] p-4 text-white transition-all duration-300 shadow-xl",
      //   hasGlow && "shadow-[0_0_40px_8px_rgba(139,92,246,0.25)] border-[#8b5cf6]/40"
      // )}
      className={cn(
        `
        group relative w-full max-w-[400px]
        overflow-hidden rounded-[24px]
        border border-[#4a3b68]/40
        bg-gradient-to-b from-[#232A6B] to-[#4A1557]
        p-4 text-white

        transition-all duration-300 ease-out

        hover:-translate-y-2
        hover:border-[#5470FF]/70

        hover:shadow-[0_25px_50px_0_rgba(10,12,22,0.2),0_0_20px_8px_rgba(84,112,255,0.5)]

        `,
        hasGlow &&
          "shadow-[0_0_40px_8px_rgba(139,92,246,0.25)] border-[#8b5cf6]/40"
      )}
    >
      {/* 1. Header: Icon trang trí & Trạng thái (Status) - Giảm mb-4 xuống mb-3 */}
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#5b51ef] to-[#8b5cf6] text-white shadow-md">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide", getStatusStyle(status))}>
          {status === "Available" && <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />}
          {status === "Trending" && <span className="h-1.5 w-1.5 rounded-full bg-[#EC4899]" />}
          {status}
        </span>
      </div>

      {/* 2. Tên (Name) & Thể loại (Type)*/}
      <div className="mb-0">
        <h3 className="text-xl font-bold tracking-tight text-white mb-1 line-clamp-2">
          {name}
        </h3>
        <span className="inline-block rounded-full bg-[#2E123A] px-3 py-1 text-[11px] font-bold text-[#D946EF] border border-[#D946EF]/70">
          {type}
        </span>
      </div>

      {/* 3. Điểm thành công (AI Success Score) */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 44 44">
            <defs>
              <radialGradient id="score-gradient" cx="15%" cy="15%" r="85%">
                <stop offset="0%" stopColor="#5f7bff" />
                <stop offset="35%" stopColor="#3e5ee0" />
                <stop offset="65%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </radialGradient>
            </defs>
            <circle cx="22" cy="22" r={radius} className="fill-none stroke-[#4a3b68]/40 stroke-[3]" />
            <circle
              cx="22" cy="22" r={radius}
              className="fill-none stroke-[3] transition-all duration-1000 ease-out"
              stroke="url(#score-gradient)" /* Áp dụng Gradient vào viền */
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="relative text-[11px] font-bold text-white">{successScore}</span>
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-200 tracking-wide uppercase">AI Success Score</h4>
          <p className="text-[11px] text-slate-400">Client satisfaction & delivery</p>
        </div>
      </div>

      {/* 4. Mô tả tóm tắt (Description summary)*/}
      <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
        {description}
      </p>

      {/* 5. Công nghệ sử dụng (Tech Stacks)*/}
      <div className="flex flex-wrap gap-1.5 content-start">
        {techStacks.map((tech, index) => (
          <span
            key={index}
            className="rounded-full border border-[#7CA2FF]/70 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#7CA2FF]"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Khoảng cách đường kẻ mảnh*/}
      <hr className="border-[#4a3b68]/70" />

      {/* 6. Thông tin Tác giả (Author) */}
      <div className="flex items-center gap-2.5">
        {author.avatarUrl ? (
          <Image
            src={author.avatarUrl}
            alt={author.name}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover ring-1 ring-[#8b5cf6]/30"
          />
        ) : (
          // Avatar trống được áp dụng chính xác gradient CSS
          <div 
            className="h-9 w-9 rounded-full" 
            style={{ background: customGradient }} 
          />
        )}
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-slate-200">{author.name}</span>
          {author.checked && (
            <span title="Legit Expert" className="inline-flex items-center">
              <CheckCircle2 className="h-4 w-4 text-[#3b82f6] fill-[#3b82f6]/10" />
            </span>
          )}
        </div>
      </div>

      {/* 7. Ngân sách & Các nút tương tác (Budget & Actions) */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between mt-0.5 mb-2">
          <span className="text-lg font-bold text-white tracking-tight">{budget}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={onViewDetails}
            className="flex-1 rounded-xl bg-gradient-to-r from-[#5b51ef] to-[#6366f1] h-11 text-sm font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-[0.98] border-none"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            View details
          </Button>

          <Button
            onClick={() => {
              setSaved(!saved)
              onSave?.()
            }}
            variant="outline"
            size="icon"
            className={cn(
              `
              h-11 w-11 rounded-xl
              border-[#4a3b68]/60
              bg-[#1e1b4b]/20
              text-slate-300

              transition-all duration-300 ease-out

              hover:bg-[#1e1b4b]/50
              hover:text-white
              hover:border-[#6d5efc]/50

              active:scale-95
              `,

              saved &&
                `
                border-[#5470FF]
                bg-[#5470FF]/30
                text-[#5470FF]

                shadow-[0_0_20px_rgba(84,112,255,0.22)]
                `
            )}
          >
            <Bookmark
              className={cn(
                "h-4 w-4 transition-all duration-300",
                saved && "fill-[#5470FF]"
              )}
            />
          </Button>
          
          <Button 
            onClick={onComment}
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl border-[#4a3b68]/60 bg-[#1e1b4b]/20 text-slate-300 transition-all hover:bg-[#1e1b4b]/50 hover:text-white"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
