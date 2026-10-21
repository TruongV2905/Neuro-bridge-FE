import type { UploadAuthorization } from "@/features/ai-place/types";

export class DirectStorageUploadError extends Error {
  constructor(message = "The file could not be uploaded to secure storage. Please try again.") {
    super(message);
    this.name = "DirectStorageUploadError";
  }
}

/**
 * Uploads only to the short-lived destination issued by AI Available. This
 * intentionally uses fetch rather than the gateway Axios client so a Neuro
 * Bridge bearer token is never attached to the storage request.
 */
export async function uploadToAuthorizedStorage(
  authorization: UploadAuthorization,
  file: File,
): Promise<void> {
  if (!file.type) {
    throw new DirectStorageUploadError("This file has no media type. Choose a file with a recognized media type.");
  }

  const requiredContentType = Object.entries(authorization.requiredHeaders).find(
    ([headerName]) => headerName.toLowerCase() === "content-type",
  )?.[1];

  if (requiredContentType && requiredContentType.toLowerCase() !== file.type.toLowerCase()) {
    throw new DirectStorageUploadError("The selected file type no longer matches its upload authorization. Please try again.");
  }

  const headers = new Headers(authorization.requiredHeaders);
  headers.set("Content-Type", file.type);

  let response: Response;
  try {
    response = await fetch(authorization.uploadUrl, {
      method: authorization.uploadMethod,
      headers,
      body: file,
    });
  } catch {
    throw new DirectStorageUploadError();
  }

  if (!response.ok) {
    throw new DirectStorageUploadError();
  }
}
