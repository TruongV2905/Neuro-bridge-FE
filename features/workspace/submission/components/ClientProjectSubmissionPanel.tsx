"use client"

import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useSelector } from "react-redux"
import {
    AlertCircle,
    CheckCircle2,
    Code2,
    Database,
    Download,
    Eye,
    FileText,
    ImageIcon,
    PackageCheck,
    ShieldCheck,
    Video,
    X,
} from "lucide-react"

import type { RootState } from "@/redux/store"
import {
    useApproveSubmissionPackage,
    useRejectSubmissionPackage,
    useReviewDeliverableFile,
    useSubmissionPackageDetail,
    useSubmissionPackagesByWorkspace,
} from "@/services/submission-package.service"
import type {
    DeliverableFile,
    SubmissionFileType,
    SubmissionPackageSummary,
} from "@/types/submission-package.type"
import { UserRole, type UserResponse } from "@/types/user/user.type"
import { sortSubmissionPackagesByLatest } from "../utils/submission-package-ordering"

type ClientProjectSubmissionPanelProps = {
    workspaceId: string
    workspaceStatus?: string | null
    projectStatus?: string | null
    onRevisionAccepted?: () => Promise<unknown> | unknown
}

type ClientReviewActionAvailability = {
    canApprove: boolean
    canRequestRevision: boolean
    message: string
}

type FileSlot = {
    type: SubmissionFileType
    label: string
    icon: ReactNode
}

const fileSlots: FileSlot[] = [
    {
        type: "SOURCE_CODE",
        label: "Source Code",
        icon: <Code2 className="h-5 w-5" />,
    },
    {
        type: "DOCUMENT",
        label: "Document",
        icon: <FileText className="h-5 w-5" />,
    },
    {
        type: "VIDEO",
        label: "Video",
        icon: <Video className="h-5 w-5" />,
    },
    {
        type: "DATASET",
        label: "Dataset",
        icon: <Database className="h-5 w-5" />,
    },
]

