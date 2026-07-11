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

export type ResubmitSubmissionPackageRequest = {
  currentPackageId: string;
  notes: string;
  updatedFiles: SubmissionFileRequest[];
};

export type CreateSubmissionPackageMutationVariables = {
  request: CreateSubmissionPackageRequest;
};

export type ResubmitSubmissionPackageMutationVariables = {
  packageId: string;
  workspaceId: string;
  request: ResubmitSubmissionPackageRequest;
};
