"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import type {
  CreateJobPostFormValues,
  CreateJobPostStep,
  JobPostAnalyzeResponse,
} from "@/types/job-post.type";
import {
  useAnalyzeJobPost,
  useCreateJobPost,
  useGetSkillsByIds,
} from "@/services/job-post.service";
import type { SkillResponse } from "@/types/skill.types";
import Header from "@/components/layout/Header";
import { JobPostProgressSidebar } from "./components/JobPostProgressSidebar";
import { StepNavigation } from "./components/StepNavigation";
import { BusinessOverviewStep } from "./components/steps/BusinessOverviewStep";
import { AiAnalysisStep } from "./components/steps/AiAnalysisStep";
import { ConfigurationStep } from "./components/steps/ConfigurationStep";
import { ReviewLaunchStep } from "./components/steps/ReviewLaunchStep";
import { StepFlipTransition } from "./components/ui/StepFlipTransition";

export function CreateJobPostView() {
  const [step, setStep] = useState<CreateJobPostStep>(1);
  const [direction, setDirection] = useState(1);

  const [aiResult, setAiResult] = useState<JobPostAnalyzeResponse | null>(null);
  const [fetchedSkills, setFetchedSkills] = useState<SkillResponse[]>([]);
  const [requiredSkillIds, setRequiredSkillIds] = useState<number[]>([]);
  const [preferredSkillIds, setPreferredSkillIds] = useState<number[]>([]);

  const {
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
    getValues,
  } = useForm<CreateJobPostFormValues>({
    defaultValues: {
      title: "",
      description: "",
      budgetFrom: 5000,
      budgetTo: 15000,
      estimatedDays: 14,
    },
    mode: "onChange",
  });

  const title = watch("title");
  const description = watch("description");
  const budgetFrom = watch("budgetFrom");
  const budgetTo = watch("budgetTo");
  const estimatedDays = watch("estimatedDays");

  const analyzeMutation = useAnalyzeJobPost();
  const skillsMutation = useGetSkillsByIds();
  const createJobPostMutation = useCreateJobPost();

  const isAnalyzing = analyzeMutation.isPending || skillsMutation.isPending;

  const progress = step * 25;

  const isStepOneValid = useMemo(() => {
    return (
      title.trim().length > 0 &&
      description.trim().length > 0 &&
      budgetFrom > 0 &&
      budgetTo >= budgetFrom &&
      estimatedDays > 0
    );
  }, [title, description, budgetFrom, budgetTo, estimatedDays]);

  const isStepThreeValid = useMemo(() => {
    return (
      title.trim().length > 0 &&
      description.trim().length > 0 &&
      budgetFrom > 0 &&
      budgetTo >= budgetFrom &&
      estimatedDays > 0 &&
      requiredSkillIds.length > 0
    );
  }, [
    title,
    description,
    budgetFrom,
    budgetTo,
    estimatedDays,
    requiredSkillIds,
  ]);

  const requiredSkillNames = useMemo(() => {
    const map = new Map(fetchedSkills.map((s) => [s.id, s.skillName]));
    return requiredSkillIds
      .map((id) => map.get(id))
      .filter(Boolean) as string[];
  }, [fetchedSkills, requiredSkillIds]);

  const preferredSkillNames = useMemo(() => {
    const map = new Map(fetchedSkills.map((s) => [s.id, s.skillName]));
    return preferredSkillIds
      .map((id) => map.get(id))
      .filter(Boolean) as string[];
  }, [fetchedSkills, preferredSkillIds]);

  const goToStep = (nextStep: CreateJobPostStep) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const handleAnalyze = async () => {
    const values = getValues();

    try {
      const result = await analyzeMutation.mutateAsync({
        data: {
          title: values.title,
          description: values.description,
          budgetFrom: values.budgetFrom,
          budgetTo: values.budgetTo,
          estimatedDays: values.estimatedDays,
        },
      });

      const data = result.result;
      setAiResult(data);

      const allSkillIds = [
        ...(data.requiredSkillIds ?? []),
        ...(data.preferredSkillIds ?? []),
      ];

      let skills: SkillResponse[] = [];
      if (allSkillIds.length > 0) {
        const skillsResult = await skillsMutation.mutateAsync({
          data: allSkillIds,
        });
        skills = skillsResult.result ?? [];
      }

      setFetchedSkills(skills);

      setValue("title", data.title ?? values.title, { shouldValidate: true });
      setValue("description", data.description ?? values.description, {
        shouldValidate: true,
      });
      setValue("budgetFrom", data.budgetFrom ?? values.budgetFrom, {
        shouldValidate: true,
      });
      setValue("budgetTo", data.budgetTo ?? values.budgetTo, {
        shouldValidate: true,
      });
      setValue("estimatedDays", data.estimatedDays ?? values.estimatedDays, {
        shouldValidate: true,
      });

      setRequiredSkillIds(data.requiredSkillIds ?? []);
      setPreferredSkillIds(data.preferredSkillIds ?? []);

      goToStep(2);
    } catch {
      toast.error(
        analyzeMutation.error?.message ??
          skillsMutation.error?.message ??
          "Failed to analyze job post. Please try again.",
      );
    }
  };

  const buildRecommendExpertsPayload = () => {
    return {
      title: getValues("title"),
      description: getValues("description"),
      requiredSkillIds,
      preferredSkillIds,
      budgetFrom: getValues("budgetFrom"),
      budgetTo: getValues("budgetTo"),
      estimatedDays: getValues("estimatedDays"),
    };
  };

  const handleContinue = () => {
    if (step === 1 && (!isStepOneValid || isAnalyzing)) return;
    if (step === 3 && !isStepThreeValid) return;

    if (step === 1) {
      handleAnalyze();
      return;
    }

    if (step === 3) {
      // Future call: POST /api/jobpost/job-post/recommend-experts
      const recommendPayload = buildRecommendExpertsPayload();
      console.log("Recommend Experts Payload (future API):", recommendPayload);
      goToStep(4);
      return;
    }

    if (step === 4) {
      const payload = buildRecommendExpertsPayload();

      createJobPostMutation.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast.success("Job post created successfully!");
            reset({
              title: "",
              description: "",
              budgetFrom: 5000,
              budgetTo: 15000,
              estimatedDays: 14,
            });
            setAiResult(null);
            setFetchedSkills([]);
            setRequiredSkillIds([]);
            setPreferredSkillIds([]);
            goToStep(1);
          },
          onError: (err) => {
            toast.error(
              err?.message ?? "Failed to create job post. Please try again.",
            );
          },
        },
      );
      return;
    }

    goToStep((step + 1) as CreateJobPostStep);
  };

  const handleRegenerate = () => {
    setAiResult(null);
    setFetchedSkills([]);
    setRequiredSkillIds([]);
    setPreferredSkillIds([]);
    reset({
      title: "",
      description: "",
      budgetFrom: 5000,
      budgetTo: 15000,
      estimatedDays: 14,
    });
    goToStep(1);
  };

  const canContinue = () => {
    if (step === 1) return isStepOneValid && !isAnalyzing;
    if (step === 3) return isStepThreeValid;
    if (step === 4) return !createJobPostMutation.isPending;
    return true;
  };

  return (
    <>
      <main className="min-h-screen bg-[#f6f1f1]">
        <div className="flex min-h-screen">
          <JobPostProgressSidebar step={step} progress={progress} />

          <section className="flex-1 px-8 py-10  lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto max-w-3xl"
            >
              <StepFlipTransition step={step} direction={direction}>
                {step === 1 && (
                  <BusinessOverviewStep
                    register={register}
                    errors={errors}
                    budgetFrom={budgetFrom}
                    budgetTo={budgetTo}
                    estimatedDays={estimatedDays}
                    onBudgetRangeChange={(from, to) => {
                      setValue("budgetFrom", from, { shouldValidate: true });
                      setValue("budgetTo", to, { shouldValidate: true });
                    }}
                    onEstimatedDaysChange={(value) => {
                      setValue("estimatedDays", value, {
                        shouldValidate: true,
                      });
                    }}
                  />
                )}

                {step === 2 && (
                  <AiAnalysisStep
                    aiResult={aiResult}
                    fetchedSkills={fetchedSkills}
                    budgetFrom={budgetFrom}
                    budgetTo={budgetTo}
                    estimatedDays={estimatedDays}
                    onAccept={() => goToStep(3)}
                    onRegenerate={handleRegenerate}
                  />
                )}

                {step === 3 && (
                  <ConfigurationStep
                    register={register}
                    errors={errors}
                    budgetFrom={budgetFrom}
                    budgetTo={budgetTo}
                    estimatedDays={estimatedDays}
                    aiResult={aiResult}
                    requiredSkillIds={requiredSkillIds}
                    preferredSkillIds={preferredSkillIds}
                    onBudgetRangeChange={(from, to) => {
                      setValue("budgetFrom", from, { shouldValidate: true });
                      setValue("budgetTo", to, { shouldValidate: true });
                    }}
                    onEstimatedDaysChange={(value) => {
                      setValue("estimatedDays", value, {
                        shouldValidate: true,
                      });
                    }}
                    onRequiredSkillIdsChange={setRequiredSkillIds}
                    onPreferredSkillIdsChange={setPreferredSkillIds}
                  />
                )}

                {step === 4 && (
                  <ReviewLaunchStep
                    projectTitle={title}
                    description={description}
                    requiredSkillIds={requiredSkillIds}
                    preferredSkillIds={preferredSkillIds}
                    requiredSkillNames={requiredSkillNames}
                    preferredSkillNames={preferredSkillNames}
                    budgetFrom={budgetFrom}
                    budgetTo={budgetTo}
                    estimatedDays={estimatedDays}
                  />
                )}
              </StepFlipTransition>
              <div className="mt-8">
                <StepNavigation
                  step={step}
                  canContinue={canContinue()}
                  onContinue={handleContinue}
                />
                <p className="mt-5 min-h-5 max-w-3xl text-right text-sm text-red-500">
                  {step === 1 && !isStepOneValid
                    ? "Please fill in all required fields before continuing."
                    : step === 3 && !isStepThreeValid
                      ? "Please fill in all required fields and select at least one skill."
                      : ""}
                </p>
              </div>
            </motion.div>
          </section>
        </div>
      </main>
    </>
  );
}