export function ClientProjectSubmissionPanel({
    workspaceId,
    workspaceStatus,
    projectStatus,
    onRevisionAccepted,
}: ClientProjectSubmissionPanelProps) {
    const user = useSelector(
        (state: RootState) => state.user,
    ) as UserResponse | null
    const currentUserCode = user?.code?.trim() ?? ""
    const normalizedWorkspaceId = workspaceId.trim()
    const packageListQuery =
        useSubmissionPackagesByWorkspace(currentUserCode, normalizedWorkspaceId)
    const rejectSubmissionPackageMutation =
        useRejectSubmissionPackage(currentUserCode)
    const approveSubmissionPackageMutation =
        useApproveSubmissionPackage(currentUserCode)
    const reviewDeliverableFileMutation =
        useReviewDeliverableFile(currentUserCode)
    const sortedPackages = useMemo(
        () => sortSubmissionPackagesByLatest(packageListQuery.data ?? []),
        [packageListQuery.data]
    )
    const latestPackage = sortedPackages[0] ?? null
    const [selectedPackageId, setSelectedPackageId] = useState("")
    const [openHistoryModal, setOpenHistoryModal] = useState(false)
    const [previewFile, setPreviewFile] = useState<DeliverableFile | null>(null)
    const [openRevisionDialog, setOpenRevisionDialog] = useState(false)
    const [revisionFeedback, setRevisionFeedback] = useState("")
    const [revisionFormError, setRevisionFormError] = useState<string | null>(null)
    const [revisionRequestError, setRevisionRequestError] =
        useState<string | null>(null)
    const [revisionRefreshWarning, setRevisionRefreshWarning] =
        useState<string | null>(null)
    const [acceptedRevisionPackageId, setAcceptedRevisionPackageId] =
        useState<string | null>(null)
    const [previewedFileIds, setPreviewedFileIds] = useState<Set<string>>(
        () => new Set(),
    )
    const [approvedFileIds, setApprovedFileIds] = useState<Set<string>>(
        () => new Set(),
    )
    const [resumeHistoryAfterPreview, setResumeHistoryAfterPreview] =
        useState(false)

    const selectedPackageSummary = useMemo(() => {
        return (
            sortedPackages.find((item) => item.packageId === selectedPackageId) ??
            latestPackage
        )
    }, [latestPackage, selectedPackageId, sortedPackages])

    const selectedDetailPackageId = selectedPackageSummary?.packageId ?? ""
    const packageDetailQuery =
        useSubmissionPackageDetail(currentUserCode, selectedDetailPackageId)
    const selectedPackageDetail =
        packageDetailQuery.data?.packageId === selectedDetailPackageId
            ? packageDetailQuery.data
            : null
    const selectedDeliverableFiles = selectedPackageDetail?.deliverableFiles
    const visibleFiles = useMemo(
        () => getFilesSortedBySlot(selectedDeliverableFiles ?? []),
        [selectedDeliverableFiles]
    )
    const approvedVisibleFileCount = useMemo(() => {
        return visibleFiles.filter((file) =>
            isDeliverableFileAccepted(file, approvedFileIds),
        ).length
    }, [approvedFileIds, visibleFiles])
    const allVisibleFilesAccepted =
        visibleFiles.length === fileSlots.length &&
        visibleFiles.every((file) => isDeliverableFileAccepted(file, approvedFileIds))
    const isPackageListLoading = packageListQuery.isLoading
    const isPackageListError = packageListQuery.isError
    const isDetailLoading =
        Boolean(selectedDetailPackageId) && packageDetailQuery.isLoading
    const isDetailError =
        Boolean(selectedDetailPackageId) && packageDetailQuery.isError
    const hasOpenModal =
        openHistoryModal || Boolean(previewFile) || openRevisionDialog
    const reviewAvailability = getClientReviewActionAvailability({
        role: user?.role,
        workspaceStatus,
        projectStatus,
        workspaceId: normalizedWorkspaceId,
        latestPackage,
        selectedPackage: selectedPackageSummary,
        isMutationPending:
            rejectSubmissionPackageMutation.isPending ||
            approveSubmissionPackageMutation.isPending ||
            reviewDeliverableFileMutation.isPending,
        acceptedRevisionPackageId,
        approvedFileCount: approvedVisibleFileCount,
        requiredFileCount: fileSlots.length,
        allRequiredFilesApproved: allVisibleFilesAccepted,
    })
    const fileReviewAvailability = getClientFileReviewAvailability({
        role: user?.role,
        workspaceStatus,
        projectStatus,
        workspaceId: normalizedWorkspaceId,
        latestPackage,
        selectedPackage: selectedPackageSummary,
        isMutationPending: reviewDeliverableFileMutation.isPending,
    })
    const canReviewFiles = fileReviewAvailability.canReview

    const openRequestRevisionDialog = () => {
        if (!reviewAvailability.canRequestRevision) {
            setRevisionRequestError(reviewAvailability.message)
            return
        }

        rejectSubmissionPackageMutation.reset()
        setRevisionFormError(null)
        setRevisionRequestError(null)
        setRevisionRefreshWarning(null)
        setOpenRevisionDialog(true)
    }

    const closeRequestRevisionDialog = () => {
        if (rejectSubmissionPackageMutation.isPending) return

        setOpenRevisionDialog(false)
        setRevisionFormError(null)
        setRevisionRequestError(null)
    }

    const handleApproveFile = async (file: DeliverableFile) => {
        if (reviewDeliverableFileMutation.isPending) return

        setRevisionRequestError(null)
        setRevisionRefreshWarning(null)

        if (!fileReviewAvailability.canReview) {
            setRevisionRequestError(fileReviewAvailability.message)
            return
        }

        if (!previewedFileIds.has(file.fileId)) {
            setRevisionRequestError("Preview this file before accepting it.")
            return
        }

        if (!normalizedWorkspaceId || !file.packageId || !file.fileId) {
            setRevisionRequestError("File or workspace information is missing.")
            return
        }

        try {
            await reviewDeliverableFileMutation.mutateAsync({
                workspaceId: normalizedWorkspaceId,
                packageId: file.packageId,
                request: {
                    fileId: file.fileId,
                    newStatus: "APPROVED",
                    feedback: "Approved",
                },
            })

            setApprovedFileIds((prev) => {
                const next = new Set(prev)
                next.add(file.fileId)
                return next
            })
        } catch (error) {
            setRevisionRequestError(getReviewErrorMessage(error))
        }
    }

    const handleRequestRevision = async () => {
        if (rejectSubmissionPackageMutation.isPending) return

        setRevisionFormError(null)
        setRevisionRequestError(null)
        setRevisionRefreshWarning(null)

        if (!reviewAvailability.canRequestRevision) {
            setRevisionFormError(reviewAvailability.message)
            return
        }

        const feedback = revisionFeedback.trim()

        if (!feedback) {
            setRevisionFormError("Please add feedback before requesting revision.")
            return
        }

        const latestPackageId = latestPackage?.packageId?.trim() ?? ""

        if (!latestPackageId || !normalizedWorkspaceId) {
            setRevisionFormError("Package or workspace information is missing.")
            return
        }

        try {
            await rejectSubmissionPackageMutation.mutateAsync({
                packageId: latestPackageId,
                workspaceId: normalizedWorkspaceId,
                feedback,
            })

            setAcceptedRevisionPackageId(latestPackageId)

            const refreshResults = await Promise.allSettled([
                packageListQuery.refetch(),
                packageDetailQuery.refetch(),
                Promise.resolve(onRevisionAccepted?.()),
            ])
            const hasRefreshFailure = refreshResults.some((result) => {
                if (result.status === "rejected") return true

                return isRecord(result.value) && result.value.isError === true
            })

            if (hasRefreshFailure) {
                setRevisionRefreshWarning(
                    "Revision was requested successfully, but the latest project data could not be refreshed.",
                )
            }

            setRevisionFeedback("")
            setOpenRevisionDialog(false)
        } catch (error) {
            setRevisionRequestError(getReviewErrorMessage(error))
        }
    }

    const handleApprovePackage = async () => {
        if (approveSubmissionPackageMutation.isPending) return

        setRevisionRequestError(null)
        setRevisionRefreshWarning(null)

        if (!reviewAvailability.canApprove) {
            setRevisionRequestError(reviewAvailability.message)
            return
        }

        const latestPackageId = latestPackage?.packageId?.trim() ?? ""

        if (!latestPackageId || !normalizedWorkspaceId) {
            setRevisionRequestError("Package or workspace information is missing.")
            return
        }

        try {
            await approveSubmissionPackageMutation.mutateAsync({
                packageId: latestPackageId,
                workspaceId: normalizedWorkspaceId,
                feedback: "Approved",
            })

            const refreshResults = await Promise.allSettled([
                packageListQuery.refetch(),
                packageDetailQuery.refetch(),
                Promise.resolve(onRevisionAccepted?.()),
            ])
            const hasRefreshFailure = refreshResults.some((result) => {
                if (result.status === "rejected") return true

                return isRecord(result.value) && result.value.isError === true
            })

            if (hasRefreshFailure) {
                setRevisionRefreshWarning(
                    "Package was approved, but the latest project data could not be refreshed.",
                )
            }
        } catch (error) {
            setRevisionRequestError(getReviewErrorMessage(error))
        }
    }

    const openMainFilePreview = (file: DeliverableFile) => {
        setPreviewedFileIds((prev) => {
            const next = new Set(prev)
            next.add(file.fileId)
            return next
        })
        setResumeHistoryAfterPreview(false)
        setPreviewFile(file)
    }

    const openHistoryFilePreview = (file: DeliverableFile) => {
        setPreviewedFileIds((prev) => {
            const next = new Set(prev)
            next.add(file.fileId)
            return next
        })
        setResumeHistoryAfterPreview(true)
        setOpenHistoryModal(false)
        setPreviewFile(file)
    }

    const closeFilePreview = () => {
        setPreviewFile(null)

        if (resumeHistoryAfterPreview) {
            setOpenHistoryModal(true)
            setResumeHistoryAfterPreview(false)
        }
    }

    useEffect(() => {
        if (!hasOpenModal) return

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [hasOpenModal])

    return (
        <>
            <aside className="hidden w-[410px] shrink-0 flex-col rounded-2xl border border-white/70 bg-white p-6 shadow-sm xl:flex">
                <div className="shrink-0 border-b border-slate-100 pb-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Project Submission
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        View the packages and files submitted by the expert.
                    </p>
                </div>

                <div className="mt-5 flex flex-col gap-4">
                    <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-4">
                        <div className="mb-4 shrink-0">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800">
                                        Package Files
                                    </h3>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {selectedPackageSummary
                                            ? `Version ${formatPackageVersion(
                                                selectedPackageSummary.version
                                            )}`
                                            : "Latest submitted files."}
                                    </p>
                                </div>

                                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                                    {isDetailLoading ? "-" : visibleFiles.length} files
                                </span>
                            </div>
                        </div>

                        {isPackageListLoading ? (
                            <PanelState
                                title="Loading submitted packages..."
                                message="Checking the package history for this workspace."
                            />
                        ) : isPackageListError ? (
                            <PanelState
                                tone="error"
                                title="Unable to load submitted packages"
                                message={getRequestErrorMessage(packageListQuery.error)}
                            />
                        ) : sortedPackages.length === 0 ? (
                            <PanelState
                                title="No package submitted yet"
                                message="The expert has not submitted a package for this workspace."
                            />
                        ) : (
                            <>
                                <PackageMetadata
                                    packageSummary={selectedPackageSummary}
                                    latestPackageId={latestPackage?.packageId ?? ""}
                                />

                                <ClientReviewAction
                                    availability={reviewAvailability}
                                    refreshWarning={revisionRefreshWarning}
                                    requestError={revisionRequestError}
                                    isApproving={approveSubmissionPackageMutation.isPending}
                                    isReviewingFile={reviewDeliverableFileMutation.isPending}
                                    approvedFileCount={approvedVisibleFileCount}
                                    requiredFileCount={fileSlots.length}
                                    onApprove={handleApprovePackage}
                                    onRequestRevision={openRequestRevisionDialog}
                                    hasHistory={sortedPackages.length > 0}
                                    onViewHistory={() => setOpenHistoryModal(true)}
                                />

                                {isDetailLoading ? (
                                    <PanelState
                                        title="Loading package files..."
                                        message="Fetching files for the selected package."
                                    />
                                ) : isDetailError ? (
                                    <PanelState
                                        tone="error"
                                        title="Unable to load package files"
                                        message={getRequestErrorMessage(packageDetailQuery.error)}
                                    />
                                ) : visibleFiles.length === 0 ? (
                                    <PanelState
                                        title="No files in this package"
                                        message="This package does not contain deliverable files."
                                    />
                                ) : (
                                    <div className="flex flex-col gap-3 pb-2">
                                        {visibleFiles.map((file) => (
                                            <DeliverableFileCard
                                                key={file.fileId}
                                                file={file}
                                                canReview={canReviewFiles}
                                                hasPreviewed={previewedFileIds.has(file.fileId)}
                                                isAccepted={isDeliverableFileAccepted(
                                                    file,
                                                    approvedFileIds,
                                                )}
                                                isReviewing={
                                                    reviewDeliverableFileMutation.isPending
                                                }
                                                onPreview={openMainFilePreview}
                                                onApprove={handleApproveFile}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </aside>

            {openHistoryModal && (
                <PackageHistoryModal
                    packages={sortedPackages}
                    latestPackageId={latestPackage?.packageId ?? ""}
                    selectedPackageId={selectedDetailPackageId}
                    selectedPackageSummary={selectedPackageSummary}
                    visibleFiles={visibleFiles}
                    isDetailLoading={isDetailLoading}
                    isDetailError={isDetailError}
                    detailError={packageDetailQuery.error}
                    onSelectPackage={setSelectedPackageId}
                    onPreviewFile={openHistoryFilePreview}
                    onClose={() => setOpenHistoryModal(false)}
                />
            )}

            {previewFile && (
                <FilePreviewModal
                    file={previewFile}
                    onClose={closeFilePreview}
                />
            )}

            {openRevisionDialog && (
                <RequestRevisionDialog
                    feedback={revisionFeedback}
                    formError={revisionFormError}
                    requestError={revisionRequestError}
                    isPending={rejectSubmissionPackageMutation.isPending}
                    onFeedbackChange={setRevisionFeedback}
                    onConfirm={handleRequestRevision}
                    onClose={closeRequestRevisionDialog}
                />
            )}
        </>
    )
}

function PackageHistoryModal({
    packages,
    latestPackageId,
    selectedPackageId,
    selectedPackageSummary,
    visibleFiles,
    isDetailLoading,
    isDetailError,
    detailError,
    onSelectPackage,
    onPreviewFile,
    onClose,
}: {
    packages: SubmissionPackageSummary[]
    latestPackageId: string
    selectedPackageId: string
    selectedPackageSummary?: SubmissionPackageSummary | null
    visibleFiles: DeliverableFile[]
    isDetailLoading: boolean
    isDetailError: boolean
    detailError: unknown
    onSelectPackage: (packageId: string) => void
    onPreviewFile: (file: DeliverableFile) => void
    onClose: () => void
}) {
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="package-history-title"
                aria-describedby="package-history-description"
                className="flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-6xl flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-xl"
            >
                <div className="shrink-0 border-b border-slate-100 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3
                                id="package-history-title"
                                className="text-xl font-semibold text-slate-900"
                            >
                                Package History
                            </h3>
                            <p
                                id="package-history-description"
                                className="mt-1 text-sm text-slate-500"
                            >
                                Choose a real package version to view its files.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                            aria-label="Close package history"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
                    <div className="grid min-h-0 gap-4 md:grid-cols-[12rem_minmax(0,1fr)]">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Versions
                            </p>

                            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
                                {packages.map((item) => {
                                    const isSelected = item.packageId === selectedPackageId
                                    const isLatest = item.packageId === latestPackageId

                                    return (
                                        <button
                                            key={item.packageId}
                                            type="button"
                                            onClick={() => onSelectPackage(item.packageId)}
                                            className={`rounded-xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)]/10 ${isSelected
                                                ? "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]"
                                                : "border-slate-100 bg-white text-slate-600 hover:border-[var(--primary)]/30"
                                                }`}
                                        >
                                            <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                                                v{formatPackageVersion(item.version)}
                                                <PackageCheck className="h-4 w-4" />
                                            </span>
                                            <span className="mt-1 block truncate text-[11px] text-current/70">
                                                {isLatest ? "Latest" : formatStatusLabel(item.status)}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-800">
                                        {selectedPackageSummary
                                            ? `Version ${formatPackageVersion(
                                                selectedPackageSummary.version
                                            )}`
                                            : "Package details"}
                                    </h4>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {formatDateTime(selectedPackageSummary?.submittedAt) ??
                                            "Select a version to view files."}
                                    </p>
                                </div>
                                {selectedPackageSummary && (
                                    <StatusBadge status={selectedPackageSummary.status} />
                                )}
                            </div>

                            <PackageMetadata
                                packageSummary={selectedPackageSummary}
                                latestPackageId={latestPackageId}
                            />

                            {selectedPackageSummary?.packageId !== latestPackageId && (
                                <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
                                    Historical versions are read-only. Review actions are
                                    available only for the latest pending package.
                                </div>
                            )}

                            {isDetailLoading ? (
                                <PanelState
                                    title="Loading package files..."
                                    message="Fetching files for this selected version."
                                />
                            ) : isDetailError ? (
                                <PanelState
                                    tone="error"
                                    title="Unable to load package files"
                                    message={getRequestErrorMessage(detailError)}
                                />
                            ) : visibleFiles.length === 0 ? (
                                <PanelState
                                    title="No files in this package"
                                    message="This package does not contain deliverable files."
                                />
                            ) : (
                                <div className="grid gap-3 xl:grid-cols-2">
                                    {visibleFiles.map((file) => (
                                        <DeliverableFileCard
                                            key={file.fileId}
                                            file={file}
                                            onPreview={onPreviewFile}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function DeliverableFileCard({
    file,
    canReview = false,
    hasPreviewed = false,
    isAccepted = false,
    isReviewing = false,
    onPreview,
    onApprove,
}: {
    file: DeliverableFile
    canReview?: boolean
    hasPreviewed?: boolean
    isAccepted?: boolean
    isReviewing?: boolean
    onPreview: (file: DeliverableFile) => void
    onApprove?: (file: DeliverableFile) => void
}) {
    const slot = getFileSlot(file.fileType)
    const uploadedAt = formatDateTime(file.uploadedAt)
    const canAcceptFile = canReview && hasPreviewed && !isAccepted && !isReviewing

    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition-colors duration-150 hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5">
            <div className="flex items-start gap-3">
                <button
                    type="button"
                    onClick={() => onPreview(file)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)]"
                    title="Preview file"
                >
                    {slot.icon}
                </button>

                <div className="min-w-0 flex-1">
                    <button
                        type="button"
                        onClick={() => onPreview(file)}
                        className="w-full text-left"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800">
                                    {slot.label}
                                </p>

                                <p className="break-words text-xs font-medium text-slate-500">
                                    {file.fileName || "Untitled file"}
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    {joinDisplayParts([file.fileSize, uploadedAt])}
                                </p>
                            </div>
                            {onApprove && (
                                <FileReviewBadge
                                    isAccepted={isAccepted}
                                    hasPreviewed={hasPreviewed}
                                />
                            )}
                        </div>
                    </button>

                    <div className="mt-3 rounded-lg bg-white px-3 py-2">
                        <p className="text-xs font-medium text-slate-500">
                            {onApprove ? "Client file review" : "Read-only deliverable"}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                            <button
                                type="button"
                                onClick={() => onPreview(file)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/20"
                            >
                                <Eye className="h-3.5 w-3.5" />
                                Preview
                            </button>

                            {onApprove && (
                                <button
                                    type="button"
                                    onClick={() => onApprove(file)}
                                    disabled={!canAcceptFile}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:text-slate-400"
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {isAccepted
                                        ? "Accepted"
                                        : isReviewing
                                            ? "Saving..."
                                            : hasPreviewed
                                                ? "Accept file"
                                                : "Preview first"}
                                </button>
                            )}

                            {file.fileUrl && (
                                <a
                                    href={file.fileUrl}
                                    download={file.fileName || true}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/20"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Download
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FileReviewBadge({
    isAccepted,
    hasPreviewed,
}: {
    isAccepted: boolean
    hasPreviewed: boolean
}) {
    if (isAccepted) {
        return (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                Accepted
            </span>
        )
    }

    if (hasPreviewed) {
        return (
            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                Previewed
            </span>
        )
    }

    return (
        <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
            Preview first
        </span>
    )
}

function PackageMetadata({
    packageSummary,
    latestPackageId,
}: {
    packageSummary?: SubmissionPackageSummary | null
    latestPackageId: string
}) {
    if (!packageSummary) return null

    const submittedAt = formatDateTime(packageSummary.submittedAt)
    const reviewedAt = formatDateTime(packageSummary.reviewedAt)
    const autoReleaseAt = formatDateTime(packageSummary.autoReleaseAt)
    const notes = normalizeText(packageSummary.notes)
    const feedback = normalizeText(packageSummary.feedback)
    const isLatest = packageSummary.packageId === latestPackageId

    return (
        <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Package
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                        Version {formatPackageVersion(packageSummary.version)}
                        {isLatest ? " - Latest" : ""}
                    </p>
                </div>
                <StatusBadge status={packageSummary.status} />
            </div>

            <div className="mt-3 grid gap-2 text-xs text-slate-500">
                {submittedAt && (
                    <p>
                        Submitted:{" "}
                        <span className="font-medium text-slate-700">
                            {submittedAt}
                        </span>
                    </p>
                )}
                {reviewedAt && (
                    <p>
                        Reviewed:{" "}
                        <span className="font-medium text-slate-700">
                            {reviewedAt}
                        </span>
                    </p>
                )}
                {autoReleaseAt && (
                    <p>
                        Auto release:{" "}
                        <span className="font-medium text-slate-700">
                            {autoReleaseAt}
                        </span>
                    </p>
                )}
                {notes && (
                    <p className="leading-relaxed">
                        Notes:{" "}
                        <span className="font-medium text-slate-700">{notes}</span>
                    </p>
                )}
                {feedback && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-amber-700">
                        <p className="text-[11px] font-semibold uppercase tracking-wide">
                            Feedback
                        </p>
                        <p className="mt-1 leading-relaxed">{feedback}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status?: string | null }) {
    const label = formatStatusLabel(status)

    return (
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
            {label}
        </span>
    )
}

function ClientReviewAction({
    availability,
    refreshWarning,
    requestError,
    isApproving,
    isReviewingFile,
    approvedFileCount,
    requiredFileCount,
    onApprove,
    onRequestRevision,
    hasHistory,
    onViewHistory,
}: {
    availability: ClientReviewActionAvailability
    refreshWarning?: string | null
    requestError?: string | null
    isApproving: boolean
    isReviewingFile: boolean
    approvedFileCount: number
    requiredFileCount: number
    onApprove: () => void
    onRequestRevision: () => void
    hasHistory: boolean
    onViewHistory: () => void
}) {
    const showAction = availability.canApprove || availability.canRequestRevision

    return (
        <div className="my-4 shrink-0 space-y-2">
            {refreshWarning && (
                <PanelNotice tone="warning" message={refreshWarning} />
            )}

            {requestError && (
                <PanelNotice tone="error" message={requestError} />
            )}

            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-xs leading-relaxed text-slate-500">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Review Actions
                </p>

                <div className="mt-2 space-y-3">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">
                            {showAction
                                ? "Latest package is pending Client review."
                                : "Package review is currently locked."}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                            {showAction
                                ? "Preview and accept every submitted file before approving the package, or request changes from the expert."
                                : availability.message}
                        </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs font-semibold text-slate-700">
                                {approvedFileCount}/{requiredFileCount} files accepted
                            </span>
                        </div>
                        {isReviewingFile && (
                            <span className="text-[11px] font-medium text-slate-400">
                                Saving file review...
                            </span>
                        )}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                        <button
                            type="button"
                            onClick={onApprove}
                            disabled={!availability.canApprove || isApproving}
                            className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isApproving ? "Approving..." : "Approve Package"}
                        </button>

                        <button
                            type="button"
                            onClick={onRequestRevision}
                            disabled={!availability.canRequestRevision}
                            className="h-10 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Request Revision
                        </button>

                        {hasHistory && (
                            <button
                                type="button"
                                onClick={onViewHistory}
                                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)]/10"
                            >
                                View History
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function RequestRevisionDialog({
    feedback,
    formError,
    requestError,
    isPending,
    onFeedbackChange,
    onConfirm,
    onClose,
}: {
    feedback: string
    formError?: string | null
    requestError?: string | null
    isPending: boolean
    onFeedbackChange: (value: string) => void
    onConfirm: () => void
    onClose: () => void
}) {
    const feedbackErrorId =
        formError || requestError ? "revision-feedback-message" : undefined

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="request-revision-title"
                aria-describedby="request-revision-description"
                className="flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[560px] flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-xl"
            >
                <div className="shrink-0 border-b border-slate-100 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3
                                id="request-revision-title"
                                className="text-xl font-semibold text-slate-900"
                            >
                                Request Revision
                            </h3>
                            <p
                                id="request-revision-description"
                                className="mt-1 text-sm leading-relaxed text-slate-500"
                            >
                                Send clear feedback to the expert before the project can
                                move forward.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Close request revision dialog"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700">
                        Requesting revision sends this feedback to the expert and
                        asks the backend to return the project to a revision-required
                        state. This does not approve or complete the project, and the
                        frontend does not release escrow.
                    </div>

                    <label className="block">
                        <span
                            id="revision-feedback-label"
                            className="text-sm font-semibold text-slate-800"
                        >
                            Revision feedback
                        </span>
                        <textarea
                            value={feedback}
                            onChange={(event) => onFeedbackChange(event.target.value)}
                            disabled={isPending}
                            rows={5}
                            placeholder="Describe what the expert should revise."
                            aria-labelledby="revision-feedback-label"
                            aria-describedby={feedbackErrorId}
                            aria-invalid={Boolean(formError)}
                            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm leading-relaxed text-slate-700 outline-none transition focus:border-[var(--primary)]/50 focus:ring-4 focus:ring-[var(--primary)]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                        />
                    </label>

                    <div id={feedbackErrorId}>
                        {formError && (
                            <PanelNotice tone="error" message={formError} />
                        )}

                        {requestError && (
                            <PanelNotice tone="error" message={requestError} />
                        )}
                    </div>
                </div>

                <div className="shrink-0 border-t border-slate-100 p-5">
                    <div className="grid gap-3 sm:flex sm:items-center sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isPending}
                            className="h-10 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isPending ? "Requesting..." : "Request Revision"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PanelNotice({
    message,
    tone,
}: {
    message: string
    tone: "warning" | "error"
}) {
    const isError = tone === "error"

    return (
        <div
            className={`flex gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${isError
                ? "border-rose-100 bg-rose-50 text-rose-700"
                : "border-amber-100 bg-amber-50 text-amber-700"
                }`}
        >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{message}</span>
        </div>
    )
}

function PanelState({
    title,
    message,
    tone = "neutral",
}: {
    title: string
    message: string
    tone?: "neutral" | "error"
}) {
    const isError = tone === "error"

    return (
        <div
            className={`flex flex-1 items-center justify-center rounded-xl p-4 text-center ${isError ? "bg-rose-50" : "bg-slate-50"
                }`}
        >
            <div>
                <p
                    className={`text-sm font-semibold ${isError ? "text-rose-700" : "text-slate-600"
                        }`}
                >
                    {title}
                </p>
                <p
                    className={`mt-1 text-xs leading-relaxed ${isError ? "text-rose-600" : "text-slate-500"
                        }`}
                >
                    {message}
                </p>
            </div>
        </div>
    )
}

function FilePreviewModal({
    file,
    onClose,
}: {
    file: DeliverableFile
    onClose: () => void
}) {
    const fileKind = getFileKind(file)
    const uploadedAt = formatDateTime(file.uploadedAt)

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 px-4">
            <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[820px] flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                            {fileKind === "image" ? (
                                <ImageIcon className="h-5 w-5" />
                            ) : fileKind === "video" ? (
                                <Video className="h-5 w-5" />
                            ) : (
                                <FileText className="h-5 w-5" />
                            )}
                        </span>

                        <div className="min-w-0">
                            <h3 className="truncate text-lg font-semibold text-slate-900">
                                {file.fileName || "Untitled file"}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {joinDisplayParts([file.fileSize, uploadedAt])}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors duration-150 hover:bg-slate-200"
                        aria-label="Close file preview"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-6">
                    {file.fileUrl && fileKind === "image" && (
                        <div className="flex justify-center">
                            <img
                                src={file.fileUrl}
                                alt={file.fileName || "Submitted file"}
                                loading="lazy"
                                className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-sm"
                            />
                        </div>
                    )}

                    {file.fileUrl && fileKind === "video" && (
                        <video
                            src={file.fileUrl}
                            controls
                            className="max-h-[60vh] w-full rounded-2xl bg-black"
                        />
                    )}

                    {file.fileUrl && fileKind === "pdf" && (
                        <iframe
                            src={file.fileUrl}
                            title={file.fileName || "Submitted PDF"}
                            className="h-[60vh] w-full rounded-2xl border border-slate-200 bg-white"
                        />
                    )}

                    {(!file.fileUrl ||
                        (fileKind !== "image" &&
                            fileKind !== "video" &&
                            fileKind !== "pdf")) && (
                            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                    <FileText className="h-8 w-8" />
                                </div>

                                <h4 className="mt-4 text-base font-semibold text-slate-900">
                                    Preview is not available
                                </h4>

                                <p className="mt-2 max-w-[420px] text-sm leading-relaxed text-slate-500">
                                    This file type cannot be previewed directly in the
                                    browser. You can still download this file when a file
                                    link is available.
                                </p>
                            </div>
                        )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-5">
                    <div className="text-xs text-slate-400">
                        File type:{" "}
                        <span className="font-medium text-slate-600">
                            {normalizeText(file.fileType) ?? "Unknown"}
                        </span>
                    </div>

                    {file.fileUrl && (
                        <a
                            href={file.fileUrl}
                            download={file.fileName || true}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            <Download className="h-4 w-4" />
                            Download
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}

function getFilesSortedBySlot(files: DeliverableFile[]) {
    const slotOrder = new Map(
        fileSlots.map((slot, index) => [slot.type.toUpperCase(), index])
    )

    return [...files].sort((left, right) => {
        const leftOrder =
            slotOrder.get(String(left.fileType).toUpperCase()) ?? fileSlots.length
        const rightOrder =
            slotOrder.get(String(right.fileType).toUpperCase()) ?? fileSlots.length

        if (leftOrder !== rightOrder) return leftOrder - rightOrder

        return getTimeValue(left.uploadedAt) - getTimeValue(right.uploadedAt)
    })
}

function isDeliverableFileAccepted(
    file: DeliverableFile,
    approvedFileIds: Set<string>,
) {
    return approvedFileIds.has(file.fileId) || normalizeStatus(file.status) === "APPROVED"
}

function getClientFileReviewAvailability({
    role,
    workspaceStatus,
    projectStatus,
    workspaceId,
    latestPackage,
    selectedPackage,
    isMutationPending,
}: {
    role?: UserRole | null
    workspaceStatus?: string | null
    projectStatus?: string | null
    workspaceId: string
    latestPackage?: SubmissionPackageSummary | null
    selectedPackage?: SubmissionPackageSummary | null
    isMutationPending: boolean
}) {
    if (role !== UserRole.CLIENT) {
        return {
            canReview: false,
            message: "Only the Client can review deliverable files.",
        }
    }

    if (!normalizeText(workspaceId)) {
        return {
            canReview: false,
            message: "Workspace information is missing, so file review is locked.",
        }
    }

    if (!latestPackage || !selectedPackage) {
        return {
            canReview: false,
            message: "No submitted package is available for file review yet.",
        }
    }

    if (isMutationPending) {
        return {
            canReview: false,
            message: "File review is being saved. Please wait.",
        }
    }

    if (selectedPackage.packageId !== latestPackage.packageId) {
        return {
            canReview: false,
            message: "Historical versions are read-only. Review the latest package only.",
        }
    }

    const normalizedWorkspaceStatus = normalizeStatus(workspaceStatus)
    const normalizedProjectStatus = normalizeStatus(projectStatus)
    const normalizedPackageStatus = normalizeStatus(latestPackage.status)

    if (normalizedProjectStatus === "COMPLETED") {
        return {
            canReview: false,
            message: "This project is completed, so file review is locked.",
        }
    }

    if (normalizedProjectStatus === "DISPUTED") {
        return {
            canReview: false,
            message: "This project is disputed, so file review is locked.",
        }
    }

    if (normalizedWorkspaceStatus !== "ACTIVE") {
        return {
            canReview: false,
            message: "This workspace is read-only for file review.",
        }
    }

    if (normalizedPackageStatus !== "PENDING") {
        return {
            canReview: false,
            message: "Only pending packages can be reviewed file by file.",
        }
    }

    if (!normalizeText(latestPackage.packageId)) {
        return {
            canReview: false,
            message: "Package information is missing, so file review is locked.",
        }
    }

    return {
        canReview: true,
        message: "Preview and accept each submitted file.",
    }
}

function getClientReviewActionAvailability({
    role,
    workspaceStatus,
    projectStatus,
    workspaceId,
    latestPackage,
    selectedPackage,
    isMutationPending,
    acceptedRevisionPackageId,
    approvedFileCount,
    requiredFileCount,
    allRequiredFilesApproved,
}: {
    role?: UserRole | null
    workspaceStatus?: string | null
    projectStatus?: string | null
    workspaceId: string
    latestPackage?: SubmissionPackageSummary | null
    selectedPackage?: SubmissionPackageSummary | null
    isMutationPending: boolean
    acceptedRevisionPackageId?: string | null
    approvedFileCount: number
    requiredFileCount: number
    allRequiredFilesApproved: boolean
}): ClientReviewActionAvailability {
    if (role !== UserRole.CLIENT) {
        return {
            canApprove: false,
            canRequestRevision: false,
            message: "Only the Client can request revision for a package.",
        }
    }

    if (!normalizeText(workspaceId)) {
        return {
            canApprove: false,
            canRequestRevision: false,
            message: "Workspace information is missing, so review actions are locked.",
        }
    }

    if (!latestPackage || !selectedPackage) {
        return {
            canApprove: false,
            canRequestRevision: false,
            message: "No submitted package is available for review yet.",
        }
    }

    if (acceptedRevisionPackageId === latestPackage.packageId) {
        return {
            canApprove: false,
            canRequestRevision: false,
            message: "Revision was requested for this package. Waiting for refreshed project data.",
        }
    }

    if (isMutationPending) {
        return {
            canApprove: false,
            canRequestRevision: false,
            message: "Review action is being sent. Please wait.",
        }
    }

    const normalizedWorkspaceStatus = normalizeStatus(workspaceStatus)
    const normalizedProjectStatus = normalizeStatus(projectStatus)
    const normalizedPackageStatus = normalizeStatus(latestPackage.status)

    if (selectedPackage.packageId !== latestPackage.packageId) {
        return {
            canApprove: false,
            canRequestRevision: false,
            message: "Historical versions are read-only. Review actions are available only for the latest pending package.",
        }
    }

    if (
        normalizedProjectStatus === "COMPLETED" ||
        normalizedPackageStatus === "APPROVED"
    ) {
        return {
            canApprove: false,
            canRequestRevision: false,
            message:
                normalizedProjectStatus === "COMPLETED"
                    ? "This package has been approved and is read-only. The project has been completed, so no further review actions are available."
                    : "This package has been approved and is read-only.",
        }
    }

    if (
        normalizedProjectStatus === "REVISION_REQUESTED" &&
        normalizedPackageStatus === "REJECTED"
    ) {
        return {
            canApprove: false,
            canRequestRevision: false,
            message: "Revision feedback is available. Waiting for the expert to resubmit.",
        }
    }

    if (normalizedProjectStatus === "DISPUTED") {
        return {
            canApprove: false,
            canRequestRevision: false,
            message: "This project is disputed, so package review actions are locked.",
        }
    }

    if (normalizedWorkspaceStatus !== "ACTIVE") {
        return {
            canApprove: false,
            canRequestRevision: false,
            message: "This workspace is read-only for package review.",
        }
    }

    if (normalizedProjectStatus !== "UNDER_REVIEW") {
        return {
            canApprove: false,
            canRequestRevision: false,
            message: "Request Revision is available only while the project is under review.",
        }
    }

    if (normalizedPackageStatus !== "PENDING") {
        return {
            canApprove: false,
            canRequestRevision: false,
            message: "This package is read-only because it is no longer pending review.",
        }
    }

    if (!normalizeText(latestPackage.packageId)) {
        return {
            canApprove: false,
            canRequestRevision: false,
            message: "Package information is missing, so review actions are locked.",
        }
    }

    if (!allRequiredFilesApproved) {
        return {
            canApprove: false,
            canRequestRevision: true,
            message: `Accept all submitted files before final approval. (${approvedFileCount}/${requiredFileCount} accepted)`,
        }
    }

    return {
        canApprove: true,
        canRequestRevision: true,
        message: "The latest package can be approved or sent back for revision.",
    }
}

function getFileSlot(fileType: SubmissionFileType) {
    const normalizedType = String(fileType).toUpperCase()

    return (
        fileSlots.find((slot) => slot.type.toUpperCase() === normalizedType) ?? {
            type: fileType,
            label: formatStatusLabel(fileType),
            icon: <FileText className="h-5 w-5" />,
        }
    )
}

function getFileKind(file: DeliverableFile) {
    const source = `${file.fileName} ${file.fileUrl}`.toLowerCase()

    if (/\.(png|jpe?g|gif|webp|bmp|svg)(\s|\?|#|$)/.test(source)) return "image"
    if (/\.(mp4|webm|ogg|mov)(\s|\?|#|$)/.test(source)) return "video"
    if (/\.pdf(\s|\?|#|$)/.test(source)) return "pdf"

    return "other"
}

function formatPackageVersion(version: number) {
    const safeVersion = safeNumber(version)

    return safeVersion > 0 ? String(safeVersion) : "-"
}

function formatStatusLabel(status?: string | null) {
    const normalized = normalizeText(status)

    if (!normalized) return "Unknown"

    return normalized
        .replace(/[_-]+/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDateTime(value?: string | null) {
    const normalized = normalizeText(value)

    if (!normalized) return null

    const timestamp = Date.parse(normalized)

    if (Number.isNaN(timestamp)) return null

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(timestamp))
}

function getTimeValue(value?: string | null) {
    const normalized = normalizeText(value)

    if (!normalized) return 0

    const timestamp = Date.parse(normalized)

    return Number.isNaN(timestamp) ? 0 : timestamp
}

function getRequestErrorMessage(error: unknown) {
    if (!isRecord(error)) {
        return "Please try again later."
    }

    const response = isRecord(error.response) ? error.response : null
    const data = response && isRecord(response.data) ? response.data : null
    const message =
        data && typeof data.message === "string" ? data.message : null

    if (message) return message

    return typeof error.message === "string"
        ? error.message
        : "Please try again later."
}

function getReviewErrorMessage(error: unknown) {
    const backendMessage = getBackendMessage(error)

    if (backendMessage) return backendMessage

    const status = getResponseStatus(error)

    if (status === 400 || status === 422) {
        return "The revision feedback was not accepted. Please review it and try again."
    }

    if (status === 401) {
        return "Your session expired. Please sign in again before requesting revision."
    }

    if (status === 403) {
        return "You are not authorized to request revision for this package."
    }

    if (status === 404) {
        return "This package could not be found. Refresh the workspace and try again."
    }

    if (status === 409) {
        return "This package is no longer reviewable. Refresh the workspace to see the latest status."
    }

    return "Unable to request revision. Please try again later."
}

function getBackendMessage(error: unknown) {
    if (!isRecord(error)) return null

    const response = isRecord(error.response) ? error.response : null
    const data = response && isRecord(response.data) ? response.data : null
    const message =
        data && typeof data.message === "string" ? data.message.trim() : ""

    return message.length > 0 ? message : null
}

function getResponseStatus(error: unknown) {
    if (!isRecord(error)) return null

    const response = isRecord(error.response) ? error.response : null
    const status = response?.status

    return typeof status === "number" ? status : null
}

function joinDisplayParts(parts: Array<string | null | undefined>) {
    const visibleParts = parts
        .map((part) => normalizeText(part))
        .filter((part): part is string => Boolean(part))

    return visibleParts.length > 0
        ? visibleParts.join(" - ")
        : "File metadata unavailable"
}

function normalizeText(value?: string | null) {
    if (typeof value !== "string") return null

    const normalized = value.trim()

    return normalized.length > 0 ? normalized : null
}

function normalizeStatus(value?: string | null) {
    return normalizeText(value)?.toUpperCase() ?? ""
}

function safeNumber(value: number) {
    return Number.isFinite(value) ? value : 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}
