"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { CreateJobPostStep } from "@/types/job-post.type";

type Props = {
  step: CreateJobPostStep;
  canContinue: boolean;
  onContinue: () => void;
};

export function StepNavigation({ step, canContinue, onContinue }: Props) {
  const scrollToTop = () => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  };

  const handleContinue = () => {
    onContinue();
    scrollToTop();
  };

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
        disabled={!canContinue}
        whileHover={canContinue ? { scale: 1.03 } : undefined}
        whileTap={canContinue ? { scale: 0.97 } : undefined}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-8 py-3 font-bold text-white shadow-[0_6px_24px_rgba(99,102,241,0.35)] transition-shadow duration-300 hover:shadow-[0_8px_32px_rgba(99,102,241,0.45)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        {step === 4 ? "Launch Job Post" : "Continue"}
        <ArrowRight size={16} />
      </motion.button>
    </div>
  );
}