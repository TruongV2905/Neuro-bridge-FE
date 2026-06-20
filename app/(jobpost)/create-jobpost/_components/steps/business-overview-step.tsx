"use client";

import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { motion, type Variants } from "framer-motion";
import {
  BriefcaseBusiness,
  FileText,
  Sparkles,
  Target,
} from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import type { CreateJobPostFormValues } from "@/types/job-post.type";
import { businessGoals } from "../../_constants/job-post.constants";
import { StepBadge } from "../ui/step-badge";
import { FormField } from "../ui/form-field";
import {
  jobPostFieldClassName,
  jobPostSelectClassName,
} from "../ui/form-field-styles";

type Props = {
  register: UseFormRegister<CreateJobPostFormValues>;
  control: Control<CreateJobPostFormValues>;
  errors: FieldErrors<CreateJobPostFormValues>;
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

export function BusinessOverviewStep({ register, control, errors }: Props) {
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
          Business Overview
        </div>
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="mt-6 text-4xl font-extrabold tracking-tight text-black"
      >
        Tell us about your business
      </motion.h1>

      <motion.p variants={fadeUp} className="mt-2 text-lg text-slate-400">
        Share your goal and project context — no technical knowledge required
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
            <BriefcaseBusiness size={22} strokeWidth={2.25} />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
          </motion.div>

          <div>
            <p className="text-lg font-bold text-slate-900">
              Start with the basics
            </p>
            <p className="text-sm text-slate-500">
              This helps AI understand your project and recommend the right
              skills, budget, and timeline.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-6 space-y-5">
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, transition: { duration: 0.25 } }}
          className="group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:border-indigo-100 hover:shadow-[0_14px_36px_rgba(15,23,42,0.08)]"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-500 transition-colors duration-300 group-hover:bg-violet-100">
              <BriefcaseBusiness size={19} strokeWidth={2.25} />
            </div>

            <div>
              <p className="text-sm font-extrabold tracking-wide text-slate-900">
                PROJECT TITLE
              </p>
              <p className="text-sm text-slate-400">
                Give your project a clear and simple name
              </p>
            </div>
          </div>

          <FormField
            label="Project Title"
            required
            error={errors.projectTitle?.message}
          >
            <Input
              {...register("projectTitle", {
                required: "Project title is required",
              })}
              placeholder="e.g. AI Customer Support Chatbot"
              className={jobPostFieldClassName}
            />
          </FormField>
        </motion.div>

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, transition: { duration: 0.25 } }}
          className="group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:border-indigo-100 hover:shadow-[0_14px_36px_rgba(15,23,42,0.08)]"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500 transition-colors duration-300 group-hover:bg-sky-100">
              <Target size={19} strokeWidth={2.25} />
            </div>

            <div>
              <p className="text-sm font-extrabold tracking-wide text-slate-900">
                BUSINESS GOAL
              </p>
              <p className="text-sm text-slate-400">
                Choose the outcome you want to achieve
              </p>
            </div>
          </div>

          <FormField
            label="Business Goal"
            required
            error={errors.businessGoal?.message}
          >
            <div className="relative">
              <select
                {...register("businessGoal", {
                  required: "Business goal is required",
                })}
                className={`${jobPostSelectClassName} w-full appearance-none pr-12`}
              >
                <option value="">What outcome are you trying to achieve?</option>

                {businessGoals.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={20}
                strokeWidth={2.25}
                className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </FormField>
        </motion.div>

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, transition: { duration: 0.25 } }}
          className="group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:border-indigo-100 hover:shadow-[0_14px_36px_rgba(15,23,42,0.08)]"
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
            <Controller
              control={control}
              name="description"
              rules={{
                validate: (value) => {
                  const plainText = getPlainTextFromHtml(value);

                  if (!plainText) return "Description is required";

                  if (plainText.length > 2000) {
                    return "Description must be less than 2000 characters";
                  }

                  return true;
                },
              }}
              render={({ field }) => {
                const plainTextLength = getPlainTextFromHtml(
                  field.value
                ).length;

                return (
                  <>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Describe your job post requirements..."
                      variant="job-post"
                    />

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-400">
                        Tip: include your target users, main features, and
                        expected result.
                      </p>

                      <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-400">
                        {plainTextLength}/2000
                      </p>
                    </div>
                  </>
                );
              }}
            />
          </FormField>
        </motion.div>
      </div>
    </motion.div>
  );
}