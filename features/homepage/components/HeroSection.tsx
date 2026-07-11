"use client";

import Image from "next/image";
import { useRef } from "react";
import { useInView } from "framer-motion";

import bannerLogo from "@/public/img/bannerLogo.png";

export default function HeroSection() {
  const sectionRef = useRef(null);

  const isInView = useInView(sectionRef, {
    once: false,
    amount: 0.3,
  });

  return (
    <section
      ref={sectionRef}
      className="homepage-hero relative flex min-h-svh items-center justify-center overflow-hidden bg-[#0a0d17] px-6 text-center text-white sm:min-h-[910px]"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-screen"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/video/cta-bg.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-x-0 bottom-0 z-[1] h-48 bg-gradient-to-t from-[var(--foreground)] via-[var(--foreground)]/80 via-20% via-[var(--foreground)]/40 via-50% to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-[980px]">
        <Image
          src={bannerLogo}
          alt="Neuro Bridge Logo"
          width={900}
          height={100}
          className={
            isInView
              ? "mx-auto animate__animated animate__zoomIn animate__delay-0.5s"
              : "mx-auto opacity-0"
          }
        />
        <p
          className={`hero-copy mx-auto max-w-[860px] text-gray-200 text-md  ${
            isInView ? "animate__animated animate__fadeInUp" : "opacity-0"
          }`}
        >
          Connect with AI experts, ready-made models, and automation workflows
          built for real business problems.
        </p>

        <p
          className={`hero-copy text-md  text-gray-400 ${
            isInView ? "animate__animated animate__fadeInUp " : "opacity-0"
          }`}
        >
          AI marketplace and project delivery platform
        </p>
      </div>
    </section>
  );
}
