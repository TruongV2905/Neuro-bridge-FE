export type PersonalReportReason =
  | "SPAM"
  | "HARASSMENT"
  | "FAKE_PROFILE"
  | "OTHER";

export type PersonalReportStatus =
  | "PENDING"
  | "REVIEWING"
  | "RESOLVED"
  | "REJECTED";

export type DisputeReason =
  | "LATE_DELIVERY"
  | "INCORRECT_DELIVERY"
  | "INCOMPLETE_DELIVERABLES"
  | "UNJUSTIFIED_REJECTION"
  | "UNFAIR_DEADLINE_PRESSURE"
  | "OTHER";

export type DisputeStatus =
  | "OPEN"
  | "IN_REVIEW"
  | "WAITING_FOR_EVIDENCE"
  | "RESOLVED_CLIENT_WINS"
  | "RESOLVED_EXPERT_WINS"
  | "CLOSED";

export type EvidenceReferenceType = "DISPUTE" | "PERSONAL_REPORT";

export type ReportUserSummary = {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
};

export type PersonalReport = {
  reportId: string;
  reporterId: string;
  reportedUserId: string;
  reason: PersonalReportReason;
  description: string;
  createdAt: string;
  status: PersonalReportStatus;
  resolvedAt?: string;
};

export type PersonalReportRecord = PersonalReport & {
  reporter: ReportUserSummary;
  reportedUser: ReportUserSummary;
};

export type SubmissionPackage = {
  packageId: string;
  workspaceId: string;
  version: number;
  notes: string;
  submittedAt: string;
  feedback?: string;
};

export type ProjectEscrow = {
  escrowId: string;
  projectId: string;
  status: "HELD" | "RELEASED" | "REFUNDED";
};

export type Dispute = {
  disputeId: string;
  workspaceId: string;
  submissionPackageId: string;
  initiatorId: string;
  accusedId: string;
  adminId?: string;
  reason: DisputeReason;
  status: DisputeStatus;
  detailedDescription: string;
  resolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
};

export type DisputeRecord = Dispute & {
  initiator: ReportUserSummary;
  accused: ReportUserSummary;
  admin?: ReportUserSummary;
  submissionPackage: SubmissionPackage;
  projectEscrow: ProjectEscrow;
};

export type Evidence = {
  evidenceId: string;
  referenceId: string;
  referenceType: EvidenceReferenceType;
  uploaderId: string;
  fileUrl: string;
  description: string;
  uploadedAt: string;
  isDeleted: boolean;
};

export type EvidenceRecord = Evidence & {
  uploader: ReportUserSummary;
};
