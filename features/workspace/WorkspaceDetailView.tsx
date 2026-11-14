"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  CheckCircle2,
  Clock4,
  ExternalLink,
  FileText,
  FolderKanban,
  Loader2,
  LockKeyhole,
  MessageSquareText,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { toast } from "react-toastify";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RootState } from "@/redux/store";
import { completeProject } from "@/services/hire-contract.service";
import { useProjectEscrowPayment } from "@/services/payment.service";
import { useSubmissionPackagesByWorkspace } from "@/services/submission-package.service";
import { useWorkspaceDetail } from "@/services/workspace.service";
import { UserRole, type UserResponse } from "@/types/user/user.type";
import type { WorkspaceParticipant } from "@/types/workspace.type";
import { formatMoney } from "@/utils/formatMoney";

import { ClientProjectSubmissionPanel } from "./submission/components/ClientProjectSubmissionPanel";
import { ProjectSubmissionPanel } from "./submission/components/ProjectSubmissionPanel";

type WorkspaceRole = "CLIENT" | "EXPERT";

const WORKSPACE_FLOW_STEPS = [
  "Khởi tạo & Ký quỹ Escrow",
  "Triển khai & Trao đổi",
  "Bàn giao sản phẩm (Packages)",
  "Nghiệm thu & Giải ngân tiền",
] as const;

