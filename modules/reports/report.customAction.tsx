import { CheckCircle, Clock, Eye, FileText, UserCheck, XCircle } from "lucide-react";

import type { TableAction } from "@/components/dashboard/table/DataTable";
import type {
  DisputeRecord,
  EvidenceRecord,
  PersonalReportRecord,
} from "@/types/report.types";

export type PersonalReportActionHandlers = {
  viewDetail: (record: PersonalReportRecord) => void;
  updateStatus: (record: PersonalReportRecord) => void;
  resolve: (record: PersonalReportRecord) => void;
  reject: (record: PersonalReportRecord) => void;
};

export type DisputeActionHandlers = {
  viewDetail: (record: DisputeRecord) => void;
  assignAdmin: (record: DisputeRecord) => void;
  requestEvidence: (record: DisputeRecord) => void;
  resolveClientWins: (record: DisputeRecord) => void;
  resolveExpertWins: (record: DisputeRecord) => void;
  close: (record: DisputeRecord) => void;
};

export type EvidenceActionHandlers = {
  viewDetail: (record: EvidenceRecord) => void;
  markDeleted: (record: EvidenceRecord) => void;
  restore: (record: EvidenceRecord) => void;
};

const resolvedDisputeStatuses = [
  "RESOLVED_CLIENT_WINS",
  "RESOLVED_EXPERT_WINS",
  "CLOSED",
] as const;

export function createPersonalReportActions(
  handlers: PersonalReportActionHandlers,
): TableAction<PersonalReportRecord>[] {
  return [
    {
      type: "view",
      label: "View Detail",
      icon: <Eye className="h-4 w-4" />,
      onClick: handlers.viewDetail,
    },
    {
      type: "custom",
      label: "Update Status",
      icon: <Clock className="h-4 w-4" />,
      hidden: (record) => record.status !== "PENDING",
      onClick: handlers.updateStatus,
    },
    {
      type: "custom",
      label: "Resolve",
      icon: <CheckCircle className="h-4 w-4" />,
      hidden: (record) => ["RESOLVED", "REJECTED"].includes(record.status),
      onClick: handlers.resolve,
    },
    {
      type: "custom",
      label: "Reject",
      icon: <XCircle className="h-4 w-4" />,
      variant: "destructive",
      hidden: (record) => ["RESOLVED", "REJECTED"].includes(record.status),
      onClick: handlers.reject,
    },
  ];
}

export function createDisputeActions(
  handlers: DisputeActionHandlers,
): TableAction<DisputeRecord>[] {
  return [
    {
      type: "view",
      label: "View Detail",
      icon: <Eye className="h-4 w-4" />,
      onClick: handlers.viewDetail,
    },
    {
      type: "custom",
      label: "Assign Admin",
      icon: <UserCheck className="h-4 w-4" />,
      hidden: (record) => Boolean(record.adminId),
      onClick: handlers.assignAdmin,
    },
    {
      type: "custom",
      label: "Request Evidence",
      icon: <FileText className="h-4 w-4" />,
      hidden: (record) => resolvedDisputeStatuses.includes(record.status),
      onClick: handlers.requestEvidence,
    },
    {
      type: "custom",
      label: "Resolve Client Wins",
      icon: <CheckCircle className="h-4 w-4" />,
      hidden: (record) => resolvedDisputeStatuses.includes(record.status),
      onClick: handlers.resolveClientWins,
    },
    {
      type: "custom",
      label: "Resolve Expert Wins",
      icon: <CheckCircle className="h-4 w-4" />,
      hidden: (record) => resolvedDisputeStatuses.includes(record.status),
      onClick: handlers.resolveExpertWins,
    },
    {
      type: "custom",
      label: "Close",
      icon: <XCircle className="h-4 w-4" />,
      hidden: (record) => record.status === "CLOSED",
      onClick: handlers.close,
    },
  ];
}

export function createEvidenceActions(
  handlers: EvidenceActionHandlers,
): TableAction<EvidenceRecord>[] {
  return [
    {
      type: "view",
      label: "View Detail",
      icon: <Eye className="h-4 w-4" />,
      onClick: handlers.viewDetail,
    },
    {
      type: "custom",
      label: "Mark Deleted",
      icon: <XCircle className="h-4 w-4" />,
      variant: "destructive",
      hidden: (record) => record.isDeleted,
      onClick: handlers.markDeleted,
    },
    {
      type: "custom",
      label: "Restore",
      icon: <CheckCircle className="h-4 w-4" />,
      hidden: (record) => !record.isDeleted,
      onClick: handlers.restore,
    },
  ];
}
