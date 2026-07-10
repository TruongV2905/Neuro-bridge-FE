"use client"
import { useMemo, useRef, useState } from "react"
import {
    useCreateSubmissionPackage,
    useDeliverableFilesByPackage,
    useResubmitSubmissionPackage,
    useSubmissionPackagesByWorkspace,
} from "@/services/submission-package.service"
import { useSubmissionFileUpload } from "../hooks/useSubmissionFileUpload"
import { getSubmissionUploadErrorMessage } from "../utils/submission-upload-error"
import type {
    DeliverableFile as DeliverableFileResponse,
    SubmissionDraftFile,
    SubmissionFileRequest,
    SubmissionFileType,
    SubmissionPackageSummary,
} from "@/types/submission-package.type"
import {
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

type FileType = SubmissionFileType

type SubmissionPackage = {
    packageId: string
    version: number
    status: string
    submittedAt: string
    note: string
    releaseDay: number
    files: SubmissionDraftFile[]
}

type PackageFileSlot = {
    type: FileType
    label: string
    description: string
    accept?: string
    icon: React.ReactNode
}

type ProjectSubmissionPanelProps = {
    workspaceId: string
}


type ModalMode = "create" | "edit"

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

function getLatestSubmissionPackage(packages: SubmissionPackageSummary[]) {
    return packages[0] ?? null
}

function mapSubmissionPackage(
    item: SubmissionPackageSummary,
    files: DeliverableFileResponse[]
): SubmissionPackage {
    return {
        packageId: item.packageId,
        version: item.version,
        status: item.status,
        submittedAt: item.submittedAt ?? "",
        note: item.notes ?? "",
        releaseDay: 0,
        files: files
            .filter((file) => !file.isDelete)
            .map(mapDeliverableFile),
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

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

export function ProjectSubmissionPanel({ workspaceId }: ProjectSubmissionPanelProps) {
    const [openModal, setOpenModal] = useState(false)
    const [modalMode, setModalMode] = useState<ModalMode>("create")
    const [previewFile, setPreviewFile] = useState<SubmissionDraftFile | null>(null)
    const [note, setNote] = useState("")
    const [releaseDay, setReleaseDay] = useState("")
    const {
        uploadSubmissionFile,
        uploadingType,
        isUploading,
    } = useSubmissionFileUpload()

    const [draftFiles, setDraftFiles] = useState<
        Partial<Record<FileType, SubmissionDraftFile>>
    >({})

    const normalizedWorkspaceId = workspaceId.trim()
    const packageListQuery =
        useSubmissionPackagesByWorkspace(normalizedWorkspaceId)
    const createSubmissionMutation = useCreateSubmissionPackage()
    const resubmitSubmissionMutation = useResubmitSubmissionPackage()
    const latestPackageSummary = useMemo(() => {
        return getLatestSubmissionPackage(packageListQuery.data ?? [])
    }, [packageListQuery.data])
    const latestPackageId = latestPackageSummary?.packageId ?? ""
    const packageFilesQuery = useDeliverableFilesByPackage(latestPackageId)

    const inputRefs = useRef<Partial<Record<FileType, HTMLInputElement | null>>>(
        {}
    )

    const serverLatestPackage = useMemo(() => {
        if (!latestPackageSummary) return null

        return mapSubmissionPackage(
            latestPackageSummary,
            packageFilesQuery.data ?? []
        )
    }, [latestPackageSummary, packageFilesQuery.data])

    const latestPackage = serverLatestPackage
    const isPackageReadLoading =
        packageListQuery.isLoading ||
        (Boolean(latestPackageSummary) && packageFilesQuery.isLoading)
    const isPackageReadError =
        packageListQuery.isError || packageFilesQuery.isError
    const packageReadError =
        packageListQuery.error ?? packageFilesQuery.error
    const isSubmitting =
        createSubmissionMutation.isPending || resubmitSubmissionMutation.isPending

    const uploadedCount = useMemo(() => {
        return packageFileSlots.filter((slot) => draftFiles[slot.type]).length
    }, [draftFiles])

    const latestFiles = useMemo(() => {
        return latestPackage?.files ?? []
    }, [latestPackage])

    const latestFileMap = useMemo(() => {
        return latestFiles.reduce<Partial<Record<FileType, SubmissionDraftFile>>>(
            (acc, file) => {
                acc[file.fileType] = file
                return acc
            },
            {}
        )
    }, [latestFiles])

    const handleChooseFile = (type: FileType) => {
        inputRefs.current[type]?.click()
    }

    const openCreateModal = () => {
        setModalMode("create")
        setDraftFiles({})
        setNote("")
        setReleaseDay("")
        setOpenModal(true)
    }

    const openEditModal = () => {
        setModalMode("edit")
        setDraftFiles(latestFileMap)
        setNote(latestPackage?.note ?? "")
        setReleaseDay(latestPackage?.releaseDay ? String(latestPackage.releaseDay) : "")
        setOpenModal(true)
    }

    const handleFileChange = async (type: FileType, file?: File) => {
        if (!file) return

        try {
            const uploadedFile = await uploadSubmissionFile(type, file)

            setDraftFiles((prev) => ({
                ...prev,
                [type]: uploadedFile,
            }))
        } catch (error) {
            alert(getSubmissionUploadErrorMessage(error))
        }
    }

    const handleSubmitPackage = async () => {
        if (isSubmitting) return

        const files = packageFileSlots
            .map((slot) => draftFiles[slot.type])
            .filter(Boolean) as SubmissionDraftFile[]

        if (files.length !== packageFileSlots.length) return
        if (!normalizedWorkspaceId) return
        if (!note.trim()) return
        if (!releaseDay.trim()) return

        try {
            if (modalMode === "edit" && latestPackage) {
                const currentPackageId = latestPackage.packageId.trim()

                if (!currentPackageId) return

                await resubmitSubmissionMutation.mutateAsync({
                    packageId: currentPackageId,
                    workspaceId: normalizedWorkspaceId,
                    request: {
                        currentPackageId,
                        notes: note.trim(),
                        updatedFiles: files.map(mapSubmissionFileRequest),
                    },
                })

                setOpenModal(false)
                return
            }

            await createSubmissionMutation.mutateAsync({
                request: {
                    workspaceId: normalizedWorkspaceId,
                    notes: note.trim(),
                    customReleaseDays: Number(releaseDay),
                    files: files.map(mapSubmissionFileRequest),
                },
            })

            setDraftFiles({})
            setOpenModal(false)
        } catch (error) {
            console.error("Submit package failed:", getRequestErrorMessage(error))
            alert(getRequestErrorMessage(error))
        }
    }

    const isEditMode = modalMode === "edit"

    return (
        <>
            <aside className="hidden h-full w-[390px] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/95 p-6 shadow-md backdrop-blur-sm xl:flex">
                <div className="border-b border-slate-100 pb-5">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Project Submission
                        </h2>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">
                            Create a package and upload final deliverables.
                        </p>
                    </div>
                </div>

                <div className="mt-5 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                    {!isPackageReadLoading && !isPackageReadError && !latestPackage && (
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center transition hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                <PackagePlus className="h-7 w-7" />
                            </div>

                            <p className="mt-4 text-sm font-semibold text-slate-800">
                                Create submission package
                            </p>
                            <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-slate-500">
                                Add source code, document, video, and dataset before
                                submitting.
                            </p>
                        </button>
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
                                        className="rounded-full bg-[var(--primary)] px-3 py-1 text-[10px] font-semibold text-white transition hover:opacity-90"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>

                        {isPackageReadLoading ? (
                            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400">
                                    <FileText className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-slate-600">
                                        Loading submitted packages...
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Checking the latest package for this workspace.
                                    </p>
                                </div>
                            </div>
                        ) : isPackageReadError ? (
                            <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-4">
                                <p className="text-sm font-medium text-rose-700">
                                    Unable to load submitted packages
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-rose-600">
                                    {getRequestErrorMessage(packageReadError)}
                                </p>
                            </div>
                        ) : latestFiles.length === 0 ? (
                            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400">
                                    <FileText className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-slate-600">
                                        {latestPackage
                                            ? "No files in this package"
                                            : "No package submitted yet"}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {latestPackage
                                            ? "This package does not contain deliverable files."
                                            : "Create a package to upload deliverables."}
                                    </p>
                                </div>
                            </div>
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
                                                            {file.fileSize} · {file.uploadedAt}
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
                                                Submission completed
                                            </p>
                                            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                                                All 4 deliverables have been uploaded and are ready for client review.
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
                                        className="mt-4 h-10 w-full rounded-xl bg-[var(--primary)] text-sm font-semibold text-white transition hover:opacity-90"
                                    >
                                        Update uploaded files
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {openModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/40 px-4 py-10 backdrop-blur-sm">
                    <div className="my-auto w-full max-w-[720px] rounded-3xl bg-white p-6 shadow-xl">
                        <div className="border-b border-slate-100 pb-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900">
                                        {isEditMode
                                            ? "Update Submission Package"
                                            : "Create Submission Package"}
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {isEditMode
                                            ? "Replace any uploaded deliverable before updating the package."
                                            : "Upload all 4 required deliverables before creating the package."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setOpenModal(false)}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
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
                                        onChange={(event) => setNote(event.target.value)}
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
                                        value={releaseDay}
                                        onChange={(event) => setReleaseDay(event.target.value)}
                                        placeholder="Days"
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--primary)] focus:bg-white"
                                    />
                                </div>
                            </div>
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
                                                {file ? (
                                                    <CheckCircle2 className="h-5 w-5" />
                                                ) : (
                                                    slot.icon
                                                )}
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
                                                    onClick={() => handleChooseFile(slot.type)}
                                                    disabled={uploadingType === slot.type}
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
                                                handleFileChange(slot.type, event.target.files?.[0])
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
                                    onClick={() => setOpenModal(false)}
                                    className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSubmitPackage}
                                    disabled={
                                        uploadedCount !== 4 ||
                                        !note.trim() ||
                                        !releaseDay.trim() ||
                                        isSubmitting ||
                                        isUploading
                                    }
                                    className="h-11 rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting
                                        ? "Submitting..."
                                        : isEditMode
                                            ? "Update Package"
                                            : "Create Package"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {previewFile && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
                    <div className="flex max-h-[88vh] w-full max-w-[820px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                        {previewFile.fileMimeType.startsWith("image/") ? (
                                            <ImageIcon className="h-5 w-5" />
                                        ) : previewFile.fileMimeType.startsWith("video/") ? (
                                            <Video className="h-5 w-5" />
                                        ) : (
                                            <FileText className="h-5 w-5" />
                                        )}
                                    </span>

                                    <div className="min-w-0">
                                        <h3 className="truncate text-lg font-semibold text-slate-900">
                                            {previewFile.fileName}
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            {previewFile.fileSize} · {previewFile.uploadedAt}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setPreviewFile(null)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-6">
                            {previewFile.fileMimeType.startsWith("image/") && (
                                <div className="flex justify-center">
                                    <img
                                        src={previewFile.previewUrl}
                                        alt={previewFile.fileName}
                                        loading="lazy"
                                        className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-sm"
                                    />
                                </div>
                            )}

                            {previewFile.fileMimeType.startsWith("video/") && (
                                <video
                                    src={previewFile.previewUrl}
                                    controls
                                    className="max-h-[60vh] w-full rounded-2xl bg-black"
                                />
                            )}

                            {previewFile.fileMimeType === "application/pdf" && (
                                <iframe
                                    src={previewFile.previewUrl}
                                    title={previewFile.fileName}
                                    className="h-[60vh] w-full rounded-2xl border border-slate-200 bg-white"
                                />
                            )}

                            {!previewFile.fileMimeType.startsWith("image/") &&
                                !previewFile.fileMimeType.startsWith("video/") &&
                                previewFile.fileMimeType !== "application/pdf" && (
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
                                    {previewFile.fileMimeType || "Unknown"}
                                </span>
                            </div>

                            <a
                                href={previewFile.previewUrl}
                                download={previewFile.fileName}
                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
