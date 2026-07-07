"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BadgeCheck,
  CheckCircle2,
  FileText,
  Rocket,
  Search,
  Sparkles,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { GradientCtaLink, GradientLabel } from "./HomepagePrimitives"

interface WorkflowStep {
  title: string
  description: string
  icon: LucideIcon
}

const workflowSteps: WorkflowStep[] = [
  {
    title: "Explore AI solutions",
    description:
      "Browse ready-made models, automation workflows, and AI use cases before starting from scratch.",
    icon: Search,
  },
  {
    title: "Create an AI brief",
    description:
      "Describe your business problem, expected outcome, budget, and delivery scope through a guided flow.",
    icon: FileText,
  },
  {
    title: "Match with AI experts",
    description:
      "Compare expert profiles, skills, delivery fit, and proposal direction before choosing who to work with.",
    icon: Users,
  },
  {
    title: "Build and deliver",
    description:
      "Move from idea validation to milestones, implementation, and project delivery with clearer expectations.",
    icon: Rocket,
  },
]

export default function ProjectJourneySection() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section className="relative isolate overflow-hidden bg-[#061128] px-6 py-20 text-white sm:py-24 lg:px-[7.5%]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,rgba(84,112,255,0.34),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(252,56,218,0.24),transparent_28%),linear-gradient(135deg,#020714,#061128_48%,#091d3d)]" />
      <div className="absolute inset-0 -z-10 opacity-35 [background-image:linear-gradient(rgba(124,162,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(124,162,255,0.14)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute left-1/2 top-28 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#5470ff]/20 blur-3xl" />

      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)] lg:items-end">
          <div data-reveal>
            <GradientLabel>PROJECT JOURNEY</GradientLabel>
            <h2 className="mt-8 max-w-4xl text-[clamp(2.25rem,3.5vw,3.35rem)] font-extrabold uppercase leading-none">
              From AI idea to expert-led delivery
            </h2>
          </div>
          <p
            data-reveal
            className="max-w-2xl text-base leading-8 text-slate-300 lg:justify-self-end lg:text-lg"
          >
            Neuro Bridge guides teams from exploring solutions to creating a clear AI brief, matching
            with experts, and moving toward real project delivery.
          </p>
        </div>

        <div
          data-reveal
          className="relative mt-14 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-3 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-4 lg:p-5"
        >
          <div className="pointer-events-none absolute inset-x-8 top-[5.65rem] hidden h-px bg-linear-to-r from-transparent via-[#7ca2ff]/60 to-transparent shadow-[0_0_26px_rgba(124,162,255,0.7)] lg:block" />
          <div className="pointer-events-none absolute bottom-8 left-[2.6rem] top-8 w-px bg-linear-to-b from-transparent via-[#7ca2ff]/40 to-transparent shadow-[0_0_22px_rgba(124,162,255,0.45)] lg:hidden" />

          <div className="relative z-10 flex flex-col gap-3 lg:min-h-[320px] lg:flex-row lg:items-stretch">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = activeStep === index

              return (
                <button
                  key={step.title}
                  type="button"
                  aria-expanded={isActive}
                  onClick={() => setActiveStep(index)}
                  onFocus={() => setActiveStep(index)}
                  onMouseEnter={() => setActiveStep(index)}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-[22px] border p-5 text-left outline-none transition-all duration-500 focus-visible:ring-2 focus-visible:ring-[#7ca2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#061128] sm:p-6 lg:flex lg:min-w-0 lg:flex-col lg:justify-between",
                    isActive
                      ? "border-[#7ca2ff]/55 bg-white/[0.09] shadow-[0_24px_80px_rgba(84,112,255,0.24)] lg:flex-[1.8]"
                      : "border-white/10 bg-white/[0.035] opacity-75 hover:border-[#7ca2ff]/35 hover:bg-white/[0.06] hover:opacity-100 lg:flex-[0.72]",
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-white/45 to-transparent transition-opacity duration-500",
                      isActive ? "opacity-90" : "opacity-35",
                    )}
                  />
                  <div
                    className={cn(
                      "absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#fc38da]/15 blur-3xl transition-opacity duration-500",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div
                    className={cn(
                      "absolute -bottom-20 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-[#5470ff]/20 blur-3xl transition-opacity duration-500",
                      isActive ? "opacity-90" : "opacity-0",
                    )}
                  />

                  <div className="relative z-10 flex items-start gap-4 lg:flex-col lg:gap-8">
                    <span
                      className={cn(
                        "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-xl font-black leading-none transition-all duration-500",
                        isActive
                          ? "border-[#7ca2ff]/55 bg-[#142454]/80 text-white shadow-[0_0_30px_rgba(84,112,255,0.4)]"
                          : "border-white/10 bg-[#0a1836]/70 text-[#9bb8ff]",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        {isActive && (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#fc38da]/30 bg-[#fc38da]/10 text-[#ff8ae9] shadow-[0_0_24px_rgba(252,56,218,0.18)]">
                            <Icon className="size-5" />
                          </span>
                        )}
                        <h3 className="text-xl font-extrabold leading-tight text-white sm:text-2xl lg:text-[1.55rem]">
                          {step.title}
                        </h3>
                      </div>

                      <div
                        className={cn(
                          "grid transition-all duration-500",
                          isActive
                            ? "mt-5 grid-rows-[1fr] opacity-100"
                            : "mt-0 grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="overflow-hidden">
                          <p className="max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                            {step.description}
                          </p>
                          <div className="mt-7 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#7ca2ff]">
                            {index === 0 && <Sparkles className="size-4 text-[#fc38da]" />}
                            {index === 1 && <CheckCircle2 className="size-4 text-[#fc38da]" />}
                            {index === 2 && <BadgeCheck className="size-4 text-[#fc38da]" />}
                            {index === 3 && <Rocket className="size-4 text-[#fc38da]" />}
                            Project journey
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
