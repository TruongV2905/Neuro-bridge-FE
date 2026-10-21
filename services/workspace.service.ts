import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import api from "@/configs/api";
import type { APIResponse } from "@/types/common.starter";
import type {
  WorkspaceDashboardPage,
  WorkspaceDetail,
  WorkspaceMember,
} from "@/types/workspace.type";

const WORKSPACE_ENDPOINT = "/workspace/api/v1/workspaces";
const WORKSPACE_MEMBER_ENDPOINT = "/workspace/api/v1/workspace-members";

type WorkspaceApiError = AxiosError<APIResponse<null>>;

export const workspaceKeys = {
  all: ["workspace"] as const,
  detail: (workspaceId: string) =>
    [...workspaceKeys.all, "detail", workspaceId] as const,
  dashboard: (pageNo: number, pageSize: number) =>
    [...workspaceKeys.all, "dashboard", pageNo, pageSize] as const,
  members: (workspaceId: string) =>
    [...workspaceKeys.all, "members", workspaceId] as const,
};

export async function getWorkspaceDetail(workspaceId: string) {
  const { data } = await api.get<WorkspaceDetail>(
    `${WORKSPACE_ENDPOINT}/${encodeURIComponent(workspaceId)}`,
  );

  return data;
}

export type WorkspaceDashboardParams = {
  pageNo: number;
  pageSize: number;
};

export async function getWorkspaceDashboard({
  pageNo,
  pageSize,
}: WorkspaceDashboardParams) {
  const { data } = await api.get<WorkspaceDashboardPage>(
    `${WORKSPACE_ENDPOINT}/dashboard`,
    {
      params: { pageNo, pageSize },
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

export function useWorkspaceDashboard({
  pageNo,
  pageSize,
}: WorkspaceDashboardParams) {
  return useQuery<WorkspaceDashboardPage, WorkspaceApiError>({
    queryKey: workspaceKeys.dashboard(pageNo, pageSize),
    queryFn: () => getWorkspaceDashboard({ pageNo, pageSize }),
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
