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
const PURCHASE_LOOKUP_PAGE_SIZE = 50;

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

/**
 * The current backend exposes no purchase-by-product endpoint. The client
 * therefore searches its server-paginated successful-purchase history rather
 * than assuming a marketplace product has not been purchased.
 */
export async function findAiPlacePurchaseForProduct(
  productId: string,
): Promise<PurchaseHistoryItem | null> {
  let page = 0;

  while (true) {
    const response = await getAiPlacePurchaseHistory({
      page,
      size: PURCHASE_LOOKUP_PAGE_SIZE,
    });
    const match = response.result.data.find(
      (purchase) => purchase.productId === productId,
    );

    if (match) {
      return match;
    }

    if (!response.result.metadata.hasNext) {
      return null;
    }

    page += 1;
  }
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
        queryClient.invalidateQueries({
          queryKey: aiPlaceQueryKeys.marketplace.detail(data.result.productId),
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
        queryClient.invalidateQueries({
          queryKey: aiPlaceQueryKeys.marketplace.detail(data.result.productId),
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

export function useAiPlacePurchaseForProduct(productId?: string | null) {
  const normalizedProductId = productId?.trim() || "";

  return useQuery<PurchaseHistoryItem | null>({
    queryKey: aiPlaceQueryKeys.purchases.byProduct(normalizedProductId),
    queryFn: () => findAiPlacePurchaseForProduct(normalizedProductId),
    enabled: Boolean(normalizedProductId),
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
