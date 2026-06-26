"use client"

import { useMemo, useRef, useState } from "react"
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

type FileType = "SOURCE_CODE" | "DOCUMENT" | "VIDEO" | "DATASET"

type PackageStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED"

type DeliverableFile = {
    fileId: string
    fileType: FileType
    fileName: string
    fileSize: string
    fileMimeType: string
    uploadedAt: string
    previewUrl: string
}

type SubmissionPackage = {
    packageId: string
    packageName: string
    version: number
    status: PackageStatus
    submittedAt: string
    files: DeliverableFile[]
}

type PackageFileSlot = {
    type: FileType
    label: string
    description: string
    accept?: string
    icon: React.ReactNode
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

function formatFileSize(size: number) {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`

    return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function getCurrentTime() {
    return new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    })
}

export function ProjectSubmissionPanel() {
    const [openModal, setOpenModal] = useState(false)
    const [modalMode, setModalMode] = useState<ModalMode>("create")
    const [previewFile, setPreviewFile] = useState<DeliverableFile | null>(null)

    const [draftFiles, setDraftFiles] = useState<
        Partial<Record<FileType, DeliverableFile>>
    >({})

    const [latestPackage, setLatestPackage] = useState<SubmissionPackage | null>(
        null
    )

    const inputRefs = useRef<Partial<Record<FileType, HTMLInputElement | null>>>(
        {}
    )

    const uploadedCount = useMemo(() => {
        return packageFileSlots.filter((slot) => draftFiles[slot.type]).length
    }, [draftFiles])

    const latestFiles = latestPackage?.files ?? []

    const latestFileMap = useMemo(() => {
        return latestFiles.reduce<Partial<Record<FileType, DeliverableFile>>>(
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

    const revokeFileUrl = (file?: DeliverableFile) => {
        if (!file?.previewUrl) return
        URL.revokeObjectURL(file.previewUrl)
    }

    const openCreateModal = () => {
        setModalMode("create")
        setDraftFiles({})
        setOpenModal(true)
    }

    const openEditModal = () => {
        setModalMode("edit")
        setDraftFiles(latestFileMap)
        setOpenModal(true)
    }

    const handleFileChange = (type: FileType, file?: File) => {
        if (!file) return

        const uploadedFile: DeliverableFile = {
            fileId: crypto.randomUUID(),
            fileType: type,
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            fileMimeType: file.type,
            uploadedAt: getCurrentTime(),
            previewUrl: URL.createObjectURL(file),
        }

        setDraftFiles((prev) => {
            revokeFileUrl(prev[type])

            return {
                ...prev,
                [type]: uploadedFile,
            }
        })
    }

    const handleSubmitPackage = () => {
        const files = packageFileSlots
            .map((slot) => draftFiles[slot.type])
            .filter(Boolean) as DeliverableFile[]

        if (files.length !== packageFileSlots.length) return

        if (modalMode === "edit" && latestPackage) {
            latestPackage.files.forEach((oldFile) => {
                const newFile = draftFiles[oldFile.fileType]

                if (newFile?.previewUrl !== oldFile.previewUrl) {
                    revokeFileUrl(oldFile)
                }
            })

            setLatestPackage({
                ...latestPackage,
                version: latestPackage.version + 1,
                submittedAt: getCurrentTime(),
                files,
            })

            setOpenModal(false)
            return
        }

        setLatestPackage({
            packageId: crypto.randomUUID(),
            packageName: "Submission Package",
            version: latestPackage ? latestPackage.version + 1 : 1,
            status: "SUBMITTED",
            submittedAt: getCurrentTime(),
            files,
        })

        setDraftFiles({})
        setOpenModal(false)
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
                    {!latestPackage && (
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

                        {latestFiles.length === 0 ? (
                            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400">
                                    <FileText className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-slate-600">
                                        No package submitted yet
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Create a package to upload deliverables.
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
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-[720px] rounded-3xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
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
                                                    className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"
                                                >
                                                    <UploadCloud className="h-4 w-4" />
                                                    {file ? "Upload again" : "Upload file"}
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
                                    disabled={uploadedCount !== 4}
                                    className="h-11 rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isEditMode ? "Update Package" : "Create Package"}
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