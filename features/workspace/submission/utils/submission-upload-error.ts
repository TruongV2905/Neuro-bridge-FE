import { isStorageOperationError } from "@/services/supabase-storage.service";

const SUBMISSION_UPLOAD_ERROR_MESSAGE = "Upload file failed. Please try again.";

export function getSubmissionUploadErrorMessage(error: unknown) {
  if (isStorageOperationError(error)) {
    return SUBMISSION_UPLOAD_ERROR_MESSAGE;
  }

  return SUBMISSION_UPLOAD_ERROR_MESSAGE;
}
