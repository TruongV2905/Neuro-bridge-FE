"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  CalendarClock,
  Coins,
  Users,
} from "lucide-react";

import type { RootState } from "@/redux/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useGetJobPostById } from "@/services/jobpost.service";
import { useGetAppliesByJobPost } from "@/services/apply.service";
import { useGetAllSkills } from "@/services/skill.service";
import {
  JobPostStatus,
  type JobPostResponse,
} from "@/types/jobpost.types";
import type { ApplyJobPostResponse } from "@/types/proposal.types";
import { UserResponse, UserRole } from "@/types/user/user.type";
import type { SkillResponse } from "@/types/skill.types";
import { formatMoney } from "@/utils/formatMoney";

import ClientApplyCard from "./_components/ClientApplyCard";
import HireConfirmDialog from "./_components/HireConfirmDialog";

const STATUS_LABEL: Record<JobPostStatus, string> = {
  [JobPostStatus.PUBLIC]: "Đang mở",
  [JobPostStatus.PRIVATE]: "Riêng tư",
  [JobPostStatus.ASSIGNED]: "Đã giao",
};

const STATUS_VARIANT: Record<
  JobPostStatus,
  "default" | "secondary" | "outline"
> = {
  [JobPostStatus.PUBLIC]: "default",
  [JobPostStatus.PRIVATE]: "secondary",
  [JobPostStatus.ASSIGNED]: "outline",
};

export default function ClientJobPostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jobPostId = params?.id;

  const currentUser = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null;
  const isClient = currentUser?.role === UserRole.CLIENT;

  const [hiringApply, setHiringApply] =
    useState<ApplyJobPostResponse | null>(null);

  const {
    data: jobPostData,
    isLoading: jobPostLoading,
    isError: jobPostError,
    error: jobPostErrorObj,
  } = useGetJobPostById({ id: jobPostId });

  const {
    data: appliesData,
    isLoading: appliesLoading,
    isError: appliesError,
  } = useGetAppliesByJobPost({ jobPostId }, { enabled: !!jobPostId });

  const { data: skillData } = useGetAllSkills();

  const jobPost: JobPostResponse | null = jobPostData?.result ?? null;
  const applies = appliesData?.result ?? [];

  const skillNameById = useMemo(() => {
    const skills: SkillResponse[] = skillData?.result?.data ?? [];
    return Object.fromEntries(skills.map((s) => [s.id, s.skillName]));
  }, [skillData]);

  const canHire =
    jobPost?.status === JobPostStatus.PUBLIC ||
    jobPost?.status === JobPostStatus.PRIVATE;

  return (
    <div className="mx-auto max-w-5xl pt-16">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(ROUTES.CLIENT_JOBPOSTS)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </Button>

      {!isClient ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Trang này chỉ dành cho tài khoản Client.{" "}
          <Link href={ROUTES.LOGIN} className="font-semibold underline">
            Đăng nhập
          </Link>{" "}
          bằng tài khoản Client để tiếp tục.
        </div>
      ) : jobPostLoading ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">
          Đang tải job post...
        </div>
      ) : jobPostError || !jobPost ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-destructive">
          {jobPostErrorObj?.response?.data?.message ??
            "Không tải được job post."}
        </div>
      ) : (
        <div className="space-y-6">
          <header className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {jobPost.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant={STATUS_VARIANT[jobPost.status]}>
                    {STATUS_LABEL[jobPost.status]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ID: {jobPost.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <SummaryCard
                icon={<Coins className="h-3.5 w-3.5" />}
                label="Ngân sách"
                value={`${formatMoney(jobPost.budgetFrom)} – ${formatMoney(jobPost.budgetTo)}`}
              />
              <SummaryCard
                icon={<CalendarClock className="h-3.5 w-3.5" />}
                label="Ước tính"
                value={`${jobPost.estimatedDays} ngày`}
              />
              <SummaryCard
                icon={<Users className="h-3.5 w-3.5" />}
                label="Đã ứng tuyển"
                value={`${jobPost.expertApplyCodes?.length ?? 0} chuyên gia`}
              />
            </div>

            <p className="mt-5 whitespace-pre-line text-sm leading-6 text-foreground/80">
              {jobPost.description}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <SkillGroup
                label="Skill bắt buộc"
                skillIds={jobPost.requiredSkillIds}
                skillNameById={skillNameById}
                variant="secondary"
              />
              <SkillGroup
                label="Skill ưu tiên"
                skillIds={jobPost.preferredSkillIds}
                skillNameById={skillNameById}
                variant="outline"
              />
            </div>
          </header>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Chuyên gia đã ứng tuyển
              </h2>
              {!canHire && jobPost.status === JobPostStatus.ASSIGNED && (
                <span className="text-xs text-muted-foreground">
                  Job post đã đóng, không thể thuê thêm.
                </span>
              )}
            </div>

            {appliesLoading ? (
              <div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">
                Đang tải danh sách ứng viên...
              </div>
            ) : appliesError ? (
              <div className="rounded-2xl border bg-white p-6 text-sm text-destructive">
                Không tải được danh sách ứng viên.
              </div>
            ) : applies.length === 0 ? (
              <div className="rounded-2xl border bg-white px-6 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Chưa có chuyên gia nào ứng tuyển. Đợi thêm chút nhé.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applies.map((apply) => (
                  <ClientApplyCard
                    key={apply.expertApply.id}
                    apply={apply}
                    disabled={!canHire}
                    onHire={() => setHiringApply(apply)}
                  />
                ))}
              </div>
            )}
          </section>

          <HireConfirmDialog
            jobPostId={jobPost.id}
            expertApplyId={hiringApply?.expertApply.id ?? null}
            expertName={
              hiringApply?.expertApply.expertCode ?? "chuyên gia này"
            }
            open={!!hiringApply}
            onOpenChange={(open) => !open && setHiringApply(null)}
          />
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <div className="flex items-center gap-1.5 text-xs uppercase text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

interface SkillGroupProps {
  label: string;
  skillIds?: number[];
  skillNameById: Record<number, string>;
  variant: "secondary" | "outline";
}

function SkillGroup({
  label,
  skillIds,
  skillNameById,
  variant,
}: SkillGroupProps) {
  const ids = skillIds ?? [];

  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {ids.length === 0 ? (
          <span className="text-xs text-muted-foreground">Không có</span>
        ) : (
          ids.map((id) => (
            <Badge key={id} variant={variant}>
              {skillNameById[id] ?? `Skill #${id}`}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
