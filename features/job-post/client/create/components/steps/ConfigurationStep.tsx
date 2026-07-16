"use client";

import {
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { motion, type Variants } from "framer-motion";
import {
  FileText,
  Wallet,
  CalendarClock,
  Sparkles,
  Wrench,
  Loader2,
  Star,
  CheckCircle2,
  RotateCcw,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useGetAllSkills } from "@/services/skill.service";
import type { CreateJobPostFormValues, JobPostAnalyzeResponse } from "@/types/job-post.type";
import type { SkillResponse } from "@/types/skill.types";
import { formatMoney } from "@/utils/formatMoney";
import { StepBadge } from "../ui/StepBadge";
import { FormField } from "../ui/FormField";
import { jobPostFieldClassName } from "../../constants/formFieldStyles";

type BlockKind = "required" | "preferred";

type Props = {
  register: UseFormRegister<CreateJobPostFormValues>;
  errors: FieldErrors<CreateJobPostFormValues>;
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
  aiResult: JobPostAnalyzeResponse | null;
  requiredSkillIds: number[];
  preferredSkillIds: number[];
  onBudgetRangeChange: (from: number, to: number) => void;
  onEstimatedDaysChange: (value: number) => void;
  onRequiredSkillIdsChange: (ids: number[]) => void;
  onPreferredSkillIdsChange: (ids: number[]) => void;
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

const BUDGET_MIN = 1000;
const BUDGET_MAX = 100000;
const BUDGET_STEP = 1000;
const DAYS_MIN = 1;
const DAYS_MAX = 90;

const BLOCK_STYLES: Record<
  BlockKind,
  {
    selectedGradient: string;
    selectedRing: string;
    availableBg: string;
    availableText: string;
    availableHover: string;
    iconBg: string;
    iconText: string;
    label: string;
    help: string;
    tagBg: string;
    tagText: string;
    tagIcon: "star" | "sparkles";
  }
> = {
  required: {
    selectedGradient:
      "bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-[0_6px_18px_rgba(244,63,94,0.28)]",
    selectedRing: "border-rose-200",
    availableBg: "bg-rose-50 text-rose-600 border-rose-200",
    availableText: "text-rose-600",
    availableHover: "hover:border-rose-300 hover:bg-rose-100",
    iconBg: "bg-rose-50 text-rose-500 group-hover:bg-rose-100",
    iconText: "text-rose-500",
    label: "REQUIRED SKILLS",
    help: "Must-have skills for this project",
    tagBg: "bg-rose-50",
    tagText: "text-rose-600",
    tagIcon: "star",
  },
  preferred: {
    selectedGradient:
      "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-[0_6px_18px_rgba(56,189,248,0.28)]",
    selectedRing: "border-sky-200",
    availableBg: "bg-sky-50 text-sky-600 border-sky-200",
    availableText: "text-sky-600",
    availableHover: "hover:border-sky-300 hover:bg-sky-100",
    iconBg: "bg-sky-50 text-sky-500 group-hover:bg-sky-100",
    iconText: "text-sky-500",
    label: "PREFERRED SKILLS",
    help: "Nice-to-have skills (would be a bonus)",
    tagBg: "bg-sky-50",
    tagText: "text-sky-600",
    tagIcon: "sparkles",
  },
};

export function ConfigurationStep({
  register,
  errors,
  budgetFrom,
  budgetTo,
  estimatedDays,
  aiResult,
  requiredSkillIds,
  preferredSkillIds,
  onBudgetRangeChange,
  onEstimatedDaysChange,
  onRequiredSkillIdsChange,
  onPreferredSkillIdsChange,
}: Props) {
  const [skillQuery, setSkillQuery] = useState("");
  const [activeBlock, setActiveBlock] = useState<BlockKind>("required");

  const { data: skillsResponse, isLoading: isSkillsLoading } = useGetAllSkills({
    page: 0,
    size: 100,
  });

  const allSkills: SkillResponse[] = useMemo(
    () => skillsResponse?.result?.data ?? [],
    [skillsResponse],
  );

  // Skills the AI suggested (used for "AI Suggested" badges)
  const aiRequiredIds = useMemo(
    () => new Set(aiResult?.requiredSkillIds ?? []),
    [aiResult],
  );
  const aiPreferredIds = useMemo(
    () => new Set(aiResult?.preferredSkillIds ?? []),
    [aiResult],
  );

  const requiredSet = useMemo(
    () => new Set(requiredSkillIds),
    [requiredSkillIds],
  );
  const preferredSet = useMemo(
    () => new Set(preferredSkillIds),
    [preferredSkillIds],
  );

  // A skill belongs to exactly one block; if user already classified it
  // (required or preferred) we hide it from the "available" pool below.
  const classifiedIds = useMemo(
    () => new Set([...requiredSet, ...preferredSet]),
    [requiredSet, preferredSet],
  );

  const filteredSkills = useMemo(() => {
    const q = skillQuery.trim().toLowerCase();
    return allSkills
      .filter((s) => !classifiedIds.has(s.id))
      .filter((s) =>
        q ? s.skillName.toLowerCase().includes(q) : true,
      );
  }, [allSkills, classifiedIds, skillQuery]);

  const requiredSkills: SkillResponse[] = useMemo(
    () =>
      requiredSkillIds
        .map((id) => allSkills.find((s) => s.id === id))
        .filter(Boolean) as SkillResponse[],
    [requiredSkillIds, allSkills],
  );

  const preferredSkills: SkillResponse[] = useMemo(
    () =>
      preferredSkillIds
        .map((id) => allSkills.find((s) => s.id === id))
        .filter(Boolean) as SkillResponse[],
    [preferredSkillIds, allSkills],
  );

  const handleBudgetRangeChange = (values: number[]) => {
    const nextFrom = values[0] ?? BUDGET_MIN;
    const nextTo = values[1] ?? BUDGET_MAX;
    const clampedFrom = Math.min(nextFrom, nextTo);
    const clampedTo = Math.max(nextFrom, nextTo);
    onBudgetRangeChange(clampedFrom, clampedTo);
  };

  const addToBlock = (id: number, block: BlockKind) => {
    // Remove from the opposite block first to avoid duplicates
    if (block === "required") {
      if (requiredSet.has(id)) return;
      onRequiredSkillIdsChange([...requiredSkillIds, id]);
      if (preferredSet.has(id)) {
        onPreferredSkillIdsChange(preferredSkillIds.filter((s) => s !== id));
      }
    } else {
      if (preferredSet.has(id)) return;
      onPreferredSkillIdsChange([...preferredSkillIds, id]);
      if (requiredSet.has(id)) {
        onRequiredSkillIdsChange(requiredSkillIds.filter((s) => s !== id));
      }
    }
  };

  const removeFromBlock = (id: number, block: BlockKind) => {
    if (block === "required") {
      onRequiredSkillIdsChange(requiredSkillIds.filter((s) => s !== id));
    } else {
      onPreferredSkillIdsChange(preferredSkillIds.filter((s) => s !== id));
    }
  };

  const clearBlock = (block: BlockKind) => {
    if (block === "required") onRequiredSkillIdsChange([]);
    else onPreferredSkillIdsChange([]);
  };

  const applyAiSuggestions = (block: BlockKind) => {
    if (block === "required") {
      onRequiredSkillIdsChange(aiResult?.requiredSkillIds ?? []);
    } else {
      onPreferredSkillIdsChange(aiResult?.preferredSkillIds ?? []);
    }
  };

  const renderBlock = (kind: BlockKind) => {
    const styles = BLOCK_STYLES[kind];
    const selectedIds = kind === "required" ? requiredSkillIds : preferredSkillIds;
    const selectedList = kind === "required" ? requiredSkills : preferredSkills;
    const aiSuggestedIds = kind === "required" ? aiRequiredIds : aiPreferredIds;

    return (
      <motion.div
        variants={fadeUp}
        whileHover={{ y: -2, transition: { duration: 0.25 } }}
        className={sectionCardClassName}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`${sectionIconClassName} ${styles.iconBg}`}>
              <Wrench size={19} strokeWidth={2.25} />
            </div>

            <div>
              <p className="text-sm font-extrabold tracking-wide text-slate-900">
                {styles.label}
              </p>
              <p className="text-sm text-slate-400">{styles.help}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-bold text-indigo-500">
              {selectedIds.length} selected
            </span>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => clearBlock(kind)}
                className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 transition-all duration-300 hover:border-slate-300 hover:text-slate-700"
              >
                <RotateCcw size={12} strokeWidth={2.5} />
                Clear
              </button>
            )}
          </div>
        </div>

        {isSkillsLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-6 text-sm text-slate-500">
            <Loader2
              size={16}
              className="animate-spin text-indigo-500"
              strokeWidth={2.25}
            />
            Loading skills...
          </div>
        ) : selectedList.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-4 text-sm text-slate-400">
            <Sparkles size={16} className="text-slate-300" strokeWidth={2.25} />
            {kind === "required"
              ? "No required skills yet. Pick from the picker below."
              : "No preferred skills yet. Add bonus skills from the picker below."}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedList.map((skill, index) => {
              const isAiSuggested = aiSuggestedIds.has(skill.id);
              return (
                <motion.button
                  key={skill.id}
                  type="button"
                  onClick={() => removeFromBlock(skill.id, kind)}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: Math.min(index * 0.02, 0.5),
                    duration: 0.3,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  title="Click to remove"
                  className={`group inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-300 ${styles.selectedGradient} ${styles.selectedRing}`}
                >
                  {styles.tagIcon === "star" ? (
                    <Star
                      size={12}
                      fill="currentColor"
                      strokeWidth={2}
                      className="shrink-0"
                    />
                  ) : (
                    <Sparkles
                      size={12}
                      strokeWidth={2.25}
                      className="shrink-0"
                    />
                  )}

                  <span>{skill.skillName}</span>

                  {isAiSuggested && (
                    <span
                      className={`ml-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${styles.tagBg} ${styles.tagText}`}
                    >
                      AI
                    </span>
                  )}

                  <CheckCircle2
                    size={12}
                    strokeWidth={2.5}
                    className="shrink-0"
                  />
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>
    );
  };

  const activeStyles = BLOCK_STYLES[activeBlock];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="w-full max-w-3xl"
    >
      <motion.div variants={fadeUp} className="flex gap-3">
        <StepBadge step={3} />

        <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm">
          <Sparkles size={16} strokeWidth={2.25} />
          Project Specifications
        </div>
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="mt-6 text-4xl font-extrabold tracking-tight text-black"
      >
        Configure your project
      </motion.h1>

      <motion.p variants={fadeUp} className="mt-2 text-lg text-slate-400">
        Review the AI suggestions and refine details before publishing.
      </motion.p>

      <div className="mt-6 space-y-5">
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, transition: { duration: 0.25 } }}
          className={sectionCardClassName}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-500 transition-colors duration-300 group-hover:bg-violet-100">
              <Sparkles size={19} strokeWidth={2.25} />
            </div>

            <div>
              <p className="text-sm font-extrabold tracking-wide text-slate-900">
                TITLE
              </p>
              <p className="text-sm text-slate-400">
                Give your project a clear and simple name
              </p>
            </div>
          </div>

          <FormField label="Title" required error={errors.title?.message}>
            <Input
              {...register("title", {
                required: "Title is required",
              })}
              placeholder="e.g. AI Customer Support Chatbot"
              className={jobPostFieldClassName}
            />
          </FormField>
        </motion.div>

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, transition: { duration: 0.25 } }}
          className={sectionCardClassName}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors duration-300 group-hover:bg-amber-100">
              <FileText size={19} strokeWidth={2.25} />
            </div>

            <div>
              <p className="text-sm font-extrabold tracking-wide text-slate-900">
                DESCRIPTION
              </p>
              <p className="text-sm text-slate-400">
                Describe your project requirements in plain language
              </p>
            </div>
          </div>

          <FormField
            label="Description"
            required
            error={errors.description?.message}
          >
            <Textarea
              {...register("description", {
                required: "Description is required",
                maxLength: {
                  value: 2000,
                  message: "Description must be less than 2000 characters",
                },
              })}
              placeholder="Describe your job post requirements..."
              rows={6}
              className={`${jobPostFieldClassName} h-auto min-h-40 resize-y py-4`}
            />

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-400">
                Tip: include your target users, main features, and expected
                result.
              </p>
            </div>
          </FormField>
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
                  Drag both handles to set your expected project budget
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-bold text-indigo-500">
                {formatMoney(budgetFrom)}
              </span>

              <span className="text-slate-300">—</span>

              <span className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-1.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(99,102,241,0.25)]">
                {formatMoney(budgetTo)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-5 py-6">
            <div className="mb-4 flex items-center justify-between text-sm font-semibold text-slate-500">
              <span>{formatMoney(budgetFrom)}</span>
              <span>{formatMoney(budgetTo)}</span>
            </div>

            <Slider
              value={[budgetFrom, budgetTo]}
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              minStepsBetweenThumbs={1}
              onValueChange={handleBudgetRangeChange}
              className="w-full"
            />

            <div className="mt-3 flex items-center justify-between text-sm font-semibold text-slate-500">
              <span>{formatMoney(BUDGET_MIN)}</span>
              <span>{formatMoney(BUDGET_MAX)}</span>
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
                  ESTIMATED DAYS
                </p>
                <p className="text-sm text-slate-400">
                  How many days do you expect this project to take?
                </p>
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-1.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(99,102,241,0.25)]">
              {estimatedDays} {estimatedDays === 1 ? "day" : "days"}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-5 py-6">
            <Slider
              value={[estimatedDays]}
              min={DAYS_MIN}
              max={DAYS_MAX}
              step={1}
              onValueChange={(value) =>
                onEstimatedDaysChange(value[0] ?? DAYS_MIN)
              }
              className="w-full"
            />

            <div className="mt-3 flex items-center justify-between text-sm font-semibold text-slate-500">
              <span>{DAYS_MIN} day</span>
              <span>{DAYS_MAX} days</span>
            </div>
          </div>
        </motion.div>

        {renderBlock("required")}
        {renderBlock("preferred")}

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, transition: { duration: 0.25 } }}
          className={sectionCardClassName}
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`${sectionIconClassName} ${activeStyles.iconBg}`}
              >
                <Wrench size={19} strokeWidth={2.25} />
              </div>

              <div>
                <p className="text-sm font-extrabold tracking-wide text-slate-900">
                  ADD SKILLS
                </p>
                <p className="text-sm text-slate-400">
                  Pick a target block, then click a skill to add it.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 rounded-full border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveBlock("required")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-300 ${
                  activeBlock === "required"
                    ? "bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-[0_6px_18px_rgba(244,63,94,0.28)]"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Star
                  size={12}
                  fill={activeBlock === "required" ? "currentColor" : "none"}
                  strokeWidth={2}
                />
                Required
              </button>
              <button
                type="button"
                onClick={() => setActiveBlock("preferred")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-300 ${
                  activeBlock === "preferred"
                    ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-[0_6px_18px_rgba(56,189,248,0.28)]"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Sparkles size={12} strokeWidth={2.25} />
                Preferred
              </button>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-2.5">
              <Search
                size={16}
                className="text-slate-400"
                strokeWidth={2.25}
              />
              <input
                type="text"
                value={skillQuery}
                onChange={(e) => setSkillQuery(e.target.value)}
                placeholder="Search skills..."
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            {(aiResult?.requiredSkillIds?.length || aiResult?.preferredSkillIds?.length) ? (
              <button
                type="button"
                onClick={() => applyAiSuggestions(activeBlock)}
                className="flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600 transition-all duration-300 hover:bg-indigo-100"
              >
                <Sparkles size={12} strokeWidth={2.25} />
                Use AI {activeBlock === "required" ? "Required" : "Preferred"}
              </button>
            ) : null}
          </div>

          {filteredSkills.length === 0 && !isSkillsLoading ? (
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
              {classifiedIds.size > 0 && skillQuery === ""
                ? "All available skills have already been added to a block."
                : "No skills found."}
            </div>
          ) : (
            <div className="flex max-h-80 flex-wrap gap-2 overflow-y-auto pr-1">
              {filteredSkills.map((skill, index) => {
                const aiSuggestedInThisBlock =
                  activeBlock === "required"
                    ? aiRequiredIds.has(skill.id)
                    : aiPreferredIds.has(skill.id);

                return (
                  <motion.button
                    key={skill.id}
                    type="button"
                    onClick={() => addToBlock(skill.id, activeBlock)}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: Math.min(index * 0.02, 0.5),
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ y: -2, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`group inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-300 ${activeStyles.availableBg} ${activeStyles.availableHover}`}
                  >
                    {activeStyles.tagIcon === "star" ? (
                      <Star
                        size={12}
                        fill="currentColor"
                        strokeWidth={2}
                        className="shrink-0"
                      />
                    ) : (
                      <Sparkles
                        size={12}
                        strokeWidth={2.25}
                        className="shrink-0"
                      />
                    )}

                    <span>{skill.skillName}</span>

                    {aiSuggestedInThisBlock && (
                      <span
                        className={`ml-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${activeStyles.tagBg} ${activeStyles.tagText}`}
                      >
                        AI
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          <p className="mt-4 text-xs font-medium text-slate-400">
            Skills marked with the AI badge match the AI&apos;s suggestions for
            this block. Switch the toggle above to add skills to the other
            block.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
