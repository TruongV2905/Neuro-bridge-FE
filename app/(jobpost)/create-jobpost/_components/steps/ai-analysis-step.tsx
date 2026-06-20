"use client";

import { motion, type Variants } from "framer-motion";
import {
  BadgeCheck,
  Bot,
  CalendarClock,
  CheckCircle2,
  Gauge,
  RefreshCcw,
  Sparkles,
  Wallet,
  Wrench,
} from "lucide-react";

import { AiBadge } from "../ui/ai-badge";
import { AnalysisCard } from "../ui/analysis-card";
import { SkillPill } from "../ui/skill-pill";
import { StepBadge } from "../ui/step-badge";

type Props = {
  selectedSkills: string[];
  budgetFrom: number;
  budgetTo: number;
  timeline: string;
  onAccept: () => void;
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

export function AiAnalysisStep({
  selectedSkills,
  budgetFrom,
  budgetTo,
  timeline,
  onAccept,
}: Props) {
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
        AI is analyzing your project
      </motion.h1>

      <motion.p variants={fadeUp} className="mt-2 text-lg text-slate-400">
        Our AI is reviewing your description and generating smart project
        recommendations
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
                AI Analysis Complete
              </p>
              <p className="text-sm text-slate-500">
                Matched against{" "}
                <span className="font-semibold text-indigo-500">10,247</span>{" "}
                similar projects
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 group-hover:border-emerald-200 group-hover:shadow-md">
            <BadgeCheck
              size={18}
              className="text-emerald-500"
              strokeWidth={2.25}
            />
            94% Confidence
          </div>
        </div>
      </motion.div>

      <AnalysisCard
        title="AI CATEGORY"
        icon={Bot}
        iconClassName="bg-violet-50 text-violet-500 group-hover:bg-violet-100"
        delay={0.1}
      >
        <p className="flex items-center gap-2 text-base">
          <span className="font-bold text-slate-900">
            AI Chatbot & Conversational AI
          </span>
        </p>
      </AnalysisCard>

      <AnalysisCard
        title="RECOMMENDED SKILLS"
        icon={Wrench}
        iconClassName="bg-sky-50 text-sky-500 group-hover:bg-sky-100"
        delay={0.16}
      >
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((skill, index) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.22 + index * 0.04,
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <SkillPill active>{skill}</SkillPill>
            </motion.div>
          ))}
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard
          title="ESTIMATE BUDGET"
          icon={Wallet}
          iconClassName="bg-amber-50 text-amber-600 group-hover:bg-amber-100"
          className="mt-5"
          delay={0.22}
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
          <p className="text-lg font-bold text-slate-900">{timeline}</p>
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
              animate={{ width: "72%" }}
              transition={{
                duration: 1,
                delay: 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
            />
          </div>

          <p className="shrink-0 text-sm font-bold text-slate-700">
            Medium–High
          </p>
        </div>
      </AnalysisCard>

      <motion.div
        variants={fadeUp}
        className="mt-8 flex gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4"
      >
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-3 font-medium text-slate-600 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-[0_8px_24px_rgba(99,102,241,0.12)]"
        >
          <RefreshCcw size={16} strokeWidth={2.25} />
          Regenerate
        </motion.button>

        <motion.button
          type="button"
          onClick={onAccept}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-3 font-bold text-white shadow-[0_8px_28px_rgba(99,102,241,0.35)] transition-shadow duration-300 hover:shadow-[0_12px_36px_rgba(99,102,241,0.45)]"
        >
          <CheckCircle2 size={18} strokeWidth={2.25} />
          Accept AI Suggestions & Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
}