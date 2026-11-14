"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock4,
  ExternalLink,
  FileSignature,
  Loader2,
  ShieldCheck,
  WalletCards,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  getContractDetail,
  hireExpert,
  signContract,
} from "@/services/hire-contract.service";
import { saveContractHireContext } from "@/features/contract";
import type { ContractDetail, HireResponse } from "@/types/contract.types";
import { formatMoney } from "@/utils/formatMoney";

type ContractSignModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobPostId: string;
  expertApplyId: string;
  initialHireResponse: HireResponse | null;
  onSuccess?: (workspaceId: string) => void;
};

export function ContractSignModal({
  open,
  onOpenChange,
  jobPostId,
  expertApplyId,
  initialHireResponse,
  onSuccess,
}: ContractSignModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [shortfallAmount, setShortfallAmount] = useState<number | null>(
    initialHireResponse?.shortfallAmount ?? null,
  );
  const [hiringProgress, setHiringProgress] = useState<string>("");

  const contractId = initialHireResponse?.contractId || contract?.id;

  // Tải chi tiết hợp đồng khi mở modal
  useEffect(() => {
    if (!open || !contractId) return;

    saveContractHireContext(contractId, {
      jobPostId,
      expertApplyId,
    });

    let mounted = true;
    setLoading(true);

    getContractDetail(contractId)
      .then((data) => {
        if (mounted) {
          setContract(data);
          if (data.workspaceId) {
            toast.success("Workspace đã sẵn sàng!");
            router.push(`/workspace/${data.workspaceId}`);
          }
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy thông tin hợp đồng:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open, contractId, router]);

  // Hành động 1: Ký hợp đồng
  const handleSign = async () => {
    if (!contractId) return;
    setLoading(true);
    try {
      await signContract(contractId);
      toast.success("Ký hợp đồng thành công!");

      // Tải lại chi tiết hợp đồng để thấy trạng thái clientSigned = true
      const updated = await getContractDetail(contractId);
      setContract(updated);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Ký hợp đồng thất bại. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Hành động 2: Xác nhận thuê & Khởi tạo Workspace (Gọi hire lần 2)
  const handleConfirmHire = async () => {
    setLoading(true);
    setHiringProgress("Đang kiểm tra ký quỹ và khởi tạo phòng làm việc...");
    try {
      const res = await hireExpert(jobPostId, expertApplyId);

      // Trường hợp ví thiếu tiền
      if (res.shortfallAmount && res.shortfallAmount > 0) {
        setShortfallAmount(res.shortfallAmount);
        toast.warning(
          `Số dư ví không đủ! Cần nạp thêm ${res.shortfallAmount.toLocaleString()} VNĐ qua VNPay.`,
        );
        return;
      }

      // Trường hợp tạo Workspace thành công!
      if (res.workspaceId) {
        toast.success("Thuê Expert thành công! Đang chuyển đến phòng làm việc...");
        onOpenChange(false);
        if (onSuccess) {
          onSuccess(res.workspaceId);
        } else {
          router.push(`/workspace/${res.workspaceId}`);
        }
        return;
      }

      // Nếu backend trả về thông báo khác
      if (res.message) {
        toast.info(res.message);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Có lỗi xảy ra khi hoàn tất thuê Expert. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
      setHiringProgress("");
    }
  };

  const isClientSigned = contract?.clientSigned ?? false;
  const isExpertSigned = contract?.expertSigned ?? false;
  const isFullySigned =
    contract?.status === "FULLY_SIGNED" || (isClientSigned && isExpertSigned);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-slate-100">
        <DialogHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/80 px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <FileSignature className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-extrabold text-slate-950">
                Hợp Đồng Thuê Chuyên Gia
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Quy trình thuê chuẩn hợp đồng pháp lý & ký quỹ an toàn qua Escrow
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5 max-h-[75vh] overflow-y-auto">
          {/* Thông tin cảnh báo thiếu tiền cọc (Shortfall Amount) */}
          {shortfallAmount && shortfallAmount > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-extrabold text-amber-900">
                    Số dư ví không đủ để ký quỹ dự án!
                  </h4>
                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    Bạn cần ký quỹ số tiền còn thiếu là{" "}
                    <strong className="text-amber-900 font-bold">
                      {shortfallAmount.toLocaleString()} VNĐ
                    </strong>{" "}
                    để hệ thống trừ vào ví chung Escrow và tạo Workspace.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => router.push("/client/dashboard/wallet")}
                    className="mt-3 rounded-xl bg-amber-600 text-white hover:bg-amber-700"
                  >
                    <WalletCards className="mr-1.5 h-4 w-4" />
                    Nạp tiền vào ví qua VNPay
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Chi tiết hợp đồng */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Mã Hợp Đồng
                </span>
                <p className="font-mono text-sm font-extrabold text-slate-900">
                  {contractId || "Đang tạo..."}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`rounded-full px-3 py-1 font-bold ${
                  isFullySigned
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-indigo-200 bg-indigo-50 text-indigo-700"
                }`}
              >
                {contract?.status || "PENDING"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ngân sách ký quỹ (Escrow)
                </span>
                <p className="text-lg font-extrabold text-indigo-600">
                  {contract?.proposedBudget
                    ? `${contract.proposedBudget.toLocaleString()} VNĐ`
                    : "Đang cập nhật..."}
                </p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Thời gian ước tính
                </span>
                <p className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-1">
                  <Clock4 className="h-4 w-4 text-slate-400" />
                  {contract?.estimatedDays
                    ? `${contract.estimatedDays} ngày`
                    : "Theo thoả thuận"}
                </p>
              </div>
            </div>

            {/* Trạng thái ký hợp đồng 2 bên */}
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                Tiến độ ký hợp đồng
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isClientSigned
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isClientSigned ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Clock4 className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Bên Thuê (Client)
                    </p>
                    <p className="text-xs text-slate-500">
                      {isClientSigned ? "Đã ký hợp đồng" : "Chưa ký"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isExpertSigned
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isExpertSigned ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Clock4 className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Chuyên Gia (Expert)
                    </p>
                    <p className="text-xs text-slate-500">
                      {isExpertSigned ? "Đã ký hợp đồng" : "Chờ chuyên gia ký"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Điều khoản bảo vệ Escrow */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-indigo-600 mt-0.5" />
              <div className="text-xs leading-5 text-indigo-950">
                <p className="font-bold">Bảo vệ thanh toán qua Escrow:</p>
                <p className="text-slate-600 mt-0.5">
                  Tiền cọc dự án sẽ được giữ an toàn tại tài khoản trung gian của
                  hệ thống. Expert chỉ nhận được thanh toán (90%) sau khi bạn bấm
                  nghiệm thu và duyệt hoàn tất dự án.
                </p>
              </div>
            </div>
          </div>

          {hiringProgress ? (
            <p className="text-center text-xs font-semibold text-indigo-600 animate-pulse">
              {hiringProgress}
            </p>
          ) : null}
        </div>

        <DialogFooter className="border-t border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Đóng
          </Button>

          <div className="flex items-center gap-2">
            {/* Nút 1: Ký hợp đồng nếu Client chưa ký */}
            {!isClientSigned ? (
              <Button
                type="button"
                onClick={handleSign}
                disabled={loading}
                className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <FileSignature className="mr-2 h-4 w-4" />
                Ký Hợp Đồng Ngay
              </Button>
            ) : null}

            {/* Nút 2: Xác nhận thuê & Khởi tạo Workspace */}
            <Button
              type="button"
              onClick={handleConfirmHire}
              disabled={loading}
              className={`rounded-xl text-white shadow-md ${
                isFullySigned
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-600/20"
              }`}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isFullySigned
                ? "Xác Nhận & Khởi Tạo Workspace"
                : "Xác Nhận Thuê & Ký Quỹ"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
