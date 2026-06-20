"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

import { createJobPostSteps } from "../_constants/job-post.constants";
import type { CreateJobPostStep } from "@/types/job-post.type";

type Props = {
  step: CreateJobPostStep;
  progress: number;
};

export function JobPostProgressSidebar({ step, progress }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <aside className="sticky top-0 flex h-screen w-[320px] shrink-0 flex-col border-r border-slate-100/80 bg-gradient-to-b from-white via-white to-indigo-50/30 px-7 py-8 pt-28 shadow-[4px_0_40px_rgba(99,102,241,0.04)]">
      <div className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold tracking-[0.25em] text-slate-400">
            PROGRESS
          </p>

          <motion.p
            key={progress}
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm font-bold tabular-nums text-indigo-500"
          >
            {progress}%
          </motion.p>
        </div>

        <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: reduceMotion ? 0 : 0.65,
              ease: [0.16, 1, 0.3, 1],
            }}
          />

          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
        </div>
      </div>

      <div className="space-y-2">
        {createJobPostSteps.map((item, index) => {
          const Icon = item.icon;
          const isActive = step === item.id;
          const isDone = step > item.id;
          const isLast = index === createJobPostSteps.length - 1;

          return (
            <div key={item.id} className="relative">
              {!isLast && (
                <div className="absolute left-[30px] top-[52px] h-[calc(100%-8px)] w-px bg-slate-200">
                  <motion.div
                    className="w-full bg-gradient-to-b from-emerald-400 to-indigo-400"
                    initial={false}
                    animate={{ height: isDone ? "100%" : "0%" }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                </div>
              )}

              <motion.div
                layout
                initial={false}
                animate={{
                  scale: isActive ? 1 : 0.98,
                  opacity: isActive || isDone ? 1 : 0.72,
                }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-all duration-300 ${
                  isActive
                    ? "border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50/80 shadow-[0_8px_28px_rgba(99,102,241,0.14)]"
                    : "border-transparent bg-transparent hover:-translate-y-0.5 hover:translate-x-1 hover:border-indigo-100 hover:bg-white hover:shadow-[0_8px_24px_rgba(99,102,241,0.12)]"
                }`}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${
                    isDone
                      ? "bg-emerald-100 text-emerald-500 shadow-sm"
                      : isActive
                        ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-[0_6px_20px_rgba(99,102,241,0.35)]"
                        : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500"
                  }`}
                >
                  {isDone ? (
                    <motion.div
                      initial={reduceMotion ? false : { scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Check size={20} strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    <Icon size={20} />
                  )}
                </motion.div>

                <div className="min-w-0">
                  <p
                    className={`truncate font-bold transition-colors duration-300 ${
                      isActive
                        ? "text-slate-950"
                        : "text-slate-500 group-hover:text-indigo-600"
                    }`}
                  >
                    {item.title}
                  </p>

                  <p className="truncate text-xs text-slate-400 transition-colors duration-300 group-hover:text-slate-500">
                    {item.subtitle}
                  </p>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute right-3 h-2 w-2 rounded-full bg-indigo-500"
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto space-y-5 pt-8">
        <button
          type="button"
          className="w-full rounded-xl border border-transparent py-2.5 text-sm font-semibold text-slate-500 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-100 hover:bg-white hover:text-indigo-600 hover:shadow-[0_8px_24px_rgba(99,102,241,0.14)] active:translate-y-0"
        >
          Save Draft
        </button>

        <div className="rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50 to-violet-50/50 p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-indigo-600">AI Confidence</p>
            <p className="text-xs font-bold tabular-nums text-indigo-500">
              94%
            </p>
          </div>

          <div className="relative h-2 overflow-hidden rounded-full bg-white/70">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
              initial={false}
              animate={{ width: "94%" }}
              transition={{
                duration: reduceMotion ? 0 : 1,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2,
              }}
            />
          </div>

          <p className="mt-3 text-xs leading-relaxed text-indigo-400/90">
            Based on 10,247 similar projects in our database
          </p>
        </div>
      </div>
    </aside>
  );
}