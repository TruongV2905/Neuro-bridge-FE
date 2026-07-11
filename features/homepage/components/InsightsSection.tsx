import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import type { HomepageArticle } from "@/types/homepage"
import { GradientLabel } from "./HomepagePrimitives"

interface InsightsSectionProps {
  articles: readonly HomepageArticle[]
}

export default function InsightsSection({ articles }: Readonly<InsightsSectionProps>) {
  const marqueeArticles = [...articles, ...articles]

  return (
    <section className="relative isolate overflow-hidden bg-[#061128] px-6 py-20 text-white sm:py-24 lg:px-[7.5%]">
      <style>
        {`
          @keyframes insights-marquee-ltr {
            from {
              transform: translateX(-50%);
            }
            to {
              transform: translateX(0);
            }
          }

          .insights-marquee-window:hover .insights-marquee-track,
          .insights-marquee-window:focus-within .insights-marquee-track {
            animation-play-state: paused;
          }

          @media (prefers-reduced-motion: reduce) {
            .insights-marquee-window {
              overflow-x: auto;
              overflow-y: hidden;
            }

            .insights-marquee-track {
              animation: none !important;
              transform: translateX(0) !important;
            }
          }
        `}
      </style>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(84,112,255,0.32),transparent_28%),radial-gradient(circle_at_84%_12%,rgba(252,56,218,0.2),transparent_28%),linear-gradient(135deg,#020714,#061128_52%,#091d3d)]" />
      <div className="absolute inset-0 -z-10 opacity-30 [background-image:linear-gradient(rgba(124,162,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(124,162,255,0.12)_1px,transparent_1px)] [background-size:68px_68px]" />
      <div className="absolute left-[12%] top-28 -z-10 h-72 w-72 rounded-full bg-[#5470ff]/15 blur-3xl" />
      <div className="absolute bottom-24 right-[10%] -z-10 h-80 w-80 rounded-full bg-[#fc38da]/10 blur-3xl" />

      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.55fr)] lg:items-end">
          <div data-reveal>
            <GradientLabel>INSIGHTS</GradientLabel>
            <h2 className="mt-8 max-w-4xl text-[clamp(2.25rem,3.5vw,3.35rem)] font-extrabold uppercase leading-none">
              AI in the global spotlight
            </h2>
          </div>
          <p
            data-reveal
            className="max-w-2xl text-base leading-8 text-slate-300 lg:justify-self-end lg:text-lg"
          >
            Explore trusted reports and articles shaping how teams think about AI adoption,
            governance, agents, risk, and business value.
          </p>
        </div>

        <div
          data-reveal
          className="insights-marquee-window group relative mt-14 overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-[#061128] to-transparent sm:w-28" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-[#061128] to-transparent sm:w-28" />

          <div className="insights-marquee-track flex w-max gap-5 [animation:insights-marquee-ltr_46s_linear_infinite] group-hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] sm:gap-6">
            {marqueeArticles.map((article, index) => {
              const isDuplicate = index >= articles.length
              const linkText = article.kind?.toLowerCase().includes("report")
                ? "Read report"
                : "Read external article"

              return (
                <article
                  data-insight-card
                  data-insight-duplicate={isDuplicate ? "true" : "false"}
                  key={`${article.title}-${index}`}
                  aria-hidden={isDuplicate}
                  className="w-[min(84vw,380px)] shrink-0 sm:w-[360px] lg:w-[400px]"
                >
                  <a
                    href={article.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={isDuplicate ? -1 : undefined}
                    className="group/card flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.065] shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#7ca2ff]/45 hover:bg-white/[0.09] hover:shadow-[0_24px_80px_rgba(84,112,255,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ca2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#061128]"
                  >
                    <div className="relative aspect-[1.75] overflow-hidden">
                      <Image
                        src={article.image}
                        alt={`${article.title} from ${article.source}`}
                        fill
                        sizes="(max-width: 640px) 84vw, (max-width: 1024px) 360px, 400px"
                        className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-[#020714]/90 via-[#020714]/20 to-transparent" />
                      {article.kind && (
                        <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-[#061128]/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#b9c9ff] backdrop-blur-md">
                          {article.kind}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col px-6 pb-7 pt-6">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7ca2ff]">
                        {article.source}
                      </p>
                      <h3 className="mt-4 text-xl font-extrabold leading-snug text-white">
                        {article.title}
                      </h3>
                      {article.description && (
                        <p className="mt-4 text-sm leading-6 text-slate-300">{article.description}</p>
                      )}
                      <span className="mt-auto inline-flex pt-7 items-center gap-2 text-sm font-extrabold text-[#9bb8ff] transition-colors duration-300 group-hover/card:text-[#fc8ee4]">
                        {linkText}
                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
                      </span>
                    </div>
                  </a>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
