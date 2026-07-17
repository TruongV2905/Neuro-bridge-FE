import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";

import api from "@/configs/api";
import type { APIResponse } from "@/types/common.starter";
import type {
  ExpertRatingSummaryResponse,
  RateProjectMutationVariables,
  RatingRequest,
  RatingResponse,
} from "@/types/rating.type";

const RATING_ENDPOINT = "/rate/api/rating";

type RatingApiError = AxiosError<APIResponse<null>>;
type ApiEnvelope<T> = {
  code?: number;
  message?: string;
  result?: T;
};

export const ratingKeys = {
  all: ["ratings"] as const,
  project: (projectId: string) => [...ratingKeys.all, "project", projectId] as const,
  expertSummary: (expertId: string) =>
    [...ratingKeys.all, "expert", expertId, "summary"] as const,
};

export async function getProjectRating(projectId: string) {
  const { data } = await api.get<RatingResponse | ApiEnvelope<RatingResponse>>(
    `${RATING_ENDPOINT}/${encodeURIComponent(projectId)}`,
  );

  return unwrapApiResult(data);
}

export async function rateProject(
  projectId: string,
  request: RatingRequest,
) {
  const { data } = await api.post<RatingResponse | ApiEnvelope<RatingResponse>>(
    `${RATING_ENDPOINT}/${encodeURIComponent(projectId)}`,
    request,
  );

  return unwrapApiResult(data);
}

export async function getExpertRatingSummary(expertId: string) {
  const { data } = await api.get<
    ExpertRatingSummaryResponse | ApiEnvelope<ExpertRatingSummaryResponse>
  >(`${RATING_ENDPOINT}/expert/${encodeURIComponent(expertId)}/summary`);

  return unwrapApiResult(data);
}

export function useProjectRating(
  projectId?: string | null,
  options?: Omit<
    UseQueryOptions<RatingResponse, RatingApiError, RatingResponse, QueryKey>,
    "queryKey" | "queryFn"
  >,
) {
  const normalizedProjectId = normalizeIdentifier(projectId);

  return useQuery<RatingResponse, RatingApiError, RatingResponse, QueryKey>({
    queryKey: normalizedProjectId
      ? ratingKeys.project(normalizedProjectId)
      : ratingKeys.project(""),
    queryFn: () => getProjectRating(normalizedProjectId ?? ""),
    enabled: Boolean(normalizedProjectId),
    retry: 0,
    ...options,
  });
}

export function useRateProject(
  options?: Omit<
    UseMutationOptions<
      RatingResponse,
      RatingApiError,
      RateProjectMutationVariables,
      unknown
    >,
    "mutationFn" | "retry"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    RatingResponse,
    RatingApiError,
    RateProjectMutationVariables,
    unknown
  >({
    ...options,
    mutationFn: ({ projectId, request }) => rateProject(projectId, request),
    retry: 0,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.allSettled([
        queryClient.invalidateQueries({
          queryKey: ratingKeys.project(variables.projectId),
        }),
        queryClient.invalidateQueries({
          queryKey: ratingKeys.expertSummary(data.expertId),
        }),
      ]);

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useExpertRatingSummary(
  expertId?: string | null,
  options?: Omit<
    UseQueryOptions<
      ExpertRatingSummaryResponse,
      RatingApiError,
      ExpertRatingSummaryResponse,
      QueryKey
    >,
    "queryKey" | "queryFn"
  >,
) {
  const normalizedExpertId = normalizeIdentifier(expertId);

  return useQuery<
    ExpertRatingSummaryResponse,
    RatingApiError,
    ExpertRatingSummaryResponse,
    QueryKey
  >({
    queryKey: normalizedExpertId
      ? ratingKeys.expertSummary(normalizedExpertId)
      : ratingKeys.expertSummary(""),
    queryFn: () => getExpertRatingSummary(normalizedExpertId ?? ""),
    enabled: Boolean(normalizedExpertId),
    retry: 0,
    ...options,
  });
}

function unwrapApiResult<T>(data: T | ApiEnvelope<T>) {
  if (
    typeof data === "object" &&
    data !== null &&
    "result" in data &&
    (data as ApiEnvelope<T>).result !== undefined
  ) {
    return (data as ApiEnvelope<T>).result as T;
  }

  return data as T;
}

function normalizeIdentifier(value?: string | null) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}
