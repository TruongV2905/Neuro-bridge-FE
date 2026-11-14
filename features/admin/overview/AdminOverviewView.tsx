"use client";

import Link from "next/link";
import {
  Users,
  Cpu,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  UserCheck,
  Briefcase,
  Layers,
  Activity,
  Server,
  RefreshCw,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilterUsers } from "@/services/user.service";
import { UserRole, UserStatus, type User } from "@/types/user/user.type";

export function AdminOverviewView() {
  const allUsersQuery = useFilterUsers({
    page: 0,
    size: 6,
    sortBy: "createdAt",
    sortDirection: "DESCENDING",
  });

  const expertsQuery = useFilterUsers({
    page: 0,
    size: 1,
    filter: { role: UserRole.EXPERT },
  });

  const clientsQuery = useFilterUsers({
    page: 0,
    size: 1,
    filter: { role: UserRole.CLIENT },
  });

  const totalUsers = allUsersQuery.data?.result?.metadata?.totalElements ?? 0;
  const totalExperts = expertsQuery.data?.result?.metadata?.totalElements ?? 0;
  const totalClients = clientsQuery.data?.result?.metadata?.totalElements ?? 0;
  const recentUsers: User[] = allUsersQuery.data?.result?.data ?? [];

  const isLoading = allUsersQuery.isLoading;

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Bảng Điều Khiển Quản Trị Hệ Thống
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Tổng Quan Nền Tảng VIAA
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Giám sát tình trạng tài khoản người dùng, danh mục kỹ năng, dự án và hạ tầng hệ thống.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void allUsersQuery.refetch();
                void expertsQuery.refetch();
                void clientsQuery.refetch();
              }}
              className="rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Làm mới
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
            >
              <Link href="/admin/dashboard/users">
                <Users className="mr-2 h-3.5 w-3.5" />
                Quản lý người dùng
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Tổng Người Dùng"
            value={isLoading ? "..." : String(totalUsers)}
            description="Tài khoản trên hệ thống"
            icon={Users}
            badge="Tất cả"
            color="indigo"
          />
          <KpiCard
            title="Chuyên Gia AI"
            value={isLoading ? "..." : String(totalExperts)}
            description="Chuyên gia sẵn sàng nhận dự án"
            icon={Briefcase}
            badge="AI Expert"
            color="emerald"
          />
          <KpiCard
            title="Khách Hàng (Client)"
            value={isLoading ? "..." : String(totalClients)}
            description="Doanh nghiệp & Bên tuyển dụng"
            icon={UserCheck}
            badge="Client"
            color="sky"
          />
          <KpiCard
            title="Hạ Tầng Dịch Vụ"
            value="100%"
            description="Tất cả dịch vụ hoạt động bình thường"
            icon={Activity}
            badge="Online"
            color="violet"
          />
        </div>

        {/* Navigation & Management Shortcuts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ManagementCard
            title="Quản Lý Tài Khoản Người Dùng"
            description="Xem danh sách người dùng, tìm kiếm theo tên/email, duyệt hoặc khóa tài khoản và xem chi tiết profile."
            href="/admin/dashboard/users"
            icon={Users}
            badgeText="Users Crud"
            color="indigo"
          />
          <ManagementCard
            title="Danh Mục Kỹ Năng & Lĩnh Vực"
            description="Quản lý từ điển kỹ năng AI, Machine Learning, Deep Learning, phân loại ngành nghề và tiêu chuẩn chuyên gia."
            href="/admin/dashboard/skills"
            icon={Cpu}
            badgeText="Skills Crud"
            color="emerald"
          />
          <ManagementCard
            title="Không Gian Làm Việc Dự Án"
            description="Theo dõi danh sách các Workspace, tiến độ dự án, quy trình ký kết hợp đồng và nghiệm thu giải ngân."
            href="/admin/dashboard/projects"
            icon={FolderOpen}
            badgeText="Projects"
            color="sky"
          />
        </div>

        {/* System Health & Recent Users Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Users List */}
          <div className="lg:col-span-2">
            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-extrabold text-slate-900">
                    Người Dùng Mới Nhất
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Danh sách tài khoản vừa đăng ký trên nền tảng
                  </p>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50"
                >
                  <Link href="/admin/dashboard/users">
                    Xem tất cả <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3 py-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-2xl" />
                    ))}
                  </div>
                ) : recentUsers.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-400">
                    Chưa có dữ liệu người dùng
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentUsers.map((user) => (
                      <div
                        key={user.id || user.code}
                        className="flex items-center justify-between py-3.5 transition hover:bg-slate-50/60 rounded-xl px-2"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback className="bg-indigo-50 font-bold text-indigo-700 text-xs">
                              {user.fullName?.slice(0, 2).toUpperCase() || "NB"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {user.fullName || "Người dùng"}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <RoleBadge role={user.role} />
                          <StatusBadge status={user.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* System Status & Infrastructure */}
          <div className="space-y-6">
            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Server className="h-4 w-4 text-indigo-600" />
                  Trạng Thái Dịch Vụ
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Theo dõi trạng thái các microservice
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <ServiceStatusItem
                  name="Identity & User Service"
                  status="Operational"
                  latency="42ms"
                />
                <ServiceStatusItem
                  name="Job Post & Proposal Service"
                  status="Operational"
                  latency="58ms"
                />
                <ServiceStatusItem
                  name="Payment & Escrow System"
                  status="Operational"
                  latency="65ms"
                />
                <ServiceStatusItem
                  name="Chat Room & WebSocket"
                  status="Operational"
                  latency="28ms"
                />
                <ServiceStatusItem
                  name="Workspace & Submission"
                  status="Operational"
                  latency="51ms"
                />
              </CardContent>
            </Card>

            <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-md">
              <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                VIAA AI Platform
              </div>
              <h3 className="mt-2 text-lg font-extrabold">
                Chào mừng Quản trị viên
              </h3>
              <p className="mt-1 text-xs text-indigo-100 leading-5">
                Bạn có toàn quyền quản trị người dùng, duyệt danh mục kỹ năng, kiểm soát không gian làm việc và cấu hình hệ thống.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  badge,
  color,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  color: "indigo" | "emerald" | "sky" | "violet";
}) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    sky: "bg-sky-50 text-sky-600 border-sky-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
  };

  return (
    <Card className="rounded-3xl border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`rounded-xl p-2.5 border ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </div>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </Card>
  );
}

