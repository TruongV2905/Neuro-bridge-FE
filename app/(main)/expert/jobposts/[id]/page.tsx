"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { ArrowLeft, CalendarClock, Coins, Users } from "lucide-react";

import type { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { formatMoney } from "@/utils/formatMoney";
import { useGetJobPostById } from "@/services/jobpost.service";
import { useGetApplyJobPostsByJobPostId } from "@/services/proposal.service";
import { useGetAllSkills } from "@/services/skill.service";
import {
  JobPostStatus,
  type JobPostResponse,
} from "@/types/jobpost.types";
import { UserResponse, UserRole } from "@/types/user/user.type";
import type { SkillResponse } from "@/types/skill.types";

import ApplyProposalDialog from "../_components/ApplyProposalDialog";
import JobPostStatusBadge from "../_components/JobPostStatusBadge";

export default function ExpertJobPostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jobPostId = params?.id;

  const currentUser = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null;

  const { data, isLoading, isError, error } = useGetJobPostById({
    id: jobPostId,
  });

  const { data: applyData, isLoading: isApplyLoading } =
    useGetApplyJobPostsByJobPostId(jobPostId);

  const { data: skillData } = useGetAllSkills();

  const skillNameById = useMemo(() => {
    const skills: SkillResponse[] = skillData?.result?.data ?? [];
    return Object.fromEntries(skills.map((s) => [s.id, s.skillName]));
  }, [skillData]);

  const jobPost: JobPostResponse | null = data?.result ?? null;

  const isExpert = currentUser?.role === UserRole.EXPERT;
  const expertCode = currentUser?.code ?? "";
  const applyRecords = applyData?.result ?? [];
  const hasApplyRecordsLoaded = !!applyData;
  const alreadyApplied =
    !!expertCode &&
    (hasApplyRecordsLoaded
      ? applyRecords.some(
          (apply) =>
            apply.expertApply?.expertCode === expertCode &&
            !!apply.proposalResponse,
        )
      : !!jobPost?.expertApplyCodes?.includes(expertCode));
  const isOpen = jobPost?.status === JobPostStatus.PUBLIC;

  return (
    <div className="mx-auto max-w-4xl pt-16">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(ROUTES.EXPERT_JOBPOSTS)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </Button>

      {isLoading ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">
          Đang tải chi tiết job post...
        </div>
      ) : isError || !jobPost ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-destructive">
          {error?.response?.data?.message ?? "Không tải được job post."}
        </div>
      ) : (
        <div className="space-y-6">
          <header className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {jobPost.title}
                </h1>
                <div className="mt-2 flex items-center gap-2">
                  <JobPostStatusBadge status={jobPost.status} />
                  <span className="text-xs text-muted-foreground">
                    ID: {jobPost.id.slice(0, 8)}
                  </span>
                </div>
              </div>

              {isExpert && (
                <ApplyProposalDialog
                  jobPostId={jobPost.id}
                  expertCode={expertCode}
                  suggestedBudget={{
                    from: jobPost.budgetFrom,
                    to: jobPost.budgetTo,
                  }}
                  suggestedDays={jobPost.estimatedDays}
                  disabled={!isOpen || alreadyApplied || isApplyLoading}
                  triggerLabel={
                    alreadyApplied
                      ? "Bạn đã ứng tuyển"
                      : !isOpen
                        ? "Job đã đóng"
                        : "Ứng tuyển"
                  }
                />
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                  <Coins className="h-3.5 w-3.5" />
                  Ngân sách
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatMoney(jobPost.budgetFrom)} –{" "}
                  {formatMoney(jobPost.budgetTo)}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Ước tính
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {jobPost.estimatedDays} ngày
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Đã ứng tuyển
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {jobPost.expertApplyCodes?.length ?? 0} chuyên gia
                </p>
              </div>
            </div>
          </header>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Mô tả</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
              {jobPost.description}
            </p>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Skill</h2>

            <div className="mt-4 space-y-4">
              <SkillGroup
                label="Bắt buộc"
                skillIds={jobPost.requiredSkillIds}
                skillNameById={skillNameById}
                variant="default"
              />
              <SkillGroup
                label="Ưu tiên"
                skillIds={jobPost.preferredSkillIds}
                skillNameById={skillNameById}
                variant="outline"
              />
            </div>
          </section>

          {!isExpert && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Chỉ tài khoản Expert mới ứng tuyển được. Đăng nhập bằng tài khoản
              Expert hoặc{" "}
              <Link
                href={ROUTES.REGISTER}
                className="font-semibold underline"
              >
                đăng ký
              </Link>{" "}
              để tiếp tục.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface SkillGroupProps {
  label: string;
  skillIds?: number[];
  skillNameById: Record<number, string>;
  variant: "default" | "outline" | "secondary";
}

function SkillGroup({
  label,
  skillIds,
  skillNameById,
  variant,
}: SkillGroupProps) {
  const ids = skillIds ?? [];

  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-2">
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
