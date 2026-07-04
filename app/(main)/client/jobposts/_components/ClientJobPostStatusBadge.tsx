"use client";

import { Badge } from "@/components/ui/badge";
import { JobPostStatus } from "@/types/jobpost.types";

const statusLabelMap: Record<JobPostStatus, string> = {
  [JobPostStatus.PRIVATE]: "Riêng tư",
  [JobPostStatus.PUBLIC]: "Công khai",
  [JobPostStatus.ASSIGNED]: "Đã chọn expert",
};

const statusClassMap: Record<JobPostStatus, string> = {
  [JobPostStatus.PRIVATE]: "bg-zinc-100 text-zinc-700 hover:bg-zinc-100",
  [JobPostStatus.PUBLIC]:
    "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  [JobPostStatus.ASSIGNED]: "bg-blue-100 text-blue-700 hover:bg-blue-100",
};

export default function ClientJobPostStatusBadge({
  status,
}: {
  status: JobPostStatus;
}) {
  return (
    <Badge className={statusClassMap[status] ?? "bg-muted text-foreground"}>
      {statusLabelMap[status] ?? status}
    </Badge>
  );
}
