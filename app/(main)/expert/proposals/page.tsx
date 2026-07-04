"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { FileText, Pencil, Search, Trash2 } from "lucide-react";

import type { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageWrapper from "@/components/common/PageWrapper";
import { ROUTES } from "@/constants/routes";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetProposalsByExpertCode } from "@/services/proposal.service";
import { UserResponse, UserRole } from "@/types/user/user.type";
import type { ProposalResponse } from "@/types/proposal.types";
import { formatMoney } from "@/utils/formatMoney";

import EditProposalDialog from "./_components/EditProposalDialog";
import DeleteProposalDialog from "./_components/DeleteProposalDialog";

const PAGE_SIZE = 10;

function isProposalResponse(
  proposal: ProposalResponse | null | undefined,
): proposal is ProposalResponse {
  return Boolean(proposal?.id);
}

export default function ExpertProposalsPage() {
  const currentUser = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null;

  const expertCode = currentUser?.code ?? "";
  const isExpert = currentUser?.role === UserRole.EXPERT;

  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const [editing, setEditing] = useState<ProposalResponse | null>(null);
  const [deleting, setDeleting] = useState<ProposalResponse | null>(null);

  const { data, isLoading, isError, error } = useGetProposalsByExpertCode({
    expertCode,
    page,
    size: PAGE_SIZE,
    search: debouncedSearch,
    sortBy: "createdAt",
    sortDirection: "DESCENDING",
  });

  const proposals = (data?.result?.data ?? []).filter(isProposalResponse);
  const metadata = data?.result?.metadata;
  const hasSearch = debouncedSearch.trim().length > 0;

  return (
    <div className="mx-auto max-w-5xl pt-16">
      <PageWrapper
        title="Đề xuất của tôi"
        description="Quản lý các đề xuất bạn đã gửi cho các job post."
      >
        {!isExpert ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Trang này chỉ dành cho tài khoản Expert.{" "}
            <Link href={ROUTES.LOGIN} className="font-semibold underline">
              Đăng nhập
            </Link>{" "}
            bằng tài khoản Expert để tiếp tục.
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Tìm theo tiêu đề..."
                  className="h-10 pl-9"
                />
              </div>
              <Button asChild variant="outline">
                <Link href={ROUTES.EXPERT_JOBPOSTS}>Tìm job mới</Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">
                Đang tải đề xuất...
              </div>
            ) : isError ? (
              <div className="rounded-2xl border bg-white p-6 text-sm text-destructive">
                {error?.response?.data?.message ??
                  "Không tải được đề xuất."}
              </div>
            ) : proposals.length === 0 ? (
              <ProposalEmptyState
                hasSearch={hasSearch}
                onClearSearch={() => {
                  setSearchInput("");
                  setPage(0);
                }}
              />
            ) : (
              <>
                <div className="space-y-3">
                  {proposals.map((proposal) => (
                    <ProposalRow
                      key={proposal.id}
                      proposal={proposal}
                      onEdit={() => setEditing(proposal)}
                      onDelete={() => setDeleting(proposal)}
                    />
                  ))}
                </div>

                {metadata && metadata.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Trang {metadata.page + 1} / {metadata.totalPages} ·{" "}
                      {metadata.totalElements} đề xuất
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!metadata.hasPrevious}
                        onClick={() => setPage((current) => Math.max(0, current - 1))}
                      >
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!metadata.hasNext}
                        onClick={() => setPage((current) => current + 1)}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            <EditProposalDialog
              proposal={editing}
              open={!!editing}
              onOpenChange={(open) => !open && setEditing(null)}
            />
            <DeleteProposalDialog
              proposal={deleting}
              open={!!deleting}
              onOpenChange={(open) => !open && setDeleting(null)}
            />
          </>
        )}
      </PageWrapper>
    </div>
  );
}

interface EmptyStateProps {
  hasSearch: boolean;
  onClearSearch: () => void;
}

function ProposalEmptyState({ hasSearch, onClearSearch }: EmptyStateProps) {
  return (
    <section className="rounded-2xl border bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FileText className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-foreground">
        {hasSearch ? "Không tìm thấy đề xuất phù hợp" : "Bạn chưa có đề xuất nào"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {hasSearch
          ? "Thử đổi từ khóa hoặc xóa bộ tìm kiếm để xem lại toàn bộ đề xuất của bạn."
          : "Khi bạn ứng tuyển vào một job post, đề xuất sẽ xuất hiện tại đây để bạn theo dõi, chỉnh sửa hoặc xóa."}
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {hasSearch ? (
          <Button type="button" variant="outline" onClick={onClearSearch}>
            Xóa tìm kiếm
          </Button>
        ) : (
          <Button asChild>
            <Link href={ROUTES.EXPERT_JOBPOSTS}>Xem job posts</Link>
          </Button>
        )}
      </div>
    </section>
  );
}

interface RowProps {
  proposal: ProposalResponse;
  onEdit: () => void;
  onDelete: () => void;
}

function ProposalRow({ proposal, onEdit, onDelete }: RowProps) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-base font-semibold text-foreground">
            {proposal.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
            {proposal.strategySummary}
          </p>
          {proposal.unlockCost != null && proposal.unlockCost > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Chi phí unlock: {formatMoney(proposal.unlockCost)}
            </p>
          )}
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
    </div>
  );
}
