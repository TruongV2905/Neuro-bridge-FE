"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import {
  ArrowRight,
  Clock4,
  FileSignature,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { contractKeys, getContractById } from "@/services/contract.service";
import { useGetJobPostById } from "@/services/job-post.service";
import { useGetUserByCode } from "@/services/user.service";
import type { ContractResponse, ContractStatus } from "@/types/contract.type";
import {
  readSavedContracts,
  removeSavedContract,
  saveContractReferenceFromResponse,
  type ContractRole,
  type SavedContractReference,
} from "./contractStorage";

type ContractListViewProps = {
  role: ContractRole;
};

export function ContractListView({ role }: ContractListViewProps) {
  const router = useRouter();
  const [contractIdInput, setContractIdInput] = useState("");
  const [savedContracts, setSavedContracts] = useState<SavedContractReference[]>(
    () => readSavedContracts(role),
  );

  const contractQueries = useQueries({
    queries: savedContracts.map((item) => ({
      queryKey: contractKeys.detail(item.id),
      queryFn: () => getContractById(item.id),
      retry: 0,
      enabled: Boolean(item.id),
    })),
  });

  const queryDataString = contractQueries
    .map(
      (q) =>
        `${q.data?.id ?? ""}-${q.data?.status ?? ""}-${q.data?.workspaceId ?? ""}`,
    )
    .join(",");

  useEffect(() => {
    contractQueries.forEach((query) => {
      if (query.data) saveContractReferenceFromResponse(query.data, role);
    });
  }, [queryDataString, role]);

  const hydratedContracts = useMemo(
    () =>
      savedContracts.map((item, index) => ({
        saved: item,
        contract: contractQueries[index]?.data,
        isLoading: contractQueries[index]?.isLoading ?? false,
        isError: contractQueries[index]?.isError ?? false,
      })),
    [contractQueries, savedContracts],
  );

  const pendingContractCount = hydratedContracts.filter(
    (item) =>
      (item.contract?.status ?? item.saved.status) &&
      (item.contract?.status ?? item.saved.status) !== "FULLY_SIGNED",
  ).length;

  const workspaceContractCount = hydratedContracts.filter(
    (item) => item.contract?.workspaceId ?? item.saved.workspaceId,
  ).length;

  const handleOpenById = () => {
    const normalized = contractIdInput.trim();
    if (!normalized) return;
    router.push(getContractDetailHref(role, normalized));
  };

  const handleRemove = (contractId: string) => {
    removeSavedContract(contractId, role);
    setSavedContracts(readSavedContracts(role));
  };

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-600">
                <FileSignature className="h-4 w-4" />
                {role === "client" ? "Hợp đồng Khách hàng" : "Hợp đồng Chuyên gia"}
              </div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                Danh Sách Hợp Đồng
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Theo dõi tiến độ ký kết hợp đồng điện tử, ký quỹ Escrow và truy cập phòng làm việc dự án.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <HeaderMetric
                label="Đã lưu"
                value={String(hydratedContracts.length)}
              />
              <HeaderMetric
                label="Chờ ký"
                value={String(pendingContractCount)}
              />
              <HeaderMetric
                label="Đã tạo Workspace"
                value={String(workspaceContractCount)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={contractIdInput}
                onChange={(event) => setContractIdInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleOpenById();
                }}
                placeholder="Dán mã Contract ID để mở trực tiếp..."
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm"
              />
            </div>
            <Button
              type="button"
              onClick={handleOpenById}
              disabled={!contractIdInput.trim()}
              className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white hover:bg-slate-800"
            >
              Mở hợp đồng
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-5">
            {hydratedContracts.length === 0 ? (
              <EmptyContractList role={role} />
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {hydratedContracts.map((item) => (
                  <ContractListCard
                    key={`${item.saved.role}-${item.saved.id}`}
                    role={role}
                    saved={item.saved}
                    contract={item.contract}
                    isLoading={item.isLoading}
                    isError={item.isError}
                    onRemove={() => handleRemove(item.saved.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ContractListCard({
  role,
  saved,
  contract,
  isLoading,
  isError,
  onRemove,
}: {
  role: ContractRole;
  saved: SavedContractReference;
  contract?: ContractResponse;
  isLoading: boolean;
  isError: boolean;
  onRemove: () => void;
}) {
  const status = contract?.status ?? saved.status;
  const statusMeta = getContractStatusMeta(status);
  const jobId = contract?.jobId ?? contract?.jobPostId ?? saved.jobPostId ?? "";
  const partnerCode = getPartnerCode(contract, saved, role);
  const jobQuery = useGetJobPostById(
    { id: jobId },
    { enabled: Boolean(jobId) },
  );
  const partnerQuery = useGetUserByCode(
    { code: partnerCode ?? "" },
    { enabled: Boolean(partnerCode) },
  );

  const projectName = getContractProjectName({
    contractProjectName: contract?.projectName,
    savedProjectName: saved.projectName,
    jobTitle: jobQuery.data?.result?.title,
    isJobLoading: jobQuery.isLoading,
  });

  const partnerName = getPartnerDisplayName(
    partnerQuery.data?.result?.fullName,
    role,
  );
  const counterpartyLabel = role === "client" ? "Expert" : "Client";

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Badge
            variant="outline"
            className={cn("rounded-full text-[11px] font-bold", statusMeta.badge)}
          >
            {isLoading ? "Đang cập nhật..." : statusMeta.label}
          </Badge>
          <h2 className="mt-3 line-clamp-2 text-base font-extrabold text-slate-950">
            {projectName}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-semibold text-slate-500">
            <UserRound className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">
              {counterpartyLabel}: {partnerName}
            </span>
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={onRemove}
          className="h-9 w-9 shrink-0 rounded-xl p-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          title="Xóa khỏi danh sách lưu"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MiniMetric
          label="Bên Thuê (Client)"
          value={contract?.clientSigned ? "✅ Đã ký" : "⏳ Chưa ký"}
        />
        <MiniMetric
          label="Chuyên Gia (Expert)"
          value={contract?.expertSigned ? "✅ Đã ký" : "⏳ Chưa ký"}
        />
      </div>

      {isError ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
          Không thể đồng bộ dữ liệu mới nhất. Bạn vẫn có thể mở trực tiếp hợp đồng.
        </p>
      ) : null}

      <Button
        asChild
        className="mt-4 h-11 w-full rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm hover:bg-slate-800"
      >
        <Link href={getContractDetailHref(role, saved.id)}>
          Xem chi tiết hợp đồng
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </article>
  );
}

function EmptyContractList({ role }: { role: ContractRole }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
      <Clock4 className="mx-auto h-10 w-10 text-slate-300" />
      <p className="mt-3 text-sm font-extrabold text-slate-900">
        Chưa có hợp đồng nào được lưu
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
        {role === "client"
          ? "Hợp đồng sẽ xuất hiện tại đây sau khi bạn phê duyệt ứng viên hoặc bấm Thuê Expert. Bạn cũng có thể dán Contract ID ở trên để mở."
          : "Khi bạn mở hợp đồng từ thông báo hoặc ứng tuyển, hợp đồng sẽ được lưu tại đây để tra cứu nhanh."}
      </p>
    </div>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-extrabold text-slate-950">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xs font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function getContractDetailHref(role: ContractRole, contractId: string) {
  return `/${role}/dashboard/contracts/${encodeURIComponent(contractId)}`;
}

function getPartnerCode(
  contract: ContractResponse | undefined,
  saved: SavedContractReference,
  role: ContractRole,
) {
  if (role === "client") {
    return contract?.expertCode ?? saved.partnerCode ?? null;
  }

  return contract?.clientCode ?? saved.partnerCode ?? null;
}

function getPartnerDisplayName(
  fullName: string | undefined,
  role: ContractRole,
) {
  if (fullName?.trim()) return fullName.trim();

  return role === "client" ? "Chuyên gia" : "Bên thuê (Client)";
}

function getContractProjectName({
  contractProjectName,
  savedProjectName,
  jobTitle,
  isJobLoading,
}: {
  contractProjectName?: string | null;
  savedProjectName?: string;
  jobTitle?: string;
  isJobLoading: boolean;
}) {
  const title = contractProjectName || savedProjectName || jobTitle;

  if (title?.trim()) return title.trim();
  if (isJobLoading) return "Đang tải tên dự án...";

  return "Hợp đồng dự án";
}

function getContractStatusMeta(status?: ContractStatus) {
  switch (status) {
    case "CLIENT_SIGNED":
      return {
        label: "Client đã ký",
        badge: "border-sky-200 bg-sky-50 text-sky-700",
      };
    case "EXPERT_SIGNED":
      return {
        label: "Expert đã ký",
        badge: "border-violet-200 bg-violet-50 text-violet-700",
      };
    case "FULLY_SIGNED":
      return {
        label: "Hoàn tất ký 2 bên",
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    case "CANCELLED":
      return {
        label: "Đã hủy",
        badge: "border-rose-200 bg-rose-50 text-rose-700",
      };
    case "PENDING":
    default:
      return {
        label: "Chờ ký",
        badge: "border-amber-200 bg-amber-50 text-amber-700",
      };
  }
}
