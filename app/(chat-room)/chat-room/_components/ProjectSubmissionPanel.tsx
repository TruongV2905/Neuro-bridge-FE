"use client"
import { supabase } from "@/lib/supabase"
import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { resubmitSubmissionPackage } from "@/services/submission-package.service"
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

type FileReviewStatus = "PENDING" | "APPROVED" | "REJECTED"

type PackageStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUPERSEDED"

type DeliverableFile = {
    fileId: string
    fileType: FileType
    fileName: string
    fileSize: string
    fileMimeType: string
    uploadedAt: string
    previewUrl: string
    downloadUrl: string
    storagePath: string
    reviewStatus: FileReviewStatus
}

type SubmissionPackage = {
    packageId: string
    version: number
    status: PackageStatus
    submittedAt: string
    note: string
    releaseDay: number
    files: DeliverableFile[]
}

type SubmissionPackageResponse = {
    packageId: string
    workspaceId: string
    version: number
    notes: string
    submittedAt: string | null
    reviewedAt: string | null
    autoReleaseAt: string | null
    status: PackageStatus
    feedback: string | null
    isDelete: boolean
}

type DeliverableFileResponse = {
    fileId: string
    packageId: string
    fileName: string
    fileUrl: string
    fileSize: string
    fileType: FileType
    uploadedAt: string
    isDelete: boolean
    status?: FileReviewStatus
    reviewStatus?: FileReviewStatus
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

function formatDateTime(value?: string | null) {
    if (!value) return "-"

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return "-"

    return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    })
}

function getFileReviewStatusStyle(status: FileReviewStatus) {
    if (status === "APPROVED") {
        return "bg-emerald-50 text-emerald-600 border-emerald-100"
    }

    if (status === "REJECTED") {
        return "bg-rose-50 text-rose-600 border-rose-100"
    }

    return "bg-amber-50 text-amber-600 border-amber-100"
}

function getFileReviewStatusLabel(status: FileReviewStatus) {
    if (status === "APPROVED") return "Approved"
    if (status === "REJECTED") return "Rejected"

    return "Pending"
}

