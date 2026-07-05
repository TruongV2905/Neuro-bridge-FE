import { createMutationHook, createQueryHook } from "@/hooks/userAPI";
import { jobPostKeys } from "@/services/jobpost.service";
import { proposalKeys } from "@/services/proposal.service";
import type {
  ApplyJobPostResponse,
  HireResponse,
} from "@/types/proposal.types";

const APPLY_ENDPOINT = "/jobpost/apply-job-post";
const HIRE_ENDPOINT = "/jobpost/job-posts";

export const applyKeys = {
  all: ["applies"],
  byJobPost: ["applies", "by-job-post"],
};

export const useGetAppliesByJobPost = createQueryHook<ApplyJobPostResponse[]>(
  applyKeys.byJobPost,
  `${APPLY_ENDPOINT}/:jobPostId/applies`,
);

export const useHireExpert = createMutationHook<HireResponse, void>({
  url: `${HIRE_ENDPOINT}/:jobPostId/expert-applies/:expertApplyId/hire`,
  method: "POST",
  queryKeyToInvalidate: [
    applyKeys.byJobPost,
    jobPostKeys.list,
    jobPostKeys.detail,
    proposalKeys.list,
  ],
});
