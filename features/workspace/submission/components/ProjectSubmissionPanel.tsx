"use client"

import { useMemo, useRef, useState } from "react"
import type { MutableRefObject, ReactNode } from "react"
import { useSelector } from "react-redux"
import {
    AlertCircle,
    CheckCircle2,
    Code2,
    Database,
    Download,
    FileText,
    ImageIcon,
    PackagePlus,
    UploadCloud,
    Video,
    X,
} from "lucide-react"

import type { RootState } from "@/redux/store"
import {
    useDeliverableFilesByPackage,
    useSubmissionPackagesByWorkspace,
    useSubmitExpertWorkspacePackage,
} from "@/services/submission-package.service"
import type { UserResponse } from "@/types/user/user.type"
import type {
    DeliverableFile as DeliverableFileResponse,
    SubmissionDraftFile,
    SubmissionFileRequest,
    SubmissionFileType,
    SubmissionPackageSummary,
} from "@/types/submission-package.type"
import { useSubmissionFileUpload } from "../hooks/useSubmissionFileUpload"
import { sortSubmissionPackagesByLatest } from "../utils/submission-package-ordering"
import { getSubmissionUploadErrorMessage } from "../utils/submission-upload-error"

type FileType = SubmissionFileType
type ModalMode = "create" | "edit"

type SubmissionPackage = {
    packageId: string
    version: number
    status: string
    submittedAt: string
    note: string
    files: SubmissionDraftFile[]
}

type PackageFileSlot = {
    type: FileType
    label: string
    description: string
    accept?: string
    icon: ReactNode
}

type ProjectSubmissionPanelProps = {
    workspaceId: string
    workspaceStatus?: string | null
    projectStatus?: string | null
    onSubmissionAccepted?: () => Promise<unknown> | unknown
}

type SubmissionAction =
    | "INITIAL_SUBMIT"
    | "RESUBMIT"
    | "PENDING_LOCKED"
    | "UNDER_REVIEW_LOCKED"
    | "COMPLETED_LOCKED"
    | "DISPUTED_LOCKED"
    | "ARCHIVED_LOCKED"
    | "UNKNOWN_LOCKED"

type ActionAvailability = {
    action: SubmissionAction
    canSubmit: boolean
    label: string
    message: string
}

