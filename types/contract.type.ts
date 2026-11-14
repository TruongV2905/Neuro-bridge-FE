export type ContractStatus =
  | "PENDING"
  | "CLIENT_SIGNED"
  | "EXPERT_SIGNED"
  | "FULLY_SIGNED"
  | "CANCELLED";

export type ContractResponse = {
  id: string;
  jobId?: string;
  jobPostId?: string;
  proposalUnlockId?: string | null;
  clientCode?: string | null;
  expertCode?: string | null;
  projectName?: string | null;
  deadline?: string | null;
  strategyDetail?: string | null;
  unlockCost?: number | null;
  proposedBudget?: number | null;
  estimatedDays?: number | null;
  clientSigned: boolean;
  clientSignedAt?: string | null;
  expertSigned: boolean;
  expertSignedAt?: string | null;
  status: ContractStatus;
  workspaceId: string | null;
  shortfallAmount?: number | null;
};

export type HireExpertResponse = {
  contractId?: string | null;
  workspaceId?: string | null;
  jobPostId?: string;
  expertCode?: string;
  message?: string;
  shortfallAmount?: number | null;
};

export type HireExpertMutationVariables = {
  jobPostId: string;
  expertApplyId: string;
};
