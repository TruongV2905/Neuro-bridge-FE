import { isAxiosError } from "axios";

import type { APIResponse } from "@/types/common.starter";
import type { AiPlaceApiError, ApiFieldErrors } from "@/features/ai-place/types";

export const AI_PLACE_ERROR_CODES = [
  "PRODUCT_NOT_FOUND",
  "PRODUCT_NOT_OWNED",
  "PRODUCT_NOT_PUBLISHED",
  "INVALID_PRODUCT_STATE",
  "DELIVERABLE_LOCKED",
  "REQUIRED_DELIVERABLES_MISSING",
  "PURCHASE_ALREADY_OWNED",
  "PURCHASE_NOT_FOUND",
  "PAYMENT_INSUFFICIENT_BALANCE",
  "PAYMENT_SERVICE_UNAVAILABLE",
  "ENTITLEMENT_EXPIRED",
  "RATING_NOT_ALLOWED",
  "RATING_ALREADY_EXISTS",
  "VALIDATION_ERROR",
  "UPLOAD_METADATA_MISMATCH",
  "UPLOAD_OBJECT_NOT_FOUND",
  "UPLOAD_AUTHORIZATION_EXPIRED",
  "INVALID_UPLOAD_TOKEN",
  "STORAGE_UNAVAILABLE",
  "UNAUTHENTICATED",
  "MEDIA_INSPECTION_UNAVAILABLE",
  "SELF_PURCHASE_NOT_ALLOWED",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "INTERNAL_ERROR",
] as const;

export type AiPlaceErrorCode = (typeof AI_PLACE_ERROR_CODES)[number];

const AI_PLACE_ERROR_MESSAGES: Record<AiPlaceErrorCode, string> = {
  PRODUCT_NOT_FOUND: "This AI product is no longer available.",
  PRODUCT_NOT_OWNED: "You do not own this AI product.",
  PRODUCT_NOT_PUBLISHED: "This AI product is not currently published.",
  INVALID_PRODUCT_STATE: "This action is not available in the product's current state.",
  DELIVERABLE_LOCKED: "Protected deliverables are locked after the product's first publication.",
  REQUIRED_DELIVERABLES_MISSING:
    "All required protected deliverables must be confirmed before publishing.",
  PURCHASE_ALREADY_OWNED: "You already own this AI product.",
  PURCHASE_NOT_FOUND: "This purchase could not be found.",
  PAYMENT_INSUFFICIENT_BALANCE:
    "Your wallet balance is insufficient. The purchase remains pending for retry.",
  PAYMENT_SERVICE_UNAVAILABLE:
    "Payment is temporarily unavailable. Please try again later.",
  ENTITLEMENT_EXPIRED: "Your download entitlement has expired.",
  RATING_NOT_ALLOWED: "You are not eligible to manage a rating for this purchase.",
  RATING_ALREADY_EXISTS: "A rating already exists for this purchase.",
  VALIDATION_ERROR: "Please correct the highlighted fields and try again.",
  UPLOAD_METADATA_MISMATCH:
    "The uploaded file could not be verified. Request a new upload authorization and try again.",
  UPLOAD_OBJECT_NOT_FOUND:
    "The uploaded file could not be found. Request a new upload authorization and try again.",
  UPLOAD_AUTHORIZATION_EXPIRED:
    "The upload authorization has expired. Request a new upload authorization and try again.",
  INVALID_UPLOAD_TOKEN:
    "The upload authorization is invalid. Request a new upload authorization and try again.",
  STORAGE_UNAVAILABLE:
    "Secure file storage is temporarily unavailable. Please try again later.",
  UNAUTHENTICATED: "Sign in is required to use AI Place.",
  MEDIA_INSPECTION_UNAVAILABLE:
    "Video preview validation is temporarily unavailable. Please use an image preview or try again later.",
  SELF_PURCHASE_NOT_ALLOWED: "You cannot purchase your own AI product.",
  UNAUTHORIZED: "Sign in is required to use AI Place.",
  FORBIDDEN: "You do not have permission to perform this AI Place action.",
  INTERNAL_ERROR: "An unexpected AI Place error occurred. Please try again.",
};

export type ExtractedAiPlaceError = {
  code: AiPlaceErrorCode;
  message: string;
  fieldErrors?: ApiFieldErrors;
  details?: unknown;
  requestId?: string;
};

export function isAiPlaceErrorCode(value: unknown): value is AiPlaceErrorCode {
  return (
    typeof value === "string" &&
    (AI_PLACE_ERROR_CODES as readonly string[]).includes(value)
  );
}

export function extractAiPlaceError(
  error: unknown,
): ExtractedAiPlaceError | null {
  if (!isAxiosError<APIResponse<AiPlaceApiError>>(error)) {
    return null;
  }

  const response = error.response?.data;
  const apiError = response?.result;

  if (!apiError || !isAiPlaceErrorCode(apiError.errorCode)) {
    return null;
  }

  return {
    code: apiError.errorCode,
    message: response.message || AI_PLACE_ERROR_MESSAGES[apiError.errorCode],
    fieldErrors: apiError.fieldErrors,
    details: apiError.details,
    requestId: apiError.requestId,
  };
}

export function getAiPlaceErrorMessage(error: unknown): string {
  const extracted = extractAiPlaceError(error);

  if (extracted) {
    return extracted.message || AI_PLACE_ERROR_MESSAGES[extracted.code];
  }

  if (isAxiosError<APIResponse<AiPlaceApiError>>(error)) {
    return error.response?.data?.message || error.message;
  }

  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

export function getAiPlaceDefaultErrorMessage(code: AiPlaceErrorCode): string {
  return AI_PLACE_ERROR_MESSAGES[code];
}
