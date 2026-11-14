export type ContractStatus =
  | "PENDING"
  | "CLIENT_SIGNED"
  | "EXPERT_SIGNED"
  | "FULLY_SIGNED"
  | "CANCELLED";

export type ContractDetail = {
  id: string;
  jobPostId?: string;
  clientCode?: string;
  expertCode?: string;
  clientSigned: boolean;
  expertSigned: boolean;
  status: ContractStatus;
  proposedBudget?: number;
  estimatedDays?: number;
  workspaceId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type HireResponse = {
  contractId?: string;
  workspaceId?: string | null;
  jobPostId?: string;
  expertCode?: string;
  message?: string;
  shortfallAmount?: number | null;
};
