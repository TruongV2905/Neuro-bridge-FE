"use client";

import type { ReactNode } from "react";
import { Download, Eye, FileText, RefreshCw, Search, ShieldAlert } from "lucide-react";

import PageWrapper from "@/components/common/PageWrapper";
import { DataTable } from "@/components/dashboard/table/DataTable";
import { TablePagination } from "@/components/dashboard/table/TablePagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  disputeColumns,
  evidenceColumns,
  personalReportColumns,
} from "@/modules/reports/report.column";
import {
  disputeReasonClass,
  disputeReasonLabel,
  disputeStatusClass,
  disputeStatusLabel,
  evidenceStateClass,
  evidenceTypeLabel,
  formatReportDate,
  getReportStatCards,
  personalReasonClass,
  personalReasonLabel,
  personalStatusClass,
  personalStatusLabel,
  ReportBadge,
  ReportUserCell,
} from "@/modules/reports/report.config";
import { useReportManagement } from "@/modules/reports/useReportManagement";

function StatCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <Card className="min-h-[108px] rounded-xl border bg-card shadow-sm">
      <CardContent className="flex h-full items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div className={cn("rounded-xl p-2.5", tone)}>{icon}</div>
      </CardContent>
    </Card>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value || "Not set"}</dd>
    </div>
  );
}

