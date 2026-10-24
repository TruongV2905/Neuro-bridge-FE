"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, CircleUserRound, CreditCard, ReceiptText, RefreshCw, Sparkles, WalletCards } from "lucide-react";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MarketplacePreview, PreviewKindLabel } from "@/features/ai-place/components/MarketplacePreview";
import { AI_PLACE_ROUTES } from "@/features/ai-place/constants/routes";
import type { MarketplaceProductDetail, PurchaseSettlement } from "@/features/ai-place/types";
import { formatDate, formatVnd } from "@/features/ai-place/expert/utils/presentation";
import { extractAiPlaceError, getAiPlaceErrorMessage } from "@/features/ai-place/utils/error";
import { useMarketplaceProduct } from "@/services/ai-available-product.service";
import { useAiPlacePurchaseDetail, useAiPlacePurchaseForProduct, useBuyAiProduct, useRetryAiProductPurchasePayment } from "@/services/ai-available-purchase.service";

type PendingPurchaseState = {
  purchaseId: string;
  message: string;
  retryAllowed: boolean;
};

export function AiPlaceProductDetailFoundation({ productId }: { productId: string }) {
  const productQuery = useMarketplaceProduct(productId);
  const ownershipQuery = useAiPlacePurchaseForProduct(productId);
  const buyMutation = useBuyAiProduct();
  const retryMutation = useRetryAiProductPurchasePayment();
  const [pendingPurchase, setPendingPurchase] = useState<PendingPurchaseState>();
  const [knownPurchaseId, setKnownPurchaseId] = useState("");
  const recoveredPurchaseQuery = useAiPlacePurchaseDetail(knownPurchaseId);
  const product = productQuery.data?.result;
  // A null successful-history lookup is the normal, explicit "not owned"
  // result. It is intentionally distinct from an unavailable/error query.
  const ownedPurchase = recoveredPurchaseQuery.data?.result ?? ownershipQuery.data ?? null;
  const successfulOutcome = buyMutation.data?.result ?? retryMutation.data?.result;

  const buyProduct = () => {
    buyMutation.mutate(productId, {
      onSuccess: (response) => {
        setPendingPurchase(undefined);
        setKnownPurchaseId(response.result.purchaseId);
        toast.success("Payment succeeded. This AI product is now owned by you.");
      },
      onError: (error) => {
        const pending = getPendingPurchaseFromError(error);
        const ownedPurchaseId = getPurchaseIdFromError(error, "PURCHASE_ALREADY_OWNED");

        if (pending) setPendingPurchase(pending);
        if (ownedPurchaseId) setKnownPurchaseId(ownedPurchaseId);
        toast.error(getAiPlaceErrorMessage(error));
      },
    });
  };

  const retryPayment = () => {
    if (!pendingPurchase) return;

    retryMutation.mutate(pendingPurchase.purchaseId, {
      onSuccess: (response) => {
        setPendingPurchase(undefined);
        setKnownPurchaseId(response.result.purchaseId);
        toast.success("Payment succeeded. This AI product is now owned by you.");
      },
      onError: (error) => {
        const nextPending = getPendingPurchaseFromError(error);
        const ownedPurchaseId = getPurchaseIdFromError(error, "PURCHASE_ALREADY_OWNED");

        if (nextPending) setPendingPurchase(nextPending);
        if (ownedPurchaseId) setKnownPurchaseId(ownedPurchaseId);
        toast.error(getAiPlaceErrorMessage(error));
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 text-slate-950 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <Button asChild variant="ghost" className="w-fit px-0 text-indigo-700 hover:bg-transparent hover:text-indigo-900"><Link href={AI_PLACE_ROUTES.marketplace}><ArrowLeft /> Back to AI Place</Link></Button>
        {productQuery.isLoading ? <DetailLoading /> : null}
        {!productQuery.isLoading && (productQuery.isError || !product) ? <DetailError message={productQuery.isError ? getAiPlaceErrorMessage(productQuery.error) : "This AI product could not be found."} onRetry={() => void productQuery.refetch()} /> : null}
        {product ? <ProductDetail product={product} ownedPurchase={ownedPurchase} successfulOutcome={successfulOutcome} pendingPurchase={pendingPurchase} isCheckingOwnership={ownershipQuery.isLoading || recoveredPurchaseQuery.isLoading} ownershipError={ownershipQuery.isError || recoveredPurchaseQuery.isError ? getAiPlaceErrorMessage(ownershipQuery.error ?? recoveredPurchaseQuery.error) : undefined} buyPending={buyMutation.isPending} retryPending={retryMutation.isPending} onBuy={buyProduct} onRetryPayment={retryPayment} /> : null}
      </div>
    </main>
  );
}

function ProductDetail({
  product,
  ownedPurchase,
  successfulOutcome,
  pendingPurchase,
  isCheckingOwnership,
  ownershipError,
  buyPending,
  retryPending,
  onBuy,
  onRetryPayment,
}: {
  product: MarketplaceProductDetail;
  ownedPurchase: { purchaseId: string; purchasedAt: string; accessExpiresAt: string; entitlementStatus: "ACTIVE" | "EXPIRED" } | null;
  successfulOutcome?: PurchaseSettlement;
  pendingPurchase?: PendingPurchaseState;
  isCheckingOwnership: boolean;
  ownershipError?: string;
  buyPending: boolean;
  retryPending: boolean;
  onBuy: () => void;
  onRetryPayment: () => void;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
      <div className="space-y-6">
        <Card className="overflow-hidden rounded-3xl border-slate-200/80 bg-white py-0 shadow-sm shadow-slate-200/60">
          <div className="aspect-[16/10] overflow-hidden bg-slate-100"><MarketplacePreview preview={product.preview} priority className="h-full min-h-0 w-full rounded-none" /></div>
          <CardContent className="border-t border-slate-100 px-5 py-3"><PreviewKindLabel preview={product.preview} className="text-slate-500" /></CardContent>
        </Card>
        <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-200/60"><CardHeader className="px-6 pt-6"><CardTitle className="text-xl font-extrabold text-slate-950">About this product</CardTitle></CardHeader><CardContent className="whitespace-pre-wrap px-6 pb-6 text-sm leading-7 text-slate-600">{product.description}</CardContent></Card>
        <CapabilitySection title="Technologies" values={product.technologies} />
        <CapabilitySection title="AI Capabilities" values={product.aiCapabilities} checked />
      </div>

      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <Card className="overflow-hidden rounded-3xl border-indigo-950/30 bg-[radial-gradient(circle_at_88%_8%,rgba(167,139,250,0.42),transparent_33%),linear-gradient(145deg,#181449,#352064)] py-0 text-white shadow-xl shadow-indigo-950/15">
          <CardHeader className="space-y-4 px-6 pt-6"><div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-100"><Sparkles className="h-3.5 w-3.5" /> AI Place product</div><div className="space-y-3"><span className="inline-flex rounded-full bg-indigo-300/15 px-2.5 py-1 text-xs font-bold text-indigo-100 ring-1 ring-indigo-100/20">{product.categoryCode}</span><CardTitle className="text-3xl font-extrabold tracking-tight text-white">{product.name}</CardTitle></div></CardHeader>
          <CardContent className="space-y-4 px-6 pb-6"><div className="rounded-2xl border border-emerald-200/15 bg-emerald-300/10 p-4"><p className="text-xs font-bold uppercase tracking-wide text-emerald-100/80">Price</p><p className="mt-1 text-2xl font-extrabold text-emerald-100">{formatVnd(product.priceVnd)}</p></div><DetailRow label="Published" value={formatDate(product.lastPublishedAt)} /></CardContent>
        </Card>
        <PurchasePanel product={product} ownedPurchase={ownedPurchase} successfulOutcome={successfulOutcome} pendingPurchase={pendingPurchase} isCheckingOwnership={isCheckingOwnership} ownershipError={ownershipError} buyPending={buyPending} retryPending={retryPending} onBuy={onBuy} onRetryPayment={onRetryPayment} />
        <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-200/60"><CardHeader className="px-6 pt-6"><CardTitle className="text-base font-extrabold text-slate-950">Seller</CardTitle></CardHeader><CardContent className="flex items-center gap-3 px-6 pb-6"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><CircleUserRound className="h-5 w-5" /></div><div className="min-w-0"><p className="truncate font-bold text-slate-950">{product.seller.displayName}</p><p className="mt-0.5 text-xs text-slate-500">AI Product seller</p></div></CardContent></Card>
      </aside>
    </section>
  );
}

function PurchasePanel({
  product,
  ownedPurchase,
  successfulOutcome,
  pendingPurchase,
  isCheckingOwnership,
  ownershipError,
  buyPending,
  retryPending,
  onBuy,
  onRetryPayment,
}: {
  product: MarketplaceProductDetail;
  ownedPurchase: { purchaseId: string; purchasedAt: string; accessExpiresAt: string; entitlementStatus: "ACTIVE" | "EXPIRED" } | null;
  successfulOutcome?: PurchaseSettlement;
  pendingPurchase?: PendingPurchaseState;
  isCheckingOwnership: boolean;
  ownershipError?: string;
  buyPending: boolean;
  retryPending: boolean;
  onBuy: () => void;
  onRetryPayment: () => void;
}) {
  const purchase = ownedPurchase ?? successfulOutcome;

  if (purchase) {
    const entitlementStatus = "entitlementStatus" in purchase ? purchase.entitlementStatus : undefined;

    return <Card className="rounded-3xl border-emerald-200 bg-white shadow-sm shadow-emerald-100/60"><CardHeader className="px-6 pt-6"><div className="flex items-center justify-between gap-3"><CardTitle className="text-lg font-extrabold text-slate-950">Purchased</CardTitle><Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Owned</Badge></div><p className="text-sm leading-6 text-slate-500">This product is permanently associated with your account. Repurchase is not available.</p></CardHeader><CardContent className="space-y-3 px-6 pb-6"><DetailLine label="Purchased" value={formatDate(purchase.purchasedAt)} /><DetailLine label="Protected access expires" value={formatDate(purchase.accessExpiresAt)} />{entitlementStatus ? <div className={`rounded-xl px-3 py-2 text-sm font-semibold ${entitlementStatus === "ACTIVE" ? "bg-indigo-50 text-indigo-800" : "bg-slate-100 text-slate-700"}`}>{entitlementStatus === "ACTIVE" ? "Protected file access is active." : "Purchased permanently — protected file access expired."}</div> : <p className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800">Payment is confirmed. Open purchase details for the backend entitlement state and protected files.</p>}<Button asChild className="w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"><Link href={AI_PLACE_ROUTES.purchaseDetail(purchase.purchaseId)}><ReceiptText /> Purchase details & downloads</Link></Button></CardContent></Card>;
  }

  if (pendingPurchase) {
    return <Card className="rounded-3xl border-amber-200 bg-white shadow-sm shadow-amber-100/60"><CardHeader className="px-6 pt-6"><div className="flex items-center justify-between gap-3"><CardTitle className="text-lg font-extrabold text-slate-950">Payment pending</CardTitle><Badge className="border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">Pending payment</Badge></div><p className="text-sm leading-6 text-slate-500">{pendingPurchase.message}</p></CardHeader><CardContent className="space-y-3 px-6 pb-6"><p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">No payment has been presented as successful, and protected downloads remain unavailable. A retry uses this same purchase through the backend.</p><div className="grid gap-2 sm:grid-cols-2"><Button type="button" onClick={onRetryPayment} disabled={!pendingPurchase.retryAllowed || retryPending} className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"><CreditCard />{retryPending ? "Retrying…" : "Retry payment"}</Button><Button asChild type="button" variant="outline" className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"><Link href="/client/dashboard/wallet"><WalletCards /> Go to Wallet</Link></Button></div>{!pendingPurchase.retryAllowed ? <p className="text-xs text-slate-500">The backend has not confirmed that a payment retry is available yet.</p> : null}</CardContent></Card>;
  }

  if (isCheckingOwnership) {
    return <Card className="rounded-3xl border-slate-200 bg-white shadow-sm shadow-slate-200/60"><CardContent className="space-y-3 px-6 py-6"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-full" /><Skeleton className="h-11 w-full rounded-xl" /></CardContent></Card>;
  }

  if (ownershipError) {
    return <Card className="rounded-3xl border-rose-100 bg-white shadow-sm shadow-rose-100/60"><CardHeader className="px-6 pt-6"><CardTitle className="text-lg font-extrabold text-slate-950">Purchase status unavailable</CardTitle></CardHeader><CardContent className="space-y-3 px-6 pb-6"><p className="text-sm leading-6 text-slate-500">{ownershipError}</p><p className="text-sm text-slate-600">For safety, purchase actions are unavailable until ownership can be verified.</p></CardContent></Card>;
  }

  return <Card className="rounded-3xl border-indigo-100 bg-white shadow-sm shadow-indigo-100/50"><CardHeader className="px-6 pt-6"><CardTitle className="text-lg font-extrabold text-slate-950">Purchase this product</CardTitle><p className="text-sm leading-6 text-slate-500">One-time purchase. Payment is settled by the Payment service; no wallet balance is calculated in this browser.</p></CardHeader><CardContent className="space-y-4 px-6 pb-6"><div className="rounded-2xl bg-indigo-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-indigo-500">Product price</p><p className="mt-1 text-xl font-extrabold text-indigo-950">{formatVnd(product.priceVnd)}</p></div><Button type="button" onClick={onBuy} disabled={buyPending} className="w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"><CreditCard />{buyPending ? "Processing payment…" : "Buy product"}</Button><p className="text-center text-xs leading-5 text-slate-500">Successful purchases remain in your purchase history. Protected files are available only while the backend entitlement is active.</p></CardContent></Card>;
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 text-sm last:border-0"><span className="text-slate-500">{label}</span><span className="text-right font-semibold text-slate-900">{value}</span></div>;
}

function getPendingPurchaseFromError(error: unknown): PendingPurchaseState | undefined {
  const extracted = extractAiPlaceError(error);
  const details = asRecord(extracted?.details);
  const purchaseId = typeof details?.purchaseId === "string" ? details.purchaseId : undefined;

  if (!extracted || details?.purchaseStatus !== "PENDING_PAYMENT" || !purchaseId) {
    return undefined;
  }

  return { purchaseId, message: extracted.message, retryAllowed: details.retryAllowed === true };
}

function getPurchaseIdFromError(error: unknown, expectedCode: string) {
  const extracted = extractAiPlaceError(error);
  if (extracted?.code !== expectedCode) return undefined;

  const purchaseId = asRecord(extracted.details)?.purchaseId;
  return typeof purchaseId === "string" ? purchaseId : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" ? value as Record<string, unknown> : undefined;
}

function CapabilitySection({ title, values, checked = false }: { title: string; values: string[]; checked?: boolean }) {
  return <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-200/60"><CardHeader className="px-6 pt-6"><CardTitle className="text-xl font-extrabold text-slate-950">{title}</CardTitle></CardHeader><CardContent className="px-6 pb-6">{values.length ? <div className="flex flex-wrap gap-2">{values.map((value) => <span key={value} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-800 ring-1 ring-indigo-100">{checked ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}{value}</span>)}</div> : <p className="text-sm text-slate-500">No {title.toLowerCase()} listed.</p>}</CardContent></Card>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 text-sm"><span className="text-indigo-100/70">{label}</span><span className="text-right font-medium text-white">{value}</span></div>;
}

function DetailLoading() {
  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]"><div className="space-y-6"><Skeleton className="aspect-[16/10] rounded-3xl bg-slate-200" /><Skeleton className="h-48 rounded-3xl bg-slate-200" /></div><div className="space-y-5"><Skeleton className="h-72 rounded-3xl bg-slate-200" /><Skeleton className="h-36 rounded-3xl bg-slate-200" /></div></div>;
}

function DetailError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Card className="rounded-3xl border-red-100 bg-white py-0 shadow-sm shadow-red-100/50"><CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-slate-950">Product unavailable</p><p className="mt-1 text-sm text-slate-500">{message}</p></div><Button type="button" variant="outline" onClick={onRetry} className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"><RefreshCw /> Retry</Button></CardContent></Card>;
}
