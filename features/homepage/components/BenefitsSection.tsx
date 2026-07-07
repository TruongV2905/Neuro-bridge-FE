import Image from "next/image"
import type { HomepageBenefit } from "@/types/homepage"
import { GradientCtaLink, GradientLabel } from "./HomepagePrimitives"

interface BenefitsSectionProps {
  benefits: readonly HomepageBenefit[]
}

export default function BenefitsSection({ benefits }: Readonly<BenefitsSectionProps>) {
  return (
    <section className="relative isolate overflow-hidden bg-[#161c2d] px-6 py-20 text-white sm:py-24 lg:px-[7.5%]">
      <Image
        src="/figma/homepage/benefits-bg.jpg"
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="-z-10 -rotate-90 object-cover opacity-30"
      />
      <div className="absolute inset-0 -z-10 bg-[#161c2d]/45" />
      <div className="absolute right-[8%] top-24 -z-10 h-72 w-72 rounded-full bg-[#5470ff]/15 blur-3xl" />
      <div className="mx-auto grid max-w-[1360px] gap-16 xl:grid-cols-[1fr_360px]">
        <div>
          <div data-reveal>
            <GradientLabel>BENEFITS</GradientLabel>
            <h2 className="mt-8 text-[clamp(2.25rem,3.2vw,3rem)] font-extrabold uppercase">What you will get</h2>
            <p className="mt-8 max-w-[540px] text-lg leading-[1.45] text-white/55 sm:text-[22px]">
              From idea validation to project posting, Neuro Bridge helps teams compare AI options,
              define scope, and connect with experts who can turn business needs into deliverable AI
              solutions.
            </p>
          </div>
          <div className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {benefits.map((benefit) => (
              <article
                data-reveal
                key={benefit.title}
                className="group flex gap-5 rounded-3xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-[2px] transition-all duration-300 hover:-translate-y-1 hover:border-[#7ca2ff]/45 hover:bg-white/[0.075] hover:shadow-[0_18px_55px_rgba(84,112,255,0.14)]"
              >
                <span className="flex size-[60px] shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#5470ff] to-[#fc38da] text-xl font-bold shadow-[0_0_24px_rgba(252,56,218,0.18)] transition-transform duration-300 group-hover:scale-105">
                  {benefit.icon}
                </span>
                <div>
                  <h3 className="text-lg font-extrabold leading-tight sm:text-xl">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/50 sm:text-base">{benefit.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <aside
          data-reveal
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0f172a]/85 px-9 py-14 text-white shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md"
        >
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#fc38da]/20 blur-3xl" />
          <div className="absolute -bottom-20 left-6 h-40 w-40 rounded-full bg-[#5470ff]/20 blur-3xl" />
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
          <GradientCtaLink href="/client/dashboard/create-job-post" className="relative mt-10 w-full">
            Create AI Brief
          </GradientCtaLink>
        </aside>
      </div>
    </section>
  )
}
