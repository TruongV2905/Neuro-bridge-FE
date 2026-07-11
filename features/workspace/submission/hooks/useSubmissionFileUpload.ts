import { useCallback, useState } from "react";

import { uploadPublicStorageObject } from "@/services/supabase-storage.service";
import type {
  SubmissionDraftFile,
  SubmissionFileType,
} from "@/types/submission-package.type";

import {
  createSubmissionStoragePath,
  mapUploadedStorageObjectToSubmissionDraftFile,
  SUBMISSION_STORAGE_BUCKET,
} from "../utils/submission-upload";

export function useSubmissionFileUpload() {
  const [uploadingType, setUploadingType] =
    useState<SubmissionFileType | null>(null);

  const uploadSubmissionFile = useCallback(
    async (
      fileType: SubmissionFileType,
      file: File,
    ): Promise<SubmissionDraftFile> => {
      setUploadingType(fileType);

      try {
        const filePath = createSubmissionStoragePath(fileType, file.name);
        const uploadedObject = await uploadPublicStorageObject({
          bucket: SUBMISSION_STORAGE_BUCKET,
          path: filePath,
          file,
          options: {
            cacheControl: "3600",
            upsert: true,
            contentType: file.type || "application/octet-stream",
          },
        });

        return mapUploadedStorageObjectToSubmissionDraftFile(
          uploadedObject,
          fileType,
        );
      } finally {
        setUploadingType(null);
      }
    },
    [],
  );

  return {
    uploadSubmissionFile,
    uploadingType,
    isUploading: uploadingType !== null,
  };
}
