"use client";

import Link from "next/link";
import { Clock, Coins } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { formatMoney } from "@/utils/formatMoney";
import { JobPostResponse } from "@/types/jobpost.types";

interface Props {
  jobPost: JobPostResponse;
  skillNameById?: Record<number, string>;
}

const SKILL_PREVIEW_LIMIT = 4;

export default function JobPostCard({ jobPost, skillNameById }: Props) {
  const requiredSkills = jobPost.requiredSkillIds ?? [];
  const previewSkills = requiredSkills.slice(0, SKILL_PREVIEW_LIMIT);
  const extraCount = requiredSkills.length - previewSkills.length;

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
          {jobPost.title}
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {jobPost.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex flex-wrap gap-2">
          {previewSkills.length === 0 ? (
            <span className="text-xs text-muted-foreground">
              Không yêu cầu skill cụ thể
            </span>
          ) : (
            previewSkills.map((id) => (
              <Badge key={id} variant="secondary">
                {skillNameById?.[id] ?? `Skill #${id}`}
              </Badge>
            ))
          )}
          {extraCount > 0 && (
            <Badge variant="outline">+{extraCount}</Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-emerald-600" />
            {formatMoney(jobPost.budgetFrom)} – {formatMoney(jobPost.budgetTo)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-indigo-600" />
            {jobPost.estimatedDays} ngày
          </span>
        </div>
      </CardContent>

      <CardFooter className="mt-auto justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {jobPost.expertApplyCodes?.length ?? 0} chuyên gia đã ứng tuyển
        </span> 
        <Button asChild size="sm">
          <Link href={ROUTES.EXPERT_JOBPOST_DETAIL(jobPost.id)}>
            Xem &amp; Ứng tuyển
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
