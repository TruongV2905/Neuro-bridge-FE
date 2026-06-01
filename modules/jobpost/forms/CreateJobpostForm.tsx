// modules/jobpost/forms/CreateJobpostForm.tsx

"use client"

import type { ProjectBriefFormValues } from "../types/create-jobpost-wizard.type"
import { StepProjectBrief } from "../steps/StepProjectBrief"

type CreateJobpostFormProps = {
  values: ProjectBriefFormValues
  errors?: Partial<Record<keyof ProjectBriefFormValues, string>>
  onChange: (values: ProjectBriefFormValues) => void
}

export function CreateJobpostForm({
  values,
  errors,
  onChange,
}: CreateJobpostFormProps) {
  return (
    <StepProjectBrief values={values} errors={errors} onChange={onChange} />
  )
}