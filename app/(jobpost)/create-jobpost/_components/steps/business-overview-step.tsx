import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import type { CreateJobPostFormValues } from "@/types/job-post.type";
import { businessGoals } from "../../_constants/job-post.constants";
import { FormField } from "../ui/form-field";
import {
  jobPostFieldClassName,
  jobPostSelectClassName,
} from "../ui/form-field-styles";
import { StepBadge } from "../ui/step-badge";

type Props = {
  register: UseFormRegister<CreateJobPostFormValues>;
  control: Control<CreateJobPostFormValues>;
  errors: FieldErrors<CreateJobPostFormValues>;
};

export function BusinessOverviewStep({ register, control, errors }: Props) {
  return (
    <div className="max-w-2xl">
      <StepBadge step={1} />

      <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-black">
        Tell us about your business
      </h1>

      <p className="mt-2 text-lg text-slate-400">
        Share your goal and project context — no technical knowledge required
      </p>

      <div className="mt-10 space-y-8">
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

        <FormField
          label="Business Goal"
          required
          error={errors.businessGoal?.message}
        >
          <select
            {...register("businessGoal", {
              required: "Business goal is required",
            })}
            className={jobPostSelectClassName}
          >
            <option value="">What outcome are you trying to achieve?</option>
            {businessGoals.map((goal) => (
              <option key={goal} value={goal}>
                {goal}
              </option>
            ))}
          </select>
        </FormField>

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
                const plainText = value.replace(/<[^>]*>/g, "").trim();

                if (!plainText) return "Description is required";

                if (plainText.length > 2000) {
                  return "Description must be less than 2000 characters";
                }

                return true;
              },
            }}
            render={({ field }) => {
              const plainTextLength = field.value
                .replace(/<[^>]*>/g, "")
                .trim().length;

              return (
                <>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Describe your job post requirements..."
                    variant="job-post"
                  />

                  <p className="mt-2 text-right text-sm font-semibold tabular-nums text-slate-400">
                    {plainTextLength}/2000
                  </p>
                </>
              );
            }}
          />
        </FormField>
      </div>
    </div>
  );
}
