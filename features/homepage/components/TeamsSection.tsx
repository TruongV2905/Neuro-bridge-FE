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
        className="-z-10 object-cover opacity-30 -rotate-90"
      />
      <div className="absolute inset-0 -z-10 bg-[#161c2d]/45" />
      <div className="mx-auto grid max-w-[1360px] gap-16 xl:grid-cols-[1fr_360px]">
        <div>
          <div data-reveal>
            <GradientLabel>BENEFITS</GradientLabel>
            <h2 className="mt-8 text-[clamp(2.25rem,3.2vw,3rem)] font-extrabold uppercase">What you will get</h2>
            <p className="mt-8 max-w-[540px] text-lg leading-[1.45] text-white/55 sm:text-[22px]">
              From idea validation to deployment planning, Neuro Bridge helps you compare AI options
              and choose the right expert with less guesswork.
            </p>
          </div>
          <div className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {benefits.map((benefit) => (
              <article data-reveal key={benefit.title} className="flex gap-5">
                <span className="flex size-[60px] shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#5470ff] to-[#fc38da] text-xl font-bold">
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
        <aside data-reveal className="bg-[#0f172a]/85 px-9 py-14 text-white backdrop-blur-[2px]">
          <GradientLabel>READY TO BUILD</GradientLabel>
          <p className="mt-8 text-5xl font-extrabold leading-none">Start an<br />AI brief</p>
          <blockquote className="mt-10 text-xl font-bold leading-snug sm:text-[22px]">
            &ldquo;Turn unclear AI ideas into scoped projects, clear budgets, and expert-led delivery.&rdquo;
          </blockquote>
          <GradientCtaLink href="/experts" className="mt-10 w-full">
            Contact us
          </GradientCtaLink>
        </aside>
      </div>
    </section>
  )
}
