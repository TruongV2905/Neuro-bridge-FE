"use client";

import Image from "next/image";
import { useRef } from "react";
import { useInView } from "framer-motion";

import type { HomepageGalleryImage } from "@/types/homepage";
import { GradientCtaLink, GradientLabel } from "./HomepagePrimitives";
import { Marquee3D } from "@/components/Marquee3D";

interface AboutSectionProps {
  images: readonly HomepageGalleryImage[];
}

export default function AboutSection({ images }: Readonly<AboutSectionProps>) {
  const sectionRef = useRef(null);

  const isInView = useInView(sectionRef, {
    once: false,
    amount: 0.3,
  });

  return (
    <section
      ref={sectionRef}
      className="relative bg-foreground mx-auto pt-40 pb-20 text-background "
    >
      <div
        className={`pointer-events-none font-display absolute left-[4%] top-[19.5%] hidden text-[116px] font-extrabold leading-[0.9]  text-primary/60  lg:block ${
          isInView ? "animate__animated animate__fadeInLeft" : "opacity-0"
        }`}
      >
        ABOUT
      </div>

      <div className="relative mx-auto grid max-w-[1360px] gap-14 grid-cols-[1fr_1.08fr]">
        <div>
          <GradientLabel
            className={
              isInView ? "animate__animated animate__backInLeft" : "opacity-0"
            }
          >
            ABOUT
          </GradientLabel>

          <h2
            className={` max-w-[570px] text-4xl font-bold uppercase  ${
              isInView
                ? "animate__animated animate__fadeInUp animate__delay-0.1s"
                : "opacity-0"
            }`}
          >
            We help teams find the right AI solution faster
          </h2>

          <p
            className={`mt-2 ml-3 max-w-[560px] text-md text-gray-400 ${
              isInView
                ? "animate__animated animate__fadeInUp animate__delay-0.1s"
                : "opacity-0"
            }`}
          >
            Neuro Bridge brings AI experts, model demos, and automation use
            cases into one place so teams can move from idea to working solution
            without starting from zero.
          </p>

          <div
            className={`mt-5 flex max-w-[530px] items-start gap-3 ${
              isInView
                ? "animate__animated animate__fadeInUp animate__delay-0.2s"
                : "opacity-0"
            }`}
          >
            <span className="flex size-15 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-[#5470ff] to-[#fc38da] text-2xl font-bold text-background">
              AI
            </span>

            <div>
              <h3 className="text-xl font-bold uppercase">
                Verified AI workflows and expert support
              </h3>

              <p className="mt-3 text-md leading-relaxed text-gray-400">
                Browse automation, computer vision, NLP, and AI agent solutions
                with clear budgets and delivery profiles.
              </p>
            </div>
          </div>
        </div>

        <div
          className={` ${
            isInView
              ? "animate__animated animate__fadeInRight animate__delay-0.1s"
              : "opacity-0"
          }`}
        >
          <Marquee3D />
        </div>
      </div>
    </section>
  );
}