export function ProjectSubmissionPanel({ workspaceId }: ProjectSubmissionPanelProps) {
    const [openModal, setOpenModal] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [modalMode, setModalMode] = useState<ModalMode>("create")
    const [previewFile, setPreviewFile] = useState<DeliverableFile | null>(null)
    const [note, setNote] = useState("")
    const [releaseDay, setReleaseDay] = useState("")
    const [uploadingType, setUploadingType] = useState<FileType | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const [draftFiles, setDraftFiles] = useState<
        Partial<Record<FileType, DeliverableFile>>
    >({})

    const [latestPackage, setLatestPackage] = useState<SubmissionPackage | null>(
        null
    )

    const inputRefs = useRef<Partial<Record<FileType, HTMLInputElement | null>>>(
        {}
    )

    useEffect(() => {
        setMounted(true)
    }, [])

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

    useEffect(() => {
        if (!workspaceId) return

        let cancelled = false

        const fetchLatestPackage = async () => {
            try {
                const packages = await getSubmissionPackagesByWorkspace()

                const latestPackage = packages[0]

                if (!latestPackage) {
                    if (!cancelled) {
                        setLatestPackage(null)
                    }

                    return
                }

                const packageFiles = await getDeliverableFilesByPackage(
                    latestPackage.packageId
                )

                const mappedFiles: DeliverableFile[] = packageFiles
                    .filter((file) => !file.isDelete)
                    .map((file) => ({
                        fileId: file.fileId,
                        fileType: file.fileType,
                        fileName: file.fileName,
                        fileSize: file.fileSize,
                        fileMimeType: "",
                        uploadedAt: file.uploadedAt,
                        previewUrl: file.fileUrl,
                        downloadUrl: file.fileUrl,
                        storagePath: file.fileUrl,
                        reviewStatus: file.reviewStatus ?? file.status ?? "PENDING",
                    }))

                if (cancelled) return

                setLatestPackage({
                    packageId: latestPackage.packageId,
                    version: latestPackage.version,
                    status: latestPackage.status,
                    submittedAt: latestPackage.submittedAt ?? "",
                    note: latestPackage.notes ?? "",
                    releaseDay: 0,
                    files: mappedFiles,
                })

                setPreviewFile((currentPreviewFile) => {
                    if (!currentPreviewFile) return currentPreviewFile

                    const freshPreviewFile = mappedFiles.find(
                        (file) => file.fileId === currentPreviewFile.fileId
                    )

                    return freshPreviewFile ?? currentPreviewFile
                })
            } catch (error) {
                console.error("Load latest submission package failed:", error)
            }
        }

        fetchLatestPackage()

        const intervalId = window.setInterval(fetchLatestPackage, 3000)

        const handleFocus = () => {
            fetchLatestPackage()
        }

        window.addEventListener("focus", handleFocus)

        return () => {
            cancelled = true
            window.clearInterval(intervalId)
            window.removeEventListener("focus", handleFocus)
        }
    }, [workspaceId])

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

    const uploadFileToSupabase = async (type: FileType, file: File) => {
        const { data: { session } } = await supabase.auth.getSession()
        console.log("Session:", session)
        console.log("User:", session?.user)
        console.log("Access token:", session?.access_token?.slice(0, 20))

        const bucket = "submission-files"

        const safeFileName = file.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9.-]/g, "-")

        const filePath = `submission-packages/${type.toLowerCase()}/${crypto.randomUUID()}-${safeFileName}`

        const { data: buckets, error: bucketError } =
            await supabase.storage.listBuckets()
        console.log("Buckets from client:", buckets)
        console.log("Bucket list error:", bucketError)

        const { data: uploadData, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: true,
                contentType: file.type || "application/octet-stream",
            })

        console.log("Upload data:", uploadData)
        console.log("Upload error:", error)

        if (error) {
            alert(`${error.name}: ${error.message}`)
            throw error
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

        return {
            filePath,
            publicUrl: data.publicUrl,
        }
    }

    const handleFileChange = async (type: FileType, file?: File) => {
        if (!file) return

        try {
            setUploadingType(type)

            const { filePath, publicUrl } = await uploadFileToSupabase(type, file)

            const uploadedFile: DeliverableFile = {
                fileId: crypto.randomUUID(),
                fileType: type,
                fileName: file.name,
                fileSize: formatFileSize(file.size),
                fileMimeType: file.type,
                uploadedAt: getCurrentTime(),
                previewUrl: publicUrl,
                downloadUrl: publicUrl,
                storagePath: filePath,
                reviewStatus: "PENDING",
            }

            setDraftFiles((prev) => ({
                ...prev,
                [type]: uploadedFile,
            }))
        } catch (error) {
            console.error("Upload file failed:", error)
            alert("Upload file failed. Please try again.")
        } finally {
            setUploadingType(null)
        }
    }

    const getSubmissionPackagesByWorkspace = async () => {
        const accessToken = localStorage.getItem("accessToken")

        console.log(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/api/v1/submission-packages/workspaces/${workspaceId}`
        )
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/api/v1/submission-packages/workspaces/${workspaceId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )

        if (!response.ok) {
            throw new Error("Get submission packages failed")
        }

        return response.json() as Promise<SubmissionPackageResponse[]>
    }

    const getDeliverableFilesByPackage = async (packageId: string) => {
        const accessToken = localStorage.getItem("accessToken")

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/api/v1/deliverable-files/packages/${packageId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )

        if (!response.ok) {
            throw new Error("Get deliverable files failed")
        }

        return response.json() as Promise<DeliverableFileResponse[]>
    }

    const handleSubmitPackage = async () => {
        const files = packageFileSlots
            .map((slot) => draftFiles[slot.type])
            .filter(Boolean) as DeliverableFile[]

        if (files.length !== packageFileSlots.length) return
        if (!note.trim()) return
        if (!releaseDay.trim()) return

        try {
            setSubmitting(true)

            if (modalMode === "edit" && latestPackage) {
                const newPackage = await resubmitSubmissionPackage({
                    packageId: latestPackage.packageId,
                    notes: note.trim(),
                    files: files.map((file) => ({
                        fileName: file.fileName,
                        fileUrl: file.previewUrl,
                        fileSize: file.fileSize,
                        fileType: file.fileType,
                    })),
                })

                setLatestPackage({
                    packageId: newPackage.packageId,
                    version: newPackage.version,
                    status: newPackage.status,
                    submittedAt: newPackage.submittedAt ?? getCurrentTime(),
                    note: newPackage.notes ?? note.trim(),
                    releaseDay: Number(releaseDay),
                    files,
                })

                setOpenModal(false)
                return
            }

            const newPackage = await createSubmissionPackage(files)

            setLatestPackage({
                packageId: newPackage.packageId,
                version: newPackage.version,
                status: newPackage.status,
                submittedAt: newPackage.submittedAt ?? getCurrentTime(),
                note: newPackage.notes ?? note.trim(),
                releaseDay: Number(releaseDay),
                files,
            })

            setDraftFiles({})
            setOpenModal(false)
        } catch (error) {
            console.error(error)
            alert("Submit package failed. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }


    const createSubmissionPackage = async (files: DeliverableFile[]) => {
        const payload = {
            workspaceId,
            notes: note.trim(),
            customReleaseDays: Number(releaseDay),
            files: files.map((file) => ({
                fileName: file.fileName,
                fileUrl: file.previewUrl,
                fileSize: file.fileSize,
                fileType: file.fileType,
            })),
        }

        const accessToken = localStorage.getItem("accessToken")

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/api/v1/submission-packages`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            }
        )

        if (!response.ok) {
            throw new Error("Submit package failed")
        }

        return response.json()
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

                                                        <div className="mt-1 flex items-center gap-2">
                                                            <p className="text-[11px] text-slate-400">
                                                                {file.fileSize} · {file.uploadedAt}
                                                            </p>

                                                            <span
                                                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getFileReviewStatusStyle(
                                                                    file.reviewStatus
                                                                )}`}
                                                            >
                                                                {getFileReviewStatusLabel(file.reviewStatus)}
                                                            </span>
                                                        </div>
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
                                                {formatDateTime(latestPackage?.submittedAt)}
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

            {mounted &&
                openModal &&
                createPortal(
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-slate-950/40 px-4 py-10 backdrop-blur-sm">
                        <div className="relative z-[100000] my-auto w-full max-w-[720px] rounded-3xl bg-white p-6 shadow-xl">
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
                                            submitting ||
                                            uploadingType !== null
                                        }
                                        className="h-11 rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {submitting
                                            ? "Submitting..."
                                            : isEditMode
                                                ? "Update Package"
                                                : "Create Package"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

            {mounted &&
                previewFile &&
                createPortal(
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
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
                                            <div className="mt-1 flex items-center gap-2">
                                                <p className="text-xs text-slate-400">
                                                    {previewFile.fileSize} · {previewFile.uploadedAt}
                                                </p>

                                                <span
                                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getFileReviewStatusStyle(
                                                        previewFile.reviewStatus
                                                    )}`}
                                                >
                                                    {getFileReviewStatusLabel(previewFile.reviewStatus)}
                                                </span>
                                            </div>
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
                    </div>,
                    document.body
                )}
        </>
    )
}