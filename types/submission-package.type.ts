export type SubmissionFileType = string;

export type SubmissionPackageSummary = {
  packageId: string;
  workspaceId: string;
  version: number;
  notes: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  autoReleaseAt: string | null;
  status: string;
  feedback: string | null;
  isDelete: boolean;
};

export type DeliverableFile = {
  fileId: string;
  packageId: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  fileType: SubmissionFileType;
  uploadedAt: string;
  isDelete: boolean;
  status?: string | null;
  feedback?: string | null;
  reviewedAt?: string | null;
};

export type SubmissionPackageDetail = SubmissionPackageSummary & {
  deliverableFiles: DeliverableFile[];
};

export type SubmissionFileRequest = {
  fileName: string;
  fileUrl: string;
  fileSize: string;
  fileType: SubmissionFileType;
};

export type SubmissionDraftFile = {
  fileId: string;
  fileType: SubmissionFileType;
  fileName: string;
  fileSize: string;
  fileMimeType: string;
  uploadedAt: string;
  previewUrl: string;
  downloadUrl: string;
  storagePath: string;
};

export type CreateSubmissionPackageRequest = {
  workspaceId: string;
  notes: string;
  files: SubmissionFileRequest[];
  customReleaseDays: number;
};

export type ExpertSubmitWorkspacePackageRequest = {
  workspaceId: string;
  notes: string;
  files: SubmissionFileRequest[];
  customReleaseDays: number | null;
};

export type ExpertSubmitWorkspaceDeliverableFile = {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  fileType: SubmissionFileType;
};

export type ExpertSubmitWorkspacePackageResponse = {
  packageId: string;
  workspaceId: string;
  version: number;
  notes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  autoReleaseAt: string | null;
  status: string;
  feedback: string | null;
  files: ExpertSubmitWorkspaceDeliverableFile[];
};

export type ResubmitSubmissionPackageRequest = {
  currentPackageId: string;
  notes: string;
  updatedFiles: SubmissionFileRequest[];
};

export type ReviewSubmissionPackageRequest = {
  packageId: string;
  feedback: string;
};

export type SubmissionReviewResponse = SubmissionPackageSummary;

export type DeliverableFileReviewStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REVISION_REQUIRED"
  | "SUPERSEDED";

export type ReviewDeliverableFileRequest = {
  fileId: string;
  newStatus: DeliverableFileReviewStatus;
  feedback?: string;
};

export type CreateSubmissionPackageMutationVariables = {
  request: CreateSubmissionPackageRequest;
};

export type ExpertSubmitWorkspacePackageMutationVariables = {
  request: ExpertSubmitWorkspacePackageRequest;
};

export type ResubmitSubmissionPackageMutationVariables = {
  packageId: string;
  workspaceId: string;
  request: ResubmitSubmissionPackageRequest;
};

export type RejectSubmissionPackageMutationVariables = {
  packageId: string;
  workspaceId: string;
  feedback: string;
};

export type ApproveSubmissionPackageMutationVariables = {
  packageId: string;
  workspaceId: string;
  feedback?: string;
};

export type ReviewDeliverableFileMutationVariables = {
  workspaceId: string;
  packageId: string;
  request: ReviewDeliverableFileRequest;
};
