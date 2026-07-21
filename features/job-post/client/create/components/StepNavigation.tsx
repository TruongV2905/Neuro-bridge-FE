"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { CreateJobPostStep } from "@/types/job-post.type";

type Props = {
  step: CreateJobPostStep;
  canContinue: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  onContinue: () => void;
};

export function StepNavigation({
  step,
  canContinue,
  isLoading = false,
  loadingLabel,
  onContinue,
}: Props) {
  const scrollToTop = () => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  };

  const handleContinue = () => {
    if (!canContinue || isLoading) return;

    onContinue();
    scrollToTop();
  };

  const buttonLabel = isLoading
    ? (loadingLabel ?? "Loading...")
    : step === 4
      ? "Launch Job Post"
      : "Continue";

  return (
    <div className="mt-10 flex max-w-3xl items-center justify-end gap-4">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((item) => (
          <motion.div
            key={item}
            layout
            animate={{
              width: item === step ? 32 : 8,
              opacity: item === step ? 1 : 0.45,
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`h-2 rounded-full ${
              item === step
                ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                : item < step
                  ? "bg-indigo-300"
                  : "bg-slate-300"
            }`}
          />
        ))}
      </div>

      <motion.button
        type="button"
        onClick={handleContinue}
        disabled={!canContinue || isLoading}
        aria-busy={isLoading}
        whileHover={canContinue && !isLoading ? { scale: 1.03 } : undefined}
        whileTap={canContinue && !isLoading ? { scale: 0.97 } : undefined}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex min-w-44 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-8 py-3 font-bold text-white shadow-[0_6px_24px_rgba(99,102,241,0.35)] transition-shadow duration-300 hover:shadow-[0_8px_32px_rgba(99,102,241,0.45)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ArrowRight size={16} />
        )}
        {buttonLabel}
      </motion.button>
    </div>
  );
}
