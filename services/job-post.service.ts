import { createMutationHook } from "@/hooks/userAPI";
import { JobPostAnalyzeResponse } from "@/types/job-post.type";
import type { SkillResponse } from "@/types/skill.types";

const JOB_POST_ENDPOINT = "/jobpost/job-post";
const SKILL_ENDPOINT = "/identity/skill";

export const jobPostKeys = {
  all: ["job-posts"],
  analyze: ["job-posts", "analyze"],
  recommendExperts: ["job-posts", "recommend-experts"],
};

export type JobPostAnalyzeRequest = {
  title: string;
  description: string;
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
};

export type RecommendExpertsRequest = JobPostAnalyzeRequest & {
  requiredSkillIds: number[];
  preferredSkillIds: number[];
};

export const useAnalyzeJobPost = createMutationHook<
  JobPostAnalyzeResponse,
  JobPostAnalyzeRequest
>({
  url: `${JOB_POST_ENDPOINT}/analyze-ai`,
  method: "POST",
});

export const useGetSkillsByIds = createMutationHook<SkillResponse[], number[]>({
  url: `${SKILL_ENDPOINT}/by-list-ids`,
  method: "POST",
});

// Hook prepared for future use; matches the recommended payload shape from
// the spec. Endpoint to be confirmed once the backend is ready.
export const useRecommendExperts = createMutationHook<
  unknown,
  RecommendExpertsRequest
>({
  url: `${JOB_POST_ENDPOINT}/recommend-experts`,
  method: "POST",
});

export type CreateJobPostPayload = RecommendExpertsRequest;

export const useCreateJobPost = createMutationHook<unknown, CreateJobPostPayload>({
  url: JOB_POST_ENDPOINT,
  method: "POST",
});