export function ReportManagementView() {
  const report = useReportManagement();
  const statCards = getReportStatCards(report.stats);

  return (
    <PageWrapper
      title="Report Management"
      description="Review user reports, manage project disputes, and handle evidence"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {statCards.map((card) => (
            <StatCard
              key={card.key}
              title={card.title}
              value={card.value}
              icon={card.icon}
              tone={card.tone}
            />
          ))}
        </div>

        <Card className="rounded-xl border bg-card shadow-sm">
          <CardHeader className="border-b px-0 py-0">
            <div className="flex flex-wrap items-stretch px-5">
              {report.tabs.map((tab) => {
                const isActive = report.activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    className={cn(
                      "flex h-14 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors",
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => report.setActiveTab(tab.key)}
                  >
                    {tab.label}
                    <Badge
                      variant="secondary"
                      className={cn(
                        "h-5 min-w-6",
                        isActive && "bg-primary/10 text-primary",
                      )}
                    >
                      {tab.count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,380px)_170px_190px_150px_150px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={report.filters.search}
                    onChange={(event) =>
                      report.setFilter("search", event.target.value)
                    }
                    placeholder={
                      report.activeTab === "personal"
                        ? "Search by ID, reporter, or reported user"
                        : report.activeTab === "disputes"
                          ? "Search by ID, workspace, or party"
                          : "Search by ID, reference, uploader, or file"
                    }
                    className="h-9 bg-muted/50 pl-9"
                  />
                </div>

                <Select
                  value={report.filters.statusFilter}
                  onValueChange={(value) =>
                    report.setFilter("statusFilter", value)
                  }
                >
                  <SelectTrigger className="h-9 w-full bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {report.filterOptions.statuses.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={report.filters.reasonFilter}
                  onValueChange={(value) =>
                    report.setFilter("reasonFilter", value)
                  }
                >
                  <SelectTrigger className="h-9 w-full bg-background">
                    <SelectValue placeholder={report.filterOptions.reasonLabel} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All {report.filterOptions.reasonLabel}s
                    </SelectItem>
                    {report.filterOptions.reasons.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={report.filters.dateFrom}
                  onChange={(event) =>
                    report.setFilter("dateFrom", event.target.value)
                  }
                  className="h-9 bg-background"
                  aria-label="Start date"
                />

                <Input
                  type="date"
                  value={report.filters.dateTo}
                  onChange={(event) =>
                    report.setFilter("dateTo", event.target.value)
                  }
                  className="h-9 bg-background"
                  aria-label="End date"
                />
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  onClick={report.resetMockData}
                  aria-label="Refresh reports"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="lg">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {report.activeTab === "personal" && (
              <DataTable
                columns={personalReportColumns}
                data={report.data.personalReports}
                actions={report.actions.personal}
                paginationInfo={report.paginationInfo}
              />
            )}

            {report.activeTab === "disputes" && (
              <DataTable
                columns={disputeColumns}
                data={report.data.disputes}
                actions={report.actions.disputes}
                paginationInfo={report.paginationInfo}
              />
            )}

            {report.activeTab === "evidence" && (
              <DataTable
                columns={evidenceColumns}
                data={report.data.evidence}
                actions={report.actions.evidence}
                paginationInfo={report.paginationInfo}
              />
            )}

            <TablePagination
              currentPage={report.currentPage}
              totalPages={report.totalPages}
              onPageChange={report.setCurrentPage}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(report.selectedDetail)}
        onOpenChange={(open) => {
          if (!open) report.setSelectedDetail(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              {report.selectedDetail?.type === "personal" &&
                report.selectedDetail.record.reportId}
              {report.selectedDetail?.type === "disputes" &&
                report.selectedDetail.record.disputeId}
              {report.selectedDetail?.type === "evidence" &&
                report.selectedDetail.record.evidenceId}
            </DialogTitle>
            <DialogDescription>
              Admin review details and related evidence context.
            </DialogDescription>
          </DialogHeader>

          {report.selectedDetail?.type === "personal" && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <DetailItem
                  label="Reporter"
                  value={<ReportUserCell user={report.selectedDetail.record.reporter} />}
                />
                <DetailItem
                  label="Reported User"
                  value={
                    <ReportUserCell
                      user={report.selectedDetail.record.reportedUser}
                    />
                  }
                />
                <DetailItem
                  label="Reason"
                  value={
                    <ReportBadge
                      label={personalReasonLabel[report.selectedDetail.record.reason]}
                      className={
                        personalReasonClass[report.selectedDetail.record.reason]
                      }
                    />
                  }
                />
                <DetailItem
                  label="Status"
                  value={
                    <ReportBadge
                      label={personalStatusLabel[report.selectedDetail.record.status]}
                      className={
                        personalStatusClass[report.selectedDetail.record.status]
                      }
                    />
                  }
                />
                <DetailItem
                  label="Created At"
                  value={formatReportDate(report.selectedDetail.record.createdAt)}
                />
                <DetailItem
                  label="Resolved At"
                  value={formatReportDate(report.selectedDetail.record.resolvedAt)}
                />
              </div>
              <DetailItem
                label="Description"
                value={report.selectedDetail.record.description}
              />
            </div>
          )}

          {report.selectedDetail?.type === "disputes" && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <DetailItem
                  label="Workspace"
                  value={report.selectedDetail.record.workspaceId}
                />
                <DetailItem
                  label="Submission Package"
                  value={report.selectedDetail.record.submissionPackageId}
                />
                <DetailItem
                  label="Initiator"
                  value={<ReportUserCell user={report.selectedDetail.record.initiator} />}
                />
                <DetailItem
                  label="Accused"
                  value={<ReportUserCell user={report.selectedDetail.record.accused} />}
                />
                <DetailItem
                  label="Admin"
                  value={report.selectedDetail.record.admin?.name ?? "Unassigned"}
                />
                <DetailItem
                  label="Status"
                  value={
                    <ReportBadge
                      label={disputeStatusLabel[report.selectedDetail.record.status]}
                      className={disputeStatusClass[report.selectedDetail.record.status]}
                    />
                  }
                />
                <DetailItem
                  label="Reason"
                  value={
                    <ReportBadge
                      label={disputeReasonLabel[report.selectedDetail.record.reason]}
                      className={disputeReasonClass[report.selectedDetail.record.reason]}
                    />
                  }
                />
                <DetailItem
                  label="Escrow"
                  value={`${report.selectedDetail.record.projectEscrow.escrowId} - ${report.selectedDetail.record.projectEscrow.status}`}
                />
              </div>
              <DetailItem
                label="Detailed Description"
                value={report.selectedDetail.record.detailedDescription}
              />
              <DetailItem
                label="Resolution Note"
                value={report.selectedDetail.record.resolutionNote}
              />

              <Card className="rounded-xl border bg-muted/20 shadow-none">
                <CardHeader>
                  <CardTitle className="text-sm">
                    Related Submission Package
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <DetailItem
                    label="Package ID"
                    value={report.selectedDetail.record.submissionPackage.packageId}
                  />
                  <DetailItem
                    label="Version"
                    value={`v${report.selectedDetail.record.submissionPackage.version}`}
                  />
                  <DetailItem
                    label="Submitted At"
                    value={formatReportDate(
                      report.selectedDetail.record.submissionPackage.submittedAt,
                    )}
                  />
                  <DetailItem
                    label="Feedback"
                    value={report.selectedDetail.record.submissionPackage.feedback}
                  />
                  <div className="md:col-span-2">
                    <DetailItem
                      label="Notes"
                      value={report.selectedDetail.record.submissionPackage.notes}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {report.selectedDetail?.type === "evidence" && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <DetailItem
                  label="Reference"
                  value={`${report.selectedDetail.record.referenceId} (${evidenceTypeLabel[report.selectedDetail.record.referenceType]})`}
                />
                <DetailItem
                  label="Uploader"
                  value={<ReportUserCell user={report.selectedDetail.record.uploader} />}
                />
                <DetailItem
                  label="Uploaded At"
                  value={formatReportDate(report.selectedDetail.record.uploadedAt)}
                />
                <DetailItem
                  label="State"
                  value={
                    report.selectedDetail.record.isDeleted ? (
                      <ReportBadge
                        label="Deleted"
                        className={evidenceStateClass.deleted}
                      />
                    ) : (
                      <ReportBadge
                        label="Available"
                        className={evidenceStateClass.available}
                      />
                    )
                  }
                />
              </div>

              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm text-foreground">
                      {report.selectedDetail.record.fileUrl}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {report.selectedDetail.record.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter showCloseButton>
            <Button type="button">
              <Eye className="h-4 w-4" />
              Keep Reviewing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
