import { Badge } from "@/components/ui/badge";
import { JobPostStatus } from "@/types/jobpost.types";

const STATUS_LABEL: Record<JobPostStatus, string> = {
  [JobPostStatus.PUBLIC]: "Đang mở",
  [JobPostStatus.PRIVATE]: "Riêng tư",
  [JobPostStatus.ASSIGNED]: "Đã giao",
};

const STATUS_VARIANT: Record<
  JobPostStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  [JobPostStatus.PUBLIC]: "default",
  [JobPostStatus.PRIVATE]: "secondary",
  [JobPostStatus.ASSIGNED]: "outline",
};

interface Props {
  status: JobPostStatus;
}

export default function JobPostStatusBadge({ status }: Props) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
  );
}
