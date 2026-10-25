import { Download, Eye, LoaderCircle, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProductAssetType } from "@/features/ai-place/types";
import type { ProtectedAssetSlot } from "@/features/ai-place/utils/protected-asset-presentation";

export type ProtectedAssetAction = "preview" | "download";

type AiPlaceProtectedAssetCardProps = {
  slot: ProtectedAssetSlot;
  available: boolean;
  entitlementActive: boolean;
  requestingAction?: ProtectedAssetAction;
  requestInFlight: boolean;
  errorMessage?: string;
  onPreview: (assetType: ProductAssetType) => void;
  onDownload: (assetType: ProductAssetType) => void;
};

export function AiPlaceProtectedAssetCard({
  slot,
  available,
  entitlementActive,
  requestingAction,
  requestInFlight,
  errorMessage,
  onPreview,
  onDownload,
}: AiPlaceProtectedAssetCardProps) {
  const Icon = slot.icon;
  const actionLabel = requestingAction === "preview" ? "Preparing preview…" : "Requesting access…";

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-950">{slot.label}</h3>
            <AssetAvailabilityBadge available={available} entitlementActive={entitlementActive} />
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{slot.description}</p>
          {errorMessage ? <p role="alert" className="mt-1 text-xs font-semibold leading-5 text-rose-700">{errorMessage} Try again.</p> : null}
        </div>
      </div>

      {available ? (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {slot.supportsPreview ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onPreview(slot.type)}
              disabled={requestInFlight}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-white"
            >
              {requestingAction === "preview" ? <LoaderCircle className="animate-spin" /> : <Eye />}
              {requestingAction === "preview" ? actionLabel : "Preview"}
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            onClick={() => onDownload(slot.type)}
            disabled={requestInFlight}
            className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {requestingAction === "download" ? <LoaderCircle className="animate-spin" /> : <Download />}
            {requestingAction === "download" ? actionLabel : "Download"}
          </Button>
        </div>
      ) : null}
    </article>
  );
}

function AssetAvailabilityBadge({
  available,
  entitlementActive,
}: {
  available: boolean;
  entitlementActive: boolean;
}) {
  if (available) {
    return <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">Available</span>;
  }

  if (entitlementActive) {
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">Not included</span>;
  }

  return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-100"><LockKeyhole className="h-3 w-3" /> Access expired</span>;
}
