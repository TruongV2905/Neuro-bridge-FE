// modules/jobpost/components/page/CreateJobpostPage.tsx

"use client"

import { useMemo, useState } from "react"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createJobpostSchema } from "../../schemas/create-jobpost.schema"
import { mockAIAnalysisResult } from "../../mocks/ai-analysis.mock"
import { mockExpertMatches } from "../../mocks/expert-match.mock"
import {
  saveJobpostDraft,
  loadJobpostDraft,
} from "../../configs/jobpost-draft-storage.config"

import type {
  CreateJobpostStep,
  CreateJobpostWizardState,
  ProjectBriefFormValues,
} from "../../types/create-jobpost-wizard.type"

import { CreateJobpostForm } from "../../forms/CreateJobpostForm"
import { CreateJobpostSidebar } from "./CreateJobpostSidebar"

const initialBrief: ProjectBriefFormValues = {
  projectTitle: "",
  businessGoal: "",
  customBusinessGoal: "",
  description: "",
  attachments: [],
}

const initialState: CreateJobpostWizardState = {
  currentStep: 1,
  brief: initialBrief,
  aiAnalysis: null,
  configuration: {
    category: null,
    requiredSkills: [],
    budgetRange: {
      min: 1000,
      max: 5000,
      currency: "USD",
    },
    timelineRange: {
      min: 1,
      max: 4,
      unit: "weeks",
    },
  },
  expertMatches: [],
}

export function CreateJobpostPage() {
  const [wizardState, setWizardState] =
    useState<CreateJobpostWizardState>(() => {
      return loadJobpostDraft() ?? initialState
    })

  const [errors, setErrors] = useState<
    Partial<Record<keyof ProjectBriefFormValues, string>>
  >({})

  const currentStep = wizardState.currentStep

  const aiConfidence = useMemo(() => {
    return wizardState.aiAnalysis?.confidenceScore ?? 94
  }, [wizardState.aiAnalysis])

  const handleBriefChange = (brief: ProjectBriefFormValues) => {
    setWizardState((previous) => ({
      ...previous,
      brief,
    }))
  }

  const handleSaveDraft = () => {
    saveJobpostDraft(wizardState)
  }

  const handleContinue = () => {
    if (currentStep === 1) {
      const result = createJobpostSchema.safeParse(wizardState.brief)

      if (!result.success) {
        const fieldErrors: Partial<
          Record<keyof ProjectBriefFormValues, string>
        > = {}

        result.error.issues.forEach((issue) => {
          const fieldName = issue.path[0] as keyof ProjectBriefFormValues
          fieldErrors[fieldName] = issue.message
        })

        setErrors(fieldErrors)
        return
      }

      setErrors({})

      setWizardState((previous) => ({
        ...previous,
        currentStep: 2,
        aiAnalysis: mockAIAnalysisResult,
        configuration: {
          category: mockAIAnalysisResult.category,
          requiredSkills: mockAIAnalysisResult.recommendedSkills,
          budgetRange: mockAIAnalysisResult.estimatedBudget,
          timelineRange: mockAIAnalysisResult.estimatedTimeline,
        },
        expertMatches: mockExpertMatches,
      }))

      return
    }

    if (currentStep < 4) {
      setWizardState((previous) => ({
        ...previous,
        currentStep: (previous.currentStep + 1) as CreateJobpostStep,
      }))
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f8f3f3]">
      <CreateJobpostSidebar
        currentStep={currentStep}
        aiConfidence={aiConfidence}
        onSaveDraft={handleSaveDraft}
      />

      <main className="flex min-h-screen flex-1 flex-col px-8 py-8">
        <div className="flex flex-1 items-start justify-center pt-8">
          {currentStep === 1 ? (
            <CreateJobpostForm
              values={wizardState.brief}
              errors={errors}
              onChange={handleBriefChange}
            />
          ) : (
            <div className="w-full max-w-[720px] rounded-3xl border bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold text-primary">
                Step {currentStep}/4
              </p>

              <h1 className="mt-3 text-2xl font-bold">
                Step {currentStep} UI is ready to connect
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Sau bước này mình sẽ nối tiếp các component StepAIAnalysis,
                StepConfiguration và StepReviewLaunch.
              </p>
            </div>
          )}
        </div>

        <div className="mx-auto flex w-full max-w-[560px] items-center justify-between pb-6">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={[
                  "h-1.5 rounded-full transition-all",
                  currentStep === step
                    ? "w-8 bg-primary"
                    : "w-1.5 bg-zinc-300",
                ].join(" ")}
              />
            ))}
          </div>

          <Button
            type="button"
            onClick={handleContinue}
            className="rounded-full bg-gradient-to-r from-primary to-fuchsia-500 px-8"
          >
            Continue
            <ArrowRight size={16} />
          </Button>
        </div>
      </main>
    </div>
  )
}