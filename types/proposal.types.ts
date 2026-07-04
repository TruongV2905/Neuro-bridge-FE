export interface ProposalRequest {
  title: string;
  strategySummary: string;
}

export interface ProposalResponse {
  id: string;
  title: string;
  strategySummary: string;
  unlockCost?: number;
}

export interface ProposalUnlockRequest {
  strategyDetail?: string;
  unlockCost?: number;
}

export interface ProposalUnlockResponse {
  id: string;
  createdAt: string;
  strategyDetail: string;
  unlockCost: number;
}

export interface ExpertApplyRequest {
  jobPostId: string;
  proposedBudget: number;
  estimatedDays: number;
  expertCode: string;
}

export interface ExpertApplyResponse {
  id: string;
  proposedBudget: number;
  estimatedDays: number;
  expertCode: string;
}

export interface ApplyJobPostRequest {
  expertApplyRequest: ExpertApplyRequest;
  proposalRequest: ProposalRequest;
  proposalUnlockRequest?: ProposalUnlockRequest;
}

export interface ApplyJobPostResponse {
  expertApply: ExpertApplyResponse;
  proposalResponse?: ProposalResponse | null;
  proposalUnlock?: ProposalUnlockResponse;
}

export interface HireResponse {
  workspaceId: string;
  jobPostId: string;
  expertCode: string;
  message: string;
}
