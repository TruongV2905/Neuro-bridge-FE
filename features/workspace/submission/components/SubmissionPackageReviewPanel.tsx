"use client"

import { useMemo, useState } from "react"
import { useSelector } from "react-redux"
import {
  CheckCircle2,
  Download,
  FileArchive,
  FileText,
  Loader2,
  PackageCheck,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { RootState } from "@/redux/store"
import {
  useCompleteProject,
  useDeliverableFilesByPackage,
  useProjectDetailByWorkspace,
  useSubmissionPackagesByWorkspace,
} from "@/services/submission-package.service"
import type {
  DeliverableFile,
  SubmissionPackageSummary,
} from "@/types/submission-package.type"
import type { UserResponse } from "@/types/user/user.type"

type ReviewDecision = "ACCEPTED" | "REJECTED" | null

export function SubmissionPackageReviewPanel({
  workspaceId,
  onCompleted,
}: {
  workspaceId: string
  onCompleted?: () => Promise<unknown> | unknown
}) {
  const normalizedWorkspaceId = workspaceId.trim()
  const user = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null
  const currentUserCode = user?.code?.trim() ?? ""
  const packageListQuery = useSubmissionPackagesByWorkspace(
    currentUserCode,
    normalizedWorkspaceId,
  )
  const projectDetailQuery = useProjectDetailByWorkspace(normalizedWorkspaceId)
  const completeProjectMutation = useCompleteProject()
  const latestPackage = useMemo(
    () => getLatestPackage(packageListQuery.data ?? []),
    [packageListQuery.data],
  )
  const packageId = latestPackage?.packageId?.trim() ?? ""
  const filesQuery = useDeliverableFilesByPackage(currentUserCode, packageId)
  const files = useMemo(
    () => getVisibleFiles(filesQuery.data ?? []),
    [filesQuery.data],
  )
  const projectId = projectDetailQuery.data?.result?.projectId?.trim() ?? ""
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [decision, setDecision] = useState<ReviewDecision>(null)
  const [isRejecting, setIsRejecting] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const isLoading =
    packageListQuery.isLoading ||
    projectDetailQuery.isLoading ||
    (Boolean(packageId) && filesQuery.isLoading)
  const isError =
    packageListQuery.isError || projectDetailQuery.isError || filesQuery.isError
  const statusText = getPackageStatusText(decision, latestPackage)
  const canAccept =
    Boolean(normalizedWorkspaceId && projectId && packageId) &&
    files.length > 0 &&
    !completeProjectMutation.isPending

  const handleOpenPackage = () => {
    setActionError(null)
    setIsDialogOpen(true)
  }

  const handleAccept = async () => {
    if (!canAccept) {
      setActionError("Project, package, or deliverable file data is missing.")
      return
    }

    setActionError(null)

    try {
      await completeProjectMutation.mutateAsync({
        projectId,
        workspaceId: normalizedWorkspaceId,
      })
      await Promise.resolve(onCompleted?.())
      setDecision("ACCEPTED")
      setIsRejecting(false)
      setFeedback("")
      setActionMessage("Project completed successfully.")
      setIsDialogOpen(false)
    } catch (error) {
      setActionError(getRequestErrorMessage(error))
    }
  }

  const handleReject = () => {
    setActionError(null)

    if (!isRejecting) {
      setIsRejecting(true)
      return
    }

    if (!feedback.trim()) {
      setActionError("Please enter feedback before rejecting this package.")
      return
    }

    setDecision("REJECTED")
    setActionMessage("Package was rejected locally with feedback.")
    setIsRejecting(false)
    setIsDialogOpen(false)
  }

  return (
    <>
      <section className="rounded-3xl border border-slate-200/70 bg-white shadow-sm shadow-slate-200/40">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <PackageCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-950">
                Submission Package
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Review the expert handover package and complete the project
                when everything is accepted.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          {isLoading ? (
            <SubmissionLoadingState />
          ) : isError ? (
            <SubmissionNotice
              tone="warning"
              title="Unable to load submission package"
              message={getRequestErrorMessage(
                packageListQuery.error ??
                  projectDetailQuery.error ??
                  filesQuery.error,
              )}
            />
          ) : !latestPackage ? (
            <SubmissionNotice
              title="No package submitted yet"
              message="The expert has not submitted a handover package for this workspace."
            />
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      Version {latestPackage.version || "-"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {files.length} deliverable files ready for review.
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                      decision === "ACCEPTED" &&
                        "bg-emerald-50 text-emerald-700",
                      decision === "REJECTED" && "bg-rose-50 text-rose-700",
                      !decision && "bg-white text-slate-500",
                    )}
                  >
                    {statusText}
                  </span>
                </div>
              </div>

              {actionMessage && (
                <SubmissionNotice
                  tone="success"
                  title="Submission updated"
                  message={actionMessage}
                />
              )}

              {actionError && (
                <SubmissionNotice
                  tone="warning"
                  title="Submission action failed"
                  message={actionError}
                />
              )}

              {decision === "REJECTED" && feedback.trim() && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-500">
                    Rejection feedback
                  </p>
                  <p className="mt-2 text-sm leading-6 text-rose-700">
                    {feedback.trim()}
                  </p>
                </div>
              )}

              <Button
                type="button"
                onClick={handleOpenPackage}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-sm font-bold text-white"
              >
                <FileArchive className="mr-2 h-4 w-4" />
                Open submission package
              </Button>
            </>
          )}
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[min(760px,calc(100vh-2rem))] overflow-hidden rounded-3xl bg-white p-0 shadow-2xl shadow-slate-900/10 sm:max-w-3xl">
          <div className="max-h-[calc(100vh-2rem)] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950">
                Submission Package
              </DialogTitle>
              <DialogDescription className="leading-6 text-slate-500">
                Files are loaded from the latest package submitted for this
                workspace.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 space-y-4">
              <PackageMeta packageSummary={latestPackage} projectId={projectId} />
              <DeliverableFilesTable files={files} />
            </div>

            {isRejecting && (
              <div className="mt-5">
                <label
                  htmlFor="submission-reject-feedback"
                  className="text-xs font-bold uppercase tracking-wider text-slate-400"
                >
                  Reject feedback
                </label>
                <Textarea
                  id="submission-reject-feedback"
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  placeholder="Tell the expert what should be changed before resubmission..."
                  className="mt-2 min-h-28 rounded-2xl border-slate-200 bg-slate-50/70 text-sm leading-6 shadow-none focus-visible:border-indigo-300 focus-visible:ring-indigo-100"
                />
              </div>
            )}

            {actionError && (
              <div className="mt-5">
                <SubmissionNotice
                  tone="warning"
                  title="Submission action failed"
                  message={actionError}
                />
              </div>
            )}

            <DialogFooter className="mt-6 gap-3 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleReject}
                disabled={isRejecting && !feedback.trim()}
                className="h-10 rounded-xl border-rose-200 px-4 font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <XCircle className="mr-2 h-4 w-4" />
                {isRejecting ? "Submit reject" : "Reject"}
              </Button>

              <Button
                type="button"
                onClick={handleAccept}
                disabled={!canAccept}
                className="h-10 rounded-xl bg-emerald-600 px-4 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {completeProjectMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Accept
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function PackageMeta({
  packageSummary,
  projectId,
}: {
  packageSummary?: SubmissionPackageSummary | null
  projectId: string
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <MetaTile label="Package ID" value={shortId(packageSummary?.packageId)} />
      <MetaTile label="Project ID" value={shortId(projectId)} />
      <MetaTile label="Status" value={formatStatus(packageSummary?.status)} />
    </div>
  )
}

function DeliverableFilesTable({ files }: { files: DeliverableFile[] }) {
  if (files.length === 0) {
    return (
      <SubmissionNotice
        title="No files found"
        message="The latest package does not contain deliverable files yet."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="grid grid-cols-[1fr_130px_90px_48px] bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        <span>File</span>
        <span>Type</span>
        <span className="text-right">Size</span>
        <span className="text-right">Open</span>
      </div>

      {files.map((file) => (
        <div
          key={file.fileId}
          className="grid grid-cols-[1fr_130px_90px_48px] items-center border-t border-slate-100 px-4 py-3 text-sm"
        >
          <span className="flex min-w-0 items-center gap-2 font-bold text-slate-900">
            <FileText className="h-4 w-4 shrink-0 text-indigo-500" />
            <span className="truncate">{file.fileName || "Untitled file"}</span>
          </span>
          <span className="text-xs font-bold text-slate-500">
            {formatStatus(file.fileType)}
          </span>
          <span className="text-right text-xs font-semibold text-slate-500">
            {file.fileSize || "-"}
          </span>
          <span className="flex justify-end">
            {file.fileUrl && (
              <a
                href={file.fileUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
                aria-label={`Open ${file.fileName}`}
              >
                <Download className="h-4 w-4" />
              </a>
            )}
          </span>
        </div>
      ))}
    </div>
  )
}

function SubmissionLoadingState() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-11 rounded-xl" />
    </div>
  )
}

function SubmissionNotice({
  title,
  message,
  tone = "neutral",
}: {
  title: string
  message: string
  tone?: "neutral" | "warning" | "success"
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-700",
        tone === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "neutral" && "border-slate-200 bg-slate-50 text-slate-600",
      )}
    >
      <p className="text-sm font-extrabold">{title}</p>
      <p className="mt-1 text-xs font-semibold leading-5">{message}</p>
    </div>
  )
}

function MetaTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-extrabold text-slate-900">
        {value}
      </p>
    </div>
  )
}

function getLatestPackage(packages: SubmissionPackageSummary[]) {
  return [...packages]
    .filter((item) => !item.isDelete)
    .sort((left, right) => {
      const versionDelta = (right.version ?? 0) - (left.version ?? 0)

      if (versionDelta !== 0) return versionDelta

      return getTimeValue(right.submittedAt) - getTimeValue(left.submittedAt)
    })[0]
}

function getVisibleFiles(files: DeliverableFile[]) {
  return [...files]
    .filter((file) => !file.isDelete)
    .sort((left, right) => getFileOrder(left.fileType) - getFileOrder(right.fileType))
}

function getFileOrder(fileType?: string | null) {
  const order = ["SOURCE_CODE", "DOCUMENT", "VIDEO", "DATASET"]

  const index = order.indexOf(String(fileType).toUpperCase())

  return index === -1 ? order.length : index
}

function getPackageStatusText(
  decision: ReviewDecision,
  latestPackage?: SubmissionPackageSummary | null,
) {
  if (decision === "ACCEPTED") return "Accepted"
  if (decision === "REJECTED") return "Rejected"
  if (latestPackage?.status) return formatStatus(latestPackage.status)

  return "Waiting for review"
}

function getTimeValue(value?: string | null) {
  if (!value) return 0

  const timestamp = Date.parse(value)

  return Number.isNaN(timestamp) ? 0 : timestamp
}

function formatStatus(value?: string | null) {
  const normalized = value?.trim()

  if (!normalized) return "Not available"

  return normalized
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function shortId(value?: string | null) {
  const normalized = value?.trim()

  if (!normalized) return "Not available"
  if (normalized.length <= 12) return normalized

  return `${normalized.slice(0, 8)}...${normalized.slice(-4)}`
}

function getRequestErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string
          }
        }
      }
    ).response

    if (response?.data?.message) return response.data.message
  }

  if (error instanceof Error && error.message) return error.message

  return "Please try again."
}
