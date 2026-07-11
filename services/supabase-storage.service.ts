import { supabase } from "@/configs/supabase";
import type {
  StorageOperationErrorCode,
  UploadedStorageObject,
  UploadPublicStorageObjectRequest,
} from "@/types/storage.type";

export class StorageOperationError extends Error {
  readonly code: StorageOperationErrorCode;

  constructor(code: StorageOperationErrorCode, message: string) {
    super(message);
    this.name = "StorageOperationError";
    this.code = code;
    Object.setPrototypeOf(this, StorageOperationError.prototype);
  }
}

export function isStorageOperationError(
  error: unknown,
): error is StorageOperationError {
  return error instanceof StorageOperationError;
}

export async function uploadPublicStorageObject({
  bucket,
  path,
  file,
  options,
}: UploadPublicStorageObjectRequest): Promise<UploadedStorageObject> {
  const normalizedBucket = bucket.trim();
  const normalizedPath = path.trim();

  if (!normalizedBucket) {
    throw new StorageOperationError(
      "INVALID_UPLOAD_REQUEST",
      "Storage bucket is required",
    );
  }

  if (!normalizedPath) {
    throw new StorageOperationError(
      "INVALID_UPLOAD_REQUEST",
      "Storage path is required",
    );
  }

  if (!isBrowserFile(file)) {
    throw new StorageOperationError(
      "INVALID_UPLOAD_REQUEST",
      "Storage file is required",
    );
  }

  let uploadedPath = normalizedPath;

  try {
    const { data: uploadData, error } = await supabase.storage
      .from(normalizedBucket)
      .upload(normalizedPath, file, options);

    if (error) {
      throw new StorageOperationError(
        "STORAGE_UPLOAD_FAILED",
        getSafeErrorMessage(error, "Storage upload failed"),
      );
    }

    uploadedPath = uploadData?.path || normalizedPath;
  } catch (error) {
    if (isStorageOperationError(error)) {
      throw error;
    }

    throw new StorageOperationError(
      "STORAGE_UPLOAD_FAILED",
      getSafeErrorMessage(error, "Storage upload failed"),
    );
  }

  let publicUrl = "";

  try {
    const { data } = supabase.storage
      .from(normalizedBucket)
      .getPublicUrl(uploadedPath);

    publicUrl = data.publicUrl;
  } catch (error) {
    throw new StorageOperationError(
      "PUBLIC_URL_UNAVAILABLE",
      getSafeErrorMessage(error, "Storage public URL could not be generated"),
    );
  }

  if (!publicUrl) {
    throw new StorageOperationError(
      "PUBLIC_URL_UNAVAILABLE",
      "Storage public URL could not be generated",
    );
  }

  return {
    bucket: normalizedBucket,
    path: uploadedPath,
    publicUrl,
    originalFileName: file.name,
    contentType: options?.contentType || file.type || "application/octet-stream",
    sizeBytes: file.size,
  };
}

function isBrowserFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

function getSafeErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallbackMessage;
}
