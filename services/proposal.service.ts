import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import api from "@/configs/api";
import { createMutationHook, createQueryHook } from "@/hooks/userAPI";
import { jobPostKeys } from "@/services/jobpost.service";
import { APIResponse, PageRequest, PageResponse } from "@/types/common.starter";
import {
  ApplyJobPostRequest,
  ApplyJobPostResponse,
  ProposalRequest,
  ProposalResponse,
  ProposalUnlockRequest,
  ProposalUnlockResponse,
} from "@/types/proposal.types";

const PROPOSAL_ENDPOINT = "/jobpost/proposal";
const APPLY_ENDPOINT = "/jobpost/apply-job-post";
const UNLOCK_ENDPOINT = "/jobpost/proposal-unlock";

export const proposalKeys = {
  all: ["proposals"],
  list: ["proposals", "list"],
  detail: ["proposals", "detail"],
  unlock: ["proposals", "unlock"],
};

export const applyJobPostKeys = {
  all: ["apply-job-posts"],
  byJobPost: ["apply-job-posts", "by-jobpost"],
};

type ApiError = AxiosError<APIResponse<null>>;

export const useApplyJobPost = createMutationHook<void, ApplyJobPostRequest>({
  url: `${APPLY_ENDPOINT}/apply`,
  method: "POST",
  queryKeyToInvalidate: [
    proposalKeys.list,
    applyJobPostKeys.all,
    jobPostKeys.list,
    jobPostKeys.detail,
  ],
});

export const useGetApplyJobPostsByJobPostId = (jobPostId?: string) => {
  return useQuery<
    APIResponse<ApplyJobPostResponse[]>,
    ApiError,
    APIResponse<ApplyJobPostResponse[]>
  >({
    queryKey: [...applyJobPostKeys.byJobPost, jobPostId],
    queryFn: async () => {
      const { data } = await api.get<APIResponse<ApplyJobPostResponse[]>>(
        `${APPLY_ENDPOINT}/${jobPostId}/applies`,
      );

      return data;
    },
    enabled: !!jobPostId,
    retry: 0,
  });
};

type ProposalListParams = PageRequest & { expertCode: string };

export const useGetProposalsByExpertCode = (params: ProposalListParams) => {
  const { expertCode, ...pageRequest } = params;

  return useQuery<
    APIResponse<PageResponse<ProposalResponse | null>>,
    ApiError,
    APIResponse<PageResponse<ProposalResponse | null>>
  >({
    queryKey: [...proposalKeys.list, params],
    queryFn: async () => {
      const search = new URLSearchParams();
      search.set("expertCode", expertCode);
      if (pageRequest.page != null)
        search.set("pageRequest.page", String(pageRequest.page));
      if (pageRequest.size != null)
        search.set("pageRequest.size", String(pageRequest.size));
      if (pageRequest.sortBy)
        search.set("pageRequest.sortBy", pageRequest.sortBy);
      if (pageRequest.sortDirection)
        search.set("pageRequest.direction", pageRequest.sortDirection);
      if (pageRequest.search)
        search.set("pageRequest.search", pageRequest.search);

      const { data } = await api.get<
        APIResponse<PageResponse<ProposalResponse | null>>
      >(`${PROPOSAL_ENDPOINT}?${search.toString()}`);
      return data;
    },
    enabled: !!expertCode,
    retry: 0,
  });
};

export const useGetProposalById = createQueryHook<ProposalResponse>(
  proposalKeys.detail,
  `${PROPOSAL_ENDPOINT}/:id`,
);

export const useUpdateProposal = createMutationHook<
  ProposalResponse,
  ProposalRequest
>({
  url: `${PROPOSAL_ENDPOINT}/:id`,
  method: "PUT",
  queryKeyToInvalidate: [proposalKeys.list, proposalKeys.detail],
});

export const useDeleteProposal = createMutationHook<void, void>({
  url: `${PROPOSAL_ENDPOINT}/:id`,
  method: "DELETE",
  queryKeyToInvalidate: [
    proposalKeys.list,
    proposalKeys.detail,
    applyJobPostKeys.all,
    jobPostKeys.list,
    jobPostKeys.detail,
  ],
});

export const useGetProposalUnlockById = createQueryHook<ProposalUnlockResponse>(
  proposalKeys.unlock,
  `${UNLOCK_ENDPOINT}/:proposalId`,
);

export const useUpdateProposalUnlock = createMutationHook<
  ProposalUnlockResponse,
  ProposalUnlockRequest
>({
  url: `${UNLOCK_ENDPOINT}/:id`,
  method: "PUT",
  queryKeyToInvalidate: [proposalKeys.unlock],
});
