import { supabase } from "@/configs/supabase";
import type {
  UploadedStorageObject,
  UploadPublicStorageObjectRequest,
} from "@/types/storage.type";

export async function uploadPublicStorageObject({
  bucket,
  path,
  file,
  options,
}: UploadPublicStorageObjectRequest): Promise<UploadedStorageObject> {
  const normalizedBucket = bucket.trim();
  const normalizedPath = path.trim();

  if (!normalizedBucket) {
    throw new Error("Storage bucket is required");
  }

  if (!normalizedPath) {
    throw new Error("Storage path is required");
  }

  if (!isBrowserFile(file)) {
    throw new Error("Storage file is required");
  }

  const { data: uploadData, error } = await supabase.storage
    .from(normalizedBucket)
    .upload(normalizedPath, file, options);

  if (error) {
    throw new Error(error.message || "Storage upload failed");
  }

  const uploadedPath = uploadData?.path || normalizedPath;
  const { data } = supabase.storage
    .from(normalizedBucket)
    .getPublicUrl(uploadedPath);

  if (!data.publicUrl) {
    throw new Error("Storage public URL could not be generated");
  }

  return {
    bucket: normalizedBucket,
    path: uploadedPath,
    publicUrl: data.publicUrl,
    originalFileName: file.name,
    contentType: options?.contentType || file.type || "application/octet-stream",
    sizeBytes: file.size,
  };
}

function isBrowserFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}
