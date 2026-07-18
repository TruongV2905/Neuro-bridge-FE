import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useSelector } from "react-redux";

import api from "@/configs/api";
import type { RootState } from "@/redux/store";
import type { APIResponse } from "@/types/common.starter";
import { UserRole, type UserResponse } from "@/types/user/user.type";
import type {
  WorkspaceDocument,
  WorkspaceDocumentUpdateRequest,
  WorkspaceDashboardPage,
  WorkspaceDetail,
  WorkspaceMember,
} from "@/types/workspace.type";

const WORKSPACE_ENDPOINT = "/workspace/api/v1/workspaces";
const WORKSPACE_MEMBER_ENDPOINT = "/workspace/api/v1/workspace-members";
const WORKSPACE_DOCUMENT_ENDPOINT = "/workspace/api/workspace";

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
  document: (workspaceId: string) =>
    [...workspaceKeys.all, "document", workspaceId] as const,
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

export async function getWorkspaceDocument(workspaceId: string) {
  const { data } = await api.get<WorkspaceDocument>(
    `${WORKSPACE_DOCUMENT_ENDPOINT}/${encodeURIComponent(workspaceId)}/document`,
  );

  return data;
}

export type UpdateWorkspaceDocumentVariables = {
  workspaceId: string;
  request: WorkspaceDocumentUpdateRequest;
};

export async function updateWorkspaceDocument({
  workspaceId,
  request,
}: UpdateWorkspaceDocumentVariables) {
  const { data } = await api.put<WorkspaceDocument>(
    `${WORKSPACE_DOCUMENT_ENDPOINT}/${encodeURIComponent(workspaceId)}/document`,
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

export function useWorkspaceDocument(workspaceId?: string | null) {
  const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId);

  return useQuery<WorkspaceDocument, WorkspaceApiError>({
    queryKey: normalizedWorkspaceId
      ? workspaceKeys.document(normalizedWorkspaceId)
      : workspaceKeys.document(""),
    queryFn: () => getWorkspaceDocument(normalizedWorkspaceId ?? ""),
    enabled: Boolean(normalizedWorkspaceId),
    retry: 0,
  });
}

export function useUpdateWorkspaceDocument() {
  const queryClient = useQueryClient();

  return useMutation<
    WorkspaceDocument,
    WorkspaceApiError,
    UpdateWorkspaceDocumentVariables
  >({
    mutationFn: updateWorkspaceDocument,
    retry: 0,
    onSuccess: async (_document, { workspaceId }) => {
      await queryClient.invalidateQueries({
        queryKey: workspaceKeys.document(workspaceId),
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
