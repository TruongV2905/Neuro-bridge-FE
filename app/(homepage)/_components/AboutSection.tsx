import Image from "next/image"
import type { HomepageGalleryImage } from "@/types/homepage"
import { GradientCtaLink, GradientLabel } from "./HomepagePrimitives"

interface AboutSectionProps {
  images: readonly HomepageGalleryImage[]
}

export default function AboutSection({ images }: Readonly<AboutSectionProps>) {
  return (
    <section className="relative px-6 py-20 sm:py-28 lg:px-[7.5%]">
      <div className="pointer-events-none absolute left-[4%] top-24 hidden text-[116px] font-extrabold leading-[0.9] text-[#e5e7eb]/60 lg:block">
        ABOUT
      </div>
      <div className="relative mx-auto grid max-w-[1360px] gap-14 lg:grid-cols-[1fr_1.08fr] lg:gap-20">
        <div data-reveal>
          <GradientLabel>ABOUT</GradientLabel>
          <h2 className="mt-10 max-w-[570px] text-[clamp(2.25rem,3.2vw,3rem)] font-extrabold uppercase leading-[0.98]">
            We help teams find the right AI solution faster
          </h2>
          <p className="mt-10 max-w-[560px] text-lg leading-[1.5] text-[#6b6b61] sm:text-[22px]">
            Neuro Bridge brings AI experts, model demos, and automation use cases into one place so
            teams can move from idea to working solution without starting from zero.
          </p>
          <div className="mt-12 flex max-w-[530px] items-start gap-5">
            <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[42px] font-bold text-[#5470ff]">
              AI
            </span>
            <div>
              <h3 className="text-lg font-extrabold uppercase sm:text-xl">Verified AI workflows and expert support</h3>
              <p className="mt-3 text-base leading-relaxed text-[#6b6b61] sm:text-lg">
                Browse automation, computer vision, NLP, and AI agent solutions with clear budgets
                and delivery profiles.
              </p>
            </div>
          </div>
        </div>
        <div data-reveal className="pt-3 lg:pt-16">
          <h3 className="mb-8 text-xl font-extrabold uppercase sm:text-2xl">Built for AI project discovery</h3>
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {images.map((image) => (
              <div key={image.src} className="relative aspect-[0.84] overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 1024px) 30vw, 210px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <GradientCtaLink href="/experts" className="mt-10">Find an expert</GradientCtaLink>
        </div>
      </div>
    </section>
  )
}
