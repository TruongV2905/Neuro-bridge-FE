"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  CalendarClock,
  Coins,
  Eye,
  EyeOff,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";

import type { RootState } from "@/redux/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageWrapper from "@/components/common/PageWrapper";
import { ROUTES } from "@/constants/routes";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useChangeJobPostStatus,
  useGetClientJobPosts,
} from "@/services/jobpost.service";
import { useGetAllSkills } from "@/services/skill.service";
import {
  JobPostStatus,
  type JobPostResponse,
} from "@/types/jobpost.types";
import { UserResponse, UserRole } from "@/types/user/user.type";
import type { SkillResponse } from "@/types/skill.types";
import { formatMoney } from "@/utils/formatMoney";

import ClientJobPostStatusBadge from "./_components/ClientJobPostStatusBadge";
import DeleteJobPostDialog from "./_components/DeleteJobPostDialog";
import JobPostFormDialog from "./_components/JobPostFormDialog";

const PAGE_SIZE = 8;

export default function ClientJobPostsPage() {
  const currentUser = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null;

  const isClient = currentUser?.role === UserRole.CLIENT;

  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJobPost, setEditingJobPost] =
    useState<JobPostResponse | null>(null);
  const [deletingJobPost, setDeletingJobPost] =
    useState<JobPostResponse | null>(null);

  const { data, isLoading, isError, error } = useGetClientJobPosts({
    page,
    size: PAGE_SIZE,
    search: debouncedSearch,
    sortBy: "createdAt",
    sortDirection: "DESCENDING",
  });

  const { data: skillData } = useGetAllSkills();
  const statusMutation = useChangeJobPostStatus();

  const skills: SkillResponse[] = useMemo(
    () => skillData?.result?.data ?? [],
    [skillData],
  );

  const skillNameById = useMemo(() => {
    return Object.fromEntries(skills.map((skill) => [skill.id, skill.skillName]));
  }, [skills]);

  const jobPosts = data?.result?.data ?? [];
  const metadata = data?.result?.metadata;
  const hasSearch = debouncedSearch.trim().length > 0;

  const openCreateDialog = () => {
    setEditingJobPost(null);
    setIsFormOpen(true);
  };

  const openEditDialog = (jobPost: JobPostResponse) => {
    setEditingJobPost(jobPost);
    setIsFormOpen(true);
  };

  const handleStatusToggle = (jobPost: JobPostResponse) => {
    if (jobPost.status === JobPostStatus.ASSIGNED) {
      toast.info("Job post đã chọn expert nên không thể đổi trạng thái.");
      return;
    }

    const nextStatus =
      jobPost.status === JobPostStatus.PUBLIC
        ? JobPostStatus.PRIVATE
        : JobPostStatus.PUBLIC;

    statusMutation.mutate(
      {
        pathParams: {
          id: jobPost.id,
          jobPostStatus: nextStatus,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            nextStatus === JobPostStatus.PUBLIC
              ? "Job post đã được công khai!"
              : "Job post đã chuyển về riêng tư!",
          );
        },
        onError: (statusError) => {
          toast.error(
            statusError.response?.data?.message ??
              "Đổi trạng thái job post thất bại.",
          );
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-6xl pt-16">
      <PageWrapper
        title="Job post của tôi"
        description="Tạo, chỉnh sửa và quản lý các job post bạn dùng để tìm expert."
      >
        {!isClient ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Trang này chỉ dành cho tài khoản Client.{" "}
            <Link href={ROUTES.LOGIN} className="font-semibold underline">
              Đăng nhập
            </Link>{" "}
            bằng tài khoản Client để tiếp tục.
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => {
                    setSearchInput(event.target.value);
                    setPage(0);
                  }}
                  placeholder="Tìm theo tiêu đề, mô tả..."
                  className="h-10 pl-9"
                />
              </div>

              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                Tạo job post
              </Button>
            </div>

            {isLoading ? (
              <div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">
                Đang tải job post...
              </div>
            ) : isError ? (
              <div className="rounded-2xl border bg-white p-6 text-sm text-destructive">
                {error?.response?.data?.message ??
                  "Không tải được job post của bạn."}
              </div>
            ) : jobPosts.length === 0 ? (
              <ClientJobPostEmptyState
                hasSearch={hasSearch}
                onCreate={openCreateDialog}
                onClearSearch={() => {
                  setSearchInput("");
                  setPage(0);
                }}
              />
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {jobPosts.map((jobPost) => (
                    <ClientJobPostCard
                      key={jobPost.id}
                      jobPost={jobPost}
                      skillNameById={skillNameById}
                      statusChanging={statusMutation.isPending}
                      onEdit={() => openEditDialog(jobPost)}
                      onDelete={() => setDeletingJobPost(jobPost)}
                      onStatusToggle={() => handleStatusToggle(jobPost)}
                    />
                  ))}
                </div>

                {metadata && metadata.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Trang {metadata.page + 1} / {metadata.totalPages} ·{" "}
                      {metadata.totalElements} job post
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!metadata.hasPrevious}
                        onClick={() =>
                          setPage((currentPage) => Math.max(0, currentPage - 1))
                        }
                      >
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!metadata.hasNext}
                        onClick={() => setPage((currentPage) => currentPage + 1)}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            <JobPostFormDialog
              open={isFormOpen}
              onOpenChange={(open) => {
                setIsFormOpen(open);
                if (!open) setEditingJobPost(null);
              }}
              jobPost={editingJobPost}
              skills={skills}
            />

            <DeleteJobPostDialog
              open={!!deletingJobPost}
              onOpenChange={(open) => !open && setDeletingJobPost(null)}
              jobPost={deletingJobPost}
            />
          </>
        )}
      </PageWrapper>
    </div>
  );
}

