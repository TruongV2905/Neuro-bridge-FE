"use client";

import { motion, type Variants } from "framer-motion";
import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Gauge,
  RefreshCcw,
  Sparkles,
  Wallet,
  Wrench,
  Loader2,
} from "lucide-react";

import { AiBadge } from "../ui/ai-badge";
import { AnalysisCard } from "../ui/analysis-card";
import { SkillPill } from "../ui/skill-pill";
import { StepBadge } from "../ui/step-badge";
import type { JobPostAnalyzeResponse } from "@/types/job-post.type";
import type { SkillResponse } from "@/types/skill.types";

type Props = {
  aiResult: JobPostAnalyzeResponse | null;
  fetchedSkills: SkillResponse[];
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
  onAccept: () => void;
  onRegenerate: () => void;
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

const getComplexityInfo = (days: number) => {
  if (days <= 7) return { label: "Low", percent: 25 };
  if (days <= 14) return { label: "Low-Medium", percent: 40 };
  if (days <= 30) return { label: "Medium", percent: 55 };
  if (days <= 60) return { label: "Medium-High", percent: 72 };
  return { label: "High", percent: 88 };
};

export function AiAnalysisStep({
  aiResult,
  fetchedSkills,
  budgetFrom,
  budgetTo,
  estimatedDays,
  onAccept,
  onRegenerate,
}: Props) {
  const complexity = getComplexityInfo(estimatedDays);

  const requiredSkillIds = aiResult?.requiredSkillIds ?? [];
  const preferredSkillIds = aiResult?.preferredSkillIds ?? [];

  const requiredSkills = fetchedSkills.filter((s) =>
    requiredSkillIds.includes(s.id),
  );
  const preferredSkills = fetchedSkills.filter((s) =>
    preferredSkillIds.includes(s.id),
  );

  const isLoading = !aiResult;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="w-full max-w-3xl"
    >
      <motion.div variants={fadeUp} className="flex gap-3">
        <StepBadge step={2} />
        <AiBadge />
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="mt-6 text-4xl font-extrabold tracking-tight text-black"
      >
        {isLoading ? "AI is analyzing your project..." : "AI Analysis Complete"}
      </motion.h1>

      <motion.p variants={fadeUp} className="mt-2 text-lg text-slate-400">
        {isLoading
          ? "Our AI is reviewing your description and generating smart project recommendations."
          : "Review the AI-generated recommendations and customize before continuing."}
      </motion.p>

      <motion.div
        variants={fadeUp}
        whileHover={{ y: -3, transition: { duration: 0.28 } }}
        className="group relative mt-8 overflow-hidden rounded-2xl border border-indigo-100/90 bg-gradient-to-br from-indigo-50 via-white to-violet-50/60 p-5 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_16px_44px_rgba(99,102,241,0.14)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/[0.03] to-fuchsia-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              animate={isLoading ? { rotate: 360 } : { scale: [1, 1.06, 1] }}
              transition={
                isLoading
                  ? { duration: 1.5, repeat: Infinity, ease: "linear" }
                  : {
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
              className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-[0_8px_28px_rgba(99,102,241,0.35)]"
            >
              {isLoading ? (
                <Loader2 size={22} strokeWidth={2.25} className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={22} strokeWidth={2.25} />
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                </>
              )}
            </motion.div>

            <div>
              <p className="text-lg font-bold text-slate-900">
                {isLoading
                  ? "Analyzing your project..."
                  : "AI Analysis Complete"}
              </p>
              <p className="text-sm text-slate-500">
                {isLoading
                  ? "This will only take a moment."
                  : `Matched against 10,247 similar projects`}
              </p>
            </div>
          </div>

          {!isLoading && (
            <div className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 group-hover:border-emerald-200 group-hover:shadow-md">
              <BadgeCheck
                size={18}
                className="text-emerald-500"
                strokeWidth={2.25}
              />
              94% Confidence
            </div>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div
          variants={fadeUp}
          className="mt-8 flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-12 shadow-sm"
        >
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50"
          >
            <Loader2
              size={32}
              strokeWidth={2}
              className="animate-spin text-indigo-500"
            />
          </motion.div>
          <p className="text-sm font-medium text-slate-500">
            Generating skill recommendations...
          </p>
        </motion.div>
      ) : (
        <>
          {aiResult?.title && (
            <AnalysisCard
              title="PROJECT TITLE"
              icon={Sparkles}
              iconClassName="bg-violet-50 text-violet-500 group-hover:bg-violet-100"
              delay={0.08}
            >
              <p className="text-base font-bold text-slate-900">
                {aiResult.title}
              </p>
            </AnalysisCard>
          )}

          {aiResult?.description && (
            <AnalysisCard
              title="PROJECT DESCRIPTION"
              icon={Sparkles}
              iconClassName="bg-amber-50 text-amber-600 group-hover:bg-amber-100"
              delay={0.12}
            >
              <p className="line-clamp-4 text-sm leading-relaxed text-slate-600">
                {aiResult.description}
              </p>
            </AnalysisCard>
          )}

          {requiredSkills.length > 0 && (
            <AnalysisCard
              title="REQUIRED SKILLS"
              icon={Wrench}
              iconClassName="bg-red-50 text-red-500 group-hover:bg-red-100"
              delay={0.16}
            >
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.2 + index * 0.04,
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <SkillPill active>{skill.skillName}</SkillPill>
                  </motion.div>
                ))}
              </div>
            </AnalysisCard>
          )}

          {preferredSkills.length > 0 && (
            <AnalysisCard
              title="PREFERRED SKILLS"
              icon={Wrench}
              iconClassName="bg-sky-50 text-sky-500 group-hover:bg-sky-100"
              delay={0.2}
            >
              <div className="flex flex-wrap gap-2">
                {preferredSkills.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.24 + index * 0.04,
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <SkillPill>{skill.skillName}</SkillPill>
                  </motion.div>
                ))}
              </div>
            </AnalysisCard>
          )}

          <div className="grid grid-cols-2 gap-4">
            <AnalysisCard
              title="ESTIMATED BUDGET"
              icon={Wallet}
              iconClassName="bg-amber-50 text-amber-600 group-hover:bg-amber-100"
              className="mt-5"
              delay={0.24}
            >
              <p className="text-lg font-bold tabular-nums text-slate-900">
                ${budgetFrom.toLocaleString()}{" "}
                <span className="font-normal text-slate-400">–</span>{" "}
                ${budgetTo.toLocaleString()}
              </p>
            </AnalysisCard>

            <AnalysisCard
              title="TIMELINE"
              icon={CalendarClock}
              iconClassName="bg-teal-50 text-teal-600 group-hover:bg-teal-100"
              className="mt-5"
              delay={0.26}
            >
              <p className="text-lg font-bold text-slate-900">
                {estimatedDays} {estimatedDays === 1 ? "day" : "days"}
              </p>
            </AnalysisCard>
          </div>

          <AnalysisCard
            title="PROJECT COMPLEXITY"
            icon={Gauge}
            iconClassName="bg-rose-50 text-rose-500 group-hover:bg-rose-100"
            delay={0.3}
          >
            <div className="flex items-center gap-4">
              <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${complexity.percent}%` }}
                  transition={{
                    duration: 1,
                    delay: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
                />
              </div>

              <p className="shrink-0 text-sm font-bold text-slate-700">
                {complexity.label}
              </p>
            </div>
          </AnalysisCard>
        </>
      )}
    </motion.div>
  );
}