import type {
  DeliverableFile,
  SubmissionDraftFile,
  SubmissionFileRequest,
  SubmissionPackageSummary,
} from "@/types/submission-package.type";

import { submissionFileSlots } from "../constants/submission-file-slots";
import { normalizeStatus, normalizeText } from "./submission-display";

export type ExpertSubmissionPackage = {
  packageId: string;
  version: number;
  status: string;
  submittedAt: string;
  note: string;
  feedback: string | null;
  files: SubmissionDraftFile[];
};

export type ExpertSubmissionAction =
  | "INITIAL_SUBMIT"
  | "RESUBMIT"
  | "PENDING_LOCKED"
  | "UNDER_REVIEW_LOCKED"
  | "COMPLETED_LOCKED"
  | "DISPUTED_LOCKED"
  | "ARCHIVED_LOCKED"
  | "UNKNOWN_LOCKED";

export type ExpertSubmissionAvailability = {
  action: ExpertSubmissionAction;
  canSubmit: boolean;
  label: string;
  message: string;
};

export function getExpertSubmissionAvailability({
  workspaceStatus,
  projectStatus,
  latestPackage,
  isSubmitting,
  isUploading,
  hasAcceptedSubmission,
}: {
  workspaceStatus?: string | null;
  projectStatus?: string | null;
  latestPackage?: SubmissionPackageSummary | null;
  isSubmitting: boolean;
  isUploading: boolean;
  hasAcceptedSubmission: boolean;
}): ExpertSubmissionAvailability {
  if (isSubmitting || isUploading) {
    return {
      action: "PENDING_LOCKED",
      canSubmit: false,
      label: "Submission in progress",
      message: "Please wait for the current upload or submission to finish.",
    };
  }

  if (normalizeStatus(workspaceStatus) === "ARCHIVED") {
    return {
      action: "ARCHIVED_LOCKED",
      canSubmit: false,
      label: "Workspace archived",
      message: "This workspace is archived, so submissions are locked.",
    };
  }

  const normalizedProjectStatus = normalizeStatus(projectStatus);

  if (normalizedProjectStatus === "REVISION_REQUESTED") {
    return {
      action: "RESUBMIT",
      canSubmit: true,
      label: "Resubmit Package",
      message: "The client requested changes. You can resubmit the package.",
    };
  }

  if (hasAcceptedSubmission) {
    return {
      action: "UNDER_REVIEW_LOCKED",
      canSubmit: false,
      label: "Under review",
      message:
        "The package was accepted and is waiting for the project status to refresh.",
    };
  }

  if (
    (normalizedProjectStatus === "ACTIVE" ||
      normalizedProjectStatus === "IN_PROGRESS") &&
    !latestPackage
  ) {
    return {
      action: "INITIAL_SUBMIT",
      canSubmit: true,
      label: "Submit Package",
      message: "Upload all required deliverables to submit the first package.",
    };
  }

  if (normalizedProjectStatus === "UNDER_REVIEW") {
    return {
      action: "UNDER_REVIEW_LOCKED",
      canSubmit: false,
      label: "Under review",
      message: "This package is under client review.",
    };
  }

  if (normalizedProjectStatus === "COMPLETED") {
    return {
      action: "COMPLETED_LOCKED",
      canSubmit: false,
      label: "Project completed",
      message: "This project is completed, so submissions are locked.",
    };
  }

  if (normalizedProjectStatus === "DISPUTED") {
    return {
      action: "DISPUTED_LOCKED",
      canSubmit: false,
      label: "Project disputed",
      message: "This project is disputed, so submissions are locked.",
    };
  }

  return {
    action: "UNKNOWN_LOCKED",
    canSubmit: false,
    label: "Submission locked",
    message: latestPackage
      ? "A package already exists. Resubmission requires REVISION_REQUESTED project status."
      : "The current project status does not support submission.",
  };
}

export function mapSubmissionPackage(
  item: SubmissionPackageSummary,
  files: DeliverableFile[],
): ExpertSubmissionPackage {
  return {
    packageId: item.packageId,
    version: item.version,
    status: item.status,
    submittedAt: item.submittedAt ?? "",
    note: item.notes ?? "",
    feedback: item.feedback,
    files: files.filter((file) => !file.isDelete).map(mapDeliverableFile),
  };
}

export function mapDeliverableFile(file: DeliverableFile): SubmissionDraftFile {
  return {
    fileId: file.fileId,
    fileType: file.fileType,
    fileName: file.fileName,
    fileSize: file.fileSize,
    fileMimeType: "",
    uploadedAt: file.uploadedAt,
    previewUrl: file.fileUrl,
    downloadUrl: file.fileUrl,
    storagePath: file.fileUrl,
  };
}

export function mapSubmissionFileRequest(
  file: SubmissionDraftFile,
): SubmissionFileRequest {
  return {
    fileName: file.fileName,
    fileUrl: file.previewUrl,
    fileSize: file.fileSize,
    fileType: file.fileType,
  };
}

export function parseCustomReleaseDays(
  value: string,
): { value: number | null } | { error: string } {
  const normalized = value.trim();

  if (!normalized) {
    return { value: null };
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    return {
      error:
        "Release day must be a positive whole number, or left empty for the backend default.",
    };
  }

  return { value: parsed };
}

export function validateSubmissionFiles(files: SubmissionDraftFile[]) {
  if (files.length !== submissionFileSlots.length) {
    return "Please upload all required deliverable slots before submitting.";
  }

  const missingMetadata = files.some((file) => {
    return (
      !normalizeText(file.fileName) ||
      !normalizeText(file.previewUrl) ||
      !normalizeText(file.fileType) ||
      !normalizeText(file.fileSize)
    );
  });

  if (missingMetadata) {
    return "One or more uploaded files is missing required metadata.";
  }

  return null;
}
