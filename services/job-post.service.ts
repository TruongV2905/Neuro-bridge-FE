import api from "@/configs/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { createMutationHook, createQueryHook } from "@/hooks/userAPI";
import {
  ApplyJobPostRequest,
  ChangeJobPostStatusMutationVariables,
  ChangeJobPostStatusResponse,
  ExpertAppliedJobPostsResponse,
  ExpertMyApplicationsResponse,
  HireExpertMutationVariables,
  HireExpertResponse,
  ExpertProposal,
  JobPost,
  JobPostAnalyzeRequest,
  JobPostAnalyzeResponse,
  JobPostApplicant,
  JobPostListItem,
  JobPostStatus,
  ProposalUnlock,
  RecommendExpertsRequest,
  UpdateJobPostMutationVariables,
  UpdateJobPostRequest,
  UpdateProposalRequest,
  UpdateProposalUnlockRequest,
} from "@/types/job-post.type";
import type { SkillResponse } from "@/types/skill.types";
import type { APIResponse, PageResponse } from "@/types/common.starter";
import type { AxiosError } from "axios";

const JOB_POST_ENDPOINT = "/jobpost/job-post";
const APPLY_JOB_POST_ENDPOINT = "/jobpost/apply-job-post";
const HIRE_ENDPOINT = "/jobpost/job-posts";
const PROPOSAL_ENDPOINT = "/jobpost/proposal";
const PROPOSAL_UNLOCK_ENDPOINT = "/jobpost/proposal-unlock";
const SKILL_ENDPOINT = "/identity/skill";

type JobPostApiError = AxiosError<APIResponse<null>>;

export const jobPostKeys = {
  all: ["job-posts"],
  analyze: ["job-posts", "analyze"],
  recommendExperts: ["job-posts", "recommend-experts"],
  clientList: ["job-posts", "client", "list"],
  publicList: ["job-posts", "public", "list"],
  expertApplied: ["job-posts", "expert", "applied"],
  expertMyApplications: ["job-posts", "expert", "my-applications"],
  detail: ["job-posts", "detail"],
  apply: ["job-posts", "apply"],
  applicants: ["job-posts", "applicants"],
  hire: ["job-posts", "hire"],
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

export async function updateJobPost(
  jobPostId: string,
  request: UpdateJobPostRequest,
) {
  const { data } = await api.put<APIResponse<JobPost>>(
    `${JOB_POST_ENDPOINT}/${encodeURIComponent(jobPostId)}`,
    request,
  );

  return data;
}

export async function changeJobPostStatus(
  jobPostId: string,
  status: JobPostStatus,
) {
  const { data } = await api.patch<APIResponse<ChangeJobPostStatusResponse>>(
    `${JOB_POST_ENDPOINT}/${encodeURIComponent(jobPostId)}/status`,
    undefined,
    {
      params: {
        jobPostStatus: status,
      },
    },
  );

  return data;
}

export function useUpdateJobPost() {
  const queryClient = useQueryClient();

  return useMutation<
    APIResponse<JobPost>,
    JobPostApiError,
    UpdateJobPostMutationVariables
  >({
    mutationFn: ({ jobPostId, request }) => updateJobPost(jobPostId, request),
    retry: 0,
    onSuccess: async (_data, { jobPostId }) => {
      await invalidateJobPostReadQueries(queryClient, jobPostId);
    },
  });
}

export function useChangeJobPostStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    APIResponse<ChangeJobPostStatusResponse>,
    JobPostApiError,
    ChangeJobPostStatusMutationVariables
  >({
    mutationFn: ({ jobPostId, status }) =>
      changeJobPostStatus(jobPostId, status),
    retry: 0,
    onSuccess: async (_data, { jobPostId }) => {
      await invalidateJobPostReadQueries(queryClient, jobPostId);
    },
  });
}

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

export const useGetExpertMyApplications =
  createQueryHook<ExpertMyApplicationsResponse>(
    jobPostKeys.expertMyApplications,
    `${APPLY_JOB_POST_ENDPOINT}/my-applies`,
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

export async function hireExpert({
  jobPostId,
  expertApplyId,
}: HireExpertMutationVariables) {
  const { data } = await api.post<HireExpertResponse>(
    `${HIRE_ENDPOINT}/${encodeURIComponent(jobPostId)}/expert-applies/${encodeURIComponent(expertApplyId)}/hire`,
  );

  return data;
}

export function useHireExpert() {
  const queryClient = useQueryClient();

  return useMutation<
    HireExpertResponse,
    JobPostApiError,
    HireExpertMutationVariables
  >({
    mutationFn: hireExpert,
    retry: 0,
    onSuccess: async (_data, { jobPostId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: jobPostKeys.clientList,
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: jobPostKeys.detail,
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: jobPostKeys.applicants,
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: jobPostKeys.hire,
          exact: false,
        }),
        invalidateJobPostReadQueries(queryClient, jobPostId),
      ]);
    },
  });
}

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

function invalidateJobPostReadQueries(
  queryClient: QueryClient,
  jobPostId: string,
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: [...jobPostKeys.detail, { id: jobPostId }],
    }),
    queryClient.invalidateQueries({
      queryKey: jobPostKeys.clientList,
    }),
    queryClient.invalidateQueries({
      queryKey: jobPostKeys.publicList,
    }),
  ]);
}
