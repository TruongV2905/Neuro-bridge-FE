"use client";

import { type FieldErrors, type UseFormRegister } from "react-hook-form";
import { motion, type Variants } from "framer-motion";
import { FileText, Wallet, CalendarClock, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import type { CreateJobPostFormValues } from "@/types/job-post.type";
import { formatMoney } from "@/utils/formatMoney";
import { StepBadge } from "../ui/StepBadge";
import { FormField } from "../ui/FormField";
import { jobPostFieldClassName } from "../../constants/formFieldStyles";

type Props = {
  register: UseFormRegister<CreateJobPostFormValues>;
  errors: FieldErrors<CreateJobPostFormValues>;
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
  onBudgetRangeChange: (from: number, to: number) => void;
  onEstimatedDaysChange: (value: number) => void;
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

const BUDGET_MIN = 100000;
const BUDGET_MAX = 10000000;
const BUDGET_STEP = 1000;
const DAYS_MIN = 1;
const DAYS_MAX = 90;

export function BusinessOverviewStep({
  register,
  errors,
  budgetFrom,
  budgetTo,
  estimatedDays,
  onBudgetRangeChange,
  onEstimatedDaysChange,
}: Props) {
  const handleBudgetRangeChange = (values: number[]) => {
    const nextFrom = values[0] ?? BUDGET_MIN;
    const nextTo = values[1] ?? BUDGET_MAX;
    const clampedFrom = Math.min(nextFrom, nextTo);
    const clampedTo = Math.max(nextFrom, nextTo);
    onBudgetRangeChange(clampedFrom, clampedTo);
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="w-full max-w-3xl"
    >
      <motion.div variants={fadeUp} className="flex gap-3">
        <StepBadge step={1} />

        <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm">
          <Sparkles size={16} strokeWidth={2.25} />
          Project Details
        </div>
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="mt-6 text-4xl font-extrabold tracking-tight text-black"
      >
        Tell us about your project
      </motion.h1>

      <motion.p variants={fadeUp} className="mt-2 text-lg text-slate-400">
        Share the basics — title, description, budget range, and timeline.
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
            <Slider
              value={[budgetFrom, budgetTo]}
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              minStepsBetweenThumbs={1}
              onValueChange={handleBudgetRangeChange}
              className="w-full"
            />
          </div>

          {(errors.budgetFrom?.message || errors.budgetTo?.message) && (
            <p className="mt-2 text-sm text-red-500">
              {errors.budgetFrom?.message ?? errors.budgetTo?.message}
            </p>
          )}
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

          {errors.estimatedDays?.message && (
            <p className="mt-2 text-sm text-red-500">
              {errors.estimatedDays.message}
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
