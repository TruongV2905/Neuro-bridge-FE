"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AiPlaceProtectedPackage } from "@/features/ai-place/components/AiPlaceProtectedPackage";
import { PurchaseRatingPanel } from "@/features/ai-place/components/PurchaseRatingPanel";
import { EntitlementBadge, SuccessBadge } from "@/features/ai-place/components/ClientPurchaseHistoryView";
import { AI_PLACE_ROUTES } from "@/features/ai-place/constants/routes";
import type { PurchaseDetail } from "@/features/ai-place/types";
import { formatDate, formatVnd } from "@/features/ai-place/expert/utils/presentation";
import { getAiPlaceErrorMessage } from "@/features/ai-place/utils/error";
import { useAiPlacePurchaseDetail } from "@/services/ai-available-purchase.service";

export function ClientPurchaseDetailView({ purchaseId }: { purchaseId: string }) {
  const purchaseQuery = useAiPlacePurchaseDetail(purchaseId);
  const purchase = purchaseQuery.data?.result;

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 text-slate-950 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <Button asChild variant="ghost" className="-ml-3 h-9 w-fit px-3 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-900">
          <Link href={AI_PLACE_ROUTES.purchases}>
            <ArrowLeft />
            Purchase history
          </Link>
        </Button>
        {purchaseQuery.isLoading ? <PurchaseDetailLoading /> : null}
        {!purchaseQuery.isLoading && (purchaseQuery.isError || !purchase) ? (
          <PurchaseDetailError
            message={purchaseQuery.isError ? getAiPlaceErrorMessage(purchaseQuery.error) : "This purchase could not be found."}
            onRetry={() => void purchaseQuery.refetch()}
          />
        ) : null}
        {purchase ? <PurchaseDetailContent purchase={purchase} /> : null}
      </div>
    </main>
  );
}

function PurchaseDetailContent({ purchase }: { purchase: PurchaseDetail }) {
  return (
    <>
      <header className="flex flex-col gap-4 rounded-3xl border border-indigo-950/25 bg-[radial-gradient(circle_at_85%_10%,rgba(167,139,250,0.38),transparent_35%),linear-gradient(145deg,#181449,#352064)] px-6 py-7 text-white shadow-xl shadow-indigo-950/15 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-100">
            <ShieldCheck className="h-3.5 w-3.5" /> AI product purchase
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{purchase.productNameAtPurchase}</h1>
          <p className="mt-2 text-sm text-indigo-100/80">Purchased from {purchase.sellerDisplayName}</p>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <SuccessBadge />
          <EntitlementBadge status={purchase.entitlementStatus} expiresAt={purchase.accessExpiresAt} />
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(310px,0.85fr)]">
        <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-200/60">
          <CardHeader className="px-6 pt-6"><CardTitle className="text-xl font-extrabold text-slate-950">Purchase snapshot</CardTitle></CardHeader>
          <CardContent className="px-6 pb-6">
            <dl className="divide-y divide-slate-100">
              <SnapshotRow label="Product" value={purchase.productNameAtPurchase} />
              <SnapshotRow label="Seller" value={purchase.sellerDisplayName} />
              <SnapshotRow label="Purchase status" value="Success" />
              <SnapshotRow label="Paid price" value={formatVnd(purchase.grossPriceVnd)} strong />
              <SnapshotRow label="Platform fee" value={formatVnd(purchase.platformFeeVnd)} />
              <SnapshotRow label="Seller net" value={formatVnd(purchase.expertNetVnd)} />
              <SnapshotRow label="Payment reference" value={purchase.paymentTransactionId} />
              <SnapshotRow label="Purchased" value={formatDate(purchase.purchasedAt)} />
              <SnapshotRow label="Access expires" value={formatDate(purchase.accessExpiresAt)} />
            </dl>
          </CardContent>
        </Card>
        <AiPlaceProtectedPackage purchase={purchase} />
      </section>

      <PurchaseRatingPanel purchaseId={purchase.purchaseId} productId={purchase.productId} rating={purchase.rating} />
    </>
  );
}

function SnapshotRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="grid gap-2 py-3.5 text-sm sm:grid-cols-[160px_1fr]"><dt className="font-semibold text-slate-500">{label}</dt><dd className={`break-all text-slate-950 ${strong ? "font-extrabold" : "font-medium"}`}>{value}</dd></div>;
}

function PurchaseDetailLoading() {
  return <div className="space-y-6"><Skeleton className="h-48 rounded-3xl bg-slate-200" /><div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-96 rounded-3xl bg-slate-200" /><Skeleton className="h-96 rounded-3xl bg-slate-200" /></div></div>;
}

function PurchaseDetailError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Card className="rounded-3xl border-rose-100 bg-white py-0 shadow-sm shadow-rose-100/50"><CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-slate-950">Purchase unavailable</p><p className="mt-1 text-sm text-slate-500">{message}</p></div><Button type="button" variant="outline" onClick={onRetry} className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"><RefreshCw /> Retry</Button></CardContent></Card>;
}
