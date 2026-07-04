"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/components/common/PageWrapper";
import { ROUTES } from "@/constants/routes";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetPublicJobPosts } from "@/services/jobpost.service";
import { useGetAllSkills } from "@/services/skill.service";
import { SkillResponse } from "@/types/skill.types";

import JobPostCard from "./_components/JobPostCard";

const PAGE_SIZE = 9;

export default function ExpertJobPostsPage() {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const { data, isLoading, isError, error } = useGetPublicJobPosts({
    page,
    size: PAGE_SIZE,
    search: debouncedSearch,
    sortBy: "createdAt",
    sortDirection: "DESCENDING",
  });

  const { data: skillData } = useGetAllSkills();

  const skillNameById = useMemo(() => {
    const skills: SkillResponse[] = skillData?.result?.data ?? [];
    return Object.fromEntries(skills.map((s) => [s.id, s.skillName]));
  }, [skillData]);

  const jobPosts = data?.result?.data ?? [];
  const metadata = data?.result?.metadata;

  return (
    <div className="mx-auto max-w-7xl pt-16">
      <PageWrapper
        title="Việc phù hợp với chuyên gia"
        description="Duyệt các job post công khai và ứng tuyển bằng một đề xuất chiến lược của bạn."
      >
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo tiêu đề, mô tả..."
            className="h-10 pl-9"
          />
        </div>
        <Button asChild variant="outline">
          <Link href={ROUTES.EXPERT_MY_PROPOSALS}>
            <FileText className="h-4 w-4" />
            Đề xuất của tôi
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">
          Đang tải danh sách job post...
        </div>
      ) : isError ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-destructive">
          {error?.response?.data?.message ?? "Không tải được job post."}
        </div>
      ) : jobPosts.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">
          Chưa có job post phù hợp.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobPosts.map((jp) => (
              <JobPostCard
                key={jp.id}
                jobPost={jp}
                skillNameById={skillNameById}
              />
            ))}
          </div>

          {metadata && metadata.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Trang {metadata.page + 1} / {metadata.totalPages} ·{" "}
                {metadata.totalElements} job posts
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!metadata.hasPrevious}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!metadata.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      </PageWrapper>
    </div>
  );
}
