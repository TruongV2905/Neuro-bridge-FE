"use client";

import { motion, type Variants } from "framer-motion";
import {
  BadgeCheck,
  Bot,
  CalendarClock,
  CheckCircle2,
  FileText,
  Sparkles,
  Tags,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

import { AiBadge } from "../ui/ai-badge";
import { ExpertMatch } from "../ui/expert-match";
import { SkillPill } from "../ui/skill-pill";
import { StepBadge } from "../ui/step-badge";

type Props = {
  projectTitle: string;
  description: string;
  category: string;
  selectedSkills: string[];
  budgetFrom: number;
  budgetTo: number;
  timeline: string;
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

const cardClassName =
  "group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:border-indigo-100 hover:shadow-[0_14px_36px_rgba(15,23,42,0.08)]";

const iconClassName =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300";

function getPlainTextFromHtml(html: string) {
  if (!html) return "";

  return html
    .replace(/<p><\/p>/g, "")
    .replace(/<p><br><\/p>/g, "")
    .replace(/<br\s*\/?>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function DetailItem({
  icon: Icon,
  label,
  value,
  iconClassName,
}: {
  icon: typeof Bot;
  label: string;
  value: string;
  iconClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 transition-all duration-300 hover:border-indigo-100 hover:bg-white hover:shadow-[0_8px_24px_rgba(99,102,241,0.1)]">
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClassName}`}>
          <Icon size={18} strokeWidth={2.25} />
        </div>

        <p className="text-xs font-extrabold tracking-wide text-slate-400">
          {label}
        </p>
      </div>

      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

export function ReviewLaunchStep({
  projectTitle,
  description,
  category,
  selectedSkills,
  budgetFrom,
  budgetTo,
  timeline,
}: Props) {
  const plainDescription = getPlainTextFromHtml(description);

  const displayTitle = projectTitle || "AI Customer Support Chatbot";
  const displayDescription =
    plainDescription ||
    "An AI chatbot engagement focused on customer support automation and API service integration.";

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-3xl"
    >
      <motion.div variants={fadeUp} className="flex gap-3">
        <StepBadge step={4} />
        <AiBadge />
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="mt-6 text-4xl font-extrabold tracking-tight text-black"
      >
        Review and launch
      </motion.h1>

      <motion.p variants={fadeUp} className="mt-2 text-lg text-slate-400">
        Everything looks great — publish to start receiving expert proposals
      </motion.p>

      <motion.div
        variants={fadeUp}
        whileHover={{ y: -3, transition: { duration: 0.28 } }}
        className="group relative mt-8 overflow-hidden rounded-2xl border border-indigo-100/90 bg-gradient-to-br from-indigo-50 via-white to-violet-50/60 p-5 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_16px_44px_rgba(99,102,241,0.14)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/[0.03] to-fuchsia-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative flex items-start justify-between gap-5">
          <div className="flex gap-4">
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
              <p className="text-xs font-extrabold tracking-wide text-indigo-500">
                AI PROJECT SUMMARY
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                {displayTitle}
              </h2>

              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                {displayDescription}
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm md:flex">
            <BadgeCheck
              size={18}
              className="text-emerald-500"
              strokeWidth={2.25}
            />
            94% Confidence
          </div>
        </div>
      </motion.div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, transition: { duration: 0.25 } }}
          className={cardClassName}
        >
          <div className="mb-5 flex items-center gap-3">
            <div
              className={`${iconClassName} bg-violet-50 text-violet-500 group-hover:bg-violet-100`}
            >
              <FileText size={19} strokeWidth={2.25} />
            </div>

            <div>
              <p className="text-sm font-extrabold tracking-wide text-slate-900">
                PROJECT DETAILS
              </p>
              <p className="text-sm text-slate-400">
                Final information before publishing
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              icon={Bot}
              label="CATEGORY"
              value={category || "AI Chatbot"}
              iconClassName="bg-violet-50 text-violet-500"
            />

            <DetailItem
              icon={Wallet}
              label="BUDGET"
              value={`$${budgetFrom.toLocaleString()} – $${budgetTo.toLocaleString()}`}
              iconClassName="bg-amber-50 text-amber-600"
            />

            <DetailItem
              icon={CalendarClock}
              label="TIMELINE"
              value={timeline || "Not selected"}
              iconClassName="bg-teal-50 text-teal-600"
            />

            <DetailItem
              icon={CheckCircle2}
              label="STATUS"
              value="Ready to publish"
              iconClassName="bg-emerald-50 text-emerald-600"
            />
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, transition: { duration: 0.25 } }}
          className={cardClassName}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`${iconClassName} bg-sky-50 text-sky-500 group-hover:bg-sky-100`}
              >
                <Wrench size={19} strokeWidth={2.25} />
              </div>

              <div>
                <p className="text-sm font-extrabold tracking-wide text-slate-900">
                  SKILLS
                </p>
                <p className="text-sm text-slate-400">
                  {selectedSkills.length} selected
                </p>
              </div>
            </div>

            <Tags size={18} className="text-slate-300" strokeWidth={2.25} />
          </div>

          <div className="flex max-h-[210px] flex-wrap gap-2 overflow-y-auto pr-1">
            {selectedSkills.length > 0 ? (
              selectedSkills.map((skill, index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.2 + index * 0.035,
                    duration: 0.3,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ y: -2, scale: 1.04 }}
                >
                  <SkillPill active>{skill}</SkillPill>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No skills selected yet.</p>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={fadeUp}
        whileHover={{ y: -2, transition: { duration: 0.25 } }}
        className={`${cardClassName} mt-5`}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`${iconClassName} bg-rose-50 text-rose-500 group-hover:bg-rose-100`}
            >
              <Users size={19} strokeWidth={2.25} />
            </div>

            <div>
              <p className="text-sm font-extrabold tracking-wide text-slate-900">
                TOP EXPERT MATCHES
              </p>
              <p className="text-sm text-slate-400">
                Verified experts ready to send proposals
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-bold text-indigo-500">
            30 experts
          </span>
        </div>

        <div className="space-y-3">
          <ExpertMatch name="Sarah Chen" role="AI & ML Engineer" score="98%" />

          <ExpertMatch
            name="Marcus Webb"
            role="LangChain Specialist"
            score="96%"
          />

          <ExpertMatch
            name="Priya Sharma"
            role="Conversational AI Dev"
            score="94%"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}