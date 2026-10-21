import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/configs/api";
import { aiPlaceQueryKeys } from "@/features/ai-place/constants/query-keys";
import { AI_PLACE_API_BASE } from "@/features/ai-place/constants/routes";
import type {
  AiPlacePage,
  PageParams,
  ProductAssetType,
  ProtectedDownloadAccess,
  PurchaseDetail,
  PurchaseHistoryItem,
  PurchaseSettlement,
} from "@/features/ai-place/types";
import type { APIResponse } from "@/types/common.starter";

const CLIENT_ENDPOINT = `${AI_PLACE_API_BASE}/client`;
const PURCHASES_ENDPOINT = `${CLIENT_ENDPOINT}/purchases`;

export async function buyAiProduct(productId: string) {
  const { data } = await api.post<APIResponse<PurchaseSettlement>>(
    `${CLIENT_ENDPOINT}/products/${encodeURIComponent(productId)}/purchases`,
  );

  return data;
}

export async function retryAiProductPurchasePayment(purchaseId: string) {
  const { data } = await api.post<APIResponse<PurchaseSettlement>>(
    `${PURCHASES_ENDPOINT}/${encodeURIComponent(purchaseId)}/retry-payment`,
  );

  return data;
}

export async function getAiPlacePurchaseHistory(params: PageParams = {}) {
  const { data } = await api.get<APIResponse<AiPlacePage<PurchaseHistoryItem>>>(
    PURCHASES_ENDPOINT,
    { params },
  );

  return data;
}

export async function getAiPlacePurchaseDetail(purchaseId: string) {
  const { data } = await api.get<APIResponse<PurchaseDetail>>(
    `${PURCHASES_ENDPOINT}/${encodeURIComponent(purchaseId)}`,
  );

  return data;
}

export async function requestProtectedDownloadAccess({
  purchaseId,
  productId,
  assetType,
}: {
  purchaseId: string;
  productId: string;
  assetType: ProductAssetType;
}) {
  const { data } = await api.get<APIResponse<ProtectedDownloadAccess>>(
    `${PURCHASES_ENDPOINT}/${encodeURIComponent(purchaseId)}/products/${encodeURIComponent(productId)}/assets/${encodeURIComponent(assetType)}/download-access`,
  );

  return data;
}

export function useBuyAiProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: buyAiProduct,
    retry: 0,
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: aiPlaceQueryKeys.purchases.all,
        }),
        queryClient.invalidateQueries({
          queryKey: aiPlaceQueryKeys.purchases.detail(data.result.purchaseId),
        }),
      ]);
    },
  });
}

export function useRetryAiProductPurchasePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryAiProductPurchasePayment,
    retry: 0,
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: aiPlaceQueryKeys.purchases.all,
        }),
        queryClient.invalidateQueries({
          queryKey: aiPlaceQueryKeys.purchases.detail(data.result.purchaseId),
        }),
      ]);
    },
  });
}

export function useAiPlacePurchaseHistory(params: PageParams = {}) {
  return useQuery({
    queryKey: aiPlaceQueryKeys.purchases.history(params),
    queryFn: () => getAiPlacePurchaseHistory(params),
    retry: 0,
  });
}

export function useAiPlacePurchaseDetail(purchaseId?: string | null) {
  const normalizedPurchaseId = purchaseId?.trim() || "";

  return useQuery({
    queryKey: aiPlaceQueryKeys.purchases.detail(normalizedPurchaseId),
    queryFn: () => getAiPlacePurchaseDetail(normalizedPurchaseId),
    enabled: Boolean(normalizedPurchaseId),
    retry: 0,
  });
}

export function useProtectedDownloadAccess() {
  return useMutation({
    mutationFn: requestProtectedDownloadAccess,
    retry: 0,
  });
}
