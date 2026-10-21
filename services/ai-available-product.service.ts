import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/configs/api";
import { AI_PLACE_API_BASE } from "@/features/ai-place/constants/routes";
import { aiPlaceQueryKeys } from "@/features/ai-place/constants/query-keys";
import type {
  AiPlacePage,
  BrowseMarketplaceProductsParams,
  CreateAiProductRequest,
  ExpertProductDetail,
  ExpertProductListItem,
  MarketplaceProductDetail,
  MarketplaceProductListItem,
  PageParams,
  ProductLifecycleAction,
  UpdateAiProductRequest,
} from "@/features/ai-place/types";
import type { APIResponse } from "@/types/common.starter";

const EXPERT_PRODUCTS_ENDPOINT = `${AI_PLACE_API_BASE}/expert/products`;
const MARKETPLACE_PRODUCTS_ENDPOINT = `${AI_PLACE_API_BASE}/products`;

export async function getExpertProducts(params: PageParams = {}) {
  const { data } = await api.get<APIResponse<AiPlacePage<ExpertProductListItem>>>(
    EXPERT_PRODUCTS_ENDPOINT,
    { params },
  );

  return data;
}

export async function getExpertProduct(productId: string) {
  const { data } = await api.get<APIResponse<ExpertProductDetail>>(
    `${EXPERT_PRODUCTS_ENDPOINT}/${encodeURIComponent(productId)}`,
  );

  return data;
}

export async function createAiProduct(request: CreateAiProductRequest) {
  const { data } = await api.post<APIResponse<ExpertProductDetail>>(
    EXPERT_PRODUCTS_ENDPOINT,
    request,
  );

  return data;
}

export async function updateAiProduct(
  productId: string,
  request: UpdateAiProductRequest,
) {
  const { data } = await api.put<APIResponse<ExpertProductDetail>>(
    `${EXPERT_PRODUCTS_ENDPOINT}/${encodeURIComponent(productId)}`,
    request,
  );

  return data;
}

export async function deleteAiProduct(productId: string) {
  await api.delete(
    `${EXPERT_PRODUCTS_ENDPOINT}/${encodeURIComponent(productId)}`,
  );
}

export async function publishAiProduct(productId: string) {
  const { data } = await api.post<APIResponse<ProductLifecycleAction>>(
    `${EXPERT_PRODUCTS_ENDPOINT}/${encodeURIComponent(productId)}/publish`,
  );

  return data;
}

export async function unpublishAiProduct(productId: string) {
  const { data } = await api.post<APIResponse<ProductLifecycleAction>>(
    `${EXPERT_PRODUCTS_ENDPOINT}/${encodeURIComponent(productId)}/unpublish`,
  );

  return data;
}

export async function getMarketplaceProducts(
  params: BrowseMarketplaceProductsParams = {},
) {
  const { data } = await api.get<
    APIResponse<AiPlacePage<MarketplaceProductListItem>>
  >(MARKETPLACE_PRODUCTS_ENDPOINT, { params });

  return data;
}

export async function getMarketplaceProduct(productId: string) {
  const { data } = await api.get<APIResponse<MarketplaceProductDetail>>(
    `${MARKETPLACE_PRODUCTS_ENDPOINT}/${encodeURIComponent(productId)}`,
  );

  return data;
}

export function useExpertProducts(params: PageParams = {}) {
  return useQuery({
    queryKey: aiPlaceQueryKeys.expertProducts.list(params),
    queryFn: () => getExpertProducts(params),
    retry: 0,
  });
}

export function useExpertProduct(productId?: string | null) {
  const normalizedProductId = productId?.trim() || "";

  return useQuery({
    queryKey: aiPlaceQueryKeys.expertProducts.detail(normalizedProductId),
    queryFn: () => getExpertProduct(normalizedProductId),
    enabled: Boolean(normalizedProductId),
    retry: 0,
  });
}

export function useCreateAiProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAiProduct,
    retry: 0,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: aiPlaceQueryKeys.expertProducts.all,
      });
    },
  });
}

export function useUpdateAiProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      request,
    }: {
      productId: string;
      request: UpdateAiProductRequest;
    }) => updateAiProduct(productId, request),
    retry: 0,
    onSuccess: async (data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: aiPlaceQueryKeys.expertProducts.all,
        }),
        queryClient.setQueryData(
          aiPlaceQueryKeys.expertProducts.detail(variables.productId),
          data,
        ),
      ]);
    },
  });
}

export function useDeleteAiProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAiProduct,
    retry: 0,
    onSuccess: async (_data, productId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: aiPlaceQueryKeys.expertProducts.all,
        }),
        queryClient.removeQueries({
          queryKey: aiPlaceQueryKeys.expertProducts.detail(productId),
          exact: true,
        }),
      ]);
    },
  });
}

export function usePublishAiProduct() {
  return useProductLifecycleMutation(publishAiProduct);
}

export function useUnpublishAiProduct() {
  return useProductLifecycleMutation(unpublishAiProduct);
}

export function useMarketplaceProducts(
  params: BrowseMarketplaceProductsParams = {},
) {
  return useQuery({
    queryKey: aiPlaceQueryKeys.marketplace.list(params),
    queryFn: () => getMarketplaceProducts(params),
    retry: 0,
  });
}

export function useMarketplaceProduct(productId?: string | null) {
  const normalizedProductId = productId?.trim() || "";

  return useQuery({
    queryKey: aiPlaceQueryKeys.marketplace.detail(normalizedProductId),
    queryFn: () => getMarketplaceProduct(normalizedProductId),
    enabled: Boolean(normalizedProductId),
    retry: 0,
  });
}

function useProductLifecycleMutation(
  action: (productId: string) => Promise<APIResponse<ProductLifecycleAction>>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: action,
    retry: 0,
    onSuccess: async (_data, productId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: aiPlaceQueryKeys.expertProducts.all,
        }),
        queryClient.invalidateQueries({
          queryKey: aiPlaceQueryKeys.expertProducts.detail(productId),
        }),
        queryClient.invalidateQueries({
          queryKey: aiPlaceQueryKeys.marketplace.all,
        }),
      ]);
    },
  });
}
