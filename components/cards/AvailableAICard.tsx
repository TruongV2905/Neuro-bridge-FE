import * as React from "react";
import {
  Sparkles,
  Eye,
  Bookmark,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { AvailableAI, AIStatus } from "@/types/available-ai";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface AvailableAICardProps {
  data: AvailableAI;

  onViewDetails?: () => void;
  onSave?: () => void;
  onComment?: () => void;
}

export function AvailableAICard({
  data,
  onViewDetails,
  onSave,
  onComment,
}: AvailableAICardProps) {
  const {
    name,
    status,
    type,
    successScore,
    description,
    techStacks,
    author,
    budget,
    hasGlow = false,
  } = data;

  const getStatusStyle = (status: AIStatus) => {
    switch (status) {
      case "Available":
        return "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30";

      case "Trending":
        return "bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30";

      case "Sold":
        return "bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30";

      default:
        return "bg-slate-500/15 text-slate-400";
    }
  };

  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = circumference - (successScore / 100) * circumference;

  // Avatar Gradient
  const customGradient =
    "radial-gradient(circle at 15% 15%, #5f7bff 0%, #3e5ee0 35%, #8b5cf6 65%, #ec4899 100%)";

  const [saved, setSaved] = React.useState(false);

  return (
    <Card
      className={cn(
        `
        group relative w-full max-w-100

        overflow-hidden rounded-[24px]

        border border-[#4a3b68]/40

        bg-linear-to-b
        from-[#232A6B]
        to-[#4A1557]

        p-4 text-white

        transition-all duration-300 ease-out

        hover:-translate-y-2
        hover:border-[#5470FF]/70

        hover:shadow-[0_25px_50px_0_rgba(10,12,22,0.2),0_0_20px_8px_rgba(84,112,255,0.5)]
        `,
        hasGlow &&
          "shadow-[0_0_40px_8px_rgba(139,92,246,0.25)] border-[#8b5cf6]/40",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-[#5b51ef] to-[#8b5cf6] text-white shadow-md">
          <Sparkles className="h-5 w-5" />
        </div>

        <Badge
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
            getStatusStyle(status),
          )}
        >
          {status === "Available" && (
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
          )}

          {status === "Trending" && <TrendingUp className="h-3.5 w-3.5" />}

          {status}
        </Badge>
      </div>

      {/* Name & Type */}
      <div className="mb-0">
        <h3 className="mb-1 line-clamp-2 text-xl font-bold tracking-tight text-white">
          {name}
        </h3>

        <Badge
          variant={"outline"}
          className="rounded-full border border-[#D946EF]/70 bg-[#2E123A] px-3 py-1 text-[11px] font-bold text-[#D946EF]"
        >
          {type}
        </Badge>
      </div>

      {/* AI Success Score */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 items-center justify-center">
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 44 44"
          >
            <defs>
              <radialGradient id="score-gradient" cx="15%" cy="15%" r="85%">
                <stop offset="0%" stopColor="#5f7bff" />
                <stop offset="35%" stopColor="#3e5ee0" />
                <stop offset="65%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </radialGradient>
            </defs>

            <circle
              cx="22"
              cy="22"
              r={radius}
              className="fill-none stroke-[#4a3b68]/40 stroke-3"
            />

            <circle
              cx="22"
              cy="22"
              r={radius}
              className="fill-none stroke-3 transition-all duration-1000 ease-out"
              stroke="url(#score-gradient)"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          <span className="relative text-[11px] font-bold text-white">
            {successScore}
          </span>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-200">
            AI Success Score
          </h4>

          <p className="text-[11px] text-slate-400">
            Client satisfaction & delivery
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="line-clamp-2 text-sm leading-relaxed text-slate-300">
        {description}
      </p>

      {/* Tech Stacks */}
      <div className="flex flex-wrap gap-1.5 content-start">
        {techStacks.map((tech, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="rounded-full border border-[#7CA2FF]/70 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#7CA2FF]"
          >
            {tech}
          </Badge>
        ))}
      </div>

      {/* Divider */}
      <Separator className="bg-[#4a3b68]/70" />

      {/* Author */}
      <div className="flex items-center gap-2.5">
        {author.avatarUrl ? (
          <Image
          <Image
            src={author.avatarUrl}
            alt={author.name}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover ring-1 ring-[#8b5cf6]/30"
          />
        ) : (
          <div
            className="h-9 w-9 rounded-full"
            style={{ background: customGradient }}
          />
        )}

        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-slate-200">
            {author.name}
          </span>

          {author.checked && (
            <span title="Legit Expert" className="inline-flex items-center">
              <CheckCircle2 className="h-4 w-4 fill-[#3b82f6]/10 text-[#3b82f6]" />
            </span>
          )}
        </div>
      </div>

      {/* Budget & Actions */}
      <div className="flex flex-col gap-1">
        <div className="mb-2 mt-0.5 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-white">
            {budget}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Detail */}
          <Button
            onClick={onViewDetails}
            className="h-11 flex-1 rounded-xl border-none bg-linear-to-r from-[#5b51ef] to-[#6366f1] text-sm font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <Eye className="mr-1.5 h-4 w-4" />
            View details
          </Button>

          {/* Save */}
          <Button
            onClick={() => {
              setSaved(!saved);
              onSave?.();
            }}
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
                `,
            )}
          >
            <Bookmark
              className={cn(
                "h-4 w-4 transition-all duration-300",
                saved && "fill-[#5470FF]",
              )}
            />
          </Button>

          {/* Comment */}
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
  );
}

