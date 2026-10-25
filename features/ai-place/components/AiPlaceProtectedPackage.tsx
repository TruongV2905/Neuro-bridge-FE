"use client";

import { useState } from "react";
import { LockKeyhole, PackageCheck } from "lucide-react";
import { toast } from "react-toastify";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AiPlaceProtectedAssetCard, type ProtectedAssetAction } from "@/features/ai-place/components/AiPlaceProtectedAssetCard";
import { AiPlaceProtectedAssetPreviewDialog } from "@/features/ai-place/components/AiPlaceProtectedAssetPreviewDialog";
import type { ProductAssetType, ProtectedDownloadAccess, PurchaseDetail } from "@/features/ai-place/types";
import { PROTECTED_ASSET_SLOTS, isTemporaryHttpUrl } from "@/features/ai-place/utils/protected-asset-presentation";
import { getAiPlaceErrorMessage } from "@/features/ai-place/utils/error";
import { useProtectedDownloadAccess } from "@/services/ai-available-purchase.service";

type RequestedAction = {
  assetType: ProductAssetType;
  action: ProtectedAssetAction;
};

type AssetRequestError = {
  assetType: ProductAssetType;
  message: string;
};

export function AiPlaceProtectedPackage({ purchase }: { purchase: PurchaseDetail }) {
  const accessMutation = useProtectedDownloadAccess();
  const [requestedAction, setRequestedAction] = useState<RequestedAction | null>(null);
  const [previewAccess, setPreviewAccess] = useState<ProtectedDownloadAccess | null>(null);
  const [accessError, setAccessError] = useState<AssetRequestError | null>(null);
  const entitlementActive = purchase.entitlementStatus === "ACTIVE" && purchase.canDownload;

  const requestAccess = (assetType: ProductAssetType, action: ProtectedAssetAction) => {
    if (!entitlementActive || !purchase.availableAssetTypes.includes(assetType)) {
      return;
    }

    setAccessError(null);
    setRequestedAction({ assetType, action });
    accessMutation.mutate(
      { purchaseId: purchase.purchaseId, productId: purchase.productId, assetType },
      {
        onSuccess: (response) => {
          const access = response.result;

          if (!isTemporaryHttpUrl(access.accessUrl)) {
            const message = "The secure access link is invalid.";
            setAccessError({ assetType, message });
            toast.error(`${message} Please retry.`);
            return;
          }

          if (action === "preview") {
            setPreviewAccess(access);
            return;
          }

          openTemporaryDownload(access);
          toast.success("Secure file access is opening.");
        },
        onError: (error) => {
          const message = getAiPlaceErrorMessage(error);
          setAccessError({ assetType, message });
          toast.error(message);
        },
        onSettled: () => setRequestedAction(null),
      },
    );
  };

  return (
    <>
      <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-200/60">
        <CardHeader className="flex flex-row items-start justify-between gap-4 px-6 pt-6">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-extrabold text-slate-950"><PackageCheck className="h-5 w-5 text-indigo-600" /> Protected deliverables</CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {entitlementActive
                ? "Request a temporary access link only when you preview or download a deliverable."
                : "This purchase remains in your history, but protected-file access has expired."}
            </p>
          </div>
          <span className={entitlementActive ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100" : "inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-100"}>
            {!entitlementActive ? <LockKeyhole className="h-3.5 w-3.5" /> : null}
            {entitlementActive ? "Active" : "Expired"}
          </span>
        </CardHeader>
        <CardContent className="space-y-3 px-6 pb-6">
          {PROTECTED_ASSET_SLOTS.map((slot) => (
            <AiPlaceProtectedAssetCard
              key={slot.type}
              slot={slot}
              available={entitlementActive && purchase.availableAssetTypes.includes(slot.type)}
              entitlementActive={entitlementActive}
              requestInFlight={accessMutation.isPending}
              requestingAction={requestedAction?.assetType === slot.type ? requestedAction.action : undefined}
              errorMessage={accessError?.assetType === slot.type ? accessError.message : undefined}
              onPreview={(assetType) => requestAccess(assetType, "preview")}
              onDownload={(assetType) => requestAccess(assetType, "download")}
            />
          ))}
        </CardContent>
      </Card>

      <AiPlaceProtectedAssetPreviewDialog
        access={previewAccess}
        open={Boolean(previewAccess)}
        downloadInFlight={accessMutation.isPending && requestedAction?.action === "download"}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewAccess(null);
          }
        }}
        onDownload={() => {
          if (previewAccess) {
            requestAccess(previewAccess.assetType, "download");
          }
        }}
      />
    </>
  );
}

function openTemporaryDownload(access: ProtectedDownloadAccess) {
  const temporaryLink = document.createElement("a");
  temporaryLink.href = access.accessUrl;
  temporaryLink.download = access.originalFilename;
  temporaryLink.target = "_blank";
  temporaryLink.rel = "noopener noreferrer";
  temporaryLink.style.display = "none";
  document.body.appendChild(temporaryLink);
  temporaryLink.click();
  temporaryLink.remove();
}
