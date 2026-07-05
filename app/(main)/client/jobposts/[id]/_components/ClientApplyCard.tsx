"use client";

import Link from "next/link";
import { CalendarClock, Coins, Handshake } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useGetUserByCode } from "@/services/user.service";
import type { ApplyJobPostResponse } from "@/types/proposal.types";
import { formatMoney } from "@/utils/formatMoney";

interface Props {
  apply: ApplyJobPostResponse;
  disabled?: boolean;
  onHire: () => void;
}

const getInitials = (name?: string | null) => {
  if (!name?.trim()) return "EX";
  return name
    .trim()
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export default function ClientApplyCard({ apply, disabled, onHire }: Props) {
  const expertCode = apply.expertApply.expertCode;
  const { data: expertData, isLoading } = useGetUserByCode({
    code: expertCode,
  });
  const expert = expertData?.result;

  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 shrink-0 border border-slate-200">
          <AvatarImage
            src={expert?.avatarUrl ?? undefined}
            alt={expert?.fullName ?? "Expert"}
          />
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {getInitials(expert?.fullName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground">
                {isLoading
                  ? "Đang tải hồ sơ..."
                  : (expert?.fullName ?? `Expert ${expertCode}`)}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {expertCode}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`${ROUTES.EXPERTS}/${expertCode}`}>Xem hồ sơ</Link>
              </Button>
              <Button size="sm" disabled={disabled} onClick={onHire}>
                <Handshake className="h-3.5 w-3.5" />
                Thuê
              </Button>
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Metric
              icon={<Coins className="h-3.5 w-3.5" />}
              label="Ngân sách đề xuất"
              value={formatMoney(apply.expertApply.proposedBudget)}
            />
            <Metric
              icon={<CalendarClock className="h-3.5 w-3.5" />}
              label="Thời gian"
              value={`${apply.expertApply.estimatedDays} ngày`}
            />
          </div>

          {apply.proposalResponse && (
            <div className="mt-4 rounded-xl border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Đề xuất chiến lược
              </p>
              <h4 className="mt-1 text-sm font-semibold text-foreground">
                {apply.proposalResponse.title}
              </h4>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-foreground/80">
                {apply.proposalResponse.strategySummary}
              </p>

              {apply.proposalUnlock ? (
                <div className="mt-3 rounded-lg border border-primary/30 bg-primary/[0.04] p-3">
                  <p className="text-xs font-medium text-primary">
                    Đã unlock chi tiết ·{" "}
                    {formatMoney(apply.proposalUnlock.unlockCost ?? 0)}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-6 text-foreground/80">
                    {apply.proposalUnlock.strategyDetail}
                  </p>
                </div>
              ) : (
                (apply.proposalResponse.unlockCost ?? 0) > 0 && (
                  <Badge variant="outline" className="mt-3">
                    Chi tiết chiến lược chưa unlock ·{" "}
                    {formatMoney(apply.proposalResponse.unlockCost ?? 0)}
                  </Badge>
                )
              )}
            </div>
          )}
        </div>
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
