import { createMutationHook, createQueryHook } from "@/hooks/userAPI";
import {
  ApplyJobPostRequest,
  JobPost,
  JobPostAnalyzeRequest,
  JobPostAnalyzeResponse,
  JobPostListItem,
  RecommendExpertsRequest,
} from "@/types/job-post.type";
import type { SkillResponse } from "@/types/skill.types";
import type { PageResponse } from "@/types/common.starter";

const JOB_POST_ENDPOINT = "/jobpost/job-post";
const APPLY_JOB_POST_ENDPOINT = "/jobpost/apply-job-post";
const SKILL_ENDPOINT = "/identity/skill";

export const jobPostKeys = {
  all: ["job-posts"],
  analyze: ["job-posts", "analyze"],
  recommendExperts: ["job-posts", "recommend-experts"],
  clientList: ["job-posts", "client", "list"],
  publicList: ["job-posts", "public", "list"],
  detail: ["job-posts", "detail"],
  apply: ["job-posts", "apply"],
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

export const useGetClientJobPosts = createQueryHook<
  PageResponse<JobPostListItem>
>(jobPostKeys.clientList, `${JOB_POST_ENDPOINT}/client`);

export const useGetPublicJobPosts = createQueryHook<PageResponse<JobPost>>(
  jobPostKeys.publicList,
  JOB_POST_ENDPOINT,
);

export const useGetJobPostById = createQueryHook<JobPost>(
  jobPostKeys.detail,
  `${JOB_POST_ENDPOINT}/:id`,
);

export const useApplyJobPost = createMutationHook<
  Record<string, never>,
  ApplyJobPostRequest
>({
  url: `${APPLY_JOB_POST_ENDPOINT}/apply`,
  method: "POST",
  queryKeyToInvalidate: [jobPostKeys.detail, jobPostKeys.publicList],
});
