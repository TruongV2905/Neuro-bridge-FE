import type { PageResponse } from "@/types/common.starter";

export type AiPlaceId = string;
export type AiPlaceDateTime = string;

export type ProductStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";

export type PreviewType = "IMAGE" | "VIDEO";

export type ProductAssetType =
  | "SOURCE_CODE"
  | "VIDEO"
  | "DATASET"
  | "DOCUMENT";

export type PurchaseStatus = "PENDING_PAYMENT" | "SUCCESS";

export type EntitlementStatus = "ACTIVE" | "EXPIRED";

export type ApiFieldErrors = Record<string, string[]>;

export type AiPlaceApiError = {
  errorCode: string;
  fieldErrors?: ApiFieldErrors;
  details?: unknown;
  requestId?: string;
};

export type PublicPreview = {
  type: PreviewType;
  originalFilename: string;
  contentType: string;
  byteSize: number;
  videoDurationSeconds?: number;
  uploadedAt: AiPlaceDateTime;
  accessUrl?: string;
  accessUrlExpiresAt?: AiPlaceDateTime;
};

export type ProductAsset = {
  assetType: ProductAssetType;
  originalFilename: string;
  contentType: string;
  byteSize: number;
  uploadedAt: AiPlaceDateTime;
};

export type ExpertProductListItem = {
  id: AiPlaceId;
  name: string;
  categoryCode: string;
  priceVnd: number;
  status: ProductStatus;
  preview?: PublicPreview;
  updatedAt: AiPlaceDateTime;
  lastPublishedAt?: AiPlaceDateTime;
};

export type ExpertProductDetail = {
  id: AiPlaceId;
  name: string;
  description?: string;
  categoryCode: string;
  technologies: string[];
  aiCapabilities: string[];
  priceVnd: number;
  status: ProductStatus;
  preview?: PublicPreview;
  updatedAt: AiPlaceDateTime;
  lastPublishedAt?: AiPlaceDateTime;
  firstPublishedAt?: AiPlaceDateTime;
  createdAt: AiPlaceDateTime;
  assets: ProductAsset[];
};

export type CreateAiProductRequest = {
  name: string;
  categoryCode: string;
  priceVnd: number;
};

export type UpdateAiProductRequest = {
  name: string;
  description: string | null;
  categoryCode: string;
  technologies: string[];
  aiCapabilities: string[];
  priceVnd: number;
};

export type ProductLifecycleAction = {
  productId: AiPlaceId;
  status: ProductStatus;
  firstPublishedAt?: AiPlaceDateTime;
  lastPublishedAt?: AiPlaceDateTime;
  alreadyInTargetState: boolean;
};

export type MarketplaceProductListItem = {
  id: AiPlaceId;
  name: string;
  categoryCode: string;
  priceVnd: number;
  technologies: string[];
  aiCapabilities: string[];
  preview?: PublicPreview;
  lastPublishedAt: AiPlaceDateTime;
};

export type SellerSummary = {
  expertId: AiPlaceId;
  expertCode: string;
  displayName: string;
  avatarUrl?: string;
};

export type MarketplaceProductDetail = {
  id: AiPlaceId;
  name: string;
  description: string;
  categoryCode: string;
  technologies: string[];
  aiCapabilities: string[];
  priceVnd: number;
  preview?: PublicPreview;
  lastPublishedAt: AiPlaceDateTime;
  seller: SellerSummary;
};

export type PageParams = {
  page?: number;
  size?: number;
};

export type BrowseMarketplaceProductsParams = PageParams & {
  keyword?: string;
  categoryCode?: string;
  minPriceVnd?: number;
  maxPriceVnd?: number;
};

export type PreviewUploadAuthorizationRequest = {
  previewType: PreviewType;
  originalFilename: string;
  contentType: string;
  byteSize: number;
};

export type ProtectedAssetUploadAuthorizationRequest = {
  originalFilename: string;
  contentType: string;
  byteSize: number;
};

export type UploadAuthorization = {
  uploadToken: string;
  uploadUrl: string;
  uploadMethod: string;
  requiredHeaders: Record<string, string>;
  storageBucket: string;
  storageObjectKey: string;
  expiresAt: AiPlaceDateTime;
};

export type ConfirmPreviewUploadRequest = {
  uploadToken: string;
  objectETag?: string;
  clientObservedVideoDurationSeconds?: number;
};

export type ConfirmProtectedAssetUploadRequest = {
  uploadToken: string;
  objectETag?: string;
};

export type PurchaseSettlement = {
  purchaseId: AiPlaceId;
  productId: AiPlaceId;
  purchaseStatus: PurchaseStatus;
  wasExistingIntent: boolean;
  paymentTransactionId: AiPlaceId;
  productNameAtPurchase: string;
  sellerExpertId: AiPlaceId;
  sellerExpertCode: string;
  sellerDisplayName: string;
  grossPriceVnd: number;
  platformFeeVnd: number;
  expertNetVnd: number;
  purchasedAt: AiPlaceDateTime;
  accessExpiresAt: AiPlaceDateTime;
};

export type PurchaseHistoryItem = {
  purchaseId: AiPlaceId;
  productId: AiPlaceId;
  productNameAtPurchase: string;
  sellerExpertId: AiPlaceId;
  sellerExpertCode: string;
  sellerDisplayName: string;
  grossPriceVnd: number;
  platformFeeVnd: number;
  expertNetVnd: number;
  purchasedAt: AiPlaceDateTime;
  accessExpiresAt: AiPlaceDateTime;
  entitlementStatus: EntitlementStatus;
};

export type PurchaseDetail = PurchaseHistoryItem & {
  paymentTransactionId: AiPlaceId;
  canDownload: boolean;
  availableAssetTypes: ProductAssetType[];
  rating?: ProductRating;
};

export type ProtectedDownloadAccess = {
  purchaseId: AiPlaceId;
  productId: AiPlaceId;
  assetType: ProductAssetType;
  originalFilename: string;
  contentType: string;
  byteSize: number;
  accessUrl: string;
  accessUrlExpiresAt: AiPlaceDateTime;
};

export type ProductRating = {
  ratingId: AiPlaceId;
  score: number;
  reviewText?: string;
  createdAt: AiPlaceDateTime;
  updatedAt: AiPlaceDateTime;
};

export type ProductRatingSummary = {
  productId: AiPlaceId;
  ratingCount: number;
  averageScore?: number;
};

export type CreatePurchaseRatingRequest = {
  score: number;
  reviewText?: string;
};

export type UpdatePurchaseRatingRequest = CreatePurchaseRatingRequest;

export type AiPlacePage<T> = PageResponse<T>;
