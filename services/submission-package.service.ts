import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import api from "@/configs/api";
import type {
  ApproveSubmissionPackageMutationVariables,
  CreateSubmissionPackageMutationVariables,
  CreateSubmissionPackageRequest,
  DeliverableFile,
  ExpertSubmitWorkspacePackageMutationVariables,
  ExpertSubmitWorkspacePackageRequest,
  ExpertSubmitWorkspacePackageResponse,
  RejectSubmissionPackageMutationVariables,
  ReviewDeliverableFileMutationVariables,
  ReviewDeliverableFileRequest,
  ReviewSubmissionPackageRequest,
  ResubmitSubmissionPackageMutationVariables,
  ResubmitSubmissionPackageRequest,
  SubmissionFileType,
  SubmissionPackageDetail,
  SubmissionPackageSummary,
  SubmissionReviewResponse,
} from "@/types/submission-package.type";
import { workspaceKeys } from "./workspace.service";

const SUBMISSION_PACKAGE_ENDPOINT =
  "/workspace/api/v1/submission-packages";
const CLIENT_REVIEW_ENDPOINT = "/workspace/api/v1/workspaces/client";
const DELIVERABLE_FILE_ENDPOINT =
  "/workspace/api/v1/deliverable-files";
const FILE_TYPE_ENDPOINT = "/workspace/api/v1/file-types";
const EXPERT_WORKSPACE_SUBMIT_ENDPOINT = SUBMISSION_PACKAGE_ENDPOINT;

type SubmissionReadError = AxiosError;
type SubmissionMutationError = AxiosError;

