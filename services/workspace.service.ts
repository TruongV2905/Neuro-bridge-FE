import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useSelector } from "react-redux";

import api from "@/configs/api";
import type { RootState } from "@/redux/store";
import type { APIResponse } from "@/types/common.starter";
import { UserRole, type UserResponse } from "@/types/user/user.type";
import type {
  ProposalStrategy,
  ProposalStrategyUpdateRequest,
  WorkspaceDashboardPage,
  WorkspaceDetail,
  WorkspaceMember,
} from "@/types/workspace.type";

const WORKSPACE_ENDPOINT = "/workspace/api/v1/workspaces";
const WORKSPACE_MEMBER_ENDPOINT = "/workspace/api/v1/workspace-members";
const PROPOSAL_STRATEGY_ENDPOINT = "/workspace/api/workspace";

type WorkspaceApiError = AxiosError<APIResponse<null>>;

export const workspaceKeys = {
  all: ["workspace"] as const,
  detail: (workspaceId: string) =>
    [...workspaceKeys.all, "detail", workspaceId] as const,
  dashboard: (
    userCode: string,
    role: UserRole.CLIENT | UserRole.EXPERT,
    pageNo: number,
    pageSize: number,
  ) =>
    [
      ...workspaceKeys.all,
      "user",
      userCode,
      role,
      "dashboard",
      pageNo,
      pageSize,
    ] as const,
  members: (workspaceId: string) =>
    [...workspaceKeys.all, "members", workspaceId] as const,
  proposalStrategy: (workspaceId: string) =>
    [...workspaceKeys.all, "proposal-strategy", workspaceId] as const,
};

export type WorkspaceDashboardParams = {
  pageNo: number;
  pageSize: number;
};

export async function getWorkspaceDetail(workspaceId: string) {
  const { data } = await api.get<WorkspaceDetail>(
    `${WORKSPACE_ENDPOINT}/${encodeURIComponent(workspaceId)}`,
  );

  return data;
}

export async function getWorkspaceDashboard({
  pageNo,
  pageSize,
}: WorkspaceDashboardParams) {
  const { data } = await api.get<WorkspaceDashboardPage>(
    `${WORKSPACE_ENDPOINT}/dashboard`,
    {
      params: {
        pageNo,
        pageSize,
      },
    },
  );

  return data;
}

export async function getWorkspaceMembers(workspaceId: string) {
  const { data } = await api.get<APIResponse<WorkspaceMember[]>>(
    `${WORKSPACE_MEMBER_ENDPOINT}/workspace/${encodeURIComponent(workspaceId)}`,
  );

  return data;
}

export async function getProposalStrategy(workspaceId: string) {
  const { data } = await api.get<ProposalStrategy>(
    `${PROPOSAL_STRATEGY_ENDPOINT}/${encodeURIComponent(workspaceId)}/proposal-strategy`,
  );

  return data;
}

export type UpdateProposalStrategyVariables = {
  workspaceId: string;
  request: ProposalStrategyUpdateRequest;
};

export async function updateProposalStrategy({
  workspaceId,
  request,
}: UpdateProposalStrategyVariables) {
  const { data } = await api.patch<ProposalStrategy>(
    `${PROPOSAL_STRATEGY_ENDPOINT}/${encodeURIComponent(workspaceId)}/proposal-strategy`,
    request,
  );

  return data;
}

export function useWorkspaceDetail(workspaceId?: string | null) {
  const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId);

  return useQuery<WorkspaceDetail, WorkspaceApiError>({
    queryKey: normalizedWorkspaceId
      ? workspaceKeys.detail(normalizedWorkspaceId)
      : workspaceKeys.detail(""),
    queryFn: () => getWorkspaceDetail(normalizedWorkspaceId ?? ""),
    enabled: Boolean(normalizedWorkspaceId),
    retry: 0,
  });
}

export function useWorkspaceMembers(workspaceId?: string | null) {
  const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId);

  return useQuery<APIResponse<WorkspaceMember[]>, WorkspaceApiError>({
    queryKey: normalizedWorkspaceId
      ? workspaceKeys.members(normalizedWorkspaceId)
      : workspaceKeys.members(""),
    queryFn: () => getWorkspaceMembers(normalizedWorkspaceId ?? ""),
    enabled: Boolean(normalizedWorkspaceId),
    retry: 0,
  });
}

export function useProposalStrategy(workspaceId?: string | null) {
  const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId);

  return useQuery<ProposalStrategy, WorkspaceApiError>({
    queryKey: normalizedWorkspaceId
      ? workspaceKeys.proposalStrategy(normalizedWorkspaceId)
      : workspaceKeys.proposalStrategy(""),
    queryFn: () => getProposalStrategy(normalizedWorkspaceId ?? ""),
    enabled: Boolean(normalizedWorkspaceId),
    retry: 0,
  });
}

export function useUpdateProposalStrategy() {
  const queryClient = useQueryClient();

  return useMutation<
    ProposalStrategy,
    WorkspaceApiError,
    UpdateProposalStrategyVariables
  >({
    mutationFn: updateProposalStrategy,
    retry: 0,
    onSuccess: async (_strategy, { workspaceId }) => {
      await queryClient.invalidateQueries({
        queryKey: workspaceKeys.proposalStrategy(workspaceId),
      });
    },
  });
}

export function useWorkspaceDashboard({
  pageNo,
  pageSize,
}: WorkspaceDashboardParams) {
  const currentUser = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null;
  const userCode = currentUser?.code?.trim() ?? "";
  const role = getSupportedWorkspaceDashboardRole(currentUser?.role);

  return useQuery<WorkspaceDashboardPage, WorkspaceApiError>({
    queryKey: role
      ? workspaceKeys.dashboard(userCode, role, pageNo, pageSize)
      : [
          ...workspaceKeys.all,
          "user",
          userCode,
          "unsupported",
          "dashboard",
          pageNo,
          pageSize,
        ],
    queryFn: () => getWorkspaceDashboard({ pageNo, pageSize }),
    enabled: Boolean(userCode && role),
    retry: 0,
  });
}

function normalizeWorkspaceId(workspaceId?: string | null) {
  if (typeof workspaceId !== "string") {
    return null;
  }

  const normalized = workspaceId.trim();

  return normalized.length > 0 ? normalized : null;
}

function getSupportedWorkspaceDashboardRole(role?: UserRole | null) {
  return role === UserRole.CLIENT || role === UserRole.EXPERT ? role : null;
}
