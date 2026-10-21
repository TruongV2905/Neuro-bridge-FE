"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { AvailableAICard } from "@/features/available-ai";
import type { HomepageActivity } from "@/types/homepage";
import { GradientCtaLink } from "./HomepagePrimitives";

interface ActivitiesSectionProps {
  activities: readonly HomepageActivity[];
}

export default function ActivitiesSection({
  activities,
}: Readonly<ActivitiesSectionProps>) {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement | null>(null);
  const introVideoRef = useRef<HTMLVideoElement | null>(null);
  const finalVideoRef = useRef<HTMLVideoElement | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isInViewRef = useRef(false);
  const finalRevealStartedRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, {
    once: false,
    amount: 0.2,
  });

  const [showIntroVideo, setShowIntroVideo] = useState(false);
  const [showFinalVideo, setShowFinalVideo] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [showCta, setShowCta] = useState(false);

  const clearRevealTimers = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const revealFinalPhase = useCallback(() => {
    if (!isInViewRef.current || finalRevealStartedRef.current) {
      return;
    }

    finalRevealStartedRef.current = true;
    setShowFinalVideo(true);
    setShowContent(true);
    setShowCards(true);
    setShowIntroVideo(false);

    const finalVideo = finalVideoRef.current;

    if (finalVideo) {
      finalVideo.play().catch(() => {});
    }

    timersRef.current.push(
      setTimeout(
        () => {
          const introVideo = introVideoRef.current;

          if (introVideo) {
            introVideo.pause();
            introVideo.currentTime = 0;
          }
        },
        prefersReducedMotion ? 0 : 700,
      ),
    );

    timersRef.current.push(
      setTimeout(
        () => {
          setShowCta(true);
        },
        prefersReducedMotion ? 0 : 650,
      ),
    );
  }, [prefersReducedMotion]);

  useEffect(() => {
    isInViewRef.current = isInView;

    const resetRevealState = () => {
      finalRevealStartedRef.current = false;
      setShowIntroVideo(false);
      setShowFinalVideo(false);
      setShowContent(false);
      setShowCards(false);
      setShowCta(false);
    };

    clearRevealTimers();

    const introVideo = introVideoRef.current;
    const finalVideo = finalVideoRef.current;

    if (!isInView) {
      resetRevealState();

      if (introVideo) {
        introVideo.pause();
        introVideo.currentTime = 0;
      }

      if (finalVideo) {
        finalVideo.pause();
        finalVideo.currentTime = 0;
      }

      return clearRevealTimers;
    }

    resetRevealState();
    timersRef.current.push(setTimeout(() => setShowIntroVideo(true), 0));

    if (finalVideo) {
      finalVideo.pause();
      finalVideo.currentTime = 0;
    }

    if (introVideo) {
      introVideo.currentTime = 0;

      if (!prefersReducedMotion) {
        introVideo.play().catch(() => {});
      }
    }

    if (prefersReducedMotion) {
      timersRef.current.push(
        setTimeout(() => {
          setShowIntroVideo(false);
          revealFinalPhase();
        }, 0),
      );

      return clearRevealTimers;
    }

    timersRef.current.push(setTimeout(revealFinalPhase, 1900));

    return clearRevealTimers;
  }, [clearRevealTimers, isInView, prefersReducedMotion, revealFinalPhase]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-[#061128] px-6 py-20 text-white sm:py-24 lg:px-[7.5%]"
    >
      <video
        ref={introVideoRef}
        className={`pointer-events-none absolute inset-0 z-0 h-full w-full object-fill transition-opacity duration-700 ease-out ${
          showIntroVideo ? "opacity-100" : "opacity-0"
        }`}
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        onEnded={revealFinalPhase}
      >
        <source src="/video/solution-section-bg.mp4" type="video/mp4" />
      </video>
      <video
        ref={finalVideoRef}
        className={`pointer-events-none absolute inset-0 z-0 h-full w-full object-fill transition-opacity duration-700 ease-out ${
          showFinalVideo ? "opacity-[0.72]" : "opacity-0"
        }`}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/video/end-solution-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 z-[1] bg-[#020916]/45" />
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_36%,rgba(2,9,22,0.76)_100%)]" />
      <div className="relative z-10 mx-auto max-w-[1280px] text-center">
        <div
          className={`transition-all duration-700 ease-out ${
            showContent
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-6 scale-[0.98] opacity-0"
          }`}
        >
          <p className="text-[clamp(3rem,6vw,5.5rem)] font-extrabold leading-none text-white/[0.3 ]">
            AI SOLUTIONS
          </p>
          <h2 className="-mt-6 bg-linear-to-r from-white via-[#8fb7ff] to-[#fc8ee4] bg-clip-text text-[clamp(2rem,3vw,2.75rem)] font-extrabold uppercase tracking-[0.08em] text-transparent drop-shadow-[0_0_26px_rgba(84,112,255,0.38)]">
            Popular AI solutions
          </h2>
        </div>
        <div className="activities-grid mt-16 grid gap-7 lg:grid-cols-3 lg:gap-10">
          {activities.map((activity, index) => (
            <div
              key={activity.id ?? activity.name}
              className={`relative z-10 flex justify-center transition-all duration-700 ease-out ${
                showCards
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{
                transitionDelay:
                  showCards && !prefersReducedMotion
                    ? `${index * 160}ms`
                    : "0ms",
              }}
            >
              <AvailableAICard
                {...activity}
                onViewDetails={() => router.push("/ai-place")}
              />
            </div>
          ))}
        </div>
        <div
          className={`transition-all duration-700 ease-out ${
            showCta ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <GradientCtaLink href="/ai-place" className="mt-16 min-w-[280px]">
            View all AI solutions
          </GradientCtaLink>
        </div>
      </div>
    </section>
  );
}
