import api from "@/configs/api";
import type { APIResponse } from "@/types/common.starter";
import type { ContractDetail, HireResponse } from "@/types/contract.types";

/**
 * Bước 1 & Bước 3: Gọi API Hire Expert (Client)
 * - Lần 1: Tạo hợp đồng PENDING, trả về contractId
 * - Lần 2 (sau khi ký): Trừ tiền cọc Escrow, nếu đủ -> tạo Workspace và trả về workspaceId
 */
export async function hireExpert(
  jobPostId: string,
  expertApplyId: string,
): Promise<HireResponse> {
  const { data } = await api.post<HireResponse | APIResponse<HireResponse>>(
    `/jobpost/job-posts/${encodeURIComponent(jobPostId)}/expert-applies/${encodeURIComponent(expertApplyId)}/hire`,
    {},
  );

  if ("result" in data && data.result) {
    return data.result;
  }
  return data as HireResponse;
}

/**
 * Lấy chi tiết hợp đồng
 */
export async function getContractDetail(
  contractId: string,
): Promise<ContractDetail> {
  const { data } = await api.get<ContractDetail | APIResponse<ContractDetail>>(
    `/jobpost/api/contract/${encodeURIComponent(contractId)}`,
  );

  if ("result" in data && data.result) {
    return data.result;
  }
  return data as ContractDetail;
}

/**
 * Bước 2: Ký hợp đồng (Client hoặc Expert)
 */
export async function signContract(
  contractId: string,
): Promise<{ message?: string; status?: string }> {
  const { data } = await api.patch<{ message?: string; status?: string }>(
    `/jobpost/api/contract/${encodeURIComponent(contractId)}/sign`,
    {},
  );

  return data;
}

/**
 * Giai đoạn 4: Hoàn tất dự án & Giải ngân (Client)
 * Backend hỗ trợ cả projectId lẫn workspaceId
 */
export async function completeProject(
  targetId: string,
): Promise<{ message?: string; status?: string }> {
  const { data } = await api.post<{ message?: string; status?: string }>(
    `/workspace/api/v1/projects/${encodeURIComponent(targetId)}/complete`,
    {},
  );

  return data;
}
