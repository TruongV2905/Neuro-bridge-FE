import { Download, FileText, ImageIcon, Video, X } from "lucide-react";

import { joinDisplayParts, normalizeText } from "../../utils/submission-display";

export type PreviewableSubmissionFile = {
  fileName?: string | null;
  fileUrl?: string | null;
  fileSize?: string | null;
  fileType?: string | null;
  fileMimeType?: string | null;
  uploadedAt?: string | null;
};

export function SubmissionFilePreviewModal({
  file,
  onClose,
}: {
  file: PreviewableSubmissionFile;
  onClose: () => void;
}) {
  const fileKind = getPreviewFileKind(file);
  const fileName = normalizeText(file.fileName) ?? "Submitted file";
  const fileUrl = normalizeText(file.fileUrl);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[820px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
          <div className="flex min-w-0 items-center gap-2">
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
                {fileName}
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
            aria-label="Close file preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-6">
          {fileUrl && fileKind === "image" && (
            <div className="flex justify-center">
              <img
                src={fileUrl}
                alt={fileName}
                loading="lazy"
                className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-sm"
              />
            </div>
          )}

          {fileUrl && fileKind === "video" && (
            <video
              src={fileUrl}
              controls
              className="max-h-[60vh] w-full rounded-2xl bg-black"
            />
          )}

          {fileUrl && fileKind === "pdf" && (
            <iframe
              src={fileUrl}
              title={fileName}
              className="h-[60vh] w-full rounded-2xl border border-slate-200 bg-white"
            />
          )}

          {(!fileUrl ||
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
                This file type cannot be previewed directly in the browser. You
                can still download this file when a link is available.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-5">
          <div className="text-xs text-slate-400">
            File type:{" "}
            <span className="font-medium text-slate-600">
              {normalizeText(file.fileMimeType) ??
                normalizeText(file.fileType) ??
                "Unknown"}
            </span>
          </div>

          {fileUrl && (
            <a
              href={fileUrl}
              download={fileName}
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
  );
}

function getPreviewFileKind(file: PreviewableSubmissionFile) {
  const mimeType = normalizeText(file.fileMimeType)?.toLowerCase() ?? "";
  const source = `${file.fileName ?? ""} ${file.fileUrl ?? ""}`.toLowerCase();

  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf") return "pdf";
  if (/\.(png|jpe?g|gif|webp|bmp|svg)(\s|\?|#|$)/.test(source)) {
    return "image";
  }
  if (/\.(mp4|webm|ogg|mov)(\s|\?|#|$)/.test(source)) return "video";
  if (/\.pdf(\s|\?|#|$)/.test(source)) return "pdf";

  return "other";
}
