import Image from "next/image"
import type { HomepageArticle } from "@/types/homepage"
import { GradientLabel } from "./HomepagePrimitives"

interface BlogSectionProps {
  articles: readonly HomepageArticle[]
}

export default function BlogSection({ articles }: Readonly<BlogSectionProps>) {
  return (
    <section className="px-6 py-20 sm:py-24 lg:px-[7.5%]">
      <div className="mx-auto max-w-[1360px]">
        <div data-reveal>
          <GradientLabel>INSIGHTS</GradientLabel>
          <h2 className="mt-8 text-[clamp(2.25rem,3.2vw,3rem)] font-extrabold uppercase">AI in the spotlight</h2>
        </div>
        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {articles.map((article) => (
            <article data-reveal key={article.title} className="border border-[#e0e0d6] bg-white">
              <div className="relative aspect-[2.5]">
                <Image
                  src={article.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover"
                />
              </div>
              <div className="px-7 pb-9 pt-7">
                <p className="text-xs font-bold text-[#5470ff]">AI INSIGHTS / NEURO BRIDGE</p>
                <h3 className="mt-4 text-xl font-extrabold leading-snug">{article.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
