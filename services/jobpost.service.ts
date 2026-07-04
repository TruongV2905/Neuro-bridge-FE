import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import api from "@/configs/api";
import { createMutationHook, createQueryHook } from "@/hooks/userAPI";
import { APIResponse, PageResponse } from "@/types/common.starter";
import {
  JobPostFilterRequest,
  JobPostRequest,
  JobPostResponse,
  JobPostStatus,
} from "@/types/jobpost.types";

const JOBPOST_ENDPOINT = "/jobpost/job-post";

export const jobPostKeys = {
  all: ["jobposts"],
  list: ["jobposts", "list"],
  detail: ["jobposts", "detail"],
};

type ApiError = AxiosError<APIResponse<null>>;

const buildJobPostQuery = (params?: JobPostFilterRequest) => {
  const search = new URLSearchParams();

  if (params?.page != null) search.set("page", String(params.page));
  if (params?.size != null) search.set("size", String(params.size));
  if (params?.sortBy) search.set("sortBy", params.sortBy);
  if (params?.sortDirection) search.set("direction", params.sortDirection);
  if (params?.search) search.set("search", params.search);

  const filter = params?.filter;
  if (filter) {
    if (filter.creatorId) search.set("filter.creatorId", filter.creatorId);
    if (filter.minBudget != null)
      search.set("filter.minBudget", String(filter.minBudget));
    if (filter.maxBudget != null)
      search.set("filter.maxBudget", String(filter.maxBudget));
    if (filter.estimatedDaysFrom != null)
      search.set("filter.estimatedDaysFrom", String(filter.estimatedDaysFrom));
    if (filter.estimatedDaysTo != null)
      search.set("filter.estimatedDaysTo", String(filter.estimatedDaysTo));
    if (filter.status) search.set("filter.status", filter.status);
    filter.requiredSkillIds?.forEach((id) =>
      search.append("filter.requiredSkillIds", String(id)),
    );
    filter.preferredSkillIds?.forEach((id) =>
      search.append("filter.preferredSkillIds", String(id)),
    );
  }

  return search.toString();
};

export const useGetJobPosts = (params?: JobPostFilterRequest) => {
  return useQuery<
    APIResponse<PageResponse<JobPostResponse>>,
    ApiError,
    APIResponse<PageResponse<JobPostResponse>>
  >({
    queryKey: [...jobPostKeys.list, params],
    queryFn: async () => {
      const qs = buildJobPostQuery(params);
      const url = qs ? `${JOBPOST_ENDPOINT}?${qs}` : JOBPOST_ENDPOINT;
      const { data } =
        await api.get<APIResponse<PageResponse<JobPostResponse>>>(url);
      return data;
    },
    retry: 0,
  });
};

export const useGetPublicJobPosts = (
  params?: Omit<JobPostFilterRequest, "filter"> & {
    filter?: Omit<
      NonNullable<JobPostFilterRequest["filter"]>,
      "status"
    >;
  },
) => {
  return useGetJobPosts({
    ...params,
    filter: {
      ...params?.filter,
      status: JobPostStatus.PUBLIC,
    },
  });
};

export const useGetClientJobPosts = (params?: JobPostFilterRequest) => {
  return useQuery<
    APIResponse<PageResponse<JobPostResponse>>,
    ApiError,
    APIResponse<PageResponse<JobPostResponse>>
  >({
    queryKey: [...jobPostKeys.list, "client", params],
    queryFn: async () => {
      const qs = buildJobPostQuery(params);
      const url = qs
        ? `${JOBPOST_ENDPOINT}/client?${qs}`
        : `${JOBPOST_ENDPOINT}/client`;
      const { data } =
        await api.get<APIResponse<PageResponse<JobPostResponse>>>(url);
      return data;
    },
    retry: 0,
  });
};

export const useCreateJobPost = createMutationHook<
  JobPostResponse,
  JobPostRequest
>({
  url: JOBPOST_ENDPOINT,
  method: "POST",
  queryKeyToInvalidate: [jobPostKeys.list],
});

export const useGetJobPostById = createQueryHook<JobPostResponse>(
  jobPostKeys.detail,
  `${JOBPOST_ENDPOINT}/:id`,
);

export const useUpdateJobPost = createMutationHook<
  JobPostResponse,
  JobPostRequest
>({
  url: `${JOBPOST_ENDPOINT}/:id`,
  method: "PUT",
  queryKeyToInvalidate: [jobPostKeys.list, jobPostKeys.detail],
});

export const useChangeJobPostStatus = createMutationHook<void>({
  url: `${JOBPOST_ENDPOINT}/:id/status`,
  method: "PATCH",
  queryKeyToInvalidate: [jobPostKeys.list, jobPostKeys.detail],
});

export const useDeleteJobPost = createMutationHook<void>({
  url: `${JOBPOST_ENDPOINT}/:id`,
  method: "DELETE",
  queryKeyToInvalidate: [jobPostKeys.list, jobPostKeys.detail],
});
