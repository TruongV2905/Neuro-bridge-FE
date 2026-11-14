"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock4, FileSignature, Loader2, ShieldCheck } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getContractDetail, signContract } from "@/services/hire-contract.service";
import type { ContractDetail } from "@/types/contract.types";

type ExpertSignContractModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultContractId?: string;
  onSuccess?: () => void;
};

export function ExpertSignContractModal({
  open,
  onOpenChange,
  defaultContractId = "",
  onSuccess,
}: ExpertSignContractModalProps) {
  const [contractIdInput, setContractIdInput] = useState(defaultContractId);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<ContractDetail | null>(null);

  useEffect(() => {
    if (defaultContractId) {
      setContractIdInput(defaultContractId);
    }
  }, [defaultContractId]);

  const handleLookupContract = async () => {
    const id = contractIdInput.trim();
    if (!id) {
      toast.warning("Vui lòng nhập mã hợp đồng.");
      return;
    }
    setLoading(true);
    try {
      const data = await getContractDetail(id);
      setContract(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không tìm thấy hợp đồng.");
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    const id = contract?.id || contractIdInput.trim();
    if (!id) return;

    setLoading(true);
    try {
      await signContract(id);
      toast.success("Expert ký hợp đồng thành công!");
      const updated = await getContractDetail(id);
      setContract(updated);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Ký hợp đồng thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const isClientSigned = contract?.clientSigned ?? false;
  const isExpertSigned = contract?.expertSigned ?? false;
  const isFullySigned =
    contract?.status === "FULLY_SIGNED" || (isClientSigned && isExpertSigned);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border-slate-100">
        <DialogHeader className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/80 px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <FileSignature className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-extrabold text-slate-950">
                Ký Hợp Đồng Dự Án (Chuyên Gia)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Xác nhận điều khoản hợp đồng & điều kiện thanh toán Escrow
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mã Hợp Đồng (Contract ID)
            </Label>
            <div className="flex gap-2">
              <Input
                value={contractIdInput}
                onChange={(e) => setContractIdInput(e.target.value)}
                placeholder="Nhập mã hợp đồng từ thông báo hoặc Client..."
                className="rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleLookupContract}
                disabled={loading || !contractIdInput.trim()}
                className="rounded-xl"
              >
                Kiểm tra
              </Button>
            </div>
          </div>

          {contract && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-xs font-bold text-slate-500">Trạng thái</span>
                <Badge
                  variant="outline"
                  className={`rounded-full px-2.5 py-0.5 font-bold ${
                    isFullySigned
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-indigo-200 bg-indigo-50 text-indigo-700"
                  }`}
                >
                  {contract.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">
                    Ngân sách nhận (90%)
                  </span>
                  <p className="text-base font-extrabold text-emerald-600">
                    {contract.proposedBudget
                      ? `${(contract.proposedBudget * 0.9).toLocaleString()} VNĐ`
                      : "Theo thoả thuận"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">
                    Thời gian dự kiến
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {contract.estimatedDays
                      ? `${contract.estimatedDays} ngày`
                      : "Theo thoả thuận"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {isClientSigned ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Clock4 className="h-4 w-4 text-slate-400" />
                    )}
                    <span>Client: {isClientSigned ? "Đã ký" : "Chưa ký"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isExpertSigned ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Clock4 className="h-4 w-4 text-slate-400" />
                    )}
                    <span>Expert: {isExpertSigned ? "Đã ký" : "Chưa ký"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-500 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Khi cả hai bên ký hợp đồng và Client ký quỹ Escrow thành công,
                  phòng làm việc Workspace sẽ tự động được khởi tạo.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-3 bg-slate-50/50">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Đóng
          </Button>

          {contract && !isExpertSigned && (
            <Button
              type="button"
              onClick={handleSign}
              disabled={loading}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <FileSignature className="mr-2 h-4 w-4" />
              Ký Hợp Đồng Ngay
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