export const submissionPackageKeys = {
  all: ["submission-package"] as const,
  user: (userCode: string) =>
    [...submissionPackageKeys.all, "user", userCode] as const,
  workspace: (userCode: string, workspaceId: string) =>
    [
      ...submissionPackageKeys.user(userCode),
      "workspace",
      workspaceId,
    ] as const,
  detail: (userCode: string, packageId: string) =>
    [
      ...submissionPackageKeys.user(userCode),
      "detail",
      packageId,
    ] as const,
  files: (userCode: string, packageId: string) =>
    [
      ...submissionPackageKeys.user(userCode),
      "files",
      packageId,
    ] as const,
  fileTypes: (userCode: string) =>
    [...submissionPackageKeys.user(userCode), "file-types"] as const,
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

export async function reviewDeliverableFile(
  request: ReviewDeliverableFileRequest,
) {
  const { data } = await api.patch<DeliverableFile>(
    `${DELIVERABLE_FILE_ENDPOINT}/review`,
    request,
  );

  return data;
}

export async function submitExpertWorkspacePackage(
  request: ExpertSubmitWorkspacePackageRequest,
) {
  const { data } = await api.post<ExpertSubmitWorkspacePackageResponse>(
    EXPERT_WORKSPACE_SUBMIT_ENDPOINT,
    request,
  );

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

export async function rejectSubmissionPackage(
  packageId: string,
  feedback: string,
) {
  const request: ReviewSubmissionPackageRequest = {
    packageId,
    feedback,
  };
  const { data } = await api.post<SubmissionReviewResponse>(
    `${CLIENT_REVIEW_ENDPOINT}/reject`,
    request,
  );

  return data;
}

export async function approveSubmissionPackage(
  packageId: string,
  feedback?: string,
) {
  const request: ReviewSubmissionPackageRequest = {
    packageId,
    feedback: feedback?.trim() || "Approved",
  };
  const { data } = await api.post<SubmissionReviewResponse>(
    `${CLIENT_REVIEW_ENDPOINT}/approve`,
    request,
  );

  return data;
}

export function useSubmissionPackagesByWorkspace(
  userCode?: string | null,
  workspaceId?: string | null,
) {
  const normalizedUserCode = normalizeIdentifier(userCode);
  const normalizedWorkspaceId = normalizeIdentifier(workspaceId);

  return useQuery<SubmissionPackageSummary[], SubmissionReadError>({
    queryKey:
      normalizedUserCode && normalizedWorkspaceId
        ? submissionPackageKeys.workspace(
            normalizedUserCode,
            normalizedWorkspaceId,
          )
        : submissionPackageKeys.workspace("", ""),
    queryFn: () =>
      getSubmissionPackagesByWorkspace(normalizedWorkspaceId ?? ""),
    enabled: Boolean(normalizedUserCode) && Boolean(normalizedWorkspaceId),
    retry: 0,
  });
}

export function useSubmissionPackageDetail(
  userCode?: string | null,
  packageId?: string | null,
) {
  const normalizedUserCode = normalizeIdentifier(userCode);
  const normalizedPackageId = normalizeIdentifier(packageId);

  return useQuery<SubmissionPackageDetail, SubmissionReadError>({
    queryKey:
      normalizedUserCode && normalizedPackageId
        ? submissionPackageKeys.detail(normalizedUserCode, normalizedPackageId)
        : submissionPackageKeys.detail("", ""),
    queryFn: () => getSubmissionPackageDetail(normalizedPackageId ?? ""),
    enabled: Boolean(normalizedUserCode) && Boolean(normalizedPackageId),
    retry: 0,
  });
}

export function useDeliverableFilesByPackage(
  userCode?: string | null,
  packageId?: string | null,
) {
  const normalizedUserCode = normalizeIdentifier(userCode);
  const normalizedPackageId = normalizeIdentifier(packageId);

  return useQuery<DeliverableFile[], SubmissionReadError>({
    queryKey:
      normalizedUserCode && normalizedPackageId
        ? submissionPackageKeys.files(normalizedUserCode, normalizedPackageId)
        : submissionPackageKeys.files("", ""),
    queryFn: () => getDeliverableFilesByPackage(normalizedPackageId ?? ""),
    enabled: Boolean(normalizedUserCode) && Boolean(normalizedPackageId),
    retry: 0,
  });
}

export function useSubmissionFileTypes(userCode?: string | null) {
  const normalizedUserCode = normalizeIdentifier(userCode);

  return useQuery<SubmissionFileType[], SubmissionReadError>({
    queryKey: normalizedUserCode
      ? submissionPackageKeys.fileTypes(normalizedUserCode)
      : submissionPackageKeys.fileTypes(""),
    queryFn: getSubmissionFileTypes,
    enabled: Boolean(normalizedUserCode),
    retry: 0,
  });
}

export function useReviewDeliverableFile(userCode?: string | null) {
  const queryClient = useQueryClient();
  const normalizedUserCode = normalizeIdentifier(userCode);

  return useMutation<
    DeliverableFile,
    SubmissionMutationError,
    ReviewDeliverableFileMutationVariables
  >({
    mutationFn: ({ request }) => reviewDeliverableFile(request),
    retry: 0,
    onSuccess: async (_reviewedFile, { packageId, workspaceId }) => {
      if (!normalizedUserCode) return;

      await Promise.allSettled([
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.workspace(
            normalizedUserCode,
            workspaceId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.detail(normalizedUserCode, packageId),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.files(normalizedUserCode, packageId),
        }),
      ]);
    },
  });
}

export function useSubmitExpertWorkspacePackage(userCode?: string | null) {
  const queryClient = useQueryClient();
  const normalizedUserCode = normalizeIdentifier(userCode);

  return useMutation<
    ExpertSubmitWorkspacePackageResponse,
    SubmissionMutationError,
    ExpertSubmitWorkspacePackageMutationVariables
  >({
    mutationFn: ({ request }) => submitExpertWorkspacePackage(request),
    retry: 0,
    onSuccess: async (createdPackage, { request }) => {
      if (!normalizedUserCode) return;

      await Promise.allSettled([
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.workspace(
            normalizedUserCode,
            request.workspaceId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.detail(
            normalizedUserCode,
            createdPackage.packageId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.files(
            normalizedUserCode,
            createdPackage.packageId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: workspaceKeys.detail(request.workspaceId),
        }),
      ]);
    },
  });
}

export function useCreateSubmissionPackage(userCode?: string | null) {
  const queryClient = useQueryClient();
  const normalizedUserCode = normalizeIdentifier(userCode);

  return useMutation<
    SubmissionPackageSummary,
    SubmissionMutationError,
    CreateSubmissionPackageMutationVariables
  >({
    mutationFn: ({ request }) => createSubmissionPackage(request),
    retry: 0,
    onSuccess: async (createdPackage, { request }) => {
      if (!normalizedUserCode) return;

      await Promise.allSettled([
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.workspace(
            normalizedUserCode,
            request.workspaceId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.detail(
            normalizedUserCode,
            createdPackage.packageId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.files(
            normalizedUserCode,
            createdPackage.packageId,
          ),
        }),
      ]);
    },
  });
}

export function useResubmitSubmissionPackage(userCode?: string | null) {
  const queryClient = useQueryClient();
  const normalizedUserCode = normalizeIdentifier(userCode);

  return useMutation<
    SubmissionPackageSummary,
    SubmissionMutationError,
    ResubmitSubmissionPackageMutationVariables
  >({
    mutationFn: ({ packageId, request }) =>
      resubmitSubmissionPackage(packageId, request),
    retry: 0,
    onSuccess: async (submittedPackage, { packageId, workspaceId }) => {
      if (!normalizedUserCode) return;

      await Promise.allSettled([
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.workspace(
            normalizedUserCode,
            workspaceId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.detail(
            normalizedUserCode,
            packageId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.files(normalizedUserCode, packageId),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.detail(
            normalizedUserCode,
            submittedPackage.packageId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.files(
            normalizedUserCode,
            submittedPackage.packageId,
          ),
        }),
      ]);
    },
  });
}

export function useRejectSubmissionPackage(userCode?: string | null) {
  const queryClient = useQueryClient();
  const normalizedUserCode = normalizeIdentifier(userCode);

  return useMutation<
    SubmissionReviewResponse,
    SubmissionMutationError,
    RejectSubmissionPackageMutationVariables
  >({
    mutationFn: ({ packageId, feedback }) =>
      rejectSubmissionPackage(packageId, feedback),
    retry: 0,
    onSuccess: async (_reviewedPackage, { packageId, workspaceId }) => {
      if (!normalizedUserCode) return;

      await Promise.allSettled([
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.workspace(
            normalizedUserCode,
            workspaceId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.detail(
            normalizedUserCode,
            packageId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: workspaceKeys.detail(workspaceId),
        }),
      ]);
    },
  });
}

export function useApproveSubmissionPackage(userCode?: string | null) {
  const queryClient = useQueryClient();
  const normalizedUserCode = normalizeIdentifier(userCode);

  return useMutation<
    SubmissionReviewResponse,
    SubmissionMutationError,
    ApproveSubmissionPackageMutationVariables
  >({
    mutationFn: ({ packageId, feedback }) =>
      approveSubmissionPackage(packageId, feedback),
    retry: 0,
    onSuccess: async (_reviewedPackage, { packageId, workspaceId }) => {
      if (!normalizedUserCode) return;

      await Promise.allSettled([
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.workspace(
            normalizedUserCode,
            workspaceId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: submissionPackageKeys.detail(
            normalizedUserCode,
            packageId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: workspaceKeys.detail(workspaceId),
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
