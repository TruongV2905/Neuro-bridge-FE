"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock4,
  ExternalLink,
  FileSignature,
  FileText,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RootState } from "@/redux/store";
import {
  useGetContractById,
  useHireExpert,
  useSignContract,
} from "@/services/contract.service";
import {
  fetchJobPostApplicants,
  useGetJobPostById,
} from "@/services/job-post.service";
import { useGetUserByCode } from "@/services/user.service";
import type { ContractResponse, ContractStatus, HireExpertResponse } from "@/types/contract.type";
import { UserRole, type UserResponse } from "@/types/user/user.type";
import {
  readHireContextFromStorage,
  saveContractHireContext,
  saveContractReferenceFromResponse,
  type ContractHireContext,
} from "./contractStorage";
import { formatMoney } from "@/utils/formatMoney";

type ContractSigningViewProps = {
  role?: "client" | "expert";
};

const CONTRACT_FLOW_STEPS = [
  "Bản thảo hợp đồng",
  "Cả 2 bên cùng ký",
  "Ký quỹ Escrow (Cọc tiền)",
  "Khởi tạo Workspace & Dự án",
] as const;

export function ContractSigningView({ role }: ContractSigningViewProps) {
  const router = useRouter();
  const params = useParams<{ contractId?: string | string[] }>();
  const searchParams = useSearchParams();
  const contractId = Array.isArray(params.contractId)
    ? params.contractId[0]
    : params.contractId ?? "";

  const currentUser = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null;

  const effectiveRole: "client" | "expert" =
    role ?? (currentUser?.role === UserRole.EXPERT ? "expert" : "client");
  const isClientRole = effectiveRole === "client";
  const isExpertRole = effectiveRole === "expert";

  const [finalizeResponse, setFinalizeResponse] =
    useState<HireExpertResponse | null>(null);
  const [resolvedExpertApplyId, setResolvedExpertApplyId] = useState<string>("");

  const queryHireContext = readHireContextFromSearch(searchParams);
  const storedHireContext = useMemo(
    () => (contractId ? readHireContextFromStorage(contractId) : null),
    [contractId],
  );
  const hireContext = queryHireContext ?? storedHireContext;

  const contractQuery = useGetContractById(contractId, {
    enabled: Boolean(contractId),
  });
  const contract = contractQuery.data;

  const jobPostId =
    contract?.jobId ?? contract?.jobPostId ?? hireContext?.jobPostId ?? "";
  const jobPostQuery = useGetJobPostById(
    { id: jobPostId },
    { enabled: Boolean(jobPostId) },
  );

  const signContract = useSignContract();
  const hireExpert = useHireExpert();

  const partnerCode = getPartnerCode(contract, effectiveRole, hireContext);
  const partnerQuery = useGetUserByCode(
    { code: partnerCode ?? "" },
    { enabled: Boolean(partnerCode) },
  );
  const partnerName = getPartnerDisplayName(
    partnerQuery.data?.result?.fullName,
    partnerCode,
    effectiveRole,
  );

  // Lưu ngữ cảnh hire vào localStorage
  useEffect(() => {
    if (!contractId) return;

    if (queryHireContext) {
      saveContractHireContext(contractId, queryHireContext);
    }
  }, [contractId, queryHireContext]);

  useEffect(() => {
    if (!contract) return;

    saveContractReferenceFromResponse(contract, effectiveRole, hireContext);
  }, [contract, effectiveRole, hireContext]);

  // Tự động tìm expertApplyId từ jobPostId nếu chưa có trong context
  useEffect(() => {
    if (hireContext?.expertApplyId) {
      setResolvedExpertApplyId(hireContext.expertApplyId);
      return;
    }

    if (jobPostId && contract?.expertCode) {
      fetchJobPostApplicants(jobPostId)
        .then((res) => {
          const list = res?.result ?? [];
          const matched =
            list.find(
              (item) =>
                item.expertApply?.expertCode?.toLowerCase() ===
                contract.expertCode?.toLowerCase(),
            ) ?? (list.length === 1 ? list[0] : null);
          if (matched?.expertApply?.id) {
            setResolvedExpertApplyId(matched.expertApply.id);
            saveContractHireContext(contractId, {
              jobPostId,
              expertApplyId: matched.expertApply.id,
              expertCode: contract.expertCode || undefined,
            });
          }
        })
        .catch(() => undefined);
    }
  }, [contractId, contract?.expertCode, hireContext, jobPostId]);

  const isClientSigned = contract?.clientSigned ?? false;
  const isExpertSigned = contract?.expertSigned ?? false;
  const isFullySigned =
    contract?.status === "FULLY_SIGNED" || (isClientSigned && isExpertSigned);

  const roleSigned = isClientRole ? isClientSigned : isExpertSigned;

  // Quyền ký: người dùng thuộc role đó và chưa ký
  const canSign = Boolean(contract) && !roleSigned && !isFullySigned;

  // Quyền khởi tạo Workspace / Dự án:
  // Client có thể bấm khi cả 2 bên đã ký (isFullySigned) và chưa có workspaceId
  const canFinalize =
    isClientRole &&
    (isFullySigned || contract?.status === "FULLY_SIGNED") &&
    !contract?.workspaceId;

  const shortfallAmount =
    finalizeResponse?.shortfallAmount ??
    (hireExpert.error?.response?.data as { shortfallAmount?: number } | undefined)
      ?.shortfallAmount ??
    contract?.shortfallAmount;

  const budget = contract?.unlockCost ?? contract?.proposedBudget ?? 0;
  const expertPayout = budget * 0.9;
  const platformFee = budget * 0.1;

  // Xử lý ký hợp đồng
  const handleSignContract = async () => {
    if (!contractId || signContract.isPending) return;

    try {
      await signContract.mutateAsync(contractId);
      toast.success("Ký hợp đồng thành công!");
      void contractQuery.refetch();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Ký hợp đồng thất bại. Vui lòng thử lại.",
      );
    }
  };

  // Xử lý Tạo Project / Workspace & Ký Quỹ Escrow (Client bấm lần 2)
  const handleFinalizeWorkspace = async () => {
    let activeJobPostId = jobPostId;
    let activeExpertApplyId =
      resolvedExpertApplyId || hireContext?.expertApplyId;

    if (!activeExpertApplyId && activeJobPostId) {
      try {
        const res = await fetchJobPostApplicants(activeJobPostId);
        const list = res?.result ?? [];
        const matched =
          list.find(
            (item) =>
              item.expertApply?.expertCode?.toLowerCase() ===
              contract?.expertCode?.toLowerCase(),
          ) ?? (list.length === 1 ? list[0] : null);
        if (matched?.expertApply?.id) {
          activeExpertApplyId = matched.expertApply.id;
          setResolvedExpertApplyId(matched.expertApply.id);
        }
      } catch (err) {
        console.error("Lỗi tự động phân giải ứng viên:", err);
      }
    }

    if (!activeJobPostId || !activeExpertApplyId) {
      toast.error(
        "Thiếu thông tin Jobpost hoặc đơn ứng tuyển để khởi tạo Workspace. Vui lòng thử bấm lại từ danh sách ứng tuyển.",
      );
      return;
    }

    try {
      const response = await hireExpert.mutateAsync({
        jobPostId: activeJobPostId,
        expertApplyId: activeExpertApplyId,
      });

      setFinalizeResponse(response);

      if (response.workspaceId) {
        toast.success("Khởi tạo Workspace & Dự án thành công!");
        router.push(`/workspace/${response.workspaceId}`);
        return;
      }

      if (response.shortfallAmount && response.shortfallAmount > 0) {
        toast.warning(
          response.message ||
            `Số dư ví không đủ! Cần nạp thêm ${response.shortfallAmount.toLocaleString()} VNĐ qua VNPay để ký quỹ.`,
        );
      } else if (response.message) {
        toast.info(response.message);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Khởi tạo Workspace thất bại.",
      );
    }
  };

  if (contractQuery.isLoading) {
    return (
      <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-44 rounded-3xl" />
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <Skeleton className="h-96 rounded-3xl" />
            <Skeleton className="h-80 rounded-3xl" />
          </div>
        </div>
      </main>
    );
  }

  if (contractQuery.isError || !contract) {
    return (
      <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
          <h2 className="mt-4 text-xl font-extrabold">
            Không tìm thấy thông tin Hợp Đồng
          </h2>
          <p className="mt-2 text-sm text-rose-600">
            {getErrorMessage(contractQuery.error, "Mã hợp đồng không hợp lệ hoặc đã bị huỷ.")}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => void contractQuery.refetch()}
              className="rounded-xl border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
            </Button>
            <Button asChild className="rounded-xl bg-indigo-600 text-white">
              <Link href={getBackHref(effectiveRole)}>Về danh sách hợp đồng</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href={getBackHref(effectiveRole)}
              className="font-semibold transition hover:text-indigo-600"
            >
              Contracts
            </Link>
            <span>/</span>
            <span className="font-mono text-xs font-bold text-slate-700">
              {contract.id}
            </span>
          </div>

          <Button
            asChild
            variant="outline"
            className="rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm"
          >
            <Link href={getBackHref(effectiveRole)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Danh sách hợp đồng
            </Link>
          </Button>
        </div>

        {/* Shortfall Alert nếu ví Client thiếu tiền */}
        {shortfallAmount && shortfallAmount > 0 ? (
          <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600 mt-1" />
                <div>
                  <h3 className="text-base font-extrabold text-amber-950">
                    Số dư ví không đủ để ký quỹ Escrow dự án!
                  </h3>
                  <p className="mt-1 text-sm text-amber-800 leading-relaxed">
                    Bạn cần ký quỹ số tiền còn thiếu là{" "}
                    <strong className="text-amber-950 font-bold">
                      {shortfallAmount.toLocaleString()} VNĐ
                    </strong>{" "}
                    vào ví trung gian Escrow để hệ thống tự động khởi tạo Workspace và phòng làm việc.
                  </p>
                </div>
              </div>

              <Button
                asChild
                className="shrink-0 rounded-2xl bg-amber-600 text-white hover:bg-amber-700 shadow-md shadow-amber-600/20"
              >
                <Link href="/client/dashboard/wallet">
                  <WalletCards className="mr-2 h-4 w-4" /> Nạp tiền qua VNPay
                </Link>
              </Button>
            </div>
          </div>
        ) : null}

        {/* Header Hero Banner */}
        <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300 backdrop-blur-md">
                <FileSignature className="h-3.5 w-3.5" />
                Hợp Đồng Điện Tử Dự Án
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
                {contract.projectName || jobPostQuery.data?.result?.title || "Hợp Đồng Dịch Vụ Chuyên Gia"}
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-2xl">
                Đối tác: <strong className="text-white">{partnerName}</strong> ({role === "client" ? "Expert" : "Client"})
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge
                className={`rounded-full px-4 py-1.5 text-xs font-extrabold shadow-sm ${
                  isFullySigned
                    ? "bg-emerald-400 text-emerald-950"
                    : roleSigned
                      ? "bg-teal-400 text-teal-950"
                      : "bg-amber-400 text-amber-950"
                }`}
              >
                {isFullySigned
                  ? "HOÀN TẤT KÝ (READY FOR ESCROW)"
                  : roleSigned
                    ? "BẠN ĐÃ KÝ - CHỜ ĐỐI TÁC"
                    : "CHỜ BẠN KÝ"}
              </Badge>
            </div>
          </div>

          {/* Stepper tiến độ 4 bước */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-white/10 pt-6">
            {CONTRACT_FLOW_STEPS.map((step, idx) => {
              const isPassed =
                idx === 0 ||
                (idx === 1 && isFullySigned) ||
                (idx === 2 && Boolean(contract.workspaceId)) ||
                (idx === 3 && Boolean(contract.workspaceId));

              return (
                <div key={idx} className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                      isPassed
                        ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/50"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={`text-xs font-bold truncate ${
                      isPassed ? "text-emerald-300" : "text-white/40"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Cột trái: Điều khoản & Tài chính */}
          <div className="space-y-6">
            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 px-6 py-5">
                <CardTitle className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Chi Tiết Ngân Sách & Bảo Chứng Escrow
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-3 rounded-2xl bg-slate-50 p-5 border border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Tổng Ngân Sách Ký Quỹ
                    </span>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">
                      {budget > 0 ? `${budget.toLocaleString()} VNĐ` : "Theo thoả thuận"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                      Chuyên Gia Nhận (90%)
                    </span>
                    <p className="text-xl font-extrabold text-emerald-600 mt-1">
                      {budget > 0 ? `${expertPayout.toLocaleString()} VNĐ` : "Theo thoả thuận"}
                    </p>
                    <span className="text-[11px] text-slate-400">
                      Giải ngân sau khi nghiệm thu
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Phí Nền Tảng (10%)
                    </span>
                    <p className="text-base font-extrabold text-slate-500 mt-1">
                      {budget > 0 ? `${platformFee.toLocaleString()} VNĐ` : "10%"}
                    </p>
                    <span className="text-[11px] text-slate-400">
                      Bảo đảm giao dịch trung gian
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <Clock4 className="h-4 w-4 text-indigo-600" />
                      Thời Gian Thực Hiện
                    </div>
                    <p className="mt-2 text-base font-extrabold text-slate-900">
                      {contract.estimatedDays
                        ? `${contract.estimatedDays} ngày làm việc`
                        : "Theo tiến độ đề xuất"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <LockKeyhole className="h-4 w-4 text-indigo-600" />
                      Cơ Chế Bảo Vệ
                    </div>
                    <p className="mt-2 text-sm font-bold text-slate-800">
                      Ký quỹ ví chung Escrow 100%
                    </p>
                  </div>
                </div>

                {/* Điều khoản */}
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                    Quy Trình Hoạt Động & Bảo Đảm Pháp Lý
                  </h3>
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 text-sm leading-relaxed text-slate-600">
                    <p>
                      <strong>1. Ký hợp đồng 2 bên:</strong> Cả Bên Thuê và Chuyên gia đều phải bấm nút Ký hợp đồng để xác nhận đồng thuận các điều khoản chi phí và thời hạn.
                    </p>
                    <p>
                      <strong>2. Khởi tạo Workspace:</strong> Sau khi ký đủ, Bên Thuê xác nhận khởi tạo phòng làm việc. Tiền cọc sẽ được chuyển vào ví trung gian Escrow để kích hoạt Workspace.
                    </p>
                    <p>
                      <strong>3. Bàn giao & Nghiệm thu:</strong> Chuyên gia bàn giao kết quả qua Submission Package. Khi Bên Thuê bấm Nghiệm thu & Hoàn tất, 90% ngân sách sẽ tự động chuyển vào ví Chuyên gia.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cột phải: Chữ ký & Nút Hành Động Tạo Project */}
          <div className="space-y-6">
            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 px-6 py-5">
                <CardTitle className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  Tiến Độ Ký Của 2 Bên
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {/* Client Signature */}
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      isClientSigned
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isClientSigned ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Clock4 className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Bên Thuê (Client)
                    </p>
                    <p className="text-sm font-extrabold text-slate-900 truncate">
                      {contract.clientCode || "Client"}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {isClientSigned ? "✅ Đã ký hợp đồng" : "⏳ Chưa ký"}
                    </p>
                  </div>
                </div>

                {/* Expert Signature */}
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      isExpertSigned
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isExpertSigned ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Clock4 className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Chuyên Gia (Expert)
                    </p>
                    <p className="text-sm font-extrabold text-slate-900 truncate">
                      {contract.expertCode || "Expert"}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {isExpertSigned ? "✅ Đã ký hợp đồng" : "⏳ Chưa ký"}
                    </p>
                  </div>
                </div>

                {/* NÚT 1: KÝ HỢP ĐỒNG (Nếu vai trò hiện tại chưa ký) */}
                {canSign && (
                  <Button
                    type="button"
                    onClick={handleSignContract}
                    disabled={signContract.isPending}
                    className="h-12 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-base font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-700 hover:to-violet-700"
                  >
                    {signContract.isPending ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <FileSignature className="mr-2 h-5 w-5" />
                    )}
                    {signContract.isPending
                      ? "Đang xác thực chữ ký..."
                      : "✍️ Ký Hợp Đồng Ngay"}
                  </Button>
                )}

                {/* NÚT 2: TẠO PROJECT / KHỞI TẠO WORKSPACE (Khi 2 bên đã ký xong!) */}
                {canFinalize && (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      onClick={handleFinalizeWorkspace}
                      disabled={hireExpert.isPending}
                      className="h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-base font-bold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700"
                    >
                      {hireExpert.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Đang tạo Workspace & Dự án...
                        </>
                      ) : (
                        <>
                          <LockKeyhole className="mr-2 h-5 w-5" />
                          🚀 Khởi Tạo Dự Án & Ký Quỹ Escrow
                        </>
                      )}
                    </Button>
                    <p className="text-center text-[11px] text-slate-500 font-medium">
                      * Nhấn nút để hoàn tất ký quỹ Escrow và tự động tạo phòng làm việc (Workspace & Dự án)
                    </p>
                  </div>
                )}

                {/* Thông báo cho Expert khi 2 bên đã ký, chờ Client ký quỹ tạo Workspace */}
                {isFullySigned && !contract.workspaceId && isExpertRole && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                    <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600 mb-2" />
                    <p className="text-sm font-extrabold text-emerald-900">
                      Hợp đồng đã hoàn tất ký bởi 2 bên!
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                      Bên Thuê (Client) đang tiến hành ký quỹ Escrow để kích hoạt phòng làm việc Workspace & Dự án. Bạn sẽ có thể vào phòng làm việc ngay khi Client hoàn tất bước này.
                    </p>
                  </div>
                )}

                {/* Thông báo nếu đã ký nhưng đang chờ đối tác */}
                {roleSigned && !isFullySigned && (
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center">
                    <p className="text-xs font-bold text-sky-800">
                      Bạn đã ký hợp đồng thành công!
                    </p>
                    <p className="mt-1 text-xs text-sky-600">
                      Vui lòng đợi đối tác hoàn tất chữ ký để mở bước tạo phòng làm việc.
                    </p>
                  </div>
                )}

                {/* NÚT 3: VÀO WORKSPACE (Khi Workspace đã tạo thành công) */}
                {contract.workspaceId && (
                  <Button
                    asChild
                    className="h-12 w-full rounded-2xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                  >
                    <Link href={`/workspace/${contract.workspaceId}`}>
                      <ExternalLink className="mr-2 h-4 w-4" /> Vào Phòng Làm Việc (Workspace)
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <div className="rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50/80 to-white p-5 text-indigo-950 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-sm text-indigo-900">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                Bảo Vệ Thanh Toán An Toàn
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                Sau khi ký đủ 2 bên và ký quỹ, phòng làm việc Workspace sẽ tự động được khởi tạo kèm hợp đồng điện tử bảo chứng.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function readHireContextFromSearch(
  searchParams: ReturnType<typeof useSearchParams>,
): ContractHireContext | null {
  const jobPostId = searchParams.get("jobPostId")?.trim() ?? "";
  const expertApplyId = searchParams.get("expertApplyId")?.trim() ?? "";

  if (!jobPostId || !expertApplyId) return null;

  return { jobPostId, expertApplyId };
}

function getPartnerCode(
  contract: ContractResponse | undefined,
  role: "client" | "expert",
  hireContext?: ContractHireContext | null,
) {
  if (!contract && !hireContext) return null;

  return role === "client"
    ? contract?.expertCode ?? hireContext?.expertCode
    : contract?.clientCode;
}

function getPartnerDisplayName(
  fullName: string | undefined,
  partnerCode: string | null | undefined,
  role: "client" | "expert",
) {
  if (fullName?.trim()) return fullName.trim();
  if (partnerCode?.trim()) return partnerCode.trim();

  return role === "client" ? "Chuyên gia" : "Bên thuê (Client)";
}

function getBackHref(role: "client" | "expert") {
  return role === "client"
    ? "/client/dashboard/contracts"
    : "/expert/dashboard/contracts";
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== "object") return fallback;

  const apiError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return apiError.response?.data?.message || apiError.message || fallback;
}