type EmptyStateProps = {
  hasSearch: boolean;
  onCreate: () => void;
  onClearSearch: () => void;
};

function ClientJobPostEmptyState({
  hasSearch,
  onCreate,
  onClearSearch,
}: EmptyStateProps) {
  return (
    <section className="rounded-2xl border bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FileText className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-foreground">
        {hasSearch ? "Không tìm thấy job post" : "Bạn chưa có job post nào"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {hasSearch
          ? "Thử đổi từ khóa hoặc xóa tìm kiếm để xem lại toàn bộ job post của bạn."
          : "Tạo job post đầu tiên để expert có thể xem yêu cầu và gửi proposal ứng tuyển."}
      </p>

      <div className="mt-5 flex justify-center gap-2">
        {hasSearch ? (
          <Button type="button" variant="outline" onClick={onClearSearch}>
            Xóa tìm kiếm
          </Button>
        ) : (
          <Button type="button" onClick={onCreate}>
            <Plus className="h-4 w-4" />
            Tạo job post
          </Button>
        )}
      </div>
    </section>
  );
}

type CardProps = {
  jobPost: JobPostResponse;
  skillNameById: Record<number, string>;
  statusChanging: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStatusToggle: () => void;
};

function ClientJobPostCard({
  jobPost,
  skillNameById,
  statusChanging,
  onEdit,
  onDelete,
  onStatusToggle,
}: CardProps) {
  const requiredSkills = jobPost.requiredSkillIds ?? [];
  const preferredSkills = jobPost.preferredSkillIds ?? [];
  const applicantCount = jobPost.expertApplyCodes?.length ?? 0;
  const canToggleStatus = jobPost.status !== JobPostStatus.ASSIGNED;

  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-lg font-semibold text-foreground">
            {jobPost.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ClientJobPostStatusBadge status={jobPost.status} />
            <span className="text-xs text-muted-foreground">
              ID: {jobPost.id.slice(0, 8)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Sửa
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
            Xóa
          </Button>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {jobPost.description}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric
          icon={<Coins className="h-3.5 w-3.5" />}
          label="Ngân sách"
          value={`${formatMoney(jobPost.budgetFrom)} - ${formatMoney(
            jobPost.budgetTo,
          )}`}
        />
        <Metric
          icon={<CalendarClock className="h-3.5 w-3.5" />}
          label="Thời gian"
          value={`${jobPost.estimatedDays} ngày`}
        />
        <Metric
          icon={<Users className="h-3.5 w-3.5" />}
          label="Ứng viên"
          value={`${applicantCount} expert`}
        />
      </div>

      <div className="mt-4 space-y-3">
        <SkillGroup
          label="Bắt buộc"
          skillIds={requiredSkills}
          skillNameById={skillNameById}
        />
        <SkillGroup
          label="Ưu tiên"
          skillIds={preferredSkills}
          skillNameById={skillNameById}
          variant="outline"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-4">
        <Button
          type="button"
          variant={jobPost.status === JobPostStatus.PUBLIC ? "outline" : "default"}
          size="sm"
          disabled={!canToggleStatus || statusChanging}
          onClick={onStatusToggle}
        >
          {jobPost.status === JobPostStatus.PUBLIC ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              Chuyển riêng tư
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              Công khai
            </>
          )}
        </Button>

        <Button asChild size="sm" variant="secondary">
          <Link href={ROUTES.CLIENT_JOBPOST_DETAIL(jobPost.id)}>
            <Users className="h-3.5 w-3.5" />
            Xem ứng viên ({applicantCount})
          </Link>
        </Button>
      </div>
    </article>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-xs uppercase text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function SkillGroup({
  label,
  skillIds,
  skillNameById,
  variant = "secondary",
}: {
  label: string;
  skillIds: number[];
  skillNameById: Record<number, string>;
  variant?: "secondary" | "outline";
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {skillIds.length === 0 ? (
          <span className="text-xs text-muted-foreground">Không có</span>
        ) : (
          skillIds.map((id) => (
            <Badge key={id} variant={variant}>
              {skillNameById[id] ?? `Skill #${id}`}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