function ManagementCard({
  title,
  description,
  href,
  icon: Icon,
  badgeText,
  color,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeText: string;
  color: "indigo" | "emerald" | "sky";
}) {
  return (
    <Card className="rounded-3xl border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-800">
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="outline" className="rounded-full text-[11px] font-bold">
            {badgeText}
          </Badge>
        </div>
        <h3 className="mt-4 text-base font-extrabold text-slate-900">{title}</h3>
        <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100">
        <Button
          asChild
          variant="ghost"
          className="w-full justify-between rounded-xl px-3 text-xs font-bold text-indigo-600 hover:bg-indigo-50"
        >
          <Link href={href}>
            Truy cập trang quản lý
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function ServiceStatusItem({
  name,
  status,
  latency,
}: {
  name: string;
  status: string;
  latency: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10B981]" />
        <span className="text-xs font-bold text-slate-700">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium text-slate-400">{latency}</span>
        <Badge
          variant="outline"
          className="rounded-full border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-700"
        >
          {status}
        </Badge>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role?: UserRole }) {
  switch (role) {
    case UserRole.EXPERT:
      return (
        <Badge
          variant="outline"
          className="rounded-full border-indigo-200 bg-indigo-50 text-[10px] font-bold text-indigo-700"
        >
          Expert
        </Badge>
      );
    case UserRole.CLIENT:
      return (
        <Badge
          variant="outline"
          className="rounded-full border-sky-200 bg-sky-50 text-[10px] font-bold text-sky-700"
        >
          Client
        </Badge>
      );
    case UserRole.ADMINISTRATOR:
      return (
        <Badge
          variant="outline"
          className="rounded-full border-purple-200 bg-purple-50 text-[10px] font-bold text-purple-700"
        >
          Admin
        </Badge>
      );
    default:
      return null;
  }
}

function StatusBadge({ status }: { status?: UserStatus }) {
  switch (status) {
    case UserStatus.ACTIVE:
      return (
        <Badge
          variant="outline"
          className="rounded-full border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-700"
        >
          Active
        </Badge>
      );
    case UserStatus.BANNED:
      return (
        <Badge
          variant="outline"
          className="rounded-full border-rose-200 bg-rose-50 text-[10px] font-bold text-rose-700"
        >
          Banned
        </Badge>
      );
    case UserStatus.INACTIVE:
    default:
      return (
        <Badge
          variant="outline"
          className="rounded-full border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700"
        >
          Inactive
        </Badge>
      );
  }
}
