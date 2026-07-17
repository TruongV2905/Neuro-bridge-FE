"use client"

import { useMemo, useState } from "react"
import { useSelector } from "react-redux"
import {
  CheckCircle2,
  CircleDollarSign,
  Download,
  Eye,
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
import { useProjectEscrowPayment } from "@/services/payment.service"
import {
  useCompleteProject,
  useDeliverableFilesByPackage,
  useProjectDetailByWorkspace,
  useReviewDeliverableFile,
  useSubmissionPackagesByWorkspace,
} from "@/services/submission-package.service"
import type {
  DeliverableFile,
  DeliverableFileReviewStatus,
  SubmissionPackageSummary,
} from "@/types/submission-package.type"
import type { ProjectEscrowPayment } from "@/types/payment.type"
import type { UserResponse } from "@/types/user/user.type"
import { formatMoney } from "@/utils/formatMoney"

type ReviewDecision = "ACCEPTED" | "REJECTED" | null

export function SubmissionPackageReviewPanel({
  workspaceId,
  escrowId,
  onCompleted,
}: {
  workspaceId: string
  escrowId?: string | null
  onCompleted?: () => Promise<unknown> | unknown
}) {
  const normalizedWorkspaceId = workspaceId.trim()
  const normalizedEscrowId = escrowId?.trim() ?? ""
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
  const reviewFileMutation = useReviewDeliverableFile(currentUserCode)
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
  const projectEscrowQuery = useProjectEscrowPayment(normalizedEscrowId, {
    enabled: false,
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTransferReviewOpen, setIsTransferReviewOpen] = useState(false)
  const [decision, setDecision] = useState<ReviewDecision>(null)
  const [isRejecting, setIsRejecting] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [projectEscrow, setProjectEscrow] =
    useState<ProjectEscrowPayment | null>(null)
  const [selectedFile, setSelectedFile] = useState<DeliverableFile | null>(null)
  const [fileReviewFeedback, setFileReviewFeedback] = useState("")
  const [fileReviews, setFileReviews] = useState<
    Record<string, { status: DeliverableFileReviewStatus; feedback?: string }>
  >({})
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const isLoading =
    packageListQuery.isLoading ||
    projectDetailQuery.isLoading ||
    (Boolean(packageId) && filesQuery.isLoading)
  const isError =
    packageListQuery.isError || projectDetailQuery.isError || filesQuery.isError
  const statusText = getPackageStatusText(decision, latestPackage)
  const allFilesApproved =
    files.length > 0 &&
    files.every((file) => {
      const reviewStatus =
        fileReviews[file.fileId]?.status ?? normalizeReviewStatus(file.status)

      return reviewStatus === "APPROVED"
    })
  const canAccept =
    Boolean(normalizedWorkspaceId && projectId && normalizedEscrowId && packageId) &&
    allFilesApproved &&
    !completeProjectMutation.isPending
  const selectedFileReview = selectedFile
    ? fileReviews[selectedFile.fileId]
    : undefined
  const selectedFileStatus =
    selectedFileReview?.status ?? normalizeReviewStatus(selectedFile?.status)
  const transferDetail = projectEscrowQuery.data ?? projectEscrow
  const canConfirmTransfer =
    canAccept && isValidMoneyValue(transferDetail?.heldAmount)

  const handleOpenPackage = () => {
    setActionError(null)
    setIsDialogOpen(true)
    setIsTransferReviewOpen(false)
    setProjectEscrow(null)
  }

  const handlePrepareAccept = async () => {
    if (!canAccept) {
      setActionError("Project, escrow, package, or deliverable file data is missing.")
      return
    }

    setActionError(null)

    const escrowResponse = await projectEscrowQuery.refetch()

    if (escrowResponse.isError) {
      setActionError(getRequestErrorMessage(escrowResponse.error))
      return
    }

    setProjectEscrow(escrowResponse.data ?? null)
    setIsRejecting(false)
    setIsTransferReviewOpen(true)
  }

  const handleConfirmAccept = async () => {
    if (!canAccept) {
      setActionError("Project, escrow, package, or deliverable file data is missing.")
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
      setIsTransferReviewOpen(false)
      setProjectEscrow(null)
      setIsDialogOpen(false)
    } catch (error) {
      setActionError(getRequestErrorMessage(error))
    }
  }

  const handleReject = () => {
    setActionError(null)
    setIsTransferReviewOpen(false)

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

  const handleOpenFilePreview = (file: DeliverableFile) => {
    setActionError(null)
    setSelectedFile(file)
    setFileReviewFeedback(fileReviews[file.fileId]?.feedback ?? file.feedback ?? "")
  }

  const handleCloseFilePreview = () => {
    if (reviewFileMutation.isPending) return

    setSelectedFile(null)
    setFileReviewFeedback("")
  }

  const handleReviewFile = async (newStatus: "APPROVED" | "REJECTED") => {
    if (!selectedFile || !packageId) return

    const normalizedFeedback = fileReviewFeedback.trim()

    if (newStatus === "REJECTED" && !normalizedFeedback) {
      setActionError("Please enter feedback before rejecting this file.")
      return
    }

    setActionError(null)

    try {
      await reviewFileMutation.mutateAsync({
        workspaceId: normalizedWorkspaceId,
        packageId,
        request: {
          fileId: selectedFile.fileId,
          newStatus,
          feedback:
            newStatus === "APPROVED"
              ? normalizedFeedback || "Approved"
              : normalizedFeedback,
        },
      })
      setFileReviews((current) => ({
        ...current,
        [selectedFile.fileId]: {
          status: newStatus,
          feedback:
            newStatus === "APPROVED"
              ? normalizedFeedback || "Approved"
              : normalizedFeedback,
        },
      }))
      await filesQuery.refetch()
      setActionMessage(
        newStatus === "APPROVED"
          ? "File approved successfully."
          : "File rejected successfully.",
      )
      handleCloseFilePreview()
    } catch (error) {
      setActionError(getRequestErrorMessage(error))
    }
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

              {!allFilesApproved && files.length > 0 && (
                <SubmissionNotice
                  title="File review required"
                  message="Preview and approve every deliverable file before completing the project."
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
              <DeliverableFilesTable
                files={files}
                fileReviews={fileReviews}
                onPreviewFile={handleOpenFilePreview}
              />

              {isTransferReviewOpen && (
                <TransferReleasePreview projectEscrow={transferDetail} />
              )}
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
              {isTransferReviewOpen ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsTransferReviewOpen(false)}
                    disabled={completeProjectMutation.isPending}
                    className="h-10 rounded-xl border-slate-200 px-4 font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Back to review
                  </Button>

                  <Button
                    type="button"
                    onClick={handleConfirmAccept}
                    disabled={!canConfirmTransfer}
                    className="h-10 rounded-xl bg-emerald-600 px-4 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {completeProjectMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Confirm transfer
                  </Button>
                </>
              ) : (
                <>
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
                    onClick={handlePrepareAccept}
                    disabled={!canAccept || projectEscrowQuery.isFetching}
                    className="h-10 rounded-xl bg-emerald-600 px-4 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {projectEscrowQuery.isFetching ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    {projectEscrowQuery.isFetching ? "Checking transfer" : "Accept"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedFile)}
        onOpenChange={(open) => {
          if (!open) handleCloseFilePreview()
        }}
      >
        <DialogContent className="max-h-[min(820px,calc(100vh-2rem))] overflow-hidden rounded-3xl bg-white p-0 shadow-2xl shadow-slate-900/10 sm:max-w-4xl">
          <div className="max-h-[calc(100vh-2rem)] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950">
                File Preview
              </DialogTitle>
              <DialogDescription className="leading-6 text-slate-500">
                Review the submitted file details before approving or rejecting
                it.
              </DialogDescription>
            </DialogHeader>

            {selectedFile && (
              <div className="mt-5 space-y-4">
                <FilePreviewDetail
                  file={selectedFile}
                  reviewStatus={selectedFileStatus}
                />

                <div>
                  <label
                    htmlFor="file-review-feedback"
                    className="text-xs font-bold uppercase tracking-wider text-slate-400"
                  >
                    Review feedback
                  </label>
                  <Textarea
                    id="file-review-feedback"
                    value={fileReviewFeedback}
                    onChange={(event) =>
                      setFileReviewFeedback(event.target.value)
                    }
                    placeholder="Add feedback for the expert. Required when rejecting a file."
                    className="mt-2 min-h-24 rounded-2xl border-slate-200 bg-slate-50/70 text-sm leading-6 shadow-none focus-visible:border-indigo-300 focus-visible:ring-indigo-100"
                  />
                </div>

                {actionError && (
                  <SubmissionNotice
                    tone="warning"
                    title="File review failed"
                    message={actionError}
                  />
                )}
              </div>
            )}

            <DialogFooter className="mt-6 gap-3 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleReviewFile("REJECTED")}
                disabled={reviewFileMutation.isPending}
                className="h-10 rounded-xl border-rose-200 px-4 font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                {reviewFileMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Reject file
              </Button>

              <Button
                type="button"
                onClick={() => void handleReviewFile("APPROVED")}
                disabled={reviewFileMutation.isPending}
                className="h-10 rounded-xl bg-emerald-600 px-4 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {reviewFileMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Approve file
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

function DeliverableFilesTable({
  files,
  fileReviews,
  onPreviewFile,
}: {
  files: DeliverableFile[]
  fileReviews: Record<
    string,
    { status: DeliverableFileReviewStatus; feedback?: string }
  >
  onPreviewFile: (file: DeliverableFile) => void
}) {
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
      <div className="grid grid-cols-[1fr_120px_90px_92px] bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        <span>File</span>
        <span>Type</span>
        <span className="text-right">Size</span>
        <span className="text-right">Review</span>
      </div>

      {files.map((file) => {
        const reviewStatus =
          fileReviews[file.fileId]?.status ?? normalizeReviewStatus(file.status)

        return (
          <div
            key={file.fileId}
            className="grid grid-cols-[1fr_120px_90px_92px] items-center border-t border-slate-100 px-4 py-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2 font-bold text-slate-900">
              <FileText className="h-4 w-4 shrink-0 text-indigo-500" />
              <span className="truncate">
                {file.fileName || "Untitled file"}
              </span>
            </span>
            <span className="text-xs font-bold text-slate-500">
              {formatStatus(file.fileType)}
            </span>
            <span className="text-right text-xs font-semibold text-slate-500">
              {file.fileSize || "-"}
            </span>
            <span className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onPreviewFile(file)}
                className={cn(
                  "h-8 rounded-lg px-2 text-xs font-bold",
                  reviewStatus === "APPROVED" &&
                    "text-emerald-600 hover:text-emerald-700",
                  reviewStatus === "REJECTED" &&
                    "text-rose-600 hover:text-rose-700",
                  reviewStatus === "PENDING" &&
                    "text-indigo-600 hover:text-indigo-700",
                )}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                {reviewStatus === "PENDING"
                  ? "Preview"
                  : formatStatus(reviewStatus)}
              </Button>
            </span>
          </div>
        )
      })}
    </div>
  )
}

function TransferReleasePreview({
  projectEscrow,
}: {
  projectEscrow?: ProjectEscrowPayment | null
}) {
  const heldAmount = projectEscrow?.heldAmount ?? null
  const platformFee = projectEscrow?.platformFee ?? null
  const escrowAmount = projectEscrow?.amount ?? null

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
          <CircleDollarSign className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-emerald-900">
            Transfer review
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-emerald-700">
            Confirming will complete this project and release the prepared
            amount to the expert.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MetaTile
              label="Expert receives"
              value={formatMoney(heldAmount, "Not available")}
            />
            <MetaTile
              label="Platform fee"
              value={formatMoney(platformFee, "Not available")}
            />
            <MetaTile
              label="Project escrow"
              value={formatMoney(escrowAmount, "Not available")}
            />
          </div>

          {!isValidMoneyValue(heldAmount) && (
            <p className="mt-3 text-xs font-semibold leading-5 text-amber-700">
              The project escrow response does not include a held amount
              yet. Please refresh or confirm the backend response before
              completing this project.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function FilePreviewDetail({
  file,
  reviewStatus,
}: {
  file: DeliverableFile
  reviewStatus: DeliverableFileReviewStatus
}) {
  const previewKind = getPreviewKind(file)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <MetaTile label="File" value={file.fileName || "Untitled file"} />
        <MetaTile label="Type" value={formatStatus(file.fileType)} />
        <MetaTile label="Size" value={file.fileSize || "-"} />
        <MetaTile label="Review" value={formatStatus(reviewStatus)} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {previewKind === "image" && file.fileUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.fileUrl}
            alt={file.fileName}
            className="max-h-[420px] w-full object-contain"
          />
        ) : previewKind === "video" && file.fileUrl ? (
          <video
            src={file.fileUrl}
            controls
            className="max-h-[420px] w-full bg-black"
          />
        ) : previewKind === "document" && file.fileUrl ? (
          <iframe
            src={file.fileUrl}
            title={file.fileName || "Deliverable file preview"}
            className="h-[420px] w-full bg-white"
          />
        ) : (
          <div className="flex min-h-52 flex-col items-center justify-center p-8 text-center">
            <FileArchive className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-extrabold text-slate-800">
              Preview is not available for this file type
            </p>
            <p className="mt-1 max-w-md text-xs font-semibold leading-5 text-slate-500">
              Download or open the file in a new tab to inspect it before
              reviewing.
            </p>
          </div>
        )}
      </div>

      {file.fileUrl && (
        <a
          href={file.fileUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
        >
          <Download className="mr-2 h-4 w-4" />
          Open original file
        </a>
      )}
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
    .sort(
      (left, right) =>
        getFileOrder(left.fileType) - getFileOrder(right.fileType),
    )
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

function normalizeReviewStatus(
  value?: string | null,
): DeliverableFileReviewStatus {
  const normalized = String(value ?? "PENDING").toUpperCase()

  if (
    normalized === "APPROVED" ||
    normalized === "REJECTED" ||
    normalized === "REVISION_REQUIRED" ||
    normalized === "SUPERSEDED"
  ) {
    return normalized
  }

  return "PENDING"
}

function isValidMoneyValue(value?: number | string | null) {
  if (typeof value === "number") {
    return Number.isFinite(value)
  }

  if (typeof value === "string") {
    return value.trim().length > 0 && Number.isFinite(Number(value))
  }

  return false
}

function getPreviewKind(file: DeliverableFile) {
  const url = file.fileUrl?.toLowerCase() ?? ""
  const name = file.fileName?.toLowerCase() ?? ""
  const source = `${url} ${name}`

  if (/\.(png|jpe?g|webp|gif|bmp|svg)(\?|#|$)/.test(source)) {
    return "image"
  }

  if (/\.(mp4|webm|ogg|mov)(\?|#|$)/.test(source)) {
    return "video"
  }

  if (/\.(pdf|txt|html?)(\?|#|$)/.test(source)) {
    return "document"
  }

  return "download"
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