export function WorkspaceDetailView({
  workspaceId,
  role,
}: {
  workspaceId: string;
  role?: WorkspaceRole;
}) {
  const [completing, setCompleting] = useState(false);

  const currentUser = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null;

  const effectiveRole: WorkspaceRole =
    role ?? (currentUser?.role === UserRole.CLIENT ? "CLIENT" : "EXPERT");
  const isClient = effectiveRole === "CLIENT";
  const isExpert = effectiveRole === "EXPERT";

  const workspaceQuery = useWorkspaceDetail(workspaceId);
  const workspace = workspaceQuery.data;

  const packagesQuery = useSubmissionPackagesByWorkspace(
    workspace?.workspaceId ?? workspaceId,
  );
  const packages = packagesQuery.data ?? [];

  const escrowQuery = useProjectEscrowPayment(workspace?.escrowId, {
    enabled: Boolean(workspace?.escrowId),
  });
  const escrowData = escrowQuery.data;

  if (workspaceQuery.isLoading) return <LoadingState />;

  if (workspaceQuery.isError || !workspace) {
    return (
      <PageShell>
        <StatePanel
          title="Không thể tải dữ liệu Workspace"
          message={getErrorMessage(workspaceQuery.error)}
          projectsHref={`/${effectiveRole.toLowerCase()}/dashboard/projects`}
          retry={
            workspaceQuery.isError ? () => workspaceQuery.refetch() : undefined
          }
        />
      </PageShell>
    );
  }

  const isCompleted =
    workspace.projectStatus === "COMPLETED" ||
    workspace.status === "CLOSED" ||
    workspace.progressPercentage >= 100;

  const escrowAmount =
    Number(escrowData?.amount) || Number(escrowData?.heldAmount) || 0;
  const expertPayout =
    Number(escrowData?.heldAmount) || Math.round(escrowAmount * 0.9);
  const platformFee =
    Number(escrowData?.platformFee) || Math.round(escrowAmount * 0.1);

  const handleCompleteProject = async () => {
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn nghiệm thu và kết thúc dự án? Số tiền ký quỹ (90%) sẽ được giải ngân ngay vào ví của Expert.",
    );
    if (!confirm) return;

    setCompleting(true);
    try {
      const targetId = workspace.projectId || workspace.workspaceId;
      await completeProject(targetId);
      toast.success(
        "Dự án đã được nghiệm thu và giải ngân tiền cho Expert thành công!",
      );
      void workspaceQuery.refetch();
      void escrowQuery.refetch();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Không thể hoàn tất dự án. Vui lòng thử lại.",
      );
    } finally {
      setCompleting(false);
    }
  };

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Navigation Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href={`/${effectiveRole.toLowerCase()}/dashboard/projects`}
              className="inline-flex items-center gap-1 font-semibold transition hover:text-indigo-600"
            >
              <ArrowLeft className="h-4 w-4" /> Danh sách dự án
            </Link>
            <span>/</span>
            <span className="font-mono text-xs font-bold text-slate-700">
              {workspace.workspaceId}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
            >
              <Link
                href={`/chat-room/${encodeURIComponent(workspace.workspaceId)}`}
              >
                <MessageSquareText className="mr-2 h-4 w-4" /> Phòng Chat Dự Án
              </Link>
            </Button>

            {isClient && !isCompleted && (
              <Button
                type="button"
                onClick={handleCompleteProject}
                disabled={completing}
                className="rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
              >
                {completing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                {completing ? "Đang giải ngân..." : "Nghiệm Thu & Giải Ngân"}
              </Button>
            )}
          </div>
        </div>

        {/* Hero Banner with 4-Phase Stepper */}
        <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300 backdrop-blur-md">
                <FolderKanban className="h-3.5 w-3.5" />
                Không Gian Làm Việc Dự Án (Workspace)
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
                {workspace.projectName || "Dự án chuyên gia"}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge value={workspace.status} />
                <StatusBadge value={workspace.projectStatus} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 shrink-0">
              <HeroMetric
                icon={CalendarDays}
                label="Bắt đầu"
                value={formatDate(workspace.startDate)}
              />
              <HeroMetric
                icon={Clock4}
                label="Hạn chót"
                value={formatDate(workspace.deadline)}
              />
              <HeroMetric
                icon={FolderKanban}
                label="Tiến độ"
                value={`${clamp(workspace.progressPercentage)}%`}
              />
            </div>
          </div>

          {/* Stepper 4 Giai Đoạn Tới Giải Ngân */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Tiến Trình 4 Giai Đoạn Tới Giải Ngân Escrow
              </p>
              <span className="text-xs font-bold text-white/70">
                {isCompleted
                  ? "Hoàn tất 4/4 giai đoạn"
                  : packages.length > 0
                    ? "Đang ở Giai đoạn 3 (Bàn giao)"
                    : "Đang ở Giai đoạn 2 (Triển khai)"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {WORKSPACE_FLOW_STEPS.map((step, idx) => {
                const isPassed =
                  idx === 0 ||
                  (idx === 1 && (packages.length > 0 || isCompleted)) ||
                  (idx === 2 && (packages.length > 0 || isCompleted)) ||
                  (idx === 3 && isCompleted);

                const isCurrent =
                  (!isCompleted && idx === 1 && packages.length === 0) ||
                  (!isCompleted && idx === 2 && packages.length > 0) ||
                  (isCompleted && idx === 3);

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 rounded-2xl border p-2.5 transition ${
                      isPassed
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : isCurrent
                          ? "border-indigo-400 bg-white/10 shadow-sm"
                          : "border-white/5 bg-white/5 opacity-60"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                        isPassed
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                            ? "bg-indigo-400 text-slate-950 font-black animate-pulse"
                            : "bg-white/10 text-white/50"
                      }`}
                    >
                      {isPassed ? "✓" : idx + 1}
                    </span>
                    <span
                      className={`text-xs font-bold truncate ${
                        isPassed
                          ? "text-emerald-300"
                          : isCurrent
                            ? "text-white"
                            : "text-white/40"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Layout: 2 Columns */}
        <div className="grid gap-6 lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_480px]">
          {/* Cột Trái: Thông tin dự án, Thành viên & Tài chính Escrow */}
          <div className="space-y-6">
            {/* Thẻ 1: Tổng quan dự án */}
            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 px-6 py-5">
                <CardTitle className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                  <FolderKanban className="h-5 w-5 text-indigo-600" />
                  Tổng Quan Dự Án & Tiến Độ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailTile label="Tên dự án" value={workspace.projectName} />
                  <DetailTile
                    label="Trạng thái Workspace"
                    value={formatLabel(workspace.status)}
                  />
                  <DetailTile
                    label="Trạng thái Dự án"
                    value={formatLabel(workspace.projectStatus)}
                  />
                  <DetailTile
                    label="Ngày bắt đầu"
                    value={formatDate(workspace.startDate)}
                  />
                  <DetailTile
                    label="Hạn chót hoàn thành"
                    value={formatDate(workspace.deadline)}
                  />
                  <DetailTile
                    label="Ngày tạo phòng"
                    value={formatDate(workspace.createdAt)}
                  />
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                    <span>Tiến độ thực hiện</span>
                    <span className="text-sm font-extrabold text-indigo-600">
                      {clamp(workspace.progressPercentage)}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${clamp(workspace.progressPercentage)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thẻ 2: Thành viên Workspace */}
            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 px-6 py-5">
                <CardTitle className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Thành Viên Tham Gia
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <MemberCard participant={workspace.client} role="Bên Thuê (Client)" />
                  <MemberCard participant={workspace.expert} role="Chuyên Gia (Expert)" />
                </div>
              </CardContent>
            </Card>

            {/* Thẻ 3: Tài chính & Ký quỹ Escrow */}
            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 px-6 py-5">
                <CardTitle className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Tài Chính & Ký Quỹ Escrow
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Tổng Cọc Escrow
                    </span>
                    <p className="mt-1 text-lg font-extrabold text-slate-900">
                      {escrowAmount > 0
                        ? formatMoney(escrowAmount)
                        : "Theo hợp đồng"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Expert Nhận (90%)
                    </span>
                    <p className="mt-1 text-lg font-extrabold text-emerald-700">
                      {expertPayout > 0
                        ? formatMoney(expertPayout)
                        : "Theo hợp đồng"}
                    </p>
                    <span className="text-[10px] text-emerald-600">
                      Giải ngân sau khi nghiệm thu
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Phí Nền Tảng (10%)
                    </span>
                    <p className="mt-1 text-base font-extrabold text-slate-600">
                      {platformFee > 0
                        ? formatMoney(platformFee)
                        : "10% phí dịch vụ"}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Bảo đảm trung gian
                    </span>
                  </div>
                </div>

                <div
                  className={`rounded-2xl border p-4 ${
                    isCompleted
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-sky-200 bg-sky-50 text-sky-900"
                  }`}
                >
                  <p className="text-xs font-bold flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <LockKeyhole className="h-4 w-4 text-sky-600" />
                    )}
                    {isCompleted
                      ? "✅ Đã giải ngân thành công 90% ngân sách về ví Chuyên gia!"
                      : "🔒 100% ngân sách đang được tạm giữ an toàn trong ví trung gian Escrow."}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {isCompleted
                      ? "Dự án đã kết thúc hoàn hảo. Chuyên gia có thể kiểm tra số dư ví để rút tiền."
                      : "Khoản tiền sẽ chỉ được chuyển vào ví của Expert sau khi Bên Thuê duyệt các gói bàn giao và xác nhận nghiệm thu dự án."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Thẻ 4: Thông tin tham chiếu */}
            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Mã phòng Workspace" value={workspace.workspaceId} />
                  <Field label="Mã Jobpost" value={workspace.jobId} />
                  <Field label="Mã Ký Quỹ Escrow" value={workspace.escrowId} />
                  <Field
                    label="Mã Dự Án (Project ID)"
                    value={workspace.projectId || "Đồng bộ cùng Workspace"}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cột Phải: QUẢN LÝ GÓI BÀN GIAO (SUBMISSION PACKAGES) */}
          <div className="space-y-6">
            {isExpert ? (
              <div className="space-y-4">
                <ProjectSubmissionPanel workspaceId={workspace.workspaceId} />
              </div>
            ) : (
              <div className="space-y-6">
                <ClientProjectSubmissionPanel
                  workspaceId={workspace.workspaceId}
                />

                {/* Hộp thoại Nghiệm thu & Giải ngân dành cho Client */}
                {!isCompleted ? (
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-extrabold text-emerald-950">
                          Nghiệm Thu & Giải Ngân Dự Án
                        </h4>
                        <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                          Sau khi đã kiểm tra các file bàn giao từ Chuyên gia ở trên, bấm nút dưới đây để nghiệm thu và giải ngân <strong>90% tiền cọc</strong> từ ví Escrow sang ví Chuyên gia.
                        </p>
                        <Button
                          type="button"
                          onClick={handleCompleteProject}
                          disabled={completing}
                          className="mt-4 h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700"
                        >
                          {completing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang giải ngân...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              🏆 Nghiệm Thu Dự Án & Giải Ngân Escrow
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
                    <CheckCircle className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                    <p className="text-sm font-extrabold text-emerald-950">
                      Dự án đã được nghiệm thu & giải ngân thành công!
                    </p>
                    <p className="mt-1 text-xs text-emerald-700">
                      Toàn bộ 90% số tiền cọc đã được chuyển vào số dư ví của Chuyên gia.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">{children}</div>
    </main>
  );
}

function LoadingState() {
  return (
    <PageShell>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="mt-5 h-72 rounded-3xl" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_440px]">
        <Skeleton className="h-96 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    </PageShell>
  );
}

function StatePanel({
  title,
  message,
  projectsHref,
  retry,
}: {
  title: string;
  message: string;
  projectsHref: string;
  retry?: () => void;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <AlertTriangle className="mx-auto h-7 w-7 text-amber-600" />
      <h1 className="mt-4 text-xl font-extrabold text-slate-950">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      <div className="mt-5 flex justify-center gap-3">
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={projectsHref}>Về danh sách dự án</Link>
        </Button>
        {retry && (
          <Button
            onClick={retry}
            className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
          </Button>
        )}
      </div>
    </section>
  );
}

function MemberCard({
  participant,
  role,
}: {
  participant: WorkspaceParticipant;
  role: string;
}) {
  const name = participant?.name?.trim() || "Chưa xác định";
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
      <Avatar className="h-11 w-11">
        {participant?.avatarUrl && (
          <AvatarImage src={participant.avatarUrl} alt={name} />
        )}
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="font-extrabold text-slate-900 truncate">{name}</p>
        <p className="text-xs font-semibold text-slate-500">{role}</p>
      </div>
    </div>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-sm font-extrabold text-white">{value}</p>
    </div>
  );
}

function DetailTile({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 break-words text-sm font-extrabold text-slate-900">
        {value?.trim() || "Chưa cập nhật"}
      </p>
    </div>
  );
}

function StatusBadge({ value }: { value?: string | null }) {
  return (
    <Badge
      variant="outline"
      className="rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold text-white border-white/20"
    >
      {formatLabel(value)}
    </Badge>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 font-mono text-xs font-extrabold text-slate-900 break-all">
        {value?.trim() || "Không có"}
      </p>
    </div>
  );
}

function clamp(value: number) {
  return Number.isFinite(value)
    ? Math.min(100, Math.max(0, Math.round(value)))
    : 0;
}

function formatLabel(value?: string | null) {
  return (
    value
      ?.trim()
      .replace(/[_-]+/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Đang xử lý"
  );
}

function formatDate(value?: string | null) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date)
    : "Chưa xác định";
}

function getInitials(value: string) {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "NB"
  );
}

function getErrorMessage(error: unknown) {
  const apiError = error as
    | { response?: { data?: { message?: string } }; message?: string }
    | undefined;
  return (
    apiError?.response?.data?.message ||
    apiError?.message ||
    "Không thể tải dữ liệu Workspace. Vui lòng thử lại."
  );
}
