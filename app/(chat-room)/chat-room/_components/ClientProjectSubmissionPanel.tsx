"use client"

import { useEffect, useMemo, useState } from "react"
import {
    CheckCircle2,
    Code2,
    Database,
    Download,
    Eye,
    FileText,
    ImageIcon,
    PackageCheck,
    Video,
    X,
    XCircle,
} from "lucide-react"

type FileType = "SOURCE_CODE" | "DOCUMENT" | "VIDEO" | "DATASET"

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED"

type ClientDeliverableFile = {
    fileId: string
    fileType: FileType
    fileName: string
    fileSize: string
    uploadedAt: string
    downloadUrl: string
    fileMimeType: string
    previewUrl: string
    status: ReviewStatus
}

type ClientSubmissionPackage = {
    packageId: string
    version: number
    submittedAt: string
    downloadUrl: string
    files: ClientDeliverableFile[]
}

type SubmissionPackageResponse = {
    packageId: string
    workspaceId: string
    version: number
    notes: string
    submittedAt: string | null
    reviewedAt: string | null
    autoReleaseAt: string | null
    status: "PENDING" | "APPROVED" | "REJECTED" | "SUPERSEDED"
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
}

type FileSlot = {
    type: FileType
    label: string
    icon: React.ReactNode
}

