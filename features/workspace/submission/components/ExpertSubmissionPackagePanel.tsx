"use client"

import { useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import {
  Download,
  FileArchive,
  FileUp,
  Loader2,
  PackagePlus,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { RootState } from "@/redux/store"
import {
  useAddDeliverableFile,
  useDeliverableFilesByPackage,
  useResubmitSubmissionPackage,
  useSubmissionPackagesByWorkspace,
  useSubmitExpertWorkspacePackage,
  useUpdateDeliverableFile,
} from "@/services/submission-package.service"
import type {
  DeliverableFile,
  DeliverableFileReviewStatus,
  SubmissionDraftFile,
  SubmissionFileType,
  SubmissionPackageSummary,
} from "@/types/submission-package.type"
import type { UserResponse } from "@/types/user/user.type"

import {
  submissionFileSlots,
} from "../constants/submission-file-slots"
import { useSubmissionFileUpload } from "../hooks/useSubmissionFileUpload"

export function ExpertSubmissionPackagePanel({
  workspaceId,
}: {
  workspaceId: string
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
  const filesByType = useMemo(
    () => groupFilesByType(files),
    [files],
  )
  const resubmittableFiles = useMemo(
    () =>
      files.filter((file) =>
        canResubmitFileStatus(getFileReviewStatus(file)),
      ),
    [files],
  )
  const addFileMutation = useAddDeliverableFile(currentUserCode)
  const submitPackageMutation = useSubmitExpertWorkspacePackage(currentUserCode)
  const resubmitPackageMutation = useResubmitSubmissionPackage(currentUserCode)
  const updateFileMutation = useUpdateDeliverableFile(currentUserCode)
  const { uploadSubmissionFile, uploadingType } = useSubmissionFileUpload()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeType, setActiveType] = useState<SubmissionFileType | null>(null)
  const [draftFiles, setDraftFiles] = useState<
    Record<string, SubmissionDraftFile>
  >({})
  const isLoading =
    packageListQuery.isLoading || (Boolean(packageId) && filesQuery.isLoading)
  const isError = packageListQuery.isError || filesQuery.isError
  const isMutating =
    addFileMutation.isPending ||
    submitPackageMutation.isPending ||
    resubmitPackageMutation.isPending ||
    updateFileMutation.isPending ||
    uploadingType !== null
  const packageStatus = normalizePackageStatus(latestPackage?.status)
  const packageFeedback = latestPackage?.feedback?.trim() ?? ""
  const canEditFiles = !latestPackage || packageStatus === "REJECTED"
  const canResubmitPackage =
    Boolean(latestPackage && packageId && normalizedWorkspaceId) &&
    packageStatus === "REJECTED" &&
    resubmittableFiles.length > 0 &&
    !isMutating
  const draftFileCount = Object.keys(draftFiles).length
  const requiredFileCount = submissionFileSlots.length
  const canCreatePackage =
    !latestPackage &&
    draftFileCount === requiredFileCount &&
    !isMutating &&
    Boolean(normalizedWorkspaceId)

  const handleFileChange = async (
    fileType: SubmissionFileType,
    file?: File | null,
  ) => {
    if (!file || isMutating) {
      return
    }

    setActiveType(fileType)

    try {
      const uploadedFile = await uploadSubmissionFile(fileType, file)

      if (!packageId) {
        setDraftFiles((current) => ({
          ...current,
          [String(fileType).toUpperCase()]: uploadedFile,
        }))
        toast.success("Deliverable file is ready for package creation.")
        return
      }

      if (!canEditFiles) {
        toast.error("This package is approved or under review, so files cannot be edited.")
        return
      }

      const existingFile = filesByType[String(fileType).toUpperCase()]
      const payload = {
        fileName: uploadedFile.fileName,
        fileUrl: uploadedFile.downloadUrl,
        fileSize: uploadedFile.fileSize,
        fileType,
      }

      if (existingFile?.fileId) {
        await updateFileMutation.mutateAsync({
          workspaceId: normalizedWorkspaceId,
          packageId,
          request: {
            fileId: existingFile.fileId,
            ...payload,
          },
        })
        toast.success("Deliverable file updated successfully.")
      } else {
        await addFileMutation.mutateAsync({
          workspaceId: normalizedWorkspaceId,
          request: {
            packageId,
            ...payload,
          },
        })
        toast.success("Deliverable file submitted successfully.")
      }

      await filesQuery.refetch()
    } catch (error) {
      toast.error(getRequestErrorMessage(error))
    } finally {
      setActiveType(null)
    }
  }

  const handleCreatePackage = async () => {
    if (!canCreatePackage) {
      toast.error("Upload every required deliverable file before submitting.")
      return
    }

    try {
      await submitPackageMutation.mutateAsync({
        request: {
          workspaceId: normalizedWorkspaceId,
          notes: "",
          customReleaseDays: null,
          files: submissionFileSlots.map((slot) => {
            const draftFile = draftFiles[String(slot.type).toUpperCase()]

            return {
              fileName: draftFile.fileName,
              fileUrl: draftFile.downloadUrl,
              fileSize: draftFile.fileSize,
              fileType: slot.type,
            }
          }),
        },
      })
      await packageListQuery.refetch()
      setDraftFiles({})
      setIsDialogOpen(false)
      toast.success("Submission package created successfully.")
    } catch (error) {
      toast.error(getRequestErrorMessage(error))
    }
  }

  const handleResubmitPackage = async () => {
    if (!canResubmitPackage || !latestPackage) {
      toast.error("Only rejected or pending deliverable files can be resubmitted.")
      return
    }

    try {
      await resubmitPackageMutation.mutateAsync({
        packageId,
        workspaceId: normalizedWorkspaceId,
        request: {
          currentPackageId: packageId,
          notes: "",
          updatedFiles: resubmittableFiles.map((file) => ({
            fileName: file.fileName,
            fileUrl: file.fileUrl,
            fileSize: file.fileSize,
            fileType: file.fileType,
          })),
        },
      })
      await packageListQuery.refetch()
      await filesQuery.refetch()
      setIsDialogOpen(false)
      toast.success("Submission package resubmitted successfully.")
    } catch (error) {
      toast.error(getRequestErrorMessage(error))
    }
  }

  return (
    <>
      <section className="rounded-3xl border border-slate-200/70 bg-white shadow-sm shadow-slate-200/40">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <PackagePlus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-950">
                Expert Submission Package
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Open the package to upload each deliverable file. You can also
                edit a submitted file by uploading a replacement in the same
                section.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          {isLoading ? (
            <ExpertSubmissionLoadingState />
          ) : isError ? (
            <SubmissionNotice
              tone="warning"
              title="Unable to load package"
              message={getRequestErrorMessage(
                packageListQuery.error ?? filesQuery.error,
              )}
            />
          ) : !latestPackage ? (
            <>
              <SubmissionNotice
                title="No package found"
                message="Upload the required deliverable files below, then create the first submission package for this workspace."
              />

              <Button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-sm font-bold text-white"
              >
                <FileArchive className="mr-2 h-4 w-4" />
                Create submission package
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      Version {latestPackage.version || "-"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {files.length} deliverable files in this package.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {formatStatus(latestPackage.status)}
                  </span>
                </div>
              </div>

              {packageStatus === "REJECTED" && packageFeedback && (
                <SubmissionNotice
                  tone="warning"
                  title="Revision feedback"
                  message={packageFeedback}
                />
              )}

              <Button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                disabled={packageStatus === "APPROVED"}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-sm font-bold text-white"
              >
                <FileArchive className="mr-2 h-4 w-4" />
                {packageStatus === "REJECTED"
                  ? "Edit and resubmit deliverable files"
                  : "Submit or edit deliverable files"}
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
                Submit Deliverable Files
              </DialogTitle>
              <DialogDescription className="leading-6 text-slate-500">
                Upload the required files one by one. If a file already exists
                in a section, choosing another file will update that submitted
                deliverable.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 space-y-4">
              <div className="grid gap-3">
                <MetaTile
                  label="Package status"
                  value={
                    latestPackage
                      ? formatStatus(latestPackage.status)
                      : `${draftFileCount}/${requiredFileCount} files ready`
                  }
                />
              </div>

              {packageStatus === "REJECTED" && packageFeedback && (
                <SubmissionNotice
                  tone="warning"
                  title="Client feedback"
                  message={packageFeedback}
                />
              )}

              <div className="grid gap-3">
                {submissionFileSlots.map((slot) => {
                  const existingFile =
                    filesByType[String(slot.type).toUpperCase()]
                  const draftFile =
                    draftFiles[String(slot.type).toUpperCase()]
                  const inputId = `expert-submission-${slot.type}`
                  const isSlotBusy =
                    activeType === slot.type || uploadingType === slot.type
                  const displayFileName =
                    existingFile?.fileName ?? draftFile?.fileName
                  const displayFileSize =
                    existingFile?.fileSize ?? draftFile?.fileSize
                  const fileReviewStatus = getFileReviewStatus(existingFile)
                  const fileFeedback = existingFile?.feedback?.trim() ?? ""
                  const canEditSlot =
                    !latestPackage ||
                    (canEditFiles && canResubmitFileStatus(fileReviewStatus))

                  return (
                    <article
                      key={slot.type}
                      className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
                            {slot.icon}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold text-slate-900">
                              {slot.label}
                            </p>
                            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                              {displayFileName ?? slot.description}
                            </p>
                            {(existingFile || draftFile) && (
                              <p className="mt-1 text-xs font-semibold text-slate-400">
                                {displayFileSize || "-"}
                                {existingFile
                                  ? ` - Uploaded ${formatDateTime(
                                    existingFile.uploadedAt,
                                  )}`
                                  : " - Ready to submit"}
                              </p>
                            )}
                            {existingFile && (
                              <p className="mt-1 text-xs font-bold text-slate-500">
                                Review: {formatStatus(fileReviewStatus)}
                              </p>
                            )}
                            {fileFeedback && (
                              <p className="mt-1 text-xs font-semibold leading-5 text-amber-700">
                                Feedback: {fileFeedback}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          {existingFile?.fileUrl && (
                            <a
                              href={existingFile.fileUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:text-sky-600"
                              aria-label={`Open ${existingFile.fileName}`}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}

                          <input
                            id={inputId}
                            type="file"
                            accept={slot.accept}
                            disabled={isMutating || !canEditSlot}
                            onChange={(event) => {
                              const selectedFile =
                                event.target.files?.[0] ?? null

                              void handleFileChange(slot.type, selectedFile)
                              event.target.value = ""
                            }}
                            className="sr-only"
                          />
                          <Button
                            type="button"
                            variant={existingFile ? "outline" : "default"}
                            disabled={isMutating || !canEditSlot}
                            onClick={() =>
                              document.getElementById(inputId)?.click()
                            }
                            className={cn(
                              "h-9 rounded-xl px-3 text-xs font-bold",
                              !existingFile &&
                              "bg-sky-600 text-white hover:bg-sky-700",
                            )}
                          >
                            {isSlotBusy ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : existingFile || draftFile ? (
                              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                            ) : (
                              <FileUp className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            {existingFile
                              ? canEditSlot
                                ? "Edit file"
                                : "Edit locked"
                              : draftFile
                                ? "Change file"
                                : "Upload file"}
                          </Button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              {!latestPackage && (
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">
                        Initial submission package
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                        Upload all {requiredFileCount} required files before
                        creating the package.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => void handleCreatePackage()}
                      disabled={!canCreatePackage}
                      className="h-10 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-50"
                    >
                      {submitPackageMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <PackagePlus className="mr-2 h-4 w-4" />
                      )}
                      Create package
                    </Button>
                  </div>
                </div>
              )}

              {latestPackage && packageStatus === "REJECTED" && (
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">
                        Resubmit package
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                        After updating the requested files, send this package
                        back to the client for review.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => void handleResubmitPackage()}
                      disabled={!canResubmitPackage}
                      className="h-10 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-50"
                    >
                      {resubmitPackageMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Resubmit package
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ExpertSubmissionLoadingState() {
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

function groupFilesByType(files: DeliverableFile[]) {
  return files.reduce<Record<string, DeliverableFile>>((result, file) => {
    const key = String(file.fileType).toUpperCase()

    if (!result[key]) {
      result[key] = file
    }

    return result
  }, {})
}

function getFileOrder(fileType?: string | null) {
  const order = submissionFileSlots.map((slot) => slot.type)
  const index = order.indexOf(String(fileType).toUpperCase())

  return index === -1 ? order.length : index
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

function formatDateTime(value?: string | null) {
  if (!value) return "-"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getFileReviewStatus(
  file?: DeliverableFile | null,
): DeliverableFileReviewStatus {
  return normalizeReviewStatus(file?.fileStatus ?? file?.status)
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

function canResubmitFileStatus(status: DeliverableFileReviewStatus) {
  return status === "REJECTED" || status === "PENDING"
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

function normalizePackageStatus(value?: string | null) {
  return String(value ?? "PENDING").trim().toUpperCase()
}
