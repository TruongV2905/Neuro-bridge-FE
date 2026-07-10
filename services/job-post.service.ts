import api from "@/configs/api";
import { createMutationHook, createQueryHook } from "@/hooks/userAPI";
import {
  ApplyJobPostRequest,
  ExpertAppliedJobPostsResponse,
  ExpertProposal,
  JobPost,
  JobPostAnalyzeRequest,
  JobPostAnalyzeResponse,
  JobPostApplicant,
  JobPostListItem,
  ProposalUnlock,
  RecommendExpertsRequest,
  UpdateProposalRequest,
  UpdateProposalUnlockRequest,
} from "@/types/job-post.type";
import type { SkillResponse } from "@/types/skill.types";
import type { APIResponse, PageResponse } from "@/types/common.starter";

const JOB_POST_ENDPOINT = "/jobpost/job-post";
const APPLY_JOB_POST_ENDPOINT = "/jobpost/apply-job-post";
const PROPOSAL_ENDPOINT = "/jobpost/proposal";
const PROPOSAL_UNLOCK_ENDPOINT = "/jobpost/proposal-unlock";
const SKILL_ENDPOINT = "/identity/skill";

export const jobPostKeys = {
  all: ["job-posts"],
  analyze: ["job-posts", "analyze"],
  recommendExperts: ["job-posts", "recommend-experts"],
  clientList: ["job-posts", "client", "list"],
  publicList: ["job-posts", "public", "list"],
  expertApplied: ["job-posts", "expert", "applied"],
  detail: ["job-posts", "detail"],
  apply: ["job-posts", "apply"],
  applicants: ["job-posts", "applicants"],
  expertProposals: ["job-posts", "expert", "proposals"],
  proposalDetail: ["job-posts", "proposal", "detail"],
  proposalUnlockDetail: ["job-posts", "proposal-unlock", "detail"],
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

export const useGetExpertAppliedJobPosts =
  createQueryHook<ExpertAppliedJobPostsResponse>(
    jobPostKeys.expertApplied,
    `${JOB_POST_ENDPOINT}/expert-apply`,
  );

export const useApplyJobPost = createMutationHook<
  Record<string, never>,
  ApplyJobPostRequest
>({
  url: `${APPLY_JOB_POST_ENDPOINT}/apply`,
  method: "POST",
  queryKeyToInvalidate: [jobPostKeys.detail, jobPostKeys.publicList],
});

export const useGetJobPostApplicants = createQueryHook<JobPostApplicant[]>(
  jobPostKeys.applicants,
  `${APPLY_JOB_POST_ENDPOINT}/:jobPostId/applies`,
);

export async function fetchJobPostApplicants(jobPostId: string) {
  const { data } = await api.get<APIResponse<JobPostApplicant[]>>(
    `${APPLY_JOB_POST_ENDPOINT}/${encodeURIComponent(jobPostId)}/applies`,
  );

  return {
    result: data.result,
    message: data.message,
    code: data.code,
  };
}

export const useGetExpertProposals = createQueryHook<
  PageResponse<ExpertProposal>
>(jobPostKeys.expertProposals, PROPOSAL_ENDPOINT);

export const useGetProposalById = createQueryHook<ExpertProposal>(
  jobPostKeys.proposalDetail,
  `${PROPOSAL_ENDPOINT}/:id`,
);

export const useGetProposalUnlockByProposalId =
  createQueryHook<ProposalUnlock>(
    jobPostKeys.proposalUnlockDetail,
    `${PROPOSAL_UNLOCK_ENDPOINT}/:proposalId`,
  );

export const useUpdateProposal = createMutationHook<
  ExpertProposal,
  UpdateProposalRequest
>({
  url: `${PROPOSAL_ENDPOINT}/:id`,
  method: "PUT",
  queryKeyToInvalidate: [
    jobPostKeys.expertProposals,
    jobPostKeys.proposalDetail,
  ],
});

export const useUpdateProposalUnlock = createMutationHook<
  ProposalUnlock,
  UpdateProposalUnlockRequest
>({
  url: `${PROPOSAL_UNLOCK_ENDPOINT}/:id`,
  method: "PUT",
  queryKeyToInvalidate: [
    jobPostKeys.expertProposals,
    jobPostKeys.proposalDetail,
    jobPostKeys.proposalUnlockDetail,
  ],
});
