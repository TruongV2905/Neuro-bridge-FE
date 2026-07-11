import { PageRequest } from "./common.starter";
import type { PageResponse } from "./common.starter";

export type CreateJobPostStep = 1 | 2 | 3 | 4;

export type CreateJobPostFormValues = {
  title: string;
  description: string;
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
};

export type CreateJobPostPayload = {
  title: string;
  description: string;
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
};

export type JobPostAnalyzeResponse = {
  title: string;
  description: string;
  requiredSkillIds: number[];
  preferredSkillIds: number[];
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
};
export type JobPostStatus =
  | "PRIVATE"
  | "PUBLIC"
  | "ASSIGNED";

export type JobPostDirection = "ASCENDING" | "DESCENDING";

export type JobPostFilter = {
  requiredSkillIds: number[];
  preferredSkillIds: number[];
  minBudget: number;
  maxBudget: number;
  estimatedDaysFrom: number;
  estimatedDaysTo: number;
  status: JobPostStatus;
};

export type JobPostClientListRequest = {
  page: number;
  size: number;
  sortBy: string;
  direction: JobPostDirection;
  search: string;
  filter: JobPostFilter;
};

export type JobPostListItem = {
  id: string;
  title: string;
  description: string;
  requiredSkillIds: number[];
  preferredSkillIds: number[];
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
  status: JobPostStatus;
  expertApplyCodes: string[];
};

export type JobPost = JobPostListItem;

export type JobPostClientListParams = PageRequest & {
  filter: JobPostFilter;
};

export type JobPostPublicListParams = {
  page: number;
  size: number;
  sortBy: string;
  direction: JobPostDirection;
  search?: string;
  "filter.status": JobPostStatus;
  "filter.minBudget"?: number;
  "filter.maxBudget"?: number;
  "filter.estimatedDaysFrom"?: number;
  "filter.estimatedDaysTo"?: number;
};

export type JobPostAnalyzeRequest = {
  title: string;
  description: string;
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
};

export type RecommendExpertsRequest = JobPostAnalyzeRequest & {
  requiredSkillIds: number[];
  preferredSkillIds: number[];
};

export type UpdateJobPostRequest = {
  title: string;
  description: string;
  requiredSkillIds: number[];
  preferredSkillIds: number[];
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
};

export type UpdateJobPostMutationVariables = {
  jobPostId: string;
  request: UpdateJobPostRequest;
};

export type ChangeJobPostStatusResponse = Record<string, never>;

export type ChangeJobPostStatusMutationVariables = {
  jobPostId: string;
  status: JobPostStatus;
};

export type ExpertApplyRequest = {
  jobPostId: string;
  proposedBudget: number;
  estimatedDays: number;
  expertCode: string;
};

export type ProposalRequest = {
  title: string;
  strategySummary: string;
};

export type ProposalUnlockRequest = {
  strategyDetail: string;
  unlockCost: number;
};

export type ApplyJobPostRequest = {
  expertApplyRequest: ExpertApplyRequest;
  proposalRequest?: ProposalRequest;
  proposalUnlockRequest?: ProposalUnlockRequest;
};

export type ExpertProposal = {
  id: string;
  title: string;
  strategySummary: string;
  unlockCost?: number | null;
};

export type ProposalUnlock = {
  id: string;
  createdAt: string;
  strategyDetail: string;
  unlockCost?: number | null;
};

export type ExpertApply = {
  id: string;
  proposedBudget: number;
  estimatedDays: number;
  expertCode: string;
  status?: string;
};

export type ApplicantProposal = {
  id: string;
  title: string;
  strategySummary: string;
  unlockCost?: number | null;
};

export type ApplicantProposalUnlock = {
  id: string;
  createdAt: string;
  strategyDetail?: string | null;
  unlockCost?: number | null;
};

export type JobPostApplicant = {
  expertApply: ExpertApply;
  proposal: ApplicantProposal | null;
  proposalUnlock?: ApplicantProposalUnlock | null;
};

export type ClientProposalDialogSummary = {
  expertApply: ExpertApply;
  proposal: ApplicantProposal;
};

export type ExpertAppliedJobPost = JobPost;

export type ExpertAppliedJobPostsResponse =
  | ExpertAppliedJobPost[]
  | PageResponse<ExpertAppliedJobPost>;

export type ExpertApplicationViewItem = {
  jobPost: JobPost;
  expertApply: ExpertApply;
  proposal: ApplicantProposal | null;
  proposalUnlock?: ApplicantProposalUnlock | null;
};

export type ExpertProposalListParams = {
  expertCode: string;
  "pageRequest.page": number;
  "pageRequest.size": number;
  "pageRequest.sortBy": string;
  "pageRequest.direction": JobPostDirection;
  "pageRequest.search"?: string;
};

export type UpdateProposalRequest = {
  title: string;
  strategySummary: string;
};

export type UpdateProposalUnlockRequest = {
  strategyDetail: string;
  unlockCost: number;
};
