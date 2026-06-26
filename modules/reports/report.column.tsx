import type { ColumnDef } from "@tanstack/react-table";

import {
  disputeReasonClass,
  disputeReasonLabel,
  disputeStatusClass,
  disputeStatusLabel,
  evidenceStateClass,
  evidenceTypeLabel,
  formatReportDate,
  personalReasonClass,
  personalReasonLabel,
  personalStatusClass,
  personalStatusLabel,
  ReportBadge,
  ReportUserCell,
} from "@/modules/reports/report.config";
import type {
  DisputeRecord,
  EvidenceRecord,
  PersonalReportRecord,
} from "@/types/report.types";

export const personalReportColumns: ColumnDef<PersonalReportRecord>[] = [
  {
    accessorKey: "reportId",
    header: "Report ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.reportId}
      </span>
    ),
    meta: { align: "left" },
  },
  {
    id: "reporter",
    header: "Reporter",
    cell: ({ row }) => <ReportUserCell user={row.original.reporter} />,
    meta: { align: "left" },
  },
  {
    id: "reportedUser",
    header: "Reported User",
    cell: ({ row }) => <ReportUserCell user={row.original.reportedUser} />,
    meta: { align: "left" },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <ReportBadge
        label={personalReasonLabel[row.original.reason]}
        className={personalReasonClass[row.original.reason]}
      />
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="block max-w-[260px] truncate text-left text-xs text-muted-foreground">
        {row.original.description}
      </span>
    ),
    meta: { align: "left" },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatReportDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <ReportBadge
        label={personalStatusLabel[row.original.status]}
        className={personalStatusClass[row.original.status]}
      />
    ),
  },
  {
    accessorKey: "resolvedAt",
    header: "Resolved At",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatReportDate(row.original.resolvedAt)}
      </span>
    ),
  },
];

export const disputeColumns: ColumnDef<DisputeRecord>[] = [
  {
    accessorKey: "disputeId",
    header: "Dispute ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.disputeId}
      </span>
    ),
    meta: { align: "left" },
  },
  {
    accessorKey: "workspaceId",
    header: "Workspace",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.workspaceId}
      </span>
    ),
  },
  {
    id: "initiator",
    header: "Initiator",
    cell: ({ row }) => <ReportUserCell user={row.original.initiator} />,
    meta: { align: "left" },
  },
  {
    id: "accused",
    header: "Accused",
    cell: ({ row }) => <ReportUserCell user={row.original.accused} />,
    meta: { align: "left" },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <ReportBadge
        label={disputeReasonLabel[row.original.reason]}
        className={disputeReasonClass[row.original.reason]}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <ReportBadge
        label={disputeStatusLabel[row.original.status]}
        className={disputeStatusClass[row.original.status]}
      />
    ),
  },
  {
    accessorKey: "adminId",
    header: "Admin",
    cell: ({ row }) =>
      row.original.admin ? (
        <span className="text-sm text-foreground">{row.original.admin.name}</span>
      ) : (
        <span className="text-muted-foreground">Unassigned</span>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatReportDate(row.original.createdAt)}
      </span>
    ),
  },
];

export const evidenceColumns: ColumnDef<EvidenceRecord>[] = [
  {
    accessorKey: "evidenceId",
    header: "Evidence ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.evidenceId}
      </span>
    ),
    meta: { align: "left" },
  },
  {
    accessorKey: "referenceId",
    header: "Reference",
    cell: ({ row }) => (
      <div className="text-left">
        <div className="font-mono text-xs text-muted-foreground">
          {row.original.referenceId}
        </div>
        <ReportBadge
          label={evidenceTypeLabel[row.original.referenceType]}
          className="mt-1 border-blue-200 bg-blue-50 text-blue-700"
        />
      </div>
    ),
    meta: { align: "left" },
  },
  {
    id: "uploader",
    header: "Uploader",
    cell: ({ row }) => <ReportUserCell user={row.original.uploader} />,
    meta: { align: "left" },
  },
  {
    accessorKey: "fileUrl",
    header: "File",
    cell: ({ row }) => (
      <span className="block max-w-[240px] truncate text-left font-mono text-xs text-muted-foreground">
        {row.original.fileUrl}
      </span>
    ),
    meta: { align: "left" },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="block max-w-[280px] truncate text-left text-xs text-muted-foreground">
        {row.original.description}
      </span>
    ),
    meta: { align: "left" },
  },
  {
    accessorKey: "uploadedAt",
    header: "Uploaded At",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatReportDate(row.original.uploadedAt)}
      </span>
    ),
  },
  {
    accessorKey: "isDeleted",
    header: "State",
    cell: ({ row }) =>
      row.original.isDeleted ? (
        <ReportBadge label="Deleted" className={evidenceStateClass.deleted} />
      ) : (
        <ReportBadge
          label="Available"
          className={evidenceStateClass.available}
        />
      ),
  },
];
