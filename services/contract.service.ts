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
  ContractResponse,
  HireExpertMutationVariables,
  HireExpertResponse,
} from "@/types/contract.type";

const CONTRACT_ENDPOINT = "/jobpost/api/contract";
const JOB_POST_ENDPOINT = "/jobpost/job-posts";

type ContractApiError = AxiosError<APIResponse<null>>;

export const contractKeys = {
  all: ["contracts"] as const,
  detail: (contractId: string) =>
    [...contractKeys.all, "detail", contractId] as const,
  hire: ["hire-expert"] as const,
};

export async function getContractById(contractId: string) {
  const { data } = await api.get<ContractResponse>(
    `${CONTRACT_ENDPOINT}/${encodeURIComponent(contractId)}`,
  );

  return data;
}

export async function signContract(contractId: string) {
  const { data } = await api.patch<ContractResponse>(
    `${CONTRACT_ENDPOINT}/${encodeURIComponent(contractId)}/sign`,
  );

  return data;
}

export async function hireExpert({
  jobPostId,
  expertApplyId,
}: HireExpertMutationVariables): Promise<HireExpertResponse> {
  const { data } = await api.post<HireExpertResponse | APIResponse<HireExpertResponse>>(
    `${JOB_POST_ENDPOINT}/${encodeURIComponent(jobPostId)}/expert-applies/${encodeURIComponent(expertApplyId)}/hire`,
    {},
  );

  if ("result" in data && data.result) {
    return data.result as HireExpertResponse;
  }

  return data as HireExpertResponse;
}

export function useGetContractById(
  contractId?: string | null,
  options?: Omit<
    UseQueryOptions<
      ContractResponse,
      ContractApiError,
      ContractResponse,
      QueryKey
    >,
    "queryKey" | "queryFn"
  >,
) {
  const normalizedContractId = normalizeIdentifier(contractId);

  return useQuery<ContractResponse, ContractApiError, ContractResponse>({
    queryKey: normalizedContractId
      ? contractKeys.detail(normalizedContractId)
      : contractKeys.detail(""),
    queryFn: () => getContractById(normalizedContractId ?? ""),
    enabled: Boolean(normalizedContractId),
    retry: 0,
    ...options,
  });
}

export function useSignContract(
  options?: Omit<
    UseMutationOptions<ContractResponse, ContractApiError, string, unknown>,
    "mutationFn" | "retry"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<ContractResponse, ContractApiError, string, unknown>({
    ...options,
    mutationFn: signContract,
    retry: 0,
    onSuccess: async (data, contractId, onMutateResult, context) => {
      await queryClient.invalidateQueries({
        queryKey: contractKeys.detail(contractId),
      });

      options?.onSuccess?.(data, contractId, onMutateResult, context);
    },
  });
}

export function useHireExpert(
  options?: Omit<
    UseMutationOptions<
      HireExpertResponse,
      ContractApiError,
      HireExpertMutationVariables,
      unknown
    >,
    "mutationFn" | "retry"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    HireExpertResponse,
    ContractApiError,
    HireExpertMutationVariables,
    unknown
  >({
    ...options,
    mutationFn: hireExpert,
    retry: 0,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({
        queryKey: contractKeys.hire,
      });

      if (data.contractId) {
        await queryClient.invalidateQueries({
          queryKey: contractKeys.detail(data.contractId),
        });
      }

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

function normalizeIdentifier(value?: string | null) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}
