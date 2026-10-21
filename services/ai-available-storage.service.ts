import { useMutation, useQueryClient } from "@tanstack/react-query";

import api from "@/configs/api";
import { aiPlaceQueryKeys } from "@/features/ai-place/constants/query-keys";
import { AI_PLACE_API_BASE } from "@/features/ai-place/constants/routes";
import type {
  ConfirmPreviewUploadRequest,
  ConfirmProtectedAssetUploadRequest,
  PreviewUploadAuthorizationRequest,
  ProductAsset,
  ProductAssetType,
  ProtectedAssetUploadAuthorizationRequest,
  PublicPreview,
  UploadAuthorization,
} from "@/features/ai-place/types";
import type { APIResponse } from "@/types/common.starter";

const EXPERT_PRODUCTS_ENDPOINT = `${AI_PLACE_API_BASE}/expert/products`;

function getProductEndpoint(productId: string) {
  return `${EXPERT_PRODUCTS_ENDPOINT}/${encodeURIComponent(productId)}`;
}

function getAssetEndpoint(productId: string, assetType: ProductAssetType) {
  return `${getProductEndpoint(productId)}/assets/${encodeURIComponent(assetType)}`;
}

export async function requestPreviewUploadAuthorization(
  productId: string,
  request: PreviewUploadAuthorizationRequest,
) {
  const { data } = await api.post<APIResponse<UploadAuthorization>>(
    `${getProductEndpoint(productId)}/preview/upload-authorizations`,
    request,
  );

  return data;
}

export async function confirmPreviewUpload(
  productId: string,
  request: ConfirmPreviewUploadRequest,
) {
  const { data } = await api.put<APIResponse<PublicPreview>>(
    `${getProductEndpoint(productId)}/preview`,
    request,
  );

  return data;
}

export async function deletePreview(productId: string) {
  await api.delete(`${getProductEndpoint(productId)}/preview`);
}

export async function requestAssetUploadAuthorization(
  productId: string,
  assetType: ProductAssetType,
  request: ProtectedAssetUploadAuthorizationRequest,
) {
  const { data } = await api.post<APIResponse<UploadAuthorization>>(
    `${getAssetEndpoint(productId, assetType)}/upload-authorizations`,
    request,
  );

  return data;
}

export async function confirmAssetUpload(
  productId: string,
  assetType: ProductAssetType,
  request: ConfirmProtectedAssetUploadRequest,
) {
  const { data } = await api.put<APIResponse<ProductAsset>>(
    getAssetEndpoint(productId, assetType),
    request,
  );

  return data;
}

export async function deleteAsset(
  productId: string,
  assetType: ProductAssetType,
) {
  await api.delete(getAssetEndpoint(productId, assetType));
}

export function useRequestPreviewUploadAuthorization() {
  return useMutation({
    mutationFn: ({
      productId,
      request,
    }: {
      productId: string;
      request: PreviewUploadAuthorizationRequest;
    }) => requestPreviewUploadAuthorization(productId, request),
    retry: 0,
  });
}

export function useConfirmPreviewUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      request,
    }: {
      productId: string;
      request: ConfirmPreviewUploadRequest;
    }) => confirmPreviewUpload(productId, request),
    retry: 0,
    onSuccess: async (_data, variables) => {
      await invalidateExpertProduct(queryClient, variables.productId);
    },
  });
}

export function useDeletePreview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePreview,
    retry: 0,
    onSuccess: async (_data, productId) => {
      await invalidateExpertProduct(queryClient, productId);
    },
  });
}

export function useRequestAssetUploadAuthorization() {
  return useMutation({
    mutationFn: ({
      productId,
      assetType,
      request,
    }: {
      productId: string;
      assetType: ProductAssetType;
      request: ProtectedAssetUploadAuthorizationRequest;
    }) => requestAssetUploadAuthorization(productId, assetType, request),
    retry: 0,
  });
}

export function useConfirmAssetUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      assetType,
      request,
    }: {
      productId: string;
      assetType: ProductAssetType;
      request: ConfirmProtectedAssetUploadRequest;
    }) => confirmAssetUpload(productId, assetType, request),
    retry: 0,
    onSuccess: async (_data, variables) => {
      await invalidateExpertProduct(queryClient, variables.productId);
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      assetType,
    }: {
      productId: string;
      assetType: ProductAssetType;
    }) => deleteAsset(productId, assetType),
    retry: 0,
    onSuccess: async (_data, variables) => {
      await invalidateExpertProduct(queryClient, variables.productId);
    },
  });
}

async function invalidateExpertProduct(
  queryClient: ReturnType<typeof useQueryClient>,
  productId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: aiPlaceQueryKeys.expertProducts.all,
    }),
    queryClient.invalidateQueries({
      queryKey: aiPlaceQueryKeys.expertProducts.detail(productId),
    }),
  ]);
}
