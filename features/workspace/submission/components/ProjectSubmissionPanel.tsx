"use client"

import { useMemo, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { Download, Eye, PackagePlus, RotateCcw } from "lucide-react"

import type { RootState } from "@/redux/store"
import {
    useDeliverableFilesByPackage,
    useResubmitSubmissionPackage,
    useSubmissionPackagesByWorkspace,
    useSubmitExpertWorkspacePackage,
} from "@/services/submission-package.service"
import type {
    SubmissionDraftFile,
    SubmissionFileType,
} from "@/types/submission-package.type"
import type { UserResponse } from "@/types/user/user.type"

import {
    getSubmissionFileSlot,
    submissionFileSlots,
} from "../constants/submission-file-slots"
import { useSubmissionFileUpload } from "../hooks/useSubmissionFileUpload"
import { sortSubmissionPackagesByLatest } from "../utils/submission-package-ordering"
import { getSubmissionUploadErrorMessage } from "../utils/submission-upload-error"
import {
    type ExpertSubmissionPackage,
    getExpertSubmissionAvailability,
    mapSubmissionFileRequest,
    mapSubmissionPackage,
    parseCustomReleaseDays,
    validateSubmissionFiles,
} from "../utils/expert-submission-flow"
import {
    formatDateTime,
    getRequestErrorMessage,
    joinDisplayParts,
    normalizeText,
    isRecord,
} from "../utils/submission-display"
import { ExpertSubmissionDialog } from "./expert/ExpertSubmissionDialog"
import { SubmissionFilePreviewModal } from "./shared/SubmissionFilePreviewModal"
import {
    SubmissionPanelNotice,
    SubmissionPanelState,
    SubmissionStatusBadge,
} from "./shared/SubmissionPanelPrimitives"

type DraftFileMap = Partial<Record<SubmissionFileType, SubmissionDraftFile>>

type ProjectSubmissionPanelProps = {
    workspaceId: string
    workspaceStatus?: string | null
    projectStatus?: string | null
    onSubmissionAccepted?: () => Promise<unknown> | unknown
}

type ModalMode = "create" | "edit"

export function ProjectSubmissionPanel({
    workspaceId,
    workspaceStatus,
    projectStatus,
    onSubmissionAccepted,
}: ProjectSubmissionPanelProps) {
    const user = useSelector(
        (state: RootState) => state.user,
    ) as UserResponse | null
    const currentUserCode = user?.code?.trim() ?? ""
    const normalizedWorkspaceId = workspaceId.trim()
    const inputRefs = useRef<
        Partial<Record<SubmissionFileType, HTMLInputElement | null>>
    >({})

    const [openModal, setOpenModal] = useState(false)
    const [modalMode, setModalMode] = useState<ModalMode>("create")
    const [previewFile, setPreviewFile] = useState<SubmissionDraftFile | null>(
        null,
    )
    const [note, setNote] = useState("")
    const [releaseDay, setReleaseDay] = useState("")
    const [draftFiles, setDraftFiles] = useState<DraftFileMap>({})
    const [formError, setFormError] = useState<string | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [refreshWarning, setRefreshWarning] = useState<string | null>(null)
    const [hasAcceptedSubmission, setHasAcceptedSubmission] = useState(false)

    const { uploadSubmissionFile, uploadingType, isUploading } =
        useSubmissionFileUpload()
    const packageListQuery = useSubmissionPackagesByWorkspace(
        currentUserCode,
        normalizedWorkspaceId,
    )
    const submitWorkspacePackageMutation =
        useSubmitExpertWorkspacePackage(currentUserCode)
    const resubmitWorkspacePackageMutation =
        useResubmitSubmissionPackage(currentUserCode)

    const sortedPackageSummaries = useMemo(
        () => sortSubmissionPackagesByLatest(packageListQuery.data ?? []),
        [packageListQuery.data],
    )
    const latestPackageSummary = sortedPackageSummaries[0] ?? null
    const latestPackageId = latestPackageSummary?.packageId ?? ""
    const packageFilesQuery = useDeliverableFilesByPackage(
        currentUserCode,
        latestPackageId,
    )
    const latestPackage = useMemo<ExpertSubmissionPackage | null>(() => {
        if (!latestPackageSummary) return null

        return mapSubmissionPackage(
            latestPackageSummary,
            packageFilesQuery.data ?? [],
        )
    }, [latestPackageSummary, packageFilesQuery.data])
    const latestFiles = useMemo(() => latestPackage?.files ?? [], [latestPackage])
    const latestFileMap = useMemo(() => buildDraftFileMap(latestFiles), [latestFiles])
    const uploadedCount = useMemo(
        () => submissionFileSlots.filter((slot) => draftFiles[slot.type]).length,
        [draftFiles],
    )
    const isPackageReadLoading =
        packageListQuery.isLoading ||
        (Boolean(latestPackageSummary) && packageFilesQuery.isLoading)
    const isPackageReadError =
        packageListQuery.isError || packageFilesQuery.isError
    const packageReadError = packageListQuery.error ?? packageFilesQuery.error
    const isSubmitting =
        submitWorkspacePackageMutation.isPending ||
        resubmitWorkspacePackageMutation.isPending
    const availability = getExpertSubmissionAvailability({
        workspaceStatus,
        projectStatus,
        latestPackage: latestPackageSummary,
        isSubmitting,
        isUploading,
        hasAcceptedSubmission,
    })
    const isEditMode = modalMode === "edit"
    const canOpenCreate = availability.action === "INITIAL_SUBMIT"
    const canOpenEdit = availability.action === "RESUBMIT"

    const resetTransientErrors = () => {
        setFormError(null)
        setSubmitError(null)
        setUploadError(null)
    }

    const openCreateModal = () => {
        resetTransientErrors()
        setRefreshWarning(null)
        setModalMode("create")
        setDraftFiles({})
        setNote("")
        setReleaseDay("")
        setOpenModal(true)
    }

    const openEditModal = () => {
        if (!latestPackage) return

        resetTransientErrors()
        setRefreshWarning(null)
        setModalMode("edit")
        setDraftFiles(latestFileMap)
        setNote(latestPackage.note)
        setReleaseDay("")
        setOpenModal(true)
    }

    const handleFileChange = async (type: SubmissionFileType, file?: File) => {
        if (!file) return

        setUploadError(null)

        try {
            const uploadedFile = await uploadSubmissionFile(type, file)

            setDraftFiles((prev) => ({
                ...prev,
                [type]: uploadedFile,
            }))
        } catch (error) {
            setUploadError(getSubmissionUploadErrorMessage(error))
        }
    }

    const handleSubmitPackage = async () => {
        if (isSubmitting || isUploading) return

        resetTransientErrors()
        setRefreshWarning(null)

        if (!availability.canSubmit) {
            setFormError(availability.message)
            return
        }

        const releaseDayResult = parseCustomReleaseDays(releaseDay)

        if ("error" in releaseDayResult) {
            setFormError(releaseDayResult.error)
            return
        }

        const files = submissionFileSlots
            .map((slot) => draftFiles[slot.type])
            .filter(Boolean) as SubmissionDraftFile[]
        const fileValidationError = validateSubmissionFiles(files)

        if (fileValidationError) {
            setFormError(fileValidationError)
            return
        }

        if (!normalizedWorkspaceId) {
            setFormError("Workspace ID is missing.")
            return
        }

        if (!currentUserCode) {
            setFormError("Your session is missing a user code. Please sign in again.")
            return
        }

        if (!note.trim()) {
            setFormError("Please add a note for this submission.")
            return
        }

        try {
            const submittedFiles = files.map(mapSubmissionFileRequest)

            if (isEditMode && latestPackageId) {
                await resubmitWorkspacePackageMutation.mutateAsync({
                    packageId: latestPackageId,
                    workspaceId: normalizedWorkspaceId,
                    request: {
                        currentPackageId: latestPackageId,
                        notes: note.trim(),
                        updatedFiles: submittedFiles,
                    },
                })
            } else {
                await submitWorkspacePackageMutation.mutateAsync({
                    request: {
                        workspaceId: normalizedWorkspaceId,
                        notes: note.trim(),
                        customReleaseDays: releaseDayResult.value,
                        files: submittedFiles,
                    },
                })
            }

            setHasAcceptedSubmission(true)
            await refreshSubmissionData(
                packageListQuery.refetch,
                onSubmissionAccepted,
                setRefreshWarning,
            )
            setDraftFiles({})
            setNote("")
            setReleaseDay("")
            setOpenModal(false)
        } catch (error) {
            setSubmitError(getRequestErrorMessage(error))
        }
    }

    return (
        <>
            <aside className="hidden h-full w-[390px] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/95 p-6 shadow-md backdrop-blur-sm xl:flex">
                <div className="shrink-0 border-b border-slate-100 pb-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Project Submission
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        Submit final deliverables, then wait for Client review.
                    </p>
                </div>

                <div className="mt-5 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                    {!isPackageReadLoading && !isPackageReadError && !latestPackage && (
                        <button
                            type="button"
                            onClick={openCreateModal}
                            disabled={!canOpenCreate}
                            className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center transition hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                <PackagePlus className="h-7 w-7" />
                            </div>
                            <p className="mt-4 text-sm font-semibold text-slate-800">
                                {canOpenCreate ? "Submit Package" : availability.label}
                            </p>
                            <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-slate-500">
                                {canOpenCreate
                                    ? "Add source code, document, video, and dataset before submitting."
                                    : availability.message}
                            </p>
                        </button>
                    )}

                    {refreshWarning && (
                        <SubmissionPanelNotice
                            tone="warning"
                            message={refreshWarning}
                        />
                    )}

                    {latestPackage && (
                        <ExpertResubmissionCard
                            packageItem={latestPackage}
                            canOpenEdit={canOpenEdit}
                            message={availability.message}
                            onOpenEdit={openEditModal}
                        />
                    )}

                    <LatestPackageFilesCard
                        latestPackage={latestPackage}
                        latestFiles={latestFiles}
                        isLoading={isPackageReadLoading}
                        isError={isPackageReadError}
                        error={packageReadError}
                        emptyMessage={availability.message}
                        canOpenEdit={canOpenEdit}
                        onOpenEdit={openEditModal}
                        onPreviewFile={setPreviewFile}
                    />
                </div>
            </aside>

            {openModal && (
                <ExpertSubmissionDialog
                    isEditMode={isEditMode}
                    note={note}
                    releaseDay={releaseDay}
                    draftFiles={draftFiles}
                    uploadedCount={uploadedCount}
                    uploadingType={uploadingType}
                    isUploading={isUploading}
                    isSubmitting={isSubmitting}
                    canSubmit={availability.canSubmit}
                    formError={formError}
                    submitError={submitError}
                    uploadError={uploadError}
                    inputRefs={inputRefs}
                    onNoteChange={setNote}
                    onReleaseDayChange={setReleaseDay}
                    onChooseFile={(type) => inputRefs.current[type]?.click()}
                    onFileChange={handleFileChange}
                    onSubmit={handleSubmitPackage}
                    onClose={() => setOpenModal(false)}
                />
            )}

            {previewFile && (
                <SubmissionFilePreviewModal
                    file={{
                        fileName: previewFile.fileName,
                        fileUrl: previewFile.previewUrl,
                        fileSize: previewFile.fileSize,
                        fileType: previewFile.fileType,
                        fileMimeType: previewFile.fileMimeType,
                        uploadedAt: previewFile.uploadedAt,
                    }}
                    onClose={() => setPreviewFile(null)}
                />
            )}
        </>
    )
}

