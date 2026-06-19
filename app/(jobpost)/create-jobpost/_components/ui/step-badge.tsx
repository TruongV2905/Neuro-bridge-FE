import type { CreateJobPostStep } from "@/types/job-post.type";

type Props = {
  step: CreateJobPostStep;
};

export function StepBadge({ step }: Props) {
  return (
    <span className="inline-flex rounded-lg bg-indigo-100 px-6 py-2 font-bold text-indigo-600">
      Step {step}/4
    </span>
  );
}