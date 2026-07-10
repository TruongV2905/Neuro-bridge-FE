import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import api from "@/configs/api";
import type {
  CreateSubmissionPackageMutationVariables,
  CreateSubmissionPackageRequest,
  DeliverableFile,
  ResubmitSubmissionPackageMutationVariables,
  ResubmitSubmissionPackageRequest,
  SubmissionFileType,
  SubmissionPackageDetail,
  SubmissionPackageSummary,
} from "@/types/submission-package.type";

const SUBMISSION_PACKAGE_ENDPOINT =
  "/workspace/api/v1/submission-packages";
const DELIVERABLE_FILE_ENDPOINT =
  "/workspace/api/v1/deliverable-files";
const FILE_TYPE_ENDPOINT = "/workspace/api/v1/file-types";

type SubmissionReadError = AxiosError;
type SubmissionMutationError = AxiosError;

export const submissionPackageKeys = {
  all: ["submission-package"] as const,
  workspace: (workspaceId: string) =>
    [...submissionPackageKeys.all, "workspace", workspaceId] as const,
  detail: (packageId: string) =>
    [...submissionPackageKeys.all, "detail", packageId] as const,
  files: (packageId: string) =>
    [...submissionPackageKeys.all, "files", packageId] as const,
  fileTypes: ["submission-package", "file-types"] as const,
};

export async function getSubmissionPackagesByWorkspace(workspaceId: string) {
  const { data } = await api.get<SubmissionPackageSummary[]>(
    `${SUBMISSION_PACKAGE_ENDPOINT}/workspaces/${encodeURIComponent(
      workspaceId,
    )}`,
  );

  return data;
}

export async function getSubmissionPackageDetail(packageId: string) {
  const { data } = await api.get<SubmissionPackageDetail>(
    `${SUBMISSION_PACKAGE_ENDPOINT}/${encodeURIComponent(packageId)}`,
  );

  return data;
}

export async function getDeliverableFilesByPackage(packageId: string) {
  const { data } = await api.get<DeliverableFile[]>(
    `${DELIVERABLE_FILE_ENDPOINT}/packages/${encodeURIComponent(packageId)}`,
  );

  return data;
}

export async function getSubmissionFileTypes() {
  const { data } = await api.get<SubmissionFileType[]>(FILE_TYPE_ENDPOINT);

  return data;
}

export async function createSubmissionPackage(
  request: CreateSubmissionPackageRequest,
) {
  const { data } = await api.post<SubmissionPackageSummary>(
    SUBMISSION_PACKAGE_ENDPOINT,
    request,
  );

  return data;
}

export async function resubmitSubmissionPackage(
  packageId: string,
  request: ResubmitSubmissionPackageRequest,
) {
  const { data } = await api.post<SubmissionPackageSummary>(
    `${SUBMISSION_PACKAGE_ENDPOINT}/${encodeURIComponent(packageId)}/resubmit`,
    request,
  );

  return data;
}

export function useSubmissionPackagesByWorkspace(
  workspaceId?: string | null,
) {
  const normalizedWorkspaceId = normalizeIdentifier(workspaceId);

  return useQuery<SubmissionPackageSummary[], SubmissionReadError>({
    queryKey: normalizedWorkspaceId
      ? submissionPackageKeys.workspace(normalizedWorkspaceId)
      : submissionPackageKeys.workspace(""),
    queryFn: () =>
      getSubmissionPackagesByWorkspace(normalizedWorkspaceId ?? ""),
    enabled: Boolean(normalizedWorkspaceId),
    retry: 0,
  });
}

export function useSubmissionPackageDetail(packageId?: string | null) {
  const normalizedPackageId = normalizeIdentifier(packageId);

  return useQuery<SubmissionPackageDetail, SubmissionReadError>({
    queryKey: normalizedPackageId
      ? submissionPackageKeys.detail(normalizedPackageId)
      : submissionPackageKeys.detail(""),
    queryFn: () => getSubmissionPackageDetail(normalizedPackageId ?? ""),
    enabled: Boolean(normalizedPackageId),
    retry: 0,
  });
}

export function useDeliverableFilesByPackage(packageId?: string | null) {
  const normalizedPackageId = normalizeIdentifier(packageId);

  return useQuery<DeliverableFile[], SubmissionReadError>({
    queryKey: normalizedPackageId
      ? submissionPackageKeys.files(normalizedPackageId)
      : submissionPackageKeys.files(""),
    queryFn: () => getDeliverableFilesByPackage(normalizedPackageId ?? ""),
    enabled: Boolean(normalizedPackageId),
    retry: 0,
  });
}

export function useSubmissionFileTypes() {
  return useQuery<SubmissionFileType[], SubmissionReadError>({
    queryKey: submissionPackageKeys.fileTypes,
    queryFn: getSubmissionFileTypes,
    retry: 0,
  });
}

export function useCreateSubmissionPackage() {
  const queryClient = useQueryClient();

  return useMutation<
    SubmissionPackageSummary,
    SubmissionMutationError,
    CreateSubmissionPackageMutationVariables
  >({
    mutationFn: ({ request }) => createSubmissionPackage(request),
    retry: 0,
    onSuccess: async (createdPackage, { request }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.workspace(request.workspaceId),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.detail(createdPackage.packageId),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.files(createdPackage.packageId),
        }),
      ]);
    },
  });
}

export function useResubmitSubmissionPackage() {
  const queryClient = useQueryClient();

  return useMutation<
    SubmissionPackageSummary,
    SubmissionMutationError,
    ResubmitSubmissionPackageMutationVariables
  >({
    mutationFn: ({ packageId, request }) =>
      resubmitSubmissionPackage(packageId, request),
    retry: 0,
    onSuccess: async (submittedPackage, { packageId, workspaceId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.workspace(workspaceId),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.detail(packageId),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.files(packageId),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.detail(submittedPackage.packageId),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.files(submittedPackage.packageId),
        }),
      ]);
    },
  });
}

function normalizeIdentifier(value?: string | null) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}
