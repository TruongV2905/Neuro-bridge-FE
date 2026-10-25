"use client";

import { Download, FileWarning } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatFileSize } from "@/features/ai-place/expert/utils/presentation";
import type { ProtectedDownloadAccess } from "@/features/ai-place/types";
import { getProtectedAssetPreviewKind } from "@/features/ai-place/utils/protected-asset-presentation";

type AiPlaceProtectedAssetPreviewDialogProps = {
  access: ProtectedDownloadAccess | null;
  open: boolean;
  downloadInFlight: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
};

export function AiPlaceProtectedAssetPreviewDialog({
  access,
  open,
  downloadInFlight,
  onOpenChange,
  onDownload,
}: AiPlaceProtectedAssetPreviewDialogProps) {
  const previewKind = getProtectedAssetPreviewKind(access?.contentType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden p-0 sm:max-w-4xl" showCloseButton>
        {access ? (
          <>
            <DialogHeader className="border-b border-slate-100 px-6 pt-6 pb-5 pr-14">
              <DialogTitle className="truncate text-lg font-extrabold text-slate-950">
                {access.originalFilename}
              </DialogTitle>
              <DialogDescription className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500">
                <span>{access.contentType || "Unknown file type"}</span>
                <span aria-hidden="true">·</span>
                <span>{formatFileSize(access.byteSize)}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[65vh] min-h-72 overflow-auto bg-slate-50 p-5 sm:p-6">
              <PreviewContent access={access} previewKind={previewKind} />
            </div>

            <DialogFooter className="mx-0 mb-0 rounded-none bg-white px-6 py-4 sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">
                Download requests a new temporary access link.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={onDownload}
                disabled={downloadInFlight}
                className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Download />
                {downloadInFlight ? "Requesting access…" : "Download"}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function PreviewContent({
  access,
  previewKind,
}: {
  access: ProtectedDownloadAccess;
  previewKind: ReturnType<typeof getProtectedAssetPreviewKind>;
}) {
  if (previewKind === "image") {
    return <div className="flex min-h-60 items-center justify-center"><img src={access.accessUrl} alt={access.originalFilename} className="max-h-[55vh] max-w-full rounded-2xl object-contain shadow-sm" /></div>;
  }

  if (previewKind === "video") {
    return <video controls src={access.accessUrl} className="max-h-[55vh] w-full rounded-2xl bg-black" />;
  }

  if (previewKind === "pdf") {
    return <iframe src={access.accessUrl} title={access.originalFilename} className="h-[55vh] w-full rounded-2xl border border-slate-200 bg-white" />;
  }

  return (
    <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><FileWarning className="h-7 w-7" /></span>
      <h3 className="mt-4 text-base font-extrabold text-slate-950">Preview is not available for this file type.</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">You can still request a secure download for this protected deliverable.</p>
    </div>
  );
}
