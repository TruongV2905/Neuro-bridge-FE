"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock4,
  DollarSign,
  ExternalLink,
  FileSignature,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getContractDetail,
  signContract,
} from "@/services/hire-contract.service";
import type { ContractDetail } from "@/types/contract.types";

type ExpertContractSignViewProps = {
  contractId: string;
};

export function ExpertContractSignView({
  contractId,
}: ExpertContractSignViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchContract = async () => {
    if (!contractId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getContractDetail(contractId);
      setContract(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Không thể tải thông tin hợp đồng. Vui lòng kiểm tra lại mã hợp đồng.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchContract();
  }, [contractId]);

  const handleSignContract = async () => {
    if (!contractId) return;
    setSigning(true);
    try {
      await signContract(contractId);
      toast.success("Bạn đã ký hợp đồng thành công!");
      await fetchContract();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Ký hợp đồng thất bại. Vui lòng thử lại sau.",
      );
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-44 rounded-3xl" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
          <h2 className="mt-4 text-xl font-extrabold">
            Không tìm thấy thông tin Hợp Đồng
          </h2>
          <p className="mt-2 text-sm text-rose-600">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={fetchContract}
              className="rounded-xl border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
            </Button>
            <Button asChild className="rounded-xl bg-indigo-600 text-white">
              <Link href="/expert/dashboard/my-applications">
                Về danh sách ứng tuyển
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isClientSigned = contract.clientSigned;
  const isExpertSigned = contract.expertSigned;
  const isFullySigned =
    contract.status === "FULLY_SIGNED" || (isClientSigned && isExpertSigned);
  const budget = contract.proposedBudget ?? 0;
  const expertPayout = budget * 0.9;
  const platformFee = budget * 0.1;

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6">
      {/* Top breadcrumb & back button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link
            href="/expert/dashboard/my-applications"
            className="hover:text-indigo-600 font-semibold"
          >
            My Applications
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
          <Link href="/expert/dashboard/my-applications">
            <ArrowLeft className="mr-2 h-4 w-4" /> Danh sách ứng tuyển
          </Link>
        </Button>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
              <FileSignature className="h-3.5 w-3.5" />
              Hợp Đồng Điện Tử Dự Án
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ký Hợp Đồng Nghiệp Vụ & Escrow
            </h1>
            <p className="mt-2 text-sm text-emerald-100/80 max-w-2xl">
              Hợp đồng bảo đảm pháp lý cho chuyên gia. Tiền thưởng được ký quỹ
              qua Escrow và giải ngân 90% trực tiếp vào ví sau khi nghiệm thu.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge
              className={`rounded-full px-4 py-1.5 text-xs font-extrabold shadow-sm ${
                isFullySigned
                  ? "bg-emerald-400 text-emerald-950"
                  : isExpertSigned
                    ? "bg-teal-400 text-teal-950"
                    : "bg-amber-400 text-amber-950"
              }`}
            >
              {isFullySigned
                ? "HOÀN TẤT KÝ (FULLY SIGNED)"
                : isExpertSigned
                  ? "BẠN ĐÃ KÝ - CHỜ CLIENT"
                  : "CHỜ CHUYÊN GIA KÝ"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main 2-column content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column: Contract Terms & Details */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 px-6 py-5">
              <CardTitle className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Thông Tin Hợp Đồng & Chi Tiết Thanh Toán
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Financial Box */}
              <div className="grid gap-4 sm:grid-cols-3 rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Tổng Ngân Sách Dự Án
                  </span>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">
                    {budget > 0
                      ? `${budget.toLocaleString()} VNĐ`
                      : "Theo thoả thuận"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Chuyên Gia Thực Nhận (90%)
                  </span>
                  <p className="text-xl font-extrabold text-emerald-600 mt-1">
                    {budget > 0
                      ? `${expertPayout.toLocaleString()} VNĐ`
                      : "Theo thoả thuận"}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    Giải ngân về ví sau nghiệm thu
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Phí Nền Tảng (10%)
                  </span>
                  <p className="text-base font-extrabold text-slate-500 mt-1">
                    {budget > 0
                      ? `${platformFee.toLocaleString()} VNĐ`
                      : "10% giá trị"}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    Phí vận hành & bảo chứng Escrow
                  </span>
                </div>
              </div>

              {/* General Timeline info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Clock4 className="h-4 w-4 text-indigo-600" />
                    Thời Hạn Thực Hiện
                  </div>
                  <p className="mt-2 text-base font-extrabold text-slate-900">
                    {contract.estimatedDays
                      ? `${contract.estimatedDays} ngày làm việc`
                      : "Theo kế hoạch thoả thuận"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <CalendarDays className="h-4 w-4 text-indigo-600" />
                    Mã Hợp Đồng
                  </div>
                  <p className="mt-2 font-mono text-sm font-extrabold text-slate-900 truncate">
                    {contract.id}
                  </p>
                </div>
              </div>

              {/* Terms & Clauses */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  Điều Khoản & Cam Kết Thực Hiện
                </h3>
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 text-sm leading-relaxed text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <span className="font-extrabold text-indigo-600 shrink-0">
                      1.
                    </span>
                    <p>
                      <strong>Ký quỹ an toàn (Escrow):</strong> Bên Thuê (Client)
                      đã nạp và ký quỹ 100% chi phí vào tài khoản chung Escrow của
                      hệ thống trước khi phòng làm việc được kích hoạt.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-extrabold text-indigo-600 shrink-0">
                      2.
                    </span>
                    <p>
                      <strong>Giao nhận sản phẩm (Submission Package):</strong>{" "}
                      Chuyên gia có trách nhiệm bàn giao các mốc sản phẩm, mã
                      nguồn và tài liệu đúng tiến độ quy định thông qua tab Bàn
                      giao trong Workspace.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-extrabold text-indigo-600 shrink-0">
                      3.
                    </span>
                    <p>
                      <strong>Nghiệm thu & Giải ngân tự động:</strong> Khi hoàn
                      tất công việc và được Client nghiệm thu, 90% số tiền hợp
                      đồng sẽ tự động được hệ thống chuyển vào số dư ví của Chuyên
                      gia ngay lập tức.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Signature Status & Action */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 px-6 py-5">
              <CardTitle className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" />
                Tiến Độ Ký Hợp Đồng
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Client signature */}
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

              {/* Expert signature */}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isExpertSigned
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {isExpertSigned ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <FileSignature className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Chuyên Gia (Expert - Bạn)
                  </p>
                  <p className="text-sm font-extrabold text-slate-900 truncate">
                    {contract.expertCode || "Chuyên gia"}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {isExpertSigned
                      ? "✅ Bạn đã ký hợp đồng"
                      : "✍️ Đang chờ bạn ký"}
                  </p>
                </div>
              </div>

              {/* Sign Action Button */}
              {!isExpertSigned ? (
                <Button
                  type="button"
                  onClick={handleSignContract}
                  disabled={signing}
                  className="h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-base font-bold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700"
                >
                  {signing ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <FileSignature className="mr-2 h-5 w-5" />
                  )}
                  {signing ? "Đang xác thực chữ ký..." : "Ký Hợp Đồng Ngay"}
                </Button>
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                  <p className="mt-2 text-sm font-extrabold text-emerald-900">
                    Bạn đã ký hợp đồng thành công!
                  </p>
                  <p className="mt-1 text-xs text-emerald-700">
                    {!isClientSigned
                      ? "Vui lòng chờ phía Client ký và hoàn tất ký quỹ Escrow."
                      : "Hợp đồng đã hoàn tất ký bởi cả hai bên."}
                  </p>
                </div>
              )}

              {/* Link into workspace if workspace is ready */}
              {contract.workspaceId && (
                <Button
                  asChild
                  className="h-11 w-full rounded-2xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                >
                  <Link href={`/workspace/${contract.workspaceId}`}>
                    <ExternalLink className="mr-2 h-4 w-4" /> Vào Phòng Làm Việc
                    (Workspace)
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Escrow Guarantee Box */}
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50/80 to-white p-5 text-indigo-950 space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-sm text-indigo-900">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Đảm Bảo Thanh Toán Escrow
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Hệ thống trung gian khóa trước 100% ngân sách từ Client. Chuyên gia
              hoàn toàn yên tâm thực hiện dự án mà không lo rủi ro bị từ chối thanh
              toán sai quy định.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
