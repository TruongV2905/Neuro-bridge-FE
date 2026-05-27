import Image from "next/image"
import type { HomepageGalleryImage } from "@/types/homepage"
import { GradientCtaLink, GradientLabel } from "./HomepagePrimitives"

interface AboutSectionProps {
  images: readonly HomepageGalleryImage[]
}

export default function AboutSection({ images }: Readonly<AboutSectionProps>) {
  return (
    <section className="relative px-6 py-20 sm:py-28 lg:px-[7.5%]">
      <div className="pointer-events-none absolute left-[4%] top-24 hidden text-[116px] font-extrabold leading-[0.9] text-[#ebebe0]/50 lg:block">
        ABOUT
      </div>
      <div className="relative mx-auto grid max-w-[1360px] gap-14 lg:grid-cols-[1fr_1.08fr] lg:gap-20">
        <div data-reveal>
          <GradientLabel>ABOUT</GradientLabel>
          <h2 className="mt-10 max-w-[570px] text-[clamp(2.25rem,3.2vw,3rem)] font-extrabold uppercase leading-[0.98]">
            We&apos;re all about creating amazing experiences
          </h2>
          <p className="mt-10 max-w-[560px] text-lg leading-[1.5] text-[#6b6b61] sm:text-[22px]">
            Come to Adventis for an incredible adventure, from paintball and karting to quad bikes
            and archery. There is something for everyone at our outdoor activity centre.
          </p>
          <div className="mt-12 flex max-w-[530px] items-start gap-5">
            <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#f6f2e5] text-[46px] font-bold text-[#ff6e12]">
              o
            </span>
            <div>
              <h3 className="text-lg font-extrabold uppercase sm:text-xl">Over 40 activities for all adventure</h3>
              <p className="mt-3 text-base leading-relaxed text-[#6b6b61] sm:text-lg">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.
              </p>
            </div>
          </div>
        </div>
        <div data-reveal className="pt-3 lg:pt-16">
          <h3 className="mb-8 text-xl font-extrabold uppercase sm:text-2xl">Recommended on Tripadvisor</h3>
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
          <GradientCtaLink href="/experts" className="mt-10">Find out more</GradientCtaLink>
        </div>
      </div>
    </section>
  )
}