const packageFileSlots: PackageFileSlot[] = [
    {
        type: "SOURCE_CODE",
        label: "Source Code",
        description: "Upload source code archive or repository export.",
        accept: ".zip,.rar,.7z",
        icon: <Code2 className="h-5 w-5" />,
    },
    {
        type: "DOCUMENT",
        label: "Document",
        description: "Upload project report, guide, or technical document.",
        accept: ".pdf,.doc,.docx",
        icon: <FileText className="h-5 w-5" />,
    },
    {
        type: "VIDEO",
        label: "Video",
        description: "Upload demo video or product walkthrough.",
        accept: "video/*",
        icon: <Video className="h-5 w-5" />,
    },
    {
        type: "DATASET",
        label: "Dataset",
        description: "Upload dataset, sample data, or related resources.",
        accept: ".zip,.rar,.7z,.csv,.xlsx,.json",
        icon: <Database className="h-5 w-5" />,
    },
]

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
    const [openModal, setOpenModal] = useState(false)
    const [modalMode, setModalMode] = useState<ModalMode>("create")
    const [previewFile, setPreviewFile] = useState<SubmissionDraftFile | null>(null)
    const [note, setNote] = useState("")
    const [releaseDay, setReleaseDay] = useState("")
    const [draftFiles, setDraftFiles] = useState<
        Partial<Record<FileType, SubmissionDraftFile>>
    >({})
    const [formError, setFormError] = useState<string | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [refreshWarning, setRefreshWarning] = useState<string | null>(null)
    const [hasAcceptedSubmission, setHasAcceptedSubmission] = useState(false)
    const inputRefs = useRef<Partial<Record<FileType, HTMLInputElement | null>>>({})
    const {
        uploadSubmissionFile,
        uploadingType,
        isUploading,
    } = useSubmissionFileUpload()
    const packageListQuery =
        useSubmissionPackagesByWorkspace(currentUserCode, normalizedWorkspaceId)
    const submitWorkspacePackageMutation =
        useSubmitExpertWorkspacePackage(currentUserCode)
    const sortedPackageSummaries = useMemo(
        () => sortSubmissionPackagesByLatest(packageListQuery.data ?? []),
        [packageListQuery.data],
    )
    const latestPackageSummary = sortedPackageSummaries[0] ?? null
    const latestPackageId = latestPackageSummary?.packageId ?? ""
    const packageFilesQuery =
        useDeliverableFilesByPackage(currentUserCode, latestPackageId)
    const latestPackage = useMemo(() => {
        if (!latestPackageSummary) return null

        return mapSubmissionPackage(
            latestPackageSummary,
            packageFilesQuery.data ?? [],
        )
    }, [latestPackageSummary, packageFilesQuery.data])
    const latestFiles = useMemo(() => {
        return latestPackage?.files ?? []
    }, [latestPackage])
    const latestFileMap = useMemo(() => {
        return latestFiles.reduce<Partial<Record<FileType, SubmissionDraftFile>>>(
            (acc, file) => {
                acc[file.fileType] = file
                return acc
            },
            {},
        )
    }, [latestFiles])
    const isPackageReadLoading =
        packageListQuery.isLoading ||
        (Boolean(latestPackageSummary) && packageFilesQuery.isLoading)
    const isPackageReadError =
        packageListQuery.isError || packageFilesQuery.isError
    const packageReadError =
        packageListQuery.error ?? packageFilesQuery.error
    const isSubmitting = submitWorkspacePackageMutation.isPending
    const availability = getExpertSubmissionAvailability({
        workspaceStatus,
        projectStatus,
        latestPackage: latestPackageSummary,
        isSubmitting,
        isUploading,
        hasAcceptedSubmission,
    })
    const uploadedCount = useMemo(
        () => packageFileSlots.filter((slot) => draftFiles[slot.type]).length,
        [draftFiles],
    )
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
        resetTransientErrors()
        setRefreshWarning(null)
        setModalMode("edit")
        setDraftFiles(latestFileMap)
        setNote(latestPackage?.note ?? "")
        setReleaseDay("")
        setOpenModal(true)
    }

    const handleFileChange = async (type: FileType, file?: File) => {
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

        const files = packageFileSlots
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
            await submitWorkspacePackageMutation.mutateAsync({
                request: {
                    workspaceId: normalizedWorkspaceId,
                    notes: note.trim(),
                    customReleaseDays: releaseDayResult.value,
                    files: files.map(mapSubmissionFileRequest),
                },
            })

            setHasAcceptedSubmission(true)

            const refreshResults = await Promise.allSettled([
                packageListQuery.refetch(),
                Promise.resolve(onSubmissionAccepted?.()),
            ])
            const hasRefreshFailure = refreshResults.some((result) => {
                if (result.status === "rejected") return true

                return isRecord(result.value) && result.value.isError === true
            })

            if (hasRefreshFailure) {
                setRefreshWarning(
                    "Submission was accepted, but the latest project data could not be refreshed.",
                )
            }

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
                <div className="border-b border-slate-100 pb-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Project Submission
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        Create a package and upload final deliverables.
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
                        <PanelNotice tone="warning" message={refreshWarning} />
                    )}

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
                                    {latestFiles.length}/4 files
                                </span>

                                {latestPackage && (
                                    <button
                                        type="button"
                                        onClick={openEditModal}
                                        disabled={!canOpenEdit}
                                        className="rounded-full bg-[var(--primary)] px-3 py-1 text-[10px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {canOpenEdit ? "Resubmit" : "Locked"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {isPackageReadLoading ? (
                            <PackageStateCard
                                title="Loading submitted packages..."
                                message="Checking the latest package for this workspace."
                            />
                        ) : isPackageReadError ? (
                            <PackageStateCard
                                tone="error"
                                title="Unable to load submitted packages"
                                message={getRequestErrorMessage(packageReadError)}
                            />
                        ) : latestFiles.length === 0 ? (
                            <PackageStateCard
                                title={latestPackage ? "No files in this package" : "No package submitted yet"}
                                message={
                                    latestPackage
                                        ? "This package does not contain deliverable files."
                                        : availability.message
                                }
                            />
                        ) : (
                            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                                <div className="flex flex-col gap-3 pb-4">
                                    {packageFileSlots.map((slot) => {
                                        const file = latestFileMap[slot.type]

                                        if (!file) return null

                                        return (
                                            <button
                                                key={slot.type}
                                                type="button"
                                                onClick={() => setPreviewFile(file)}
                                                className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-left transition hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5"
                                            >
                                                <div className="flex min-w-0 gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)]">
                                                        {slot.icon}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-800">
                                                            {slot.label}
                                                        </p>
                                                        <p className="truncate text-xs font-medium text-slate-500">
                                                            {file.fileName}
                                                        </p>
                                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                                            {joinDisplayParts([file.fileSize, file.uploadedAt])}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                <div className="mt-auto rounded-2xl border border-[var(--primary)]/10 bg-[var(--primary)]/5 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                Submission package available
                                            </p>
                                            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                                                {availability.message}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-white p-3">
                                            <p className="text-[11px] font-medium text-slate-400">
                                                Uploaded files
                                            </p>
                                            <p className="mt-1 text-lg font-bold text-slate-900">
                                                {latestFiles.length}/4
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-white p-3">
                                            <p className="text-[11px] font-medium text-slate-400">
                                                Last updated
                                            </p>
                                            <p className="mt-1 text-xs font-semibold text-slate-700">
                                                {latestPackage?.submittedAt}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={openEditModal}
                                        disabled={!canOpenEdit}
                                        className="mt-4 h-10 w-full rounded-xl bg-[var(--primary)] text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {canOpenEdit ? "Resubmit Package" : availability.label}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {openModal && (
                <SubmissionModal
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
                <FilePreviewModal
                    file={previewFile}
                    onClose={() => setPreviewFile(null)}
                />
            )}
        </>
    )
}

function SubmissionModal({
    isEditMode,
    note,
    releaseDay,
    draftFiles,
    uploadedCount,
    uploadingType,
    isUploading,
    isSubmitting,
    canSubmit,
    formError,
    submitError,
    uploadError,
    inputRefs,
    onNoteChange,
    onReleaseDayChange,
    onChooseFile,
    onFileChange,
    onSubmit,
    onClose,
}: {
    isEditMode: boolean
    note: string
    releaseDay: string
    draftFiles: Partial<Record<FileType, SubmissionDraftFile>>
    uploadedCount: number
    uploadingType: FileType | null
    isUploading: boolean
    isSubmitting: boolean
    canSubmit: boolean
    formError?: string | null
    submitError?: string | null
    uploadError?: string | null
    inputRefs: MutableRefObject<Partial<Record<FileType, HTMLInputElement | null>>>
    onNoteChange: (value: string) => void
    onReleaseDayChange: (value: string) => void
    onChooseFile: (type: FileType) => void
    onFileChange: (type: FileType, file?: File) => void
    onSubmit: () => void
    onClose: () => void
}) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/40 px-4 py-10 backdrop-blur-sm">
            <div className="my-auto w-full max-w-[720px] rounded-3xl bg-white p-6 shadow-xl">
                <div className="border-b border-slate-100 pb-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900">
                                {isEditMode ? "Resubmit Package" : "Submit Package"}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Upload all 4 required deliverables before submitting the package.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_180px]">
                        <div>
                            <label className="text-sm font-semibold text-slate-800">
                                Note:
                            </label>
                            <input
                                value={note}
                                onChange={(event) => onNoteChange(event.target.value)}
                                placeholder="Enter note for this submission"
                                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--primary)] focus:bg-white"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-800">
                                Release day:
                            </label>
                            <input
                                type="number"
                                min={1}
                                step={1}
                                value={releaseDay}
                                onChange={(event) => onReleaseDayChange(event.target.value)}
                                placeholder="Default"
                                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--primary)] focus:bg-white"
                            />
                        </div>
                    </div>

                    {(formError || submitError || uploadError) && (
                        <div className="mt-4 space-y-2">
                            {formError && <PanelNotice tone="warning" message={formError} />}
                            {submitError && <PanelNotice tone="error" message={submitError} />}
                            {uploadError && <PanelNotice tone="error" message={uploadError} />}
                        </div>
                    )}
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {packageFileSlots.map((slot) => {
                        const file = draftFiles[slot.type]

                        return (
                            <div
                                key={slot.type}
                                className={`rounded-2xl border p-4 text-left transition ${file
                                    ? "border-[var(--primary)]/40 bg-[var(--primary)]/5"
                                    : "border-slate-100 bg-slate-50"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${file
                                            ? "bg-[var(--primary)] text-white"
                                            : "bg-white text-[var(--primary)]"
                                            }`}
                                    >
                                        {file ? <CheckCircle2 className="h-5 w-5" /> : slot.icon}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {slot.label}
                                        </p>

                                        {file ? (
                                            <>
                                                <p className="mt-1 truncate text-xs font-medium text-slate-600">
                                                    {file.fileName}
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-slate-400">
                                                    {file.fileSize}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                                {slot.description}
                                            </p>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => onChooseFile(slot.type)}
                                            disabled={uploadingType === slot.type || isSubmitting}
                                            className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <UploadCloud className="h-4 w-4" />
                                            {uploadingType === slot.type
                                                ? "Uploading..."
                                                : file
                                                    ? "Upload again"
                                                    : "Upload file"}
                                        </button>
                                    </div>
                                </div>

                                <input
                                    ref={(element) => {
                                        inputRefs.current[slot.type] = element
                                    }}
                                    type="file"
                                    accept={slot.accept}
                                    className="hidden"
                                    onChange={(event) => {
                                        onFileChange(slot.type, event.target.files?.[0])
                                        event.target.value = ""
                                    }}
                                />
                            </div>
                        )
                    })}
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                    <p className="text-sm text-slate-500">
                        Uploaded{" "}
                        <span className="font-semibold text-slate-800">
                            {uploadedCount}/4
                        </span>{" "}
                        required files
                    </p>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={
                                uploadedCount !== 4 ||
                                !note.trim() ||
                                isSubmitting ||
                                isUploading ||
                                !canSubmit
                            }
                            className="h-11 rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting
                                ? "Submitting..."
                                : isEditMode
                                    ? "Resubmit Package"
                                    : "Submit Package"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FilePreviewModal({
    file,
    onClose,
}: {
    file: SubmissionDraftFile
    onClose: () => void
}) {
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
            <div className="flex max-h-[88vh] w-full max-w-[820px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
                    <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                            {file.fileMimeType.startsWith("image/") ? (
                                <ImageIcon className="h-5 w-5" />
                            ) : file.fileMimeType.startsWith("video/") ? (
                                <Video className="h-5 w-5" />
                            ) : (
                                <FileText className="h-5 w-5" />
                            )}
                        </span>

                        <div className="min-w-0">
                            <h3 className="truncate text-lg font-semibold text-slate-900">
                                {file.fileName}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {joinDisplayParts([file.fileSize, file.uploadedAt])}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-6">
                    {file.fileMimeType.startsWith("image/") && (
                        <div className="flex justify-center">
                            <img
                                src={file.previewUrl}
                                alt={file.fileName}
                                loading="lazy"
                                className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-sm"
                            />
                        </div>
                    )}

                    {file.fileMimeType.startsWith("video/") && (
                        <video
                            src={file.previewUrl}
                            controls
                            className="max-h-[60vh] w-full rounded-2xl bg-black"
                        />
                    )}

                    {file.fileMimeType === "application/pdf" && (
                        <iframe
                            src={file.previewUrl}
                            title={file.fileName}
                            className="h-[60vh] w-full rounded-2xl border border-slate-200 bg-white"
                        />
                    )}

                    {!file.fileMimeType.startsWith("image/") &&
                        !file.fileMimeType.startsWith("video/") &&
                        file.fileMimeType !== "application/pdf" && (
                            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                    <FileText className="h-8 w-8" />
                                </div>
                                <h4 className="mt-4 text-base font-semibold text-slate-900">
                                    Preview is not available
                                </h4>
                                <p className="mt-2 max-w-[420px] text-sm leading-relaxed text-slate-500">
                                    This file type cannot be previewed directly in the browser.
                                    You can still download this file.
                                </p>
                            </div>
                        )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-5">
                    <div className="text-xs text-slate-400">
                        File type:{" "}
                        <span className="font-medium text-slate-600">
                            {file.fileMimeType || "Unknown"}
                        </span>
                    </div>

                    <a
                        href={file.previewUrl}
                        download={file.fileName}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                        <Download className="h-4 w-4" />
                        Download
                    </a>
                </div>
            </div>
        </div>
    )
}

function PackageStateCard({
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
            className={`flex items-center gap-3 rounded-xl px-3 py-4 ${isError ? "bg-rose-50" : "bg-slate-50"
                }`}
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400">
                <FileText className="h-5 w-5" />
            </div>
            <div>
                <p
                    className={`text-sm font-medium ${isError ? "text-rose-700" : "text-slate-600"
                        }`}
                >
                    {title}
                </p>
                <p
                    className={`text-xs leading-relaxed ${isError ? "text-rose-600" : "text-slate-400"
                        }`}
                >
                    {message}
                </p>
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

function getExpertSubmissionAvailability({
    workspaceStatus,
    projectStatus,
    latestPackage,
    isSubmitting,
    isUploading,
    hasAcceptedSubmission,
}: {
    workspaceStatus?: string | null
    projectStatus?: string | null
    latestPackage?: SubmissionPackageSummary | null
    isSubmitting: boolean
    isUploading: boolean
    hasAcceptedSubmission: boolean
}): ActionAvailability {
    if (isSubmitting || isUploading) {
        return {
            action: "PENDING_LOCKED",
            canSubmit: false,
            label: "Submission in progress",
            message: "Please wait for the current upload or submission to finish.",
        }
    }

    if (normalizeStatus(workspaceStatus) === "ARCHIVED") {
        return {
            action: "ARCHIVED_LOCKED",
            canSubmit: false,
            label: "Workspace archived",
            message: "This workspace is archived, so submissions are locked.",
        }
    }

    const normalizedProjectStatus = normalizeStatus(projectStatus)

    if (normalizedProjectStatus === "REVISION_REQUESTED") {
        return {
            action: "RESUBMIT",
            canSubmit: true,
            label: "Resubmit Package",
            message: "The client requested changes. You can resubmit the package.",
        }
    }

    if (hasAcceptedSubmission) {
        return {
            action: "UNDER_REVIEW_LOCKED",
            canSubmit: false,
            label: "Under review",
            message: "The package was accepted and is waiting for the project status to refresh.",
        }
    }

    if (
        (normalizedProjectStatus === "ACTIVE" ||
            normalizedProjectStatus === "IN_PROGRESS") &&
        !latestPackage
    ) {
        return {
            action: "INITIAL_SUBMIT",
            canSubmit: true,
            label: "Submit Package",
            message: "Upload all required deliverables to submit the first package.",
        }
    }

    if (normalizedProjectStatus === "UNDER_REVIEW") {
        return {
            action: "UNDER_REVIEW_LOCKED",
            canSubmit: false,
            label: "Under review",
            message: "This package is under client review.",
        }
    }

    if (normalizedProjectStatus === "COMPLETED") {
        return {
            action: "COMPLETED_LOCKED",
            canSubmit: false,
            label: "Project completed",
            message: "This project is completed, so submissions are locked.",
        }
    }

    if (normalizedProjectStatus === "DISPUTED") {
        return {
            action: "DISPUTED_LOCKED",
            canSubmit: false,
            label: "Project disputed",
            message: "This project is disputed, so submissions are locked.",
        }
    }

    return {
        action: "UNKNOWN_LOCKED",
        canSubmit: false,
        label: "Submission locked",
        message: latestPackage
            ? "A package already exists. Resubmission requires REVISION_REQUESTED project status."
            : "The current project status does not support submission.",
    }
}

function mapSubmissionPackage(
    item: SubmissionPackageSummary,
    files: DeliverableFileResponse[],
): SubmissionPackage {
    return {
        packageId: item.packageId,
        version: item.version,
        status: item.status,
        submittedAt: item.submittedAt ?? "",
        note: item.notes ?? "",
        files: files.filter((file) => !file.isDelete).map(mapDeliverableFile),
    }
}

function mapDeliverableFile(file: DeliverableFileResponse): SubmissionDraftFile {
    return {
        fileId: file.fileId,
        fileType: file.fileType,
        fileName: file.fileName,
        fileSize: file.fileSize,
        fileMimeType: "",
        uploadedAt: file.uploadedAt,
        previewUrl: file.fileUrl,
        downloadUrl: file.fileUrl,
        storagePath: file.fileUrl,
    }
}

function mapSubmissionFileRequest(file: SubmissionDraftFile): SubmissionFileRequest {
    return {
        fileName: file.fileName,
        fileUrl: file.previewUrl,
        fileSize: file.fileSize,
        fileType: file.fileType,
    }
}

function parseCustomReleaseDays(value: string):
    | { value: number | null }
    | { error: string } {
    const normalized = value.trim()

    if (!normalized) {
        return { value: null }
    }

    const parsed = Number(normalized)

    if (
        !Number.isFinite(parsed) ||
        !Number.isInteger(parsed) ||
        parsed <= 0
    ) {
        return {
            error: "Release day must be a positive whole number, or left empty for the backend default.",
        }
    }

    return { value: parsed }
}

function validateSubmissionFiles(files: SubmissionDraftFile[]) {
    if (files.length !== packageFileSlots.length) {
        return "Please upload all required deliverable slots before submitting."
    }

    const missingMetadata = files.some((file) => {
        return (
            !normalizeText(file.fileName) ||
            !normalizeText(file.previewUrl) ||
            !normalizeText(file.fileType) ||
            !normalizeText(file.fileSize)
        )
    })

    if (missingMetadata) {
        return "One or more uploaded files is missing required metadata."
    }

    return null
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

function normalizeStatus(value?: string | null) {
    return normalizeText(value)?.toUpperCase() ?? ""
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

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}
