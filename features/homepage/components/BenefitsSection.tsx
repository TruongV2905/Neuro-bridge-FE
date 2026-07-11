"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useInView, useReducedMotion } from "framer-motion"
import type { HomepageBenefit } from "@/types/homepage"
import { cn } from "@/lib/utils"
import { GradientCtaLink, GradientLabel } from "./HomepagePrimitives"

interface BenefitsSectionProps {
  benefits: readonly HomepageBenefit[]
}

const briefPreviewChips = ["Goals", "Budget", "Timeline", "Expert Match", "Milestones"]

export default function BenefitsSection({ benefits }: Readonly<BenefitsSectionProps>) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const isInView = useInView(sectionRef, { once: false, amount: 0.25 })
  const prefersReducedMotion = useReducedMotion()
  const [revealStep, setRevealStep] = useState(-1)
  const [activeBenefit, setActiveBenefit] = useState(0)

  const maxRevealStep = 8 + briefPreviewChips.length
  const showImmediately = Boolean(prefersReducedMotion)

  useEffect(() => {
    const clearRevealTimers = () => {
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current = []
    }

    clearRevealTimers()

    const queueRevealStep = (step: number, delay = 0) => {
      timersRef.current.push(
        setTimeout(() => {
          setRevealStep(step)
        }, delay),
      )
    }

    if (showImmediately) {
      queueRevealStep(maxRevealStep)
      return clearRevealTimers
    }

    if (!isInView) {
      queueRevealStep(-1)
      return clearRevealTimers
    }

    queueRevealStep(-1)

    for (let step = 0; step <= maxRevealStep; step += 1) {
      queueRevealStep(step, 120 + step * 115)
    }

    return clearRevealTimers
  }, [isInView, maxRevealStep, showImmediately])

  const isRevealed = (step: number) => showImmediately || revealStep >= step

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-[#161c2d] px-6 py-20 text-white sm:py-24 lg:px-[7.5%]"
    >
      <Image
        src="/figma/homepage/benefits-bg.jpg"
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="-z-10 -rotate-90 object-cover opacity-30"
      />
      <div className="absolute inset-0 -z-10 bg-[#161c2d]/45" />
      <div className="absolute right-[8%] top-24 -z-10 h-72 w-72 rounded-full bg-[#5470ff]/15 blur-3xl" />
      <div className="absolute left-[12%] top-1/2 -z-10 h-64 w-64 -translate-y-1/2 rounded-full bg-[#fc38da]/10 blur-3xl motion-safe:animate-pulse" />
      <div className="absolute inset-y-16 right-[18%] -z-10 w-40 rotate-12 bg-linear-to-b from-transparent via-[#7ca2ff]/10 to-transparent blur-2xl motion-safe:animate-pulse" />
      <div className="mx-auto grid max-w-[1360px] gap-16 xl:grid-cols-[1fr_360px]">
        <div>
          <div>
            <GradientLabel
              className={cn(
                "transition-all duration-500 ease-out",
                isRevealed(0) ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
              )}
            >
              BENEFITS
            </GradientLabel>
            <h2
              className={cn(
                "mt-8 text-[clamp(2.25rem,3.2vw,3rem)] font-extrabold uppercase transition-all duration-700 ease-out",
                isRevealed(1) ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
              )}
            >
              What you will get
            </h2>
            <p
              className={cn(
                "mt-8 max-w-[540px] text-lg leading-[1.45] text-white/55 transition-all duration-700 ease-out sm:text-[22px]",
                isRevealed(2) ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
              )}
            >
              From idea validation to project posting, Neuro Bridge helps teams compare AI options,
              define scope, and connect with experts who can turn business needs into deliverable AI
              solutions.
            </p>
          </div>
          <div className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {benefits.map((benefit, index) => {
              const isActive = activeBenefit === index

              return (
                <div
                  key={benefit.title}
                  className={cn(
                    "transition-all duration-700 ease-out",
                    isRevealed(3 + index)
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0",
                  )}
                >
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveBenefit(index)}
                    onFocus={() => setActiveBenefit(index)}
                    onMouseEnter={() => setActiveBenefit(index)}
                    className={cn(
                      "group flex h-full w-full gap-5 rounded-3xl border p-5 text-left backdrop-blur-[2px] outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#7ca2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#161c2d]",
                      isActive
                        ? "-translate-y-1 border-[#7ca2ff]/55 bg-white/[0.085] shadow-[0_20px_65px_rgba(84,112,255,0.2)]"
                        : "border-white/10 bg-white/[0.045] hover:-translate-y-1 hover:border-[#7ca2ff]/45 hover:bg-white/[0.075] hover:shadow-[0_18px_55px_rgba(84,112,255,0.14)]",
                      activeBenefit !== index && "opacity-85 hover:opacity-100",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-[60px] shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#5470ff] to-[#fc38da] text-xl font-bold shadow-[0_0_24px_rgba(252,56,218,0.18)] transition-transform duration-300",
                        isActive ? "scale-110" : "group-hover:scale-105",
                      )}
                    >
                      {benefit.icon}
                    </span>
                    <div>
                      <h3 className="text-lg font-extrabold leading-tight sm:text-xl">{benefit.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/50 sm:text-base">{benefit.description}</p>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
        <aside
          className={cn(
            "relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0f172a]/85 px-9 py-14 text-white shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md transition-all duration-700 ease-out",
            isRevealed(7) ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-[0.97] opacity-0",
          )}
        >
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#fc38da]/20 blur-3xl motion-safe:animate-pulse" />
          <div className="absolute -bottom-20 left-6 h-40 w-40 rounded-full bg-[#5470ff]/20 blur-3xl motion-safe:animate-pulse" />
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/45 to-transparent" />
          <div className="relative">
            <GradientLabel>READY TO BUILD</GradientLabel>
            <p className="mt-8 text-5xl font-extrabold leading-none">
              Create your
              <br />
              AI brief
            </p>
          </div>
          <blockquote className="relative mt-10 text-xl font-bold leading-snug text-white/85 sm:text-[22px]">
            &ldquo;Turn an unclear AI idea into a scoped project brief with goals, budget,
            delivery expectations, and expert matching.&rdquo;
          </blockquote>
          <div className="relative mt-9 rounded-3xl border border-white/10 bg-white/[0.045] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9bb8ff]">AI Brief Preview</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {briefPreviewChips.map((chip, index) => (
                <span
                  key={chip}
                  className={cn(
                    "rounded-full border border-[#7ca2ff]/25 bg-[#142454]/65 px-3 py-2 text-xs font-bold text-slate-200 shadow-[0_0_20px_rgba(84,112,255,0.12)] transition-all duration-500 ease-out",
                    isRevealed(8 + index)
                      ? "translate-y-0 opacity-100"
                      : "translate-y-3 opacity-0",
                  )}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <GradientCtaLink href="/client/dashboard/create-job-post" className="relative mt-10 w-full">
            Create AI Brief
          </GradientCtaLink>
        </aside>
      </div>
    </section>
  )
}
