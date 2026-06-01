// modules/jobpost/steps/StepProjectBrief.tsx

"use client"

import { useMemo } from "react"
import {
  BUSINESS_GOALS,
  PROJECT_DESCRIPTION_MAX_LENGTH,
} from "../constants/jobpost.constants"
import type { ProjectBriefFormValues } from "../types/create-jobpost-wizard.type"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AttachmentUploader } from "../components/AttachmentUploader"

type StepProjectBriefProps = {
  values: ProjectBriefFormValues
  errors?: Partial<Record<keyof ProjectBriefFormValues, string>>
  onChange: (values: ProjectBriefFormValues) => void
}

export function StepProjectBrief({
  values,
  errors,
  onChange,
}: StepProjectBriefProps) {
  const descriptionLength = values.description?.length ?? 0

  const showCustomGoal = useMemo(() => {
    return values.businessGoal === "Others"
  }, [values.businessGoal])

  return (
    <div className="w-full max-w-[560px] space-y-6">
      <div>
        <div className="mb-4 inline-flex rounded-md bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
          Step 1/4
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
          Tell us about your business
        </h1>

        <p className="mt-1 text-sm text-zinc-400">
          Share your goal and project context — no technical knowledge required
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">
          Project Title <span className="text-red-500">*</span>
        </label>

        <Input
          value={values.projectTitle}
          onChange={(event) =>
            onChange({
              ...values,
              projectTitle: event.target.value,
            })
          }
          className="h-12 rounded-2xl"
        />

        {errors?.projectTitle && (
          <p className="text-xs text-red-500">{errors.projectTitle}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">
          Business Goal <span className="text-red-500">*</span>
        </label>

        <Select
          value={values.businessGoal}
          onValueChange={(value) =>
            onChange({
              ...values,
              businessGoal: value,
              customBusinessGoal:
                value === "Others" ? values.customBusinessGoal : "",
            })
          }
        >
          <SelectTrigger className="h-12 rounded-2xl">
            <SelectValue placeholder="What outcome are you trying to achieve?" />
          </SelectTrigger>

          <SelectContent>
            {BUSINESS_GOALS.map((goal) => (
              <SelectItem key={goal} value={goal}>
                {goal}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errors?.businessGoal && (
          <p className="text-xs text-red-500">{errors.businessGoal}</p>
        )}
      </div>

      {showCustomGoal && (
        <div className="space-y-2">
          <label className="text-sm font-semibold">
            Custom Business Goal <span className="text-red-500">*</span>
          </label>

          <Input
            value={values.customBusinessGoal ?? ""}
            maxLength={50}
            onChange={(event) =>
              onChange({
                ...values,
                customBusinessGoal: event.target.value,
              })
            }
            placeholder="Describe your goal"
            className="h-12 rounded-2xl"
          />

          {errors?.customBusinessGoal && (
            <p className="text-xs text-red-500">
              {errors.customBusinessGoal}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-semibold">
          Description <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <Textarea
            value={values.description ?? ""}
            maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
            onChange={(event) =>
              onChange({
                ...values,
                description: event.target.value,
              })
            }
            className="min-h-[120px] resize-none rounded-2xl pb-8"
          />

          <span className="absolute bottom-3 right-4 text-xs text-zinc-400">
            {descriptionLength}/{PROJECT_DESCRIPTION_MAX_LENGTH}
          </span>
        </div>

        {errors?.description && (
          <p className="text-xs text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">
          Attachments{" "}
          <span className="text-xs font-normal text-zinc-400">
            Optional — briefs, wireframes, data samples
          </span>
        </label>

        <AttachmentUploader
          files={values.attachments}
          onChange={(files) =>
            onChange({
              ...values,
              attachments: files,
            })
          }
        />
      </div>
    </div>
  )
}