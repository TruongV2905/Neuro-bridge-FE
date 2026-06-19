"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { CreateJobPostStep } from "@/types/job-post.type";

type Props = {
  step: CreateJobPostStep;
  direction: number;
  children: React.ReactNode;
};

const pageVariants = {
  enter: (direction: number) => ({
    rotateY: direction > 0 ? 68 : -68,
    x: direction > 0 ? "42%" : "-42%",
    opacity: 0,
    scale: 0.94,
    filter: "blur(6px)",
    transformOrigin: direction > 0 ? "left center" : "right center",
  }),
  center: {
    rotateY: 0,
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transformOrigin: "center center",
  },
  exit: (direction: number) => ({
    rotateY: direction > 0 ? -68 : 68,
    x: direction > 0 ? "-42%" : "42%",
    opacity: 0,
    scale: 0.94,
    filter: "blur(6px)",
    transformOrigin: direction > 0 ? "right center" : "left center",
  }),
};

export function StepFlipTransition({ step, direction, children }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-[640px] w-full [perspective:1400px]">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={step}
          custom={direction}
          variants={reduceMotion ? undefined : pageVariants}
          initial={reduceMotion ? { opacity: 0 } : "enter"}
          animate={reduceMotion ? { opacity: 1 } : "center"}
          exit={reduceMotion ? { opacity: 0 } : "exit"}
          transition={{
            duration: 0.72,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
          className="w-full will-change-transform"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
