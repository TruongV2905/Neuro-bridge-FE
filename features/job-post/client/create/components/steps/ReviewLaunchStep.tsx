"use client";

import { motion, type Variants } from "framer-motion";
import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  FileText,
  Sparkles,
  Star,
  Tags,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

import { AiBadge } from "../ui/AiBadge";
import { ExpertMatch } from "../ui/ExpertMatch";
import { SkillPill } from "../ui/SkillPill";
import { StepBadge } from "../ui/StepBadge";
import { formatMoney } from "@/utils/formatMoney";

type Props = {
  projectTitle: string;
  description: string;
  requiredSkillIds: number[];
  preferredSkillIds: number[];
  requiredSkillNames: string[];
  preferredSkillNames: string[];
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
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

function DetailItem({
  icon: Icon,
  label,
  value,
  iconClassName,
}: {
  icon: typeof BadgeCheck;
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

type SkillKind = "required" | "preferred";

const SKILL_KIND_STYLES: Record<
  SkillKind,
  {
    ring: string;
    gradient: string;
    badge: string;
    iconBg: string;
    iconText: string;
  }
> = {
  required: {
    ring: "border-rose-200",
    gradient:
      "bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-[0_6px_18px_rgba(244,63,94,0.28)]",
    badge: "bg-white/20 text-white",
    iconBg: "bg-rose-50 text-rose-500 group-hover:bg-rose-100",
    iconText: "text-rose-500",
  },
  preferred: {
    ring: "border-sky-200",
    gradient:
      "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-[0_6px_18px_rgba(56,189,248,0.28)]",
    badge: "bg-white/20 text-white",
    iconBg: "bg-sky-50 text-sky-500 group-hover:bg-sky-100",
    iconText: "text-sky-500",
  },
};

function SkillsBlock({
  kind,
  title,
  help,
  count,
  names,
  ids,
}: {
  kind: SkillKind;
  title: string;
  help: string;
  count: number;
  names: string[];
  ids: number[];
}) {
  const styles = SKILL_KIND_STYLES[kind];
  const Icon = kind === "required" ? Star : Sparkles;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2, transition: { duration: 0.25 } }}
      className={cardClassName}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`${iconClassName} ${styles.iconBg}`}>
            <Wrench size={19} strokeWidth={2.25} />
          </div>

          <div>
            <p className="text-sm font-extrabold tracking-wide text-slate-900">
              {title}
            </p>
            <p className="text-sm text-slate-400">{help}</p>
          </div>
        </div>

        <span className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-bold text-indigo-500">
          {count} selected
        </span>
      </div>

      <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Tags size={14} strokeWidth={2.25} />
        Skill IDs: {ids.length > 0 ? ids.join(", ") : "—"}
      </div>

      <div className="flex max-h-[210px] flex-wrap gap-2 overflow-y-auto pr-1">
        {names.length > 0 ? (
          names.map((skill, index) => (
            <motion.div
              key={`${kind}-${skill}-${index}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.2 + index * 0.035,
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -2, scale: 1.04 }}
            >
              <SkillPill active>
                <span className="inline-flex items-center gap-1.5">
                  <Icon
                    size={12}
                    fill={kind === "required" ? "currentColor" : "none"}
                    strokeWidth={2.25}
                  />
                  {skill}
                </span>
              </SkillPill>
            </motion.div>
          ))
        ) : (
          <p className="text-sm text-slate-400">No skills selected yet.</p>
        )}
      </div>
    </motion.div>
  );
}

export function ReviewLaunchStep({
  projectTitle,
  description,
  requiredSkillIds,
  preferredSkillIds,
  requiredSkillNames,
  preferredSkillNames,
  budgetFrom,
  budgetTo,
  estimatedDays,
}: Props) {
  const plainDescription = description.trim();

  const displayTitle = projectTitle || "AI Customer Support Chatbot";
  const displayDescription =
    plainDescription ||
    "An AI chatbot engagement focused on customer support automation and API service integration.";

  const totalSkills = requiredSkillNames.length + preferredSkillNames.length;

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
                PROJECT SUMMARY
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
            Ready to publish
          </div>
        </div>
      </motion.div>

      {/* PROJECT DETAILS — title, description, budget, timeline, status */}
      <motion.div
        variants={fadeUp}
        whileHover={{ y: -2, transition: { duration: 0.25 } }}
        className={`${cardClassName} mt-5`}
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

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 transition-all duration-300 hover:border-indigo-100 hover:bg-white hover:shadow-[0_8px_24px_rgba(99,102,241,0.1)]">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-500">
                <FileText size={18} strokeWidth={2.25} />
              </div>

              <p className="text-xs font-extrabold tracking-wide text-slate-400">
                TITLE
              </p>
            </div>

            <p className="text-base font-bold text-slate-900">
              {displayTitle}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 transition-all duration-300 hover:border-indigo-100 hover:bg-white hover:shadow-[0_8px_24px_rgba(99,102,241,0.1)]">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <FileText size={18} strokeWidth={2.25} />
              </div>

              <p className="text-xs font-extrabold tracking-wide text-slate-400">
                DESCRIPTION
              </p>
            </div>

            <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
              {displayDescription}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              icon={Wallet}
              label="BUDGET"
              value={`${formatMoney(budgetFrom)} - ${formatMoney(budgetTo)}`}
              iconClassName="bg-amber-50 text-amber-600"
            />

            <DetailItem
              icon={CalendarClock}
              label="ESTIMATED DAYS"
              value={`${estimatedDays} ${estimatedDays === 1 ? "day" : "days"}`}
              iconClassName="bg-teal-50 text-teal-600"
            />

            <DetailItem
              icon={CheckCircle2}
              label="STATUS"
              value="Ready to publish"
              iconClassName="bg-emerald-50 text-emerald-600"
            />

            <DetailItem
              icon={Wrench}
              label="SKILLS"
              value={`${totalSkills} selected`}
              iconClassName="bg-sky-50 text-sky-500"
            />
          </div>
        </div>
      </motion.div>

      {/* TWO SKILL BLOCKS — requiredSkillIds + preferredSkillIds */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <SkillsBlock
          kind="required"
          title="REQUIRED SKILLS"
          help="requiredSkillIds from AI"
          count={requiredSkillIds.length}
          names={requiredSkillNames}
          ids={requiredSkillIds}
        />

        <SkillsBlock
          kind="preferred"
          title="PREFERRED SKILLS"
          help="preferredSkillIds from AI"
          count={preferredSkillIds.length}
          names={preferredSkillNames}
          ids={preferredSkillIds}
        />
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
