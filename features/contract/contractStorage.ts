import type { ContractResponse } from "@/types/contract.type";

export type ContractRole = "client" | "expert";

export type ContractHireContext = {
  jobPostId: string;
  expertApplyId: string;
  expertCode?: string;
};

export type SavedContractReference = {
  id: string;
  role: ContractRole;
  jobPostId?: string;
  expertApplyId?: string;
  partnerCode?: string;
  projectName?: string;
  status?: ContractResponse["status"];
  workspaceId?: string | null;
  updatedAt: string;
};

const CONTRACT_HIRE_CONTEXT_PREFIX = "neuro-bridge-contract-hire:";
const CONTRACT_REFERENCE_KEY = "neuro-bridge-contracts";

export function saveContractHireContext(
  contractId: string,
  context: ContractHireContext,
) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(
    getHireContextStorageKey(contractId),
    JSON.stringify(context),
  );

  saveContractReference({
    id: contractId,
    role: "client",
    jobPostId: context.jobPostId,
    expertApplyId: context.expertApplyId,
    partnerCode: context.expertCode,
  });
}

export function readHireContextFromStorage(
  contractId: string,
): ContractHireContext | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(getHireContextStorageKey(contractId));

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ContractHireContext>;

    if (parsed.jobPostId && parsed.expertApplyId) {
      return {
        jobPostId: parsed.jobPostId,
        expertApplyId: parsed.expertApplyId,
        expertCode: parsed.expertCode,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function saveContractReference(
  reference: Omit<SavedContractReference, "updatedAt">,
) {
  if (!canUseStorage()) return;

  const current = readAllContractReferences();
  const nextReference: SavedContractReference = {
    ...reference,
    updatedAt: new Date().toISOString(),
  };
  const next = [
    nextReference,
    ...current.filter(
      (item) => !(item.id === reference.id && item.role === reference.role),
    ),
  ].slice(0, 30);

  window.localStorage.setItem(CONTRACT_REFERENCE_KEY, JSON.stringify(next));
}

export function saveContractReferenceFromResponse(
  contract: ContractResponse,
  role: ContractRole,
  context?: ContractHireContext | null,
) {
  saveContractReference({
    id: contract.id,
    role,
    jobPostId: contract.jobId || context?.jobPostId,
    expertApplyId: context?.expertApplyId,
    partnerCode:
      role === "client"
        ? contract.expertCode || context?.expertCode
        : contract.clientCode || undefined,
    projectName: contract.projectName || undefined,
    status: contract.status,
    workspaceId: contract.workspaceId,
  });
}

export function readSavedContracts(role: ContractRole) {
  if (!canUseStorage()) return [];

  return readAllContractReferences().filter((item) => item.role === role);
}

export function removeSavedContract(contractId: string, role: ContractRole) {
  if (!canUseStorage()) return;

  const next = readAllContractReferences().filter(
    (item) => !(item.id === contractId && item.role === role),
  );

  window.localStorage.setItem(CONTRACT_REFERENCE_KEY, JSON.stringify(next));
}

function readAllContractReferences(): SavedContractReference[] {
  if (!canUseStorage()) return [];

  const raw = window.localStorage.getItem(CONTRACT_REFERENCE_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as SavedContractReference[];

    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item.id && item.role);
    }
  } catch {
    return [];
  }

  return [];
}

function getHireContextStorageKey(contractId: string) {
  return `${CONTRACT_HIRE_CONTEXT_PREFIX}${contractId}`;
}

function canUseStorage() {
  return typeof window !== "undefined";
}
