import type { UploadedStorageObject } from "@/types/storage.type";
import type {
  SubmissionDraftFile,
  SubmissionFileType,
} from "@/types/submission-package.type";

export const SUBMISSION_STORAGE_BUCKET = "submission-files";

export function sanitizeSubmissionFileName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "-");
}

export function createSubmissionStoragePath(
  fileType: SubmissionFileType,
  fileName: string,
) {
  const safeFileName = sanitizeSubmissionFileName(fileName);

  return `submission-packages/${fileType.toLowerCase()}/${crypto.randomUUID()}-${safeFileName}`;
}

export function formatSubmissionFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function mapUploadedStorageObjectToSubmissionDraftFile(
  uploadedObject: UploadedStorageObject,
  fileType: SubmissionFileType,
): SubmissionDraftFile {
  return {
    fileId: crypto.randomUUID(),
    fileType,
    fileName: uploadedObject.originalFileName,
    fileSize: formatSubmissionFileSize(uploadedObject.sizeBytes),
    fileMimeType: uploadedObject.contentType,
    uploadedAt: getCurrentTime(),
    previewUrl: uploadedObject.publicUrl,
    downloadUrl: uploadedObject.publicUrl,
    storagePath: uploadedObject.path,
  };
}

function getCurrentTime() {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
