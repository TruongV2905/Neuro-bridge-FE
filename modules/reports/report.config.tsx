import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Flag,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  DisputeReason,
  DisputeStatus,
  EvidenceReferenceType,
  EvidenceRecord,
  PersonalReportReason,
  PersonalReportRecord,
  PersonalReportStatus,
  ReportUserSummary,
  DisputeRecord,
} from "@/types/report.types";

export type ReportTab = "personal" | "disputes" | "evidence";

export type SelectedReportDetail =
  | { type: "personal"; record: PersonalReportRecord }
  | { type: "disputes"; record: DisputeRecord }
  | { type: "evidence"; record: EvidenceRecord }
  | null;

export type ReportStats = {
  totalReports: number;
  pending: number;
  reviewing: number;
  openDisputes: number;
  waitingEvidence: number;
  resolvedCases: number;
};

export const reportPageSize = 10;

export const reportTabDefinitions: { key: ReportTab; label: string }[] = [
  { key: "personal", label: "Personal Reports" },
  { key: "disputes", label: "Disputes" },
  { key: "evidence", label: "Evidence Library" },
];

export const personalReasonLabel: Record<PersonalReportReason, string> = {
  SPAM: "Spam",
  HARASSMENT: "Harassment",
  FAKE_PROFILE: "Fake Profile",
  OTHER: "Other",
};

export const disputeReasonLabel: Record<DisputeReason, string> = {
  LATE_DELIVERY: "Late Delivery",
  INCORRECT_DELIVERY: "Incorrect Delivery",
  INCOMPLETE_DELIVERABLES: "Incomplete Deliverables",
  UNJUSTIFIED_REJECTION: "Unjustified Rejection",
  UNFAIR_DEADLINE_PRESSURE: "Unfair Deadline Pressure",
  OTHER: "Other",
};

export const personalStatusLabel: Record<PersonalReportStatus, string> = {
  PENDING: "Pending",
  REVIEWING: "Reviewing",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

export const disputeStatusLabel: Record<DisputeStatus, string> = {
  OPEN: "Open",
  IN_REVIEW: "In Review",
  WAITING_FOR_EVIDENCE: "Waiting Evidence",
  RESOLVED_CLIENT_WINS: "Client Wins",
  RESOLVED_EXPERT_WINS: "Expert Wins",
  CLOSED: "Closed",
};

export const evidenceTypeLabel: Record<EvidenceReferenceType, string> = {
  DISPUTE: "Dispute",
  PERSONAL_REPORT: "Personal Report",
};

export const personalReasonClass: Record<PersonalReportReason, string> = {
  SPAM: "border-slate-200 bg-slate-50 text-slate-700",
  HARASSMENT: "border-orange-200 bg-orange-50 text-orange-700",
  FAKE_PROFILE: "border-purple-200 bg-purple-50 text-purple-700",
  OTHER: "border-blue-200 bg-blue-50 text-blue-700",
};

export const disputeReasonClass: Record<DisputeReason, string> = {
  LATE_DELIVERY: "border-orange-200 bg-orange-50 text-orange-700",
  INCORRECT_DELIVERY: "border-red-200 bg-red-50 text-red-700",
  INCOMPLETE_DELIVERABLES: "border-amber-200 bg-amber-50 text-amber-700",
  UNJUSTIFIED_REJECTION: "border-purple-200 bg-purple-50 text-purple-700",
  UNFAIR_DEADLINE_PRESSURE: "border-pink-200 bg-pink-50 text-pink-700",
  OTHER: "border-blue-200 bg-blue-50 text-blue-700",
};

export const personalStatusClass: Record<PersonalReportStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  REVIEWING: "border-blue-200 bg-blue-50 text-blue-700",
  RESOLVED: "border-green-200 bg-green-50 text-green-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
};

export const disputeStatusClass: Record<DisputeStatus, string> = {
  OPEN: "border-orange-200 bg-orange-50 text-orange-700",
  IN_REVIEW: "border-blue-200 bg-blue-50 text-blue-700",
  WAITING_FOR_EVIDENCE: "border-purple-200 bg-purple-50 text-purple-700",
  RESOLVED_CLIENT_WINS: "border-green-200 bg-green-50 text-green-700",
  RESOLVED_EXPERT_WINS: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CLOSED: "border-slate-200 bg-slate-100 text-slate-700",
};

export const evidenceStateClass = {
  available: "border-green-200 bg-green-50 text-green-700",
  deleted: "border-red-200 bg-red-50 text-red-700",
};

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatReportDate(value?: string) {
  if (!value) return "Not resolved";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function ReportUserCell({ user }: { user: ReportUserSummary }) {
  return (
    <div className="flex min-w-[140px] items-center gap-3 text-left">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary/10 text-xs text-primary">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">
          {user.name}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          @{user.handle}
        </div>
      </div>
    </div>
  );
}

export function ReportBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <Badge variant="outline" className={cn("border", className)}>
      {label}
    </Badge>
  );
}

export function getReportStatCards(stats: ReportStats): {
  key: keyof ReportStats;
  title: string;
  value: number;
  icon: ReactNode;
  tone: string;
}[] {
  return [
    {
      key: "totalReports",
      title: "Total Reports",
      value: stats.totalReports,
      icon: <Flag className="h-5 w-5 text-slate-700" />,
      tone: "bg-slate-100",
    },
    {
      key: "pending",
      title: "Pending",
      value: stats.pending,
      icon: <Clock className="h-5 w-5 text-amber-700" />,
      tone: "bg-amber-100",
    },
    {
      key: "reviewing",
      title: "Reviewing",
      value: stats.reviewing,
      icon: <Eye className="h-5 w-5 text-blue-700" />,
      tone: "bg-blue-100",
    },
    {
      key: "openDisputes",
      title: "Open Disputes",
      value: stats.openDisputes,
      icon: <AlertTriangle className="h-5 w-5 text-orange-700" />,
      tone: "bg-orange-100",
    },
    {
      key: "waitingEvidence",
      title: "Waiting Evidence",
      value: stats.waitingEvidence,
      icon: <FileText className="h-5 w-5 text-purple-700" />,
      tone: "bg-purple-100",
    },
    {
      key: "resolvedCases",
      title: "Resolved Cases",
      value: stats.resolvedCases,
      icon: <CheckCircle className="h-5 w-5 text-green-700" />,
      tone: "bg-green-100",
    },
  ];
}