function ExpertResubmissionCard({
    packageItem,
    canOpenEdit,
    message,
    onOpenEdit,
}: {
    packageItem: ExpertSubmissionPackage
    canOpenEdit: boolean
    message: string
    onOpenEdit: () => void
}) {
    const submittedAt = formatDateTime(packageItem.submittedAt)

    return (
        <div className="rounded-2xl border border-[var(--primary)]/15 bg-[var(--primary)]/5 p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm">
                    <RotateCcw className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                Resubmission
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                {canOpenEdit
                                    ? "Update the current package and submit a revised version for Client review."
                                    : message}
                            </p>
                        </div>
                        <SubmissionStatusBadge status={packageItem.status} />
                    </div>

                    {packageItem.feedback && (
                        <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-700">
                            <span className="font-semibold">Client feedback: </span>
                            {packageItem.feedback}
                        </div>
                    )}

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl bg-white p-3">
                            <p className="text-[11px] font-medium text-slate-400">
                                Version
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-700">
                                v{formatPackageVersion(packageItem.version)}
                            </p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                            <p className="text-[11px] font-medium text-slate-400">
                                Submitted
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-700">
                                {submittedAt ?? "-"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onOpenEdit}
                disabled={!canOpenEdit}
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <RotateCcw className="h-4 w-4" />
                Resubmit Package
            </button>
        </div>
    )
}

