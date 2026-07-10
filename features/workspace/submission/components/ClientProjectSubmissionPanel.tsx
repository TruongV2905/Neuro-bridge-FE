"use client"

import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import {
    Code2,
    Database,
    Download,
    Eye,
    FileText,
    ImageIcon,
    PackageCheck,
    Video,
    X,
} from "lucide-react"

import {
    useSubmissionPackageDetail,
    useSubmissionPackagesByWorkspace,
} from "@/services/submission-package.service"
import type {
    DeliverableFile,
    SubmissionFileType,
    SubmissionPackageSummary,
} from "@/types/submission-package.type"

type ClientProjectSubmissionPanelProps = {
    workspaceId: string
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
}: ClientProjectSubmissionPanelProps) {
    const normalizedWorkspaceId = workspaceId.trim()
    const packageListQuery =
        useSubmissionPackagesByWorkspace(normalizedWorkspaceId)
    const sortedPackages = useMemo(
        () => getPackagesSortedByLatest(packageListQuery.data ?? []),
        [packageListQuery.data]
    )
    const latestPackage = sortedPackages[0] ?? null
    const [selectedPackageId, setSelectedPackageId] = useState("")
    const [openHistoryModal, setOpenHistoryModal] = useState(false)
    const [previewFile, setPreviewFile] = useState<DeliverableFile | null>(null)

    const selectedPackageSummary = useMemo(() => {
        return (
            sortedPackages.find((item) => item.packageId === selectedPackageId) ??
            latestPackage
        )
    }, [latestPackage, selectedPackageId, sortedPackages])

    const selectedDetailPackageId = selectedPackageSummary?.packageId ?? ""
    const packageDetailQuery =
        useSubmissionPackageDetail(selectedDetailPackageId)
    const selectedPackageDetail =
        packageDetailQuery.data?.packageId === selectedDetailPackageId
            ? packageDetailQuery.data
            : null
    const selectedDeliverableFiles = selectedPackageDetail?.deliverableFiles
    const visibleFiles = useMemo(
        () => getFilesSortedBySlot(selectedDeliverableFiles ?? []),
        [selectedDeliverableFiles]
    )
    const isPackageListLoading = packageListQuery.isLoading
    const isPackageListError = packageListQuery.isError
    const isDetailLoading =
        Boolean(selectedDetailPackageId) && packageDetailQuery.isLoading
    const isDetailError =
        Boolean(selectedDetailPackageId) && packageDetailQuery.isError

    return (
        <>
            <aside className="hidden h-full w-[410px] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/70 bg-white p-6 shadow-sm xl:flex">
                <div className="shrink-0 border-b border-slate-100 pb-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Project Submission
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        View the packages and files submitted by the expert.
                    </p>
                </div>

                <div className="mt-5 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-100 bg-white p-4">
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
                                    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                                        <div className="flex flex-col gap-3 pb-2">
                                            {visibleFiles.map((file) => (
                                                <DeliverableFileCard
                                                    key={file.fileId}
                                                    file={file}
                                                    onPreview={setPreviewFile}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <ReadOnlyReviewNotice />
                            </>
                        )}
                    </div>

                    {sortedPackages.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setOpenHistoryModal(true)}
                            className="h-11 shrink-0 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"
                        >
                            View history
                        </button>
                    )}
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
                    onPreviewFile={setPreviewFile}
                    onClose={() => setOpenHistoryModal(false)}
                />
            )}

            {previewFile && (
                <FilePreviewModal
                    file={previewFile}
                    onClose={() => setPreviewFile(null)}
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
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
            <div className="flex max-h-[88vh] w-full max-w-[780px] flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900">
                            Package History
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Choose a real package version to view its files.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                        aria-label="Close package history"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex min-h-0 flex-1 gap-4 overflow-hidden p-6">
                    <div className="w-[190px] shrink-0 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Versions
                        </p>

                        <div className="flex flex-col gap-2">
                            {packages.map((item) => {
                                const isSelected = item.packageId === selectedPackageId
                                const isLatest = item.packageId === latestPackageId

                                return (
                                    <button
                                        key={item.packageId}
                                        type="button"
                                        onClick={() => onSelectPackage(item.packageId)}
                                        className={`rounded-xl border px-3 py-2 text-left transition ${isSelected
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

                    <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-white p-4">
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
                            <div className="max-h-[360px] overflow-y-auto pr-1">
                                <div className="flex flex-col gap-3">
                                    {visibleFiles.map((file) => (
                                        <DeliverableFileCard
                                            key={file.fileId}
                                            file={file}
                                            onPreview={onPreviewFile}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function DeliverableFileCard({
    file,
    onPreview,
}: {
    file: DeliverableFile
    onPreview: (file: DeliverableFile) => void
}) {
    const slot = getFileSlot(file.fileType)
    const uploadedAt = formatDateTime(file.uploadedAt)

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

                                <p className="truncate text-xs font-medium text-slate-500">
                                    {file.fileName || "Untitled file"}
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    {joinDisplayParts([file.fileSize, uploadedAt])}
                                </p>
                            </div>
                        </div>
                    </button>

                    <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2">
                        <p className="text-xs font-medium text-slate-500">
                            Read-only deliverable
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => onPreview(file)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]"
                            >
                                <Eye className="h-3.5 w-3.5" />
                                Preview
                            </button>

                            {file.fileUrl && (
                                <a
                                    href={file.fileUrl}
                                    download={file.fileName || true}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-[var(--primary)]"
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

function ReadOnlyReviewNotice() {
    return (
        <div className="mt-3 shrink-0 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-xs leading-relaxed text-slate-500">
            Package review actions are not available until backend approval and
            rejection endpoints are provided.
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
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/35 px-4">
            <div className="flex max-h-[88vh] w-full max-w-[820px] flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
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

function getPackagesSortedByLatest(packages: SubmissionPackageSummary[]) {
    return [...packages].sort((left, right) => {
        const versionDelta = safeNumber(right.version) - safeNumber(left.version)

        if (versionDelta !== 0) return versionDelta

        return getTimeValue(right.submittedAt) - getTimeValue(left.submittedAt)
    })
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

function safeNumber(value: number) {
    return Number.isFinite(value) ? value : 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}
