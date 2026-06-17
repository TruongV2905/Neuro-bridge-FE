"use client"

import * as React from "react"
import {
  Sparkles,
  CalendarDays,
  BadgeDollarSign,
  CheckCircle2,
  Clock3,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DialogRoot,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AvailableAI,
  AIStatus,
} from "@/types/available-ai"
import { StatCard } from "@/components/shared/StatCard"

interface AvailableAICardDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void

  data: AvailableAI
}

export function AvailableAICardDetail({
  open,
  onOpenChange,
  data,
}: AvailableAICardDetailProps) {

  const {
    name,
    type,
    status,
    successScore,
    description,
    techStacks,
    capabilities,
    timeline,
    budget,
    author,
    reviews,
  } = data

  const getStatusStyle = (status: AIStatus) => {
    switch (status) {
      case "Available":
        return "border-[#10b981]/30 bg-[#10b981]/15 text-[#10b981]"

      case "Trending":
        return "bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30"

      case "Sold":
        return "border-[#ef4444]/30 bg-[#ef4444]/15 text-[#ef4444]"

      default:
        return "border-slate-500/20 bg-slate-500/10 text-slate-400"
    }
  }

  const customGradient =
    "radial-gradient(circle at 15% 15%, #5f7bff 0%, #3e5ee0 35%, #8b5cf6 65%, #ec4899 100%)"
    const radius = 18
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset =
        circumference - (successScore / 100) * circumference

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span
        key={index}
        className={cn(
          "text-sm",
          index < rating
            ? "text-[#EC4899]"
            : "text-slate-600"
        )}
      >
        ★
      </span>
    ))
  }

  return (
    <DialogRoot
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="
        flex flex-col

        overflow-hidden

        rounded-[28px]

        border border-white/10

        bg-gradient-to-b
        from-[#232A6B]
        to-[#4A1557]

        p-0

        text-white

        shadow-[0_25px_80px_rgba(0,0,0,0.45)]
        "
      >
        <ScrollArea className="max-h-[90vh]">
          <div className="p-5 sm:p-6">

            {/* Header */}
            <div className="flex items-start gap-4">

              {/* Icon */}
              <div
                className="
                flex h-16 w-16 shrink-0 items-center justify-center

                rounded-2xl

                bg-gradient-to-br
                from-[#5b51ef]
                to-[#8b5cf6]

                shadow-[0_10px_30px_rgba(91,81,239,0.35)]
                "
              >
                <Sparkles className="h-7 w-7 text-white" />
              </div>

              {/* Title */}
              <div className="flex flex-1 flex-col">

                <DialogTitle
                  className="
                  text-[30px]
                  font-extrabold
                  tracking-tight

                  text-white
                  "
                >
                  {name}
                </DialogTitle>

                <div className="flex flex-wrap items-center gap-2">

                  {/* Type */}
                  <Badge
                    className="
                    border-[#D946EF]/60

                    bg-[#2E123A]

                    px-3 py-1

                    text-[11px]
                    font-semibold

                    text-[#D946EF]
                    "
                  >
                    {type}
                  </Badge>

                  {/* Status */}
                  <Badge
                    className={cn(
                      "px-3 py-1 text-[11px] font-semibold",
                      getStatusStyle(status)
                    )}
                  >
                    {status === "Available" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                    )}

                    {status === "Trending" && (
                        <TrendingUp className="h-3.5 w-3.5" />
                    )}
                    {status}
                  </Badge>

                </div>
              </div>
            </div>

            {/* Stats - Sử dụng StatCard */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              
              {/* Thẻ AI Success Score */}
              <StatCard
                icon={
                  <div className="relative flex h-11 w-11 items-center justify-center">
                    <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 44 44">
                      <defs>
                        <radialGradient id="detail-score-gradient" cx="15%" cy="15%" r="85%">
                          <stop offset="0%" stopColor="#5f7bff" />
                          <stop offset="35%" stopColor="#3e5ee0" />
                          <stop offset="65%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </radialGradient>
                      </defs>
                      <circle cx="22" cy="22" r={radius} className="fill-none stroke-[#4a3b68]/40 stroke-[3]" />
                      <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        className="fill-none stroke-[3] transition-all duration-1000 ease-out"
                        stroke="url(#detail-score-gradient)"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="relative text-[11px] font-bold text-white">
                      {successScore}
                    </span>
                  </div>
                }
                value="AI Success Score"
                label="AI Performance"
              />

              {/* Thẻ Timeline */}
              <StatCard
                icon={
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/20 text-[#C084FC]">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                }
                value={timeline}
                label="Estimated Timeline"
              />

              {/* Thẻ Budget */}
              <StatCard
                icon={
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EC4899]/20 text-[#EC4899]">
                    <BadgeDollarSign className="h-5 w-5" />
                  </div>
                }
                value={budget}
                label="Project Budget"
              />

            </div>

            {/* Description */}
            <div className="mt-6">

              <h3 className="text-2xl font-bold text-white">
                Description
              </h3>

              <p
                className="
                mt-2

                text-sm
                leading-7

                text-slate-300
                "
              >
                {description}
              </p>

            </div>

            {/* Technologies */}
            <div className="mt-6">

              <div className="mb-3 flex items-center gap-2">

                <Sparkles className="h-5 w-5 text-[#8B5CF6]" />

                <h3 className="text-2xl font-bold text-white">
                  Technologies Used
                </h3>

              </div>

              <div className="flex flex-wrap gap-2">

                {techStacks.map((tech, index) => (
                  <Badge
                    key={index}
                    className="
                    rounded-full

                    border border-[#7CA2FF]/40

                    bg-white/5

                    px-3 py-1

                    text-[11px]
                    font-semibold

                    text-[#A5B4FC]

                    hover:bg-white/10
                    "
                  >
                    {tech}
                  </Badge>
                ))}

              </div>
            </div>

            {/* AI Capabilities */}
            <div className="mt-7">

              <h3 className="text-2xl font-bold text-white">
                AI Capabilities
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                {capabilities.map((capability, index) => (
                  <div
                    key={index}
                    className="
                    flex items-center gap-3

                    rounded-2xl

                    border border-white/5

                    bg-[#5b51ef]/12

                    px-4 py-4

                    transition-all duration-300

                    hover:border-[#8B5CF6]/30
                    hover:bg-[#5b51ef]/20
                    "
                  >
                    <CheckCircle2 className="h-5 w-5 text-[#C084FC]" />

                    <span className="font-medium text-white">
                      {capability}
                    </span>
                  </div>
                ))}

              </div>
            </div>

            {/* Author */}
            <div
              className="
              mt-7

              rounded-2xl

              border border-white/5

              bg-white/[0.06]

              p-4
              "
            >
              <div className="flex items-center justify-between gap-4">

                {/* Left */}
                <div className="flex items-center gap-3">

                  {author.avatarUrl ? (
                    <img
                      src={author.avatarUrl}
                      alt={author.name}
                      className="
                      h-12 w-12 rounded-full object-cover

                      ring-2 ring-[#8B5CF6]/30
                      "
                    />
                  ) : (
                    <div
                      className="h-12 w-12 rounded-full"
                      style={{ background: customGradient }}
                    />
                  )}

                  <div>

                    <div className="flex items-center gap-1.5">

                      <span className="text-lg font-semibold text-white">
                        {author.name}
                      </span>

                      {author.checked && (
                        <CheckCircle2 className="h-4 w-4 fill-[#3b82f6]/10 text-[#3b82f6]" />
                      )}

                    </div>

                    <p className="text-sm text-slate-400">
                      {author.completedProjects ?? 0} Completed Projects
                    </p>

                  </div>
                </div>

                {/* Button */}
                <Button
                  variant="outline"
                  className="
                  h-10

                  rounded-xl

                  border-[#6d5efc]/40

                  bg-[#1e1b4b]/30

                  px-5

                  text-sm
                  font-medium
                  text-[#A5B4FC]

                  hover:bg-[#2b246d]
                  hover:text-white
                  "
                >
                  View Profile
                </Button>

              </div>
            </div>

            {/* Reviews */}
            <div className="mt-7">

              <h3 className="text-2xl font-bold text-white">
                Client Reviews
              </h3>

              <div className="mt-4 flex flex-col gap-3">

                {reviews.map((review, index) => (
                  <div
                    key={index}
                    className="
                    rounded-2xl

                    border border-white/5

                    bg-white/[0.05]

                    p-4
                    "
                  >
                    <div className="flex items-start justify-between gap-4">

                      {/* Left */}
                      <div>

                        <h4 className="font-semibold text-white">
                          {review.name}
                        </h4>

                        <div className="mt-1 flex items-center">
                          {renderStars(review.rating)}
                        </div>

                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-1 text-xs text-slate-400">

                        <Clock3 className="h-3.5 w-3.5" />

                        {review.time}

                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {review.comment}
                    </p>

                  </div>
                ))}

              </div>
            </div>

            <Separator className="my-6 bg-white/10" />

            {/* Footer Actions */}
            <div className="grid grid-cols-2 gap-3">

              {/* Get Started */}
              <Button
                className="
                h-14

                rounded-2xl

                border-none

                bg-gradient-to-r
                from-[#5470FF]
                to-[#EC4899]

                text-base
                font-bold
                text-white

                shadow-[0_10px_30px_rgba(84,112,255,0.35)]

                transition-all duration-300

                hover:scale-[1.02]
                hover:brightness-110
                "
              >
                Get Started
              </Button>

              {/* Contact */}
              <Button
                variant="outline"
                className="
                h-14

                rounded-2xl

                border-white/20

                bg-white/[0.04]

                text-base
                font-semibold
                text-white

                transition-all duration-300

                hover:bg-white/[0.08]
                "
              >
                Contact
              </Button>

            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </DialogRoot>
  )
}