export type ContractStatus =
  | "PENDING"
  | "CLIENT_SIGNED"
  | "EXPERT_SIGNED"
  | "FULLY_SIGNED";

export type ContractResponse = {
  id: string;
  jobId: string;
  proposalUnlockId: string | null;
  clientCode?: string | null;
  expertCode?: string | null;
  projectName?: string | null;
  deadline?: string | null;
  strategyDetail: string | null;
  unlockCost: number;
  proposedBudget?: number | null;
  clientSigned: boolean;
  clientSignedAt?: string | null;
  expertSigned: boolean;
  expertSignedAt?: string | null;
  status: ContractStatus;
  workspaceId: string | null;
};
