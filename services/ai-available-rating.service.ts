import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/configs/api";
import { aiPlaceQueryKeys } from "@/features/ai-place/constants/query-keys";
import { AI_PLACE_API_BASE } from "@/features/ai-place/constants/routes";
import type {
  AiPlacePage,
  CreatePurchaseRatingRequest,
  PageParams,
  ProductRating,
  ProductRatingSummary,
  UpdatePurchaseRatingRequest,
} from "@/features/ai-place/types";
import type { APIResponse } from "@/types/common.starter";

const MARKETPLACE_PRODUCTS_ENDPOINT = `${AI_PLACE_API_BASE}/products`;
const PURCHASES_ENDPOINT = `${AI_PLACE_API_BASE}/client/purchases`;

export async function getProductRatings(
  productId: string,
  params: PageParams = {},
) {
  const { data } = await api.get<APIResponse<AiPlacePage<ProductRating>>>(
    `${MARKETPLACE_PRODUCTS_ENDPOINT}/${encodeURIComponent(productId)}/ratings`,
    { params },
  );

  return data;
}

export async function getProductRatingSummary(productId: string) {
  const { data } = await api.get<APIResponse<ProductRatingSummary>>(
    `${MARKETPLACE_PRODUCTS_ENDPOINT}/${encodeURIComponent(productId)}/ratings/summary`,
  );

  return data;
}

export async function createPurchaseRating(
  purchaseId: string,
  request: CreatePurchaseRatingRequest,
) {
  const { data } = await api.post<APIResponse<ProductRating>>(
    `${PURCHASES_ENDPOINT}/${encodeURIComponent(purchaseId)}/rating`,
    request,
  );

  return data;
}

export async function updatePurchaseRating(
  purchaseId: string,
  request: UpdatePurchaseRatingRequest,
) {
  const { data } = await api.put<APIResponse<ProductRating>>(
    `${PURCHASES_ENDPOINT}/${encodeURIComponent(purchaseId)}/rating`,
    request,
  );

  return data;
}

export async function deletePurchaseRating(purchaseId: string) {
  await api.delete(`${PURCHASES_ENDPOINT}/${encodeURIComponent(purchaseId)}/rating`);
}

export function useProductRatings(
  productId?: string | null,
  params: PageParams = {},
) {
  const normalizedProductId = productId?.trim() || "";

  return useQuery({
    queryKey: aiPlaceQueryKeys.marketplace.ratingList(
      normalizedProductId,
      params,
    ),
    queryFn: () => getProductRatings(normalizedProductId, params),
    enabled: Boolean(normalizedProductId),
    retry: 0,
  });
}

export function useProductRatingSummary(productId?: string | null) {
  const normalizedProductId = productId?.trim() || "";

  return useQuery({
    queryKey: aiPlaceQueryKeys.marketplace.ratingSummary(normalizedProductId),
    queryFn: () => getProductRatingSummary(normalizedProductId),
    enabled: Boolean(normalizedProductId),
    retry: 0,
  });
}

export type PurchaseRatingMutationVariables<TRequest> = {
  purchaseId: string;
  productId: string;
  request: TRequest;
};

export function useCreatePurchaseRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      purchaseId,
      request,
    }: PurchaseRatingMutationVariables<CreatePurchaseRatingRequest>) =>
      createPurchaseRating(purchaseId, request),
    retry: 0,
    onSuccess: async (_data, variables) => {
      await invalidatePurchaseRatingQueries(
        queryClient,
        variables.purchaseId,
        variables.productId,
      );
    },
  });
}

export function useUpdatePurchaseRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      purchaseId,
      request,
    }: PurchaseRatingMutationVariables<UpdatePurchaseRatingRequest>) =>
      updatePurchaseRating(purchaseId, request),
    retry: 0,
    onSuccess: async (_data, variables) => {
      await invalidatePurchaseRatingQueries(
        queryClient,
        variables.purchaseId,
        variables.productId,
      );
    },
  });
}

export function useDeletePurchaseRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      purchaseId,
    }: Omit<PurchaseRatingMutationVariables<never>, "request">) =>
      deletePurchaseRating(purchaseId),
    retry: 0,
    onSuccess: async (_data, variables) => {
      await invalidatePurchaseRatingQueries(
        queryClient,
        variables.purchaseId,
        variables.productId,
      );
    },
  });
}

async function invalidatePurchaseRatingQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  purchaseId: string,
  productId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: aiPlaceQueryKeys.purchases.detail(purchaseId),
    }),
    queryClient.invalidateQueries({
      queryKey: aiPlaceQueryKeys.marketplace.ratings(productId),
    }),
  ]);
}
