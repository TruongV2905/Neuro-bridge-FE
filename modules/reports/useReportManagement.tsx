"use client";

import { useMemo, useState } from "react";

import {
  createDisputeActions,
  createEvidenceActions,
  createPersonalReportActions,
} from "@/modules/reports/report.customAction";
import {
  reportPageSize,
  reportTabDefinitions,
  type ReportStats,
  type ReportTab,
  type SelectedReportDetail,
} from "@/modules/reports/report.config";
import {
  filterDisputes,
  filterEvidence,
  filterPersonalReports,
  getReportFilterOptions,
  paginateRecords,
  type ReportFilterState,
} from "@/modules/reports/report.filter";
import {
  disputesMock,
  evidenceMock,
  personalReportsMock,
} from "@/modules/reports/report.mock";
import type {
  DisputeRecord,
  EvidenceRecord,
  PersonalReportRecord,
} from "@/types/report.types";

const today = "2026-05-26";
const defaultAdmin = {
  id: "admin1",
  name: "Thomas Brown",
  handle: "t.brown.admin",
};

export function useReportManagement() {
  const [activeTab, setActiveTabState] = useState<ReportTab>("personal");
  const [personalReports, setPersonalReports] = useState(personalReportsMock);
  const [disputes, setDisputes] = useState(disputesMock);
  const [evidence, setEvidence] = useState(evidenceMock);
  const [filters, setFilters] = useState<ReportFilterState>({
    search: "",
    statusFilter: "all",
    reasonFilter: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetail, setSelectedDetail] =
    useState<SelectedReportDetail>(null);

  const resetPage = () => setCurrentPage(1);

  const setActiveTab = (tab: ReportTab) => {
    setActiveTabState(tab);
    setFilters((current) => ({
      ...current,
      statusFilter: "all",
      reasonFilter: "all",
    }));
    resetPage();
  };

  const setFilter = <TKey extends keyof ReportFilterState>(
    key: TKey,
    value: ReportFilterState[TKey],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
    resetPage();
  };

  const resetMockData = () => {
    setPersonalReports(personalReportsMock);
    setDisputes(disputesMock);
    setEvidence(evidenceMock);
  };

  const stats = useMemo<ReportStats>(
    () => ({
      totalReports: personalReports.length,
      pending: personalReports.filter((report) => report.status === "PENDING")
        .length,
      reviewing: personalReports.filter(
        (report) => report.status === "REVIEWING",
      ).length,
      openDisputes: disputes.filter((dispute) => dispute.status === "OPEN")
        .length,
      waitingEvidence: disputes.filter(
        (dispute) => dispute.status === "WAITING_FOR_EVIDENCE",
      ).length,
      resolvedCases:
        personalReports.filter((report) => report.status === "RESOLVED")
          .length +
        disputes.filter((dispute) =>
          ["RESOLVED_CLIENT_WINS", "RESOLVED_EXPERT_WINS", "CLOSED"].includes(
            dispute.status,
          ),
        ).length,
    }),
    [disputes, personalReports],
  );

  const tabs = useMemo(
    () =>
      reportTabDefinitions.map((tab) => ({
        ...tab,
        count:
          tab.key === "personal"
            ? personalReports.length
            : tab.key === "disputes"
              ? disputes.length
              : evidence.length,
      })),
    [disputes.length, evidence.length, personalReports.length],
  );

  const filterOptions = useMemo(
    () => getReportFilterOptions(activeTab),
    [activeTab],
  );

  const filteredPersonalReports = useMemo(
    () => filterPersonalReports(personalReports, filters),
    [filters, personalReports],
  );
  const filteredDisputes = useMemo(
    () => filterDisputes(disputes, filters),
    [disputes, filters],
  );
  const filteredEvidence = useMemo(
    () => filterEvidence(evidence, filters),
    [evidence, filters],
  );

  const totalItems =
    activeTab === "personal"
      ? filteredPersonalReports.length
      : activeTab === "disputes"
        ? filteredDisputes.length
        : filteredEvidence.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / reportPageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * reportPageSize + 1;
  const endItem = Math.min(currentPage * reportPageSize, totalItems);

  const personalPageData = useMemo(
    () => paginateRecords(filteredPersonalReports, currentPage, reportPageSize),
    [currentPage, filteredPersonalReports],
  );
  const disputePageData = useMemo(
    () => paginateRecords(filteredDisputes, currentPage, reportPageSize),
    [currentPage, filteredDisputes],
  );
  const evidencePageData = useMemo(
    () => paginateRecords(filteredEvidence, currentPage, reportPageSize),
    [currentPage, filteredEvidence],
  );

  const personalActions = useMemo(
    () =>
      createPersonalReportActions({
        viewDetail: (record: PersonalReportRecord) =>
          setSelectedDetail({ type: "personal", record }),
        updateStatus: (record: PersonalReportRecord) => {
          setPersonalReports((current) =>
            current.map((item) =>
              item.reportId === record.reportId
                ? { ...item, status: "REVIEWING" }
                : item,
            ),
          );
        },
        resolve: (record: PersonalReportRecord) => {
          setPersonalReports((current) =>
            current.map((item) =>
              item.reportId === record.reportId
                ? { ...item, status: "RESOLVED", resolvedAt: today }
                : item,
            ),
          );
        },
        reject: (record: PersonalReportRecord) => {
          setPersonalReports((current) =>
            current.map((item) =>
              item.reportId === record.reportId
                ? { ...item, status: "REJECTED", resolvedAt: today }
                : item,
            ),
          );
        },
      }),
    [],
  );

  const disputeActions = useMemo(
    () =>
      createDisputeActions({
        viewDetail: (record: DisputeRecord) =>
          setSelectedDetail({ type: "disputes", record }),
        assignAdmin: (record: DisputeRecord) => {
          setDisputes((current) =>
            current.map((item) =>
              item.disputeId === record.disputeId
                ? {
                    ...item,
                    adminId: defaultAdmin.id,
                    admin: defaultAdmin,
                    status: "IN_REVIEW",
                  }
                : item,
            ),
          );
        },
        requestEvidence: (record: DisputeRecord) => {
          setDisputes((current) =>
            current.map((item) =>
              item.disputeId === record.disputeId
                ? { ...item, status: "WAITING_FOR_EVIDENCE" }
                : item,
            ),
          );
        },
        resolveClientWins: (record: DisputeRecord) => {
          setDisputes((current) =>
            current.map((item) =>
              item.disputeId === record.disputeId
                ? {
                    ...item,
                    status: "RESOLVED_CLIENT_WINS",
                    resolvedAt: today,
                    resolutionNote: "Client claim accepted after review.",
                    projectEscrow: {
                      ...item.projectEscrow,
                      status: "REFUNDED",
                    },
                  }
                : item,
            ),
          );
        },
        resolveExpertWins: (record: DisputeRecord) => {
          setDisputes((current) =>
            current.map((item) =>
              item.disputeId === record.disputeId
                ? {
                    ...item,
                    status: "RESOLVED_EXPERT_WINS",
                    resolvedAt: today,
                    resolutionNote: "Expert delivery accepted after review.",
                    projectEscrow: {
                      ...item.projectEscrow,
                      status: "RELEASED",
                    },
                  }
                : item,
            ),
          );
        },
        close: (record: DisputeRecord) => {
          setDisputes((current) =>
            current.map((item) =>
              item.disputeId === record.disputeId
                ? { ...item, status: "CLOSED", resolvedAt: today }
                : item,
            ),
          );
        },
      }),
    [],
  );

  const evidenceActions = useMemo(
    () =>
      createEvidenceActions({
        viewDetail: (record: EvidenceRecord) =>
          setSelectedDetail({ type: "evidence", record }),
        markDeleted: (record: EvidenceRecord) => {
          setEvidence((current) =>
            current.map((item) =>
              item.evidenceId === record.evidenceId
                ? { ...item, isDeleted: true }
                : item,
            ),
          );
        },
        restore: (record: EvidenceRecord) => {
          setEvidence((current) =>
            current.map((item) =>
              item.evidenceId === record.evidenceId
                ? { ...item, isDeleted: false }
                : item,
            ),
          );
        },
      }),
    [],
  );

  return {
    activeTab,
    setActiveTab,
    filters,
    setFilter,
    stats,
    tabs,
    filterOptions,
    currentPage,
    setCurrentPage,
    totalPages,
    paginationInfo: { startItem, endItem, totalItems },
    selectedDetail,
    setSelectedDetail,
    resetMockData,
    data: {
      personalReports: personalPageData,
      disputes: disputePageData,
      evidence: evidencePageData,
    },
    actions: {
      personal: personalActions,
      disputes: disputeActions,
      evidence: evidenceActions,
    },
  };
}
