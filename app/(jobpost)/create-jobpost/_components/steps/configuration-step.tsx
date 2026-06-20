"use client";

import { motion, type Variants } from "framer-motion";
import {
  CalendarClock,
  CheckCircle2,
  Gauge,
  Sparkles,
  Tags,
  Wallet,
  Wrench,
} from "lucide-react";

import {
  aiCategories,
  requiredSkillOptions,
  timelineOptions,
} from "../../_constants/job-post.constants";
import { AiBadge } from "../ui/ai-badge";
import { SkillPill } from "../ui/skill-pill";
import { StepBadge } from "../ui/step-badge";

type Props = {
  category: string;
  selectedSkills: string[];
  budgetFrom: number;
  budgetTo: number;
  timeline: string;
  onCategoryChange: (value: string) => void;
  onToggleSkill: (skill: string) => void;
  onBudgetFromChange: (value: number) => void;
  onBudgetToChange: (value: number) => void;
  onTimelineChange: (value: string) => void;
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const sectionCardClassName =
  "group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:border-indigo-100 hover:shadow-[0_14px_36px_rgba(15,23,42,0.08)]";

const sectionIconClassName =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300";

export function ConfigurationStep({
  category,
  selectedSkills,
  budgetFrom,
  budgetTo,
  timeline,
  onCategoryChange,
  onToggleSkill,
  onBudgetFromChange,
  onBudgetToChange,
  onTimelineChange,
}: Props) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-3xl"
    >
      <motion.div variants={fadeUp} className="flex gap-3">
        <StepBadge step={3} />
        <AiBadge />
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="mt-6 text-4xl font-extrabold tracking-tight text-black"
      >
        Configure your requirements
      </motion.h1>

      <motion.p variants={fadeUp} className="mt-2 text-lg text-slate-400">
        Customize the AI suggestions to match your exact needs and constraints
      </motion.p>

      <motion.div
        variants={fadeUp}
        whileHover={{ y: -3, transition: { duration: 0.28 } }}
        className="group relative mt-8 overflow-hidden rounded-2xl border border-indigo-100/90 bg-gradient-to-br from-indigo-50 via-white to-violet-50/60 p-5 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_16px_44px_rgba(99,102,241,0.14)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/[0.03] to-fuchsia-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative flex items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-[0_8px_28px_rgba(99,102,241,0.35)]"
          >
            <Sparkles size={22} strokeWidth={2.25} />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
          </motion.div>

          <div>
            <p className="text-lg font-bold text-slate-900">
              AI pre-filled suggestions
            </p>
            <p className="text-sm text-slate-500">
              Review the generated recommendations and adjust them before
              continuing.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-6 space-y-5">
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, transition: { duration: 0.25 } }}
          className={sectionCardClassName}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className={`${sectionIconClassName} bg-violet-50 text-violet-500 group-hover:bg-violet-100`}
            >
              <Tags size={19} strokeWidth={2.25} />
            </div>

            <div>
              <p className="text-sm font-extrabold tracking-wide text-slate-900">
                AI CATEGORY
              </p>
              <p className="text-sm text-slate-400">
                Choose the project category that fits best
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {aiCategories.map((item, index) => {
              const isActive = category === item;

              return (
                <motion.button
                  key={item}
                  type="button"
                  onClick={() => onCategoryChange(item)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.18 + index * 0.04,
                    duration: 0.35,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden rounded-2xl border px-4 py-4 text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? "border-indigo-200 bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-[0_8px_28px_rgba(99,102,241,0.35)]"
                      : "border-slate-200 bg-slate-50/80 text-slate-600 hover:border-indigo-100 hover:bg-white hover:text-indigo-600 hover:shadow-[0_8px_24px_rgba(99,102,241,0.12)]"
                  }`}
                >
                  {isActive && (
                    <CheckCircle2
                      size={15}
                      strokeWidth={2.5}
                      className="absolute right-3 top-3"
                    />
                  )}

                  <span className="block pt-2">{item}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, transition: { duration: 0.25 } }}
          className={sectionCardClassName}
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`${sectionIconClassName} bg-sky-50 text-sky-500 group-hover:bg-sky-100`}
              >
                <Wrench size={19} strokeWidth={2.25} />
              </div>

              <div>
                <p className="text-sm font-extrabold tracking-wide text-slate-900">
                  REQUIRED SKILLS
                </p>
                <p className="text-sm text-slate-400">
                  Select the skills needed for this project
                </p>
              </div>
            </div>

            <span className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-bold text-indigo-500">
              {selectedSkills.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {requiredSkillOptions.map((skill, index) => (
              <motion.button
                key={skill}
                type="button"
                onClick={() => onToggleSkill(skill)}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.24 + index * 0.025,
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -2, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <SkillPill active={selectedSkills.includes(skill)}>
                  {skill}
                </SkillPill>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, transition: { duration: 0.25 } }}
          className={sectionCardClassName}
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`${sectionIconClassName} bg-amber-50 text-amber-600 group-hover:bg-amber-100`}
              >
                <Wallet size={19} strokeWidth={2.25} />
              </div>

              <div>
                <p className="text-sm font-extrabold tracking-wide text-slate-900">
                  BUDGET RANGE
                </p>
                <p className="text-sm text-slate-400">
                  Adjust your expected project budget
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-bold text-indigo-500">
                ${Math.round(budgetFrom / 1000)}K
              </span>

              <span className="text-slate-300">—</span>

              <span className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-1.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(99,102,241,0.25)]">
                ${Math.round(budgetTo / 1000)}K
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-5">
            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-500">
                <span>Minimum budget</span>
                <span>${budgetFrom.toLocaleString()}</span>
              </div>

              <input
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={budgetFrom}
                onChange={(e) => onBudgetFromChange(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-500">
                <span>Maximum budget</span>
                <span>${budgetTo.toLocaleString()}</span>
              </div>

              <input
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={budgetTo}
                onChange={(e) => onBudgetToChange(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-fuchsia-500"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, transition: { duration: 0.25 } }}
          className={sectionCardClassName}
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`${sectionIconClassName} bg-teal-50 text-teal-600 group-hover:bg-teal-100`}
              >
                <CalendarClock size={19} strokeWidth={2.25} />
              </div>

              <div>
                <p className="text-sm font-extrabold tracking-wide text-slate-900">
                  TIMELINE
                </p>
                <p className="text-sm text-slate-400">
                  Pick your preferred delivery timeline
                </p>
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-1.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(99,102,241,0.25)]">
              {timeline}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {timelineOptions.map((item, index) => {
              const isActive = timeline === item;

              return (
                <motion.button
                  key={item}
                  type="button"
                  onClick={() => onTimelineChange(item)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.32 + index * 0.04,
                    duration: 0.35,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-2xl border px-4 py-4 text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? "border-indigo-200 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-[0_8px_28px_rgba(99,102,241,0.35)]"
                      : "border-slate-200 bg-slate-50/80 text-slate-600 hover:border-indigo-100 hover:bg-white hover:text-indigo-600 hover:shadow-[0_8px_24px_rgba(99,102,241,0.12)]"
                  }`}
                >
                  {item}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 text-sm text-slate-500"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
            <Gauge size={18} strokeWidth={2.25} />
          </div>

          <p>
            These settings will be used to generate your final job post and
            match suitable experts.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}