type ClientProjectSubmissionPanelProps = {
    workspaceId: string
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

const mockPackages: ClientSubmissionPackage[] = [
    {
        packageId: "pkg-3",
        version: 3,
        submittedAt: "Jun 23, 02:30 PM",
        downloadUrl: "#",
        files: [
            {
                fileId: "src-3",
                fileType: "SOURCE_CODE",
                fileName: "ai-chatbot-source-v3.zip",
                fileSize: "18.4 MB",
                uploadedAt: "Jun 23, 02:30 PM",
                downloadUrl: "#",
                status: "PENDING",
                fileMimeType: "application/zip",
                previewUrl: "#",
            },
            {
                fileId: "doc-3",
                fileType: "DOCUMENT",
                fileName: "technical-document-v3.pdf",
                fileSize: "2.8 MB",
                uploadedAt: "Jun 23, 02:31 PM",
                downloadUrl: "#",
                status: "PENDING",
                fileMimeType: "application/pdf",
                previewUrl: "#",
            },
            {
                fileId: "vid-3",
                fileType: "VIDEO",
                fileName: "demo-video-v3.mp4",
                fileSize: "42.1 MB",
                uploadedAt: "Jun 23, 02:32 PM",
                downloadUrl: "#",
                status: "PENDING",
                fileMimeType: "video/mp4",
                previewUrl: "#",
            },
            {
                fileId: "data-3",
                fileType: "DATASET",
                fileName: "training-dataset-v3.csv",
                fileSize: "9.7 MB",
                uploadedAt: "Jun 23, 02:33 PM",
                downloadUrl: "#",
                status: "PENDING",
                fileMimeType: "text/csv",
                previewUrl: "#",
            },
        ],
    },
    {
        packageId: "pkg-2",
        version: 2,
        submittedAt: "Jun 21, 10:15 AM",
        downloadUrl: "#",
        files: [
            {
                fileId: "src-2",
                fileType: "SOURCE_CODE",
                fileName: "ai-chatbot-source-v2.zip",
                fileSize: "16.2 MB",
                uploadedAt: "Jun 21, 10:15 AM",
                downloadUrl: "#",
                status: "APPROVED",
                fileMimeType: "application/zip",
                previewUrl: "#",
            },
            {
                fileId: "doc-2",
                fileType: "DOCUMENT",
                fileName: "technical-document-v2.pdf",
                fileSize: "2.3 MB",
                uploadedAt: "Jun 21, 10:16 AM",
                downloadUrl: "#",
                status: "APPROVED",
                fileMimeType: "application/pdf",
                previewUrl: "#",
            },
            {
                fileId: "vid-2",
                fileType: "VIDEO",
                fileName: "demo-video-v2.mp4",
                fileSize: "39.5 MB",
                uploadedAt: "Jun 21, 10:18 AM",
                downloadUrl: "#",
                status: "REJECTED",
                fileMimeType: "video/mp4",
                previewUrl: "#",
            },
            {
                fileId: "data-2",
                fileType: "DATASET",
                fileName: "training-dataset-v2.csv",
                fileSize: "8.9 MB",
                uploadedAt: "Jun 21, 10:20 AM",
                downloadUrl: "#",
                status: "APPROVED",
                fileMimeType: "text/csv",
                previewUrl: "#",
            },
        ],
    },
    {
        packageId: "pkg-1",
        version: 1,
        submittedAt: "Jun 19, 09:00 AM",
        downloadUrl: "#",
        files: [
            {
                fileId: "src-1",
                fileType: "SOURCE_CODE",
                fileName: "ai-chatbot-source-v1.zip",
                fileSize: "14.8 MB",
                uploadedAt: "Jun 19, 09:00 AM",
                downloadUrl: "#",
                status: "APPROVED",
                fileMimeType: "application/zip",
                previewUrl: "#",
            },
            {
                fileId: "doc-1",
                fileType: "DOCUMENT",
                fileName: "technical-document-v1.pdf",
                fileSize: "1.9 MB",
                uploadedAt: "Jun 19, 09:02 AM",
                downloadUrl: "#",
                status: "APPROVED",
                fileMimeType: "application/pdf",
                previewUrl: "#",
            },
            {
                fileId: "vid-1",
                fileType: "VIDEO",
                fileName: "demo-video-v1.mp4",
                fileSize: "35.2 MB",
                uploadedAt: "Jun 19, 09:04 AM",
                downloadUrl: "#",
                status: "APPROVED",
                fileMimeType: "video/mp4",
                previewUrl: "#",
            },
            {
                fileId: "data-1",
                fileType: "DATASET",
                fileName: "training-dataset-v1.csv",
                fileSize: "7.5 MB",
                uploadedAt: "Jun 19, 09:05 AM",
                downloadUrl: "#",
                status: "APPROVED",
                fileMimeType: "text/csv",
                previewUrl: "#",
            },
        ],
    },
]



function getStatusClass(status: ReviewStatus) {
    if (status === "APPROVED") {
        return "bg-emerald-50 text-emerald-600"
    }

    if (status === "REJECTED") {
        return "bg-rose-50 text-rose-600"
    }

    return "bg-amber-50 text-amber-600"
}

export function ClientProjectSubmissionPanel({
    workspaceId,
}: ClientProjectSubmissionPanelProps) {
    const [packages, setPackages] = useState<ClientSubmissionPackage[]>([])

    const [openHistoryModal, setOpenHistoryModal] = useState(false)

    const [selectedHistoryPackageId, setSelectedHistoryPackageId] = useState("")

    const getSubmissionPackagesByWorkspace = async () => {
        const accessToken = localStorage.getItem("accessToken")

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

    function getMimeTypeFromFileName(fileName: string) {
        const lowerName = fileName.toLowerCase()

        if (lowerName.endsWith(".pdf")) return "application/pdf"
        if (lowerName.endsWith(".png")) return "image/png"
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) return "image/jpeg"
        if (lowerName.endsWith(".webp")) return "image/webp"
        if (lowerName.endsWith(".mp4")) return "video/mp4"
        if (lowerName.endsWith(".txt")) return "text/plain"
        if (lowerName.endsWith(".csv")) return "text/csv"

        return "application/octet-stream"
    }

    useEffect(() => {
        if (!workspaceId) return

        const fetchPackagesWithFiles = async () => {
            try {
                const packageResponses = await getSubmissionPackagesByWorkspace()

                const sortedPackages = [...packageResponses].sort(
                    (a, b) => b.version - a.version
                )
                console.log("Packages by workspace:", sortedPackages)

                const packagesWithFiles = await Promise.all(
                    sortedPackages.map(async (item) => {
                        const fileResponses = await getDeliverableFilesByPackage(item.packageId)
                        console.log("Files of package", item.version, item.packageId, fileResponses)

                        const files: ClientDeliverableFile[] = fileResponses
                            .filter((file) => !file.isDelete)
                            .map((file) => ({
                                fileId: file.fileId,
                                fileType: file.fileType,
                                fileName: file.fileName,
                                fileSize: file.fileSize,
                                uploadedAt: file.uploadedAt,
                                downloadUrl: file.fileUrl,
                                previewUrl: file.fileUrl,
                                fileMimeType: getMimeTypeFromFileName(file.fileName),
                                status:
                                    item.status === "APPROVED" || item.status === "REJECTED"
                                        ? item.status
                                        : "PENDING",
                            }))

                        return {
                            packageId: item.packageId,
                            version: item.version,
                            submittedAt: item.submittedAt ?? "",
                            downloadUrl: "#",
                            files,
                        }
                    })
                )

                setPackages(packagesWithFiles)
                setSelectedHistoryPackageId(packagesWithFiles[0]?.packageId ?? "")
            } catch (error) {
                console.error("Load client submission packages failed:", error)
            }
        }

        fetchPackagesWithFiles()
    }, [workspaceId])

    const [previewFile, setPreviewFile] =
        useState<ClientDeliverableFile | null>(null)

    const latestPackage = useMemo(() => {
        return packages[0]
    }, [packages])

    const selectedHistoryPackage = useMemo(() => {
        return packages.find((item) => item.packageId === selectedHistoryPackageId)
    }, [packages, selectedHistoryPackageId])

    const handleOpenHistory = () => {
        setSelectedHistoryPackageId(latestPackage?.packageId ?? "")
        setOpenHistoryModal(true)
    }

    const handleReviewFile = async (
        packageId: string,
        fileId: string,
        status: ReviewStatus
    ) => {
        try {
            await reviewDeliverableFile(fileId, status)

            setPackages((currentPackages) =>
                currentPackages.map((item) => {
                    if (item.packageId !== packageId) return item

                    return {
                        ...item,
                        files: item.files.map((file) =>
                            file.fileId === fileId
                                ? {
                                    ...file,
                                    status,
                                }
                                : file
                        ),
                    }
                })
            )
        } catch (error) {
            console.error("Review file failed:", error)
            alert("Review file failed. Please try again.")
        }
    }

    const reviewDeliverableFile = async (
        fileId: string,
        newStatus: ReviewStatus
    ) => {
        const accessToken = localStorage.getItem("accessToken")

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/api/v1/deliverable-files/review`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    fileId,
                    newStatus,
                    feedback:
                        newStatus === "APPROVED"
                            ? "Approved by client"
                            : "Rejected by client",
                }),
            }
        )

        if (!response.ok) {
            throw new Error("Review deliverable file failed")
        }

        return response.json()
    }

    const renderFileCard = (
        file: ClientDeliverableFile,
        slot: FileSlot,
        packageId: string,
        canReview: boolean
    ) => {
        return (
            <div
                key={file.fileId}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition-colors duration-150 hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5"
            >
                <div className="flex items-start gap-3">
                    <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)]"
                        title="Preview file"
                    >
                        {slot.icon}
                    </button>

                    <div className="min-w-0 flex-1">
                        <button
                            type="button"
                            onClick={() => setPreviewFile(file)}
                            className="w-full text-left"
                        >
                            <div className="flex items-start justify-between gap-2">
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

                                <span
                                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(
                                        file.status
                                    )}`}
                                >
                                    {file.status}
                                </span>
                            </div>
                        </button>

                        {canReview && file.status === "PENDING" ? (
                            <div className="mt-3 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleReviewFile(packageId, file.fileId, "APPROVED")}
                                    className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-sm"
                                >
                                    <CheckCircle2 className="h-4 w-4" />

                                    <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
                                        Approve
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleReviewFile(packageId, file.fileId, "REJECTED")}
                                    className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-100 bg-white text-rose-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm"
                                >
                                    <XCircle className="h-4 w-4" />

                                    <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
                                        Reject
                                    </span>
                                </button>

                                <a
                                    href={file.downloadUrl}
                                    download
                                    onClick={(event) => event.stopPropagation()}
                                    title="Download"
                                    className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] hover:shadow-sm"
                                >
                                    <Download className="h-4 w-4" />

                                    <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
                                        Download
                                    </span>
                                </a>





                            </div>
                        ) : (
                            <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2">
                                <p className="text-xs font-medium text-slate-500">
                                    Review completed
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setPreviewFile(file)}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]"
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    Preview
                                </button>

                                <a
                                    href={file.downloadUrl}
                                    download
                                    title="Download" /* Hiện tên nút khi hover */
                                    onClick={(event) => event.stopPropagation()}
                                    className="inline-flex items-center justify-center rounded p-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-[var(--primary)]"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span className="sr-only">Download</span> {/* Giữ lại cho người khiếm thị đọc máy */}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <aside className="hidden h-full w-[410px] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/70 bg-white p-6 shadow-sm xl:flex">
                <div className="shrink-0 border-b border-slate-100 pb-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Project Submission
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        Review the latest files submitted by the expert.
                    </p>
                </div>

                <div className="mt-5 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-100 bg-white p-4">
                        <div className="mb-4 shrink-0">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800">
                                        Package Files
                                    </h3>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Latest submitted files.
                                    </p>
                                </div>

                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                                    {latestPackage?.files.length ?? 0}/4 files
                                </span>
                            </div>
                        </div>

                        {!latestPackage ? (
                            <div className="flex flex-1 items-center justify-center rounded-xl bg-slate-50 p-4 text-center">
                                <p className="text-sm text-slate-500">
                                    No package submitted yet.
                                </p>
                            </div>
                        ) : (
                            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                                <div className="flex flex-col gap-3 pb-2">
                                    {fileSlots.map((slot) => {
                                        const file = latestPackage.files.find(
                                            (item) => item.fileType === slot.type
                                        )

                                        if (!file) return null

                                        return renderFileCard(
                                            file,
                                            slot,
                                            latestPackage.packageId,
                                            true
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {packages.length > 0 && (
                        <button
                            type="button"
                            onClick={handleOpenHistory}
                            className="h-11 shrink-0 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"
                        >
                            View history
                        </button>
                    )}
                </div>
            </aside>

            {openHistoryModal && (
                <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
                    <div className="flex max-h-[88vh] w-full max-w-[780px] flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900">
                                    Package History
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Choose a version to view its submitted files.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpenHistoryModal(false)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden p-6">
                            <div className="w-[170px] shrink-0 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Versions
                                </p>

                                <div className="flex flex-col gap-2">
                                    {packages.map((item) => {
                                        const isSelected =
                                            item.packageId === selectedHistoryPackageId

                                        return (
                                            <button
                                                key={item.packageId}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedHistoryPackageId(item.packageId)
                                                }
                                                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left transition ${isSelected
                                                    ? "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]"
                                                    : "border-slate-100 bg-white text-slate-600 hover:border-[var(--primary)]/30"
                                                    }`}
                                            >
                                                <span className="text-sm font-semibold">
                                                    v{item.version}
                                                </span>
                                                <PackageCheck className="h-4 w-4" />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-white p-4">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800">
                                            {selectedHistoryPackage
                                                ? `Version ${selectedHistoryPackage.version} files`
                                                : "Version files"}
                                        </h4>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            {selectedHistoryPackage?.submittedAt ??
                                                "Select a version to view files."}
                                        </p>
                                    </div>

                                </div>

                                {!selectedHistoryPackage ? (
                                    <div className="flex min-h-[260px] items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
                                        No version selected.
                                    </div>
                                ) : (
                                    <div className="max-h-[460px] overflow-y-auto pr-1">
                                        <div className="flex flex-col gap-3">
                                            {fileSlots.map((slot) => {
                                                const file =
                                                    selectedHistoryPackage.files.find(
                                                        (item) => item.fileType === slot.type
                                                    )

                                                if (!file) return null

                                                return renderFileCard(
                                                    file,
                                                    slot,
                                                    selectedHistoryPackage.packageId,
                                                    false
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {previewFile && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/35 px-4">
                    <div className="flex max-h-[88vh] w-full max-w-[820px] flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
                            <div className="flex min-w-0 items-center gap-3">
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

                            <button
                                type="button"
                                onClick={() => setPreviewFile(null)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors duration-150 hover:bg-slate-200"
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
                                            This file type cannot be previewed directly in
                                            the browser. You can still download this file.
                                        </p>
                                    </div>
                                )}
                        </div>

                        <div className="border-t border-slate-100 p-5">
                            <div className="text-xs text-slate-400">
                                File type:{" "}
                                <span className="font-medium text-slate-600">
                                    {previewFile.fileMimeType || "Unknown"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}