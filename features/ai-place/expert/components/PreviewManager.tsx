"use client";

import { useId, useRef, useState } from "react";
import { ImageIcon, LoaderCircle, Trash2, Upload, Video } from "lucide-react";
import { toast } from "react-toastify";

import { ConfirmActionDialog } from "@/components/dashboard/crud/ConfirmActionDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExpertProductDetail, PreviewType } from "@/features/ai-place/types";
import { DirectStorageUploadError, uploadToAuthorizedStorage } from "@/features/ai-place/utils/direct-storage-upload";
import { getAiPlaceErrorMessage } from "@/features/ai-place/utils/error";
import { formatFileSize } from "@/features/ai-place/expert/utils/presentation";
import {
  useConfirmPreviewUpload,
  useDeletePreview,
  useRequestPreviewUploadAuthorization,
} from "@/services/ai-available-storage.service";

type UploadStage = "idle" | "authorizing" | "uploading" | "confirming" | "complete";

export function PreviewManager({
  product,
  onMetadataChanged,
}: {
  product: ExpertProductDetail;
  onMetadataChanged: () => Promise<unknown>;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const requestAuthorization = useRequestPreviewUploadAuthorization();
  const confirmUpload = useConfirmPreviewUpload();
  const deletePreview = useDeletePreview();
  const preview = product.preview;
  const editable = product.status === "DRAFT" || product.status === "UNPUBLISHED";
  const busy = stage !== "idle" && stage !== "complete";

  const handleFile = async (file?: File) => {
    if (!file || busy) return;

    const previewType = getPreviewType(file);
    if (!previewType) {
      toast.error("Choose an image or video file with a recognized media type.");
      resetInput(inputRef.current);
      return;
    }
    if (file.name.trim().length > 255) {
      toast.error("The filename must be 255 characters or fewer.");
      resetInput(inputRef.current);
      return;
    }

    try {
      setStage("authorizing");
      const authorizationResponse = await requestAuthorization.mutateAsync({
        productId: product.id,
        request: {
          previewType,
          originalFilename: file.name,
          contentType: file.type,
          byteSize: file.size,
        },
      });
      const authorization = authorizationResponse.result;
      if (!authorization) throw new Error("A secure upload authorization was not returned.");

      setStage("uploading");
      await uploadToAuthorizedStorage(authorization, file);

      setStage("confirming");
      await confirmUpload.mutateAsync({
        productId: product.id,
        request: { uploadToken: authorization.uploadToken },
      });
      setStage("complete");
      await onMetadataChanged();
      toast.success("Preview confirmed.");
    } catch (error) {
      toast.error(error instanceof DirectStorageUploadError ? error.message : getAiPlaceErrorMessage(error));
    } finally {
      resetInput(inputRef.current);
      setStage("idle");
    }
  };

  const handleDelete = async () => {
    try {
      await deletePreview.mutateAsync(product.id);
      setDeleteOpen(false);
      await onMetadataChanged();
      toast.success("Preview removed.");
    } catch (error) {
      toast.error(getAiPlaceErrorMessage(error));
    }
  };

  return (
    <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
      <CardHeader>
        <div className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-indigo-600" /><CardTitle className="text-base text-slate-900">Preview</CardTitle></div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {preview ? <PreviewMetadata preview={preview} /> : <p className="text-slate-500">No preview added.</p>}
        {!editable ? <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">Preview changes require unpublishing first.</p> : null}
        {editable ? (
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              id={inputId}
              className="sr-only"
              type="file"
              accept="image/*,video/*"
              disabled={busy}
              onChange={(event) => void handleFile(event.target.files?.[0])}
            />
            <Button asChild type="button" variant="outline" disabled={busy} className="flex-1">
              <label htmlFor={inputId} className="cursor-pointer">
                {busy ? <LoaderCircle className="animate-spin" /> : <Upload />}
                {stageLabel(stage, preview ? "Replace preview" : "Upload preview")}
              </label>
            </Button>
            {preview ? <Button type="button" variant="outline" disabled={busy || deletePreview.isPending} onClick={() => setDeleteOpen(true)}><Trash2 /> Delete</Button> : null}
          </div>
        ) : null}
      </CardContent>
      <ConfirmActionDialog
        open={deleteOpen}
        loading={deletePreview.isPending}
        variant="danger"
        title="Delete this preview?"
        description="This removes the current product preview. You can upload another preview while this product is not published."
        confirmText="Delete preview"
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
      />
    </Card>
  );
}

function PreviewMetadata({ preview }: { preview: NonNullable<ExpertProductDetail["preview"]> }) {
  const isImage = preview.type === "IMAGE";
  return (
    <div className="space-y-2">
      {preview.accessUrl ? (
        isImage ? (
          // The API supplies a short-lived private URL; Next Image cannot safely optimize an unconfigured arbitrary signed host.
          // eslint-disable-next-line @next/next/no-img-element
          <img className="max-h-48 w-full rounded-xl border border-slate-100 object-cover" src={preview.accessUrl} alt="AI product preview" />
        ) : <video className="max-h-48 w-full rounded-xl border border-slate-100" controls src={preview.accessUrl}>Your browser cannot play this preview.</video>
      ) : null}
      <div className="flex gap-2 text-slate-700">{isImage ? <ImageIcon className="mt-0.5 h-4 w-4 text-indigo-600" /> : <Video className="mt-0.5 h-4 w-4 text-indigo-600" />}<div><p className="font-medium">{preview.type} preview</p><p className="mt-1 break-all text-xs text-slate-500">{preview.originalFilename} · {preview.contentType} · {formatFileSize(preview.byteSize)}</p></div></div>
    </div>
  );
}

function getPreviewType(file: File): PreviewType | null {
  if (!file.type) return null;
  if (file.type.toLowerCase().startsWith("image/")) return "IMAGE";
  if (file.type.toLowerCase().startsWith("video/")) return "VIDEO";
  return null;
}

function stageLabel(stage: UploadStage, idleLabel: string) {
  if (stage === "authorizing") return "Authorizing…";
  if (stage === "uploading") return "Uploading…";
  if (stage === "confirming") return "Confirming…";
  return idleLabel;
}

function resetInput(input: HTMLInputElement | null) {
  if (input) input.value = "";
}
