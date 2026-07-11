"use client"

import { type ReactNode, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP, ScrollTrigger)

interface HomepageMotionProps {
  children: ReactNode
}

export default function HomepageMotion({ children }: HomepageMotionProps) {
  const pageRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const media = gsap.matchMedia()

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(".hero-title-line", { yPercent: 110, autoAlpha: 0, duration: 0.85, stagger: 0.1 })
          .from(".hero-copy", { y: 26, autoAlpha: 0, duration: 0.55, stagger: 0.1 }, "-=0.35")

        gsap.to(".hero-media", {
          scale: 1.07,
          ease: "none",
          scrollTrigger: {
            trigger: ".homepage-hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        })

        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          gsap.from(element, {
            y: 42,
            autoAlpha: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 86%",
              once: true,
            },
          })
        })

        gsap.from(".activity-card", {
          y: 38,
          autoAlpha: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".activities-grid",
            start: "top 82%",
            once: true,
          },
        })
      })

      return () => media.revert()
    },
    { scope: pageRef },
  )

  return (
    <main ref={pageRef} className="overflow-hidden bg-white text-[#0a0a09]">
      {children}
    </main>
  )
}
