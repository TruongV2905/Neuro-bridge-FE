"use client";

import { useId, useRef, useState } from "react";
import { CheckCircle2, FileStack, LoaderCircle, LockKeyhole, Trash2, Upload } from "lucide-react";
import { toast } from "react-toastify";

import { ConfirmActionDialog } from "@/components/dashboard/crud/ConfirmActionDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExpertProductDetail, ProductAsset, ProductAssetType } from "@/features/ai-place/types";
import { DirectStorageUploadError, uploadToAuthorizedStorage } from "@/features/ai-place/utils/direct-storage-upload";
import { getAiPlaceErrorMessage } from "@/features/ai-place/utils/error";
import { formatFileSize } from "@/features/ai-place/expert/utils/presentation";
import {
  useConfirmAssetUpload,
  useDeleteAsset,
  useRequestAssetUploadAuthorization,
} from "@/services/ai-available-storage.service";

const ASSET_TYPES: ProductAssetType[] = ["SOURCE_CODE", "VIDEO", "DATASET", "DOCUMENT"];
type UploadStage = "idle" | "authorizing" | "uploading" | "confirming";

export function ProtectedAssetsManager({
  product,
  onMetadataChanged,
}: {
  product: ExpertProductDetail;
  onMetadataChanged: () => Promise<unknown>;
}) {
  const assetMap = new Map(product.assets.map((asset) => [asset.assetType, asset]));
  const permanentlyLocked = Boolean(product.firstPublishedAt);
  const editable = !permanentlyLocked && product.status === "DRAFT";

  return (
    <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
      <CardHeader><div className="flex items-center gap-2"><FileStack className="h-4 w-4 text-indigo-600" /><CardTitle className="text-base text-slate-900">Protected assets</CardTitle></div></CardHeader>
      <CardContent className="space-y-3">
        {ASSET_TYPES.map((assetType) => <ProtectedAssetSlot key={assetType} productId={product.id} assetType={assetType} asset={assetMap.get(assetType)} editable={editable} onMetadataChanged={onMetadataChanged} />)}
        {permanentlyLocked ? <p className="flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />Protected assets are permanently locked after first publication. Unpublishing does not unlock them.</p> : product.status !== "DRAFT" ? <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">Protected assets can be changed only while this product is a never-published Draft.</p> : null}
      </CardContent>
    </Card>
  );
}

function ProtectedAssetSlot({
  productId,
  assetType,
  asset,
  editable,
  onMetadataChanged,
}: {
  productId: string;
  assetType: ProductAssetType;
  asset?: ProductAsset;
  editable: boolean;
  onMetadataChanged: () => Promise<unknown>;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const requestAuthorization = useRequestAssetUploadAuthorization();
  const confirmUpload = useConfirmAssetUpload();
  const deleteAsset = useDeleteAsset();
  const busy = stage !== "idle";

  const handleFile = async (file?: File) => {
    if (!file || busy) return;
    if (!file.type) {
      toast.error("This file has no media type. Choose a file with a recognized media type.");
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
        productId,
        assetType,
        request: { originalFilename: file.name, contentType: file.type, byteSize: file.size },
      });
      const authorization = authorizationResponse.result;
      if (!authorization) throw new Error("A secure upload authorization was not returned.");

      setStage("uploading");
      await uploadToAuthorizedStorage(authorization, file);
      setStage("confirming");
      await confirmUpload.mutateAsync({ productId, assetType, request: { uploadToken: authorization.uploadToken } });
      await onMetadataChanged();
      toast.success(`${assetLabel(assetType)} confirmed.`);
    } catch (error) {
      toast.error(error instanceof DirectStorageUploadError ? error.message : getAiPlaceErrorMessage(error));
    } finally {
      resetInput(inputRef.current);
      setStage("idle");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAsset.mutateAsync({ productId, assetType });
      setDeleteOpen(false);
      await onMetadataChanged();
      toast.success(`${assetLabel(assetType)} removed.`);
    } catch (error) {
      toast.error(getAiPlaceErrorMessage(error));
    }
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <div className="flex items-center justify-between gap-3"><p className="text-xs font-bold tracking-wide text-slate-700">{assetLabel(assetType)}</p>{asset ? <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Present</span> : <span className="text-xs font-medium text-slate-500">Missing</span>}</div>
      {asset ? <p className="mt-1 break-all text-xs text-slate-500">{asset.originalFilename} · {asset.contentType} · {formatFileSize(asset.byteSize)}</p> : null}
      <p className="mt-1 text-xs font-medium text-slate-500">{editable ? "Editable" : "Locked"}</p>
      {editable ? <div className="mt-3 flex flex-wrap gap-2"><input ref={inputRef} id={inputId} className="sr-only" type="file" disabled={busy} onChange={(event) => void handleFile(event.target.files?.[0])} /><Button asChild type="button" size="sm" variant="outline" disabled={busy}><label htmlFor={inputId} className="cursor-pointer">{busy ? <LoaderCircle className="animate-spin" /> : <Upload />}{stageLabel(stage, asset ? "Replace" : "Upload")}</label></Button>{asset ? <Button type="button" size="sm" variant="outline" disabled={busy || deleteAsset.isPending} onClick={() => setDeleteOpen(true)}><Trash2 /> Delete</Button> : null}</div> : null}
      <ConfirmActionDialog open={deleteOpen} loading={deleteAsset.isPending} variant="danger" title={`Delete ${assetLabel(assetType)}?`} description="This protected asset is required before first publication. You can upload a replacement while this product remains a Draft." confirmText="Delete asset" onOpenChange={setDeleteOpen} onConfirm={handleDelete} />
    </div>
  );
}

function assetLabel(assetType: ProductAssetType) { return assetType.replaceAll("_", " "); }
function stageLabel(stage: UploadStage, idleLabel: string) { return stage === "authorizing" ? "Authorizing…" : stage === "uploading" ? "Uploading…" : stage === "confirming" ? "Confirming…" : idleLabel; }
function resetInput(input: HTMLInputElement | null) { if (input) input.value = ""; }
