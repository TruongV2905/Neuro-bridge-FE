import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";

import api from "@/configs/api";
import type { APIResponse } from "@/types/common.starter";
import type { ContractResponse } from "@/types/contract.type";

const CONTRACT_ENDPOINT = "/jobpost/api/contract";

type ContractApiError = AxiosError<APIResponse<null>>;

export const contractKeys = {
  all: ["contracts"] as const,
  detail: (contractId: string) =>
    [...contractKeys.all, "detail", contractId] as const,
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

function normalizeIdentifier(value?: string | null) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}
