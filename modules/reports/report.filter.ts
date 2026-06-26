import {
  disputeReasonLabel,
  disputeStatusLabel,
  evidenceTypeLabel,
  personalReasonLabel,
  personalStatusLabel,
  type ReportTab,
} from "@/modules/reports/report.config";
import type {
  DisputeRecord,
  EvidenceRecord,
  PersonalReportRecord,
} from "@/types/report.types";

export type ReportFilterState = {
  search: string;
  statusFilter: string;
  reasonFilter: string;
  dateFrom: string;
  dateTo: string;
};

export type ReportFilterOptionGroup = {
  statuses: [string, string][];
  reasons: [string, string][];
  reasonLabel: string;
};

export function getReportFilterOptions(
  activeTab: ReportTab,
): ReportFilterOptionGroup {
  if (activeTab === "personal") {
    return {
      statuses: Object.entries(personalStatusLabel),
      reasons: Object.entries(personalReasonLabel),
      reasonLabel: "Reason",
    };
  }

  if (activeTab === "disputes") {
    return {
      statuses: Object.entries(disputeStatusLabel),
      reasons: Object.entries(disputeReasonLabel),
      reasonLabel: "Reason",
    };
  }

  return {
    statuses: [
      ["available", "Available"],
      ["deleted", "Deleted"],
    ],
    reasons: Object.entries(evidenceTypeLabel),
    reasonLabel: "Reference Type",
  };
}

export function isWithinDateRange(value: string, from: string, to: string) {
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

export function filterPersonalReports(
  reports: PersonalReportRecord[],
  filters: ReportFilterState,
) {
  const query = filters.search.trim().toLowerCase();

  return reports.filter((report) => {
    const matchesSearch =
      !query ||
      [
        report.reportId,
        report.reporter.name,
        report.reporter.handle,
        report.reportedUser.name,
        report.reportedUser.handle,
        report.description,
      ].some((value) => value.toLowerCase().includes(query));

    const matchesStatus =
      filters.statusFilter === "all" || report.status === filters.statusFilter;
    const matchesReason =
      filters.reasonFilter === "all" || report.reason === filters.reasonFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesReason &&
      isWithinDateRange(report.createdAt, filters.dateFrom, filters.dateTo)
    );
  });
}

export function filterDisputes(
  disputes: DisputeRecord[],
  filters: ReportFilterState,
) {
  const query = filters.search.trim().toLowerCase();

  return disputes.filter((dispute) => {
    const matchesSearch =
      !query ||
      [
        dispute.disputeId,
        dispute.workspaceId,
        dispute.submissionPackageId,
        dispute.initiator.name,
        dispute.accused.name,
        dispute.detailedDescription,
      ].some((value) => value.toLowerCase().includes(query));

    const matchesStatus =
      filters.statusFilter === "all" ||
      dispute.status === filters.statusFilter;
    const matchesReason =
      filters.reasonFilter === "all" ||
      dispute.reason === filters.reasonFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesReason &&
      isWithinDateRange(dispute.createdAt, filters.dateFrom, filters.dateTo)
    );
  });
}

export function filterEvidence(
  evidence: EvidenceRecord[],
  filters: ReportFilterState,
) {
  const query = filters.search.trim().toLowerCase();

  return evidence.filter((item) => {
    const matchesSearch =
      !query ||
      [
        item.evidenceId,
        item.referenceId,
        item.uploader.name,
        item.uploader.handle,
        item.fileUrl,
        item.description,
      ].some((value) => value.toLowerCase().includes(query));

    const matchesStatus =
      filters.statusFilter === "all" ||
      (filters.statusFilter === "deleted" ? item.isDeleted : !item.isDeleted);
    const matchesReason =
      filters.reasonFilter === "all" ||
      item.referenceType === filters.reasonFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesReason &&
      isWithinDateRange(item.uploadedAt, filters.dateFrom, filters.dateTo)
    );
  });
}

export function paginateRecords<TRecord>(
  records: TRecord[],
  currentPage: number,
  pageSize: number,
) {
  return records.slice((currentPage - 1) * pageSize, currentPage * pageSize);
}