function LatestPackageFilesCard({
    latestPackage,
    latestFiles,
    isLoading,
    isError,
    error,
    emptyMessage,
    canOpenEdit,
    onOpenEdit,
    onPreviewFile,
}: {
    latestPackage: ExpertSubmissionPackage | null
    latestFiles: SubmissionDraftFile[]
    isLoading: boolean
    isError: boolean
    error: unknown
    emptyMessage: string
    canOpenEdit: boolean
    onOpenEdit: () => void
    onPreviewFile: (file: SubmissionDraftFile) => void
}) {
    const latestFileMap = useMemo(() => buildDraftFileMap(latestFiles), [latestFiles])

    return (
        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                        Latest Uploaded Files
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                        Only the newest file for each type is shown.
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                        {latestFiles.length}/{submissionFileSlots.length} files
                    </span>

                    {latestPackage && (
                        <button
                            type="button"
                            onClick={onOpenEdit}
                            disabled={!canOpenEdit}
                            className="rounded-full bg-[var(--primary)] px-3 py-1 text-[10px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Resubmit
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <SubmissionPanelState
                    title="Loading submitted packages..."
                    message="Checking the latest package for this workspace."
                />
            ) : isError ? (
                <SubmissionPanelState
                    tone="error"
                    title="Unable to load submitted packages"
                    message={getRequestErrorMessage(error)}
                />
            ) : latestFiles.length === 0 ? (
                <SubmissionPanelState
                    title={
                        latestPackage
                            ? "No files in this package"
                            : "No package submitted yet"
                    }
                    message={
                        latestPackage
                            ? "This package does not contain deliverable files."
                            : emptyMessage
                    }
                />
            ) : (
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                    <div className="flex flex-col gap-3 pb-4">
                        {submissionFileSlots.map((slot) => {
                            const file = latestFileMap[slot.type]

                            if (!file) return null

                            return (
                                <ExpertFileCard
                                    key={slot.type}
                                    file={file}
                                    onPreview={onPreviewFile}
                                />
                            )
                        })}
                    </div>
                </div>
            )}

            {latestPackage && (
                <div className="mt-4 shrink-0 rounded-2xl border border-slate-100 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Current Package
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                Version {formatPackageVersion(latestPackage.version)}
                            </p>
                        </div>
                        <SubmissionStatusBadge status={latestPackage.status} />
                    </div>

                    {normalizeText(latestPackage.note) && (
                        <p className="mt-3 text-xs leading-relaxed text-slate-500">
                            {latestPackage.note}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

function ExpertFileCard({
    file,
    onPreview,
}: {
    file: SubmissionDraftFile
    onPreview: (file: SubmissionDraftFile) => void
}) {
    const slot = getSubmissionFileSlot(file.fileType)

    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5">
            <div className="flex min-w-0 gap-3">
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
                        <p className="text-sm font-semibold text-slate-800">
                            {slot.label}
                        </p>
                        <p className="truncate text-xs font-medium text-slate-500">
                            {file.fileName || "Untitled file"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                            {joinDisplayParts([file.fileSize, file.uploadedAt])}
                        </p>
                    </button>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-white px-3 py-2">
                        <button
                            type="button"
                            onClick={() => onPreview(file)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/20"
                        >
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                        </button>

                        {file.previewUrl && (
                            <a
                                href={file.previewUrl}
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
    )
}

function buildDraftFileMap(files: SubmissionDraftFile[]) {
    return files.reduce<DraftFileMap>((acc, file) => {
        acc[file.fileType] = file
        return acc
    }, {})
}

async function refreshSubmissionData(
    refetchPackages: () => Promise<unknown>,
    onSubmissionAccepted?: () => Promise<unknown> | unknown,
    setRefreshWarning?: (message: string) => void,
) {
    const refreshResults = await Promise.allSettled([
        refetchPackages(),
        Promise.resolve(onSubmissionAccepted?.()),
    ])
    const hasRefreshFailure = refreshResults.some((result) => {
        if (result.status === "rejected") return true

        return isRecord(result.value) && result.value.isError === true
    })

    if (hasRefreshFailure) {
        setRefreshWarning?.(
            "Submission was accepted, but the latest project data could not be refreshed.",
        )
    }
}

function formatPackageVersion(version: number) {
    return Number.isFinite(version) && version > 0 ? String(version) : "-"
}
