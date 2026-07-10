export type StorageUploadOptions = {
  cacheControl?: string;
  upsert?: boolean;
  contentType?: string;
};

export type UploadPublicStorageObjectRequest = {
  bucket: string;
  path: string;
  file: File;
  options?: StorageUploadOptions;
};

export type UploadedStorageObject = {
  bucket: string;
  path: string;
  publicUrl: string;
  originalFileName: string;
  contentType: string;
  sizeBytes: number;
};

export type StorageOperationErrorCode =
  | "INVALID_UPLOAD_REQUEST"
  | "STORAGE_UPLOAD_FAILED"
  | "PUBLIC_URL_UNAVAILABLE";
