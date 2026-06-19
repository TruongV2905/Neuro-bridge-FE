"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

import type {
  CreateJobPostFormValues,
  CreateJobPostPayload,
  CreateJobPostStep,
} from "@/types/job-post.type";

import Header from "@/components/layout/Header";
import { JobPostProgressSidebar } from "./job-post-progress-sidebar";
import { StepNavigation } from "./step-navigation";
import { BusinessOverviewStep } from "./steps/business-overview-step";
import { AiAnalysisStep } from "./steps/ai-analysis-step";
import { ConfigurationStep } from "./steps/configuration-step";
import { ReviewLaunchStep } from "./steps/review-launch-step";
import { StepFlipTransition } from "./ui/step-flip-transition";

export function CreateJobPostForm() {
  const [step, setStep] = useState<CreateJobPostStep>(1);
  const [direction, setDirection] = useState(1);

  const {
    register,
    control,
    watch,
    formState: { errors },
    getValues,
  } = useForm<CreateJobPostFormValues>({
    defaultValues: {
      projectTitle: "",
      businessGoal: "",
      description: "",
    },
    mode: "onChange",
  });

  const projectTitle = watch("projectTitle");
  const businessGoal = watch("businessGoal");
  const description = watch("description");

  const [category, setCategory] = useState("AI Chatbot");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Python",
    "LangChain",
    "OpenAI API",
    "FastAPI",
    "Vector Databases",
  ]);

  const [budgetFrom, setBudgetFrom] = useState(5000);
  const [budgetTo, setBudgetTo] = useState(15000);
  const [timeline, setTimeline] = useState("2–4 Weeks");

  const progress = step * 25;

  const isStepOneValid = useMemo(() => {
    const plainDescription = description.replace(/<[^>]*>/g, "").trim();

    return (
      projectTitle.trim().length > 0 &&
      businessGoal.trim().length > 0 &&
      plainDescription.length > 0
    );
  }, [projectTitle, businessGoal, description]);

  const isStepThreeValid = useMemo(() => {
    return (
      category.trim().length > 0 &&
      selectedSkills.length > 0 &&
      budgetFrom > 0 &&
      budgetTo > 0 &&
      timeline.trim().length > 0
    );
  }, [category, selectedSkills, budgetFrom, budgetTo, timeline]);

  const canContinue = () => {
    if (step === 1) return isStepOneValid;
    if (step === 3) return isStepThreeValid;
    return true;
  };

  const goToStep = (nextStep: CreateJobPostStep) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const handleContinue = () => {
    if (!canContinue()) return;

    if (step < 4) {
      goToStep((step + 1) as CreateJobPostStep);
      return;
    }

    const payload: CreateJobPostPayload = {
      title: getValues("projectTitle"),
      businessGoal: getValues("businessGoal"),
      description: getValues("description"),
      category,
      requiredSkills: selectedSkills,
      budgetFrom,
      budgetTo,
      timeline,
    };

    console.log("Create Job Post Payload:", payload);
    alert("Job post created successfully!");
  };

  const handleBack = () => {
    if (step > 1) {
      goToStep((step - 1) as CreateJobPostStep);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((item) => item !== skill)
        : [...prev, skill]
    );
  };

  return (
    <main className="min-h-screen bg-[#f6f1f1]">
      <Header />

      <div className="flex min-h-screen">
        <JobPostProgressSidebar step={step} progress={progress} />

        <section className="flex-1 px-8 py-10 pt-32 lg:px-12">
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
                  control={control}
                  errors={errors}
                />
              )}

              {step === 2 && (
                <AiAnalysisStep
                  selectedSkills={selectedSkills}
                  budgetFrom={budgetFrom}
                  budgetTo={budgetTo}
                  timeline={timeline}
                  onAccept={() => goToStep(3)}
                />
              )}

              {step === 3 && (
                <ConfigurationStep
                  category={category}
                  selectedSkills={selectedSkills}
                  budgetFrom={budgetFrom}
                  budgetTo={budgetTo}
                  timeline={timeline}
                  onCategoryChange={setCategory}
                  onToggleSkill={toggleSkill}
                  onBudgetFromChange={setBudgetFrom}
                  onBudgetToChange={setBudgetTo}
                  onTimelineChange={setTimeline}
                />
              )}

              {step === 4 && (
                <ReviewLaunchStep
                  projectTitle={projectTitle}
                  description={description}
                  category={category}
                  selectedSkills={selectedSkills}
                  budgetFrom={budgetFrom}
                  budgetTo={budgetTo}
                  timeline={timeline}
                />
              )}
            </StepFlipTransition>

            <div className="mt-20">
              <StepNavigation
                step={step}
                canContinue={canContinue()}
                onBack={handleBack}
                onContinue={handleContinue}
              />

              <p className="mt-5 min-h-5 max-w-3xl text-right text-sm text-red-500">
                {step === 1 && !isStepOneValid
                  ? "Please fill in all required fields before continuing."
                  : ""}
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
