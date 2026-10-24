"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ReceiptText, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AI_PLACE_ROUTES } from "@/features/ai-place/constants/routes";
import type { EntitlementStatus, PurchaseHistoryItem } from "@/features/ai-place/types";
import { formatDate, formatVnd } from "@/features/ai-place/expert/utils/presentation";
import { getAiPlaceErrorMessage } from "@/features/ai-place/utils/error";
import { useAiPlacePurchaseHistory } from "@/services/ai-available-purchase.service";

const PAGE_SIZE = 10;

export function ClientPurchaseHistoryView() {
  const [page, setPage] = useState(0);
  const purchasesQuery = useAiPlacePurchaseHistory({ page, size: PAGE_SIZE });
  const result = purchasesQuery.data?.result;

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 text-slate-950 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Button asChild variant="ghost" className="-ml-3 h-9 w-fit px-3 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-900">
              <Link href={AI_PLACE_ROUTES.marketplace}>
                <ArrowLeft />
                AI Place
              </Link>
            </Button>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
              AI product purchases
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Your successful purchases remain here permanently. Protected-file access is governed by each purchase&apos;s backend-issued expiration time.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void purchasesQuery.refetch()}
            disabled={purchasesQuery.isFetching}
            className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={purchasesQuery.isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>
        </header>

        {purchasesQuery.isLoading ? <HistoryLoading /> : null}
        {purchasesQuery.isError ? (
          <HistoryError
            message={getAiPlaceErrorMessage(purchasesQuery.error)}
            onRetry={() => void purchasesQuery.refetch()}
          />
        ) : null}
        {result && !purchasesQuery.isLoading && !purchasesQuery.isError ? (
          <>
            {result.data.length === 0 ? <HistoryEmpty /> : <PurchaseList purchases={result.data} />}
            {result.metadata.totalPages > 1 ? (
              <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/40" aria-label="Purchase history pagination">
                <span className="text-sm text-slate-600">
                  Page {result.metadata.page + 1} of {result.metadata.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" disabled={!result.metadata.hasPrevious} onClick={() => setPage((current) => current - 1)} className="rounded-xl">
                    <ArrowLeft /> Previous
                  </Button>
                  <Button type="button" variant="outline" disabled={!result.metadata.hasNext} onClick={() => setPage((current) => current + 1)} className="rounded-xl">
                    Next <ArrowRight />
                  </Button>
                </div>
              </nav>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}

function PurchaseList({ purchases }: { purchases: PurchaseHistoryItem[] }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-extrabold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-4 py-4">Purchase status</th>
              <th className="px-4 py-4">Paid price</th>
              <th className="px-4 py-4">Purchased</th>
              <th className="px-4 py-4">File access</th>
              <th className="px-6 py-4 text-right"> </th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.purchaseId} className="border-b border-slate-100 last:border-0">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-950">{purchase.productNameAtPurchase}</p>
                  <p className="mt-1 text-xs text-slate-500">Sold by {purchase.sellerDisplayName}</p>
                </td>
                <td className="px-4 py-4"><SuccessBadge /></td>
                <td className="px-4 py-4 font-bold text-slate-950">{formatVnd(purchase.grossPriceVnd)}</td>
                <td className="px-4 py-4 text-slate-600">{formatDate(purchase.purchasedAt)}</td>
                <td className="px-4 py-4"><EntitlementBadge status={purchase.entitlementStatus} expiresAt={purchase.accessExpiresAt} /></td>
                <td className="px-6 py-4 text-right">
                  <Button asChild size="sm" variant="outline" className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800">
                    <Link href={AI_PLACE_ROUTES.purchaseDetail(purchase.purchaseId)}>View purchase</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function SuccessBadge() {
  return <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Success</Badge>;
}

export function EntitlementBadge({ status, expiresAt }: { status: EntitlementStatus; expiresAt: string }) {
  const active = status === "ACTIVE";

  return (
    <div className="space-y-1">
      <Badge className={active ? "border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-50" : "border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-100"}>
        {active ? "Active" : "Expired"}
      </Badge>
      <p className="text-xs text-slate-500">Expires {formatDate(expiresAt)}</p>
    </div>
  );
}

function HistoryLoading() {
  return <Card className="rounded-3xl border-slate-200 bg-white py-0"><CardContent className="space-y-4 p-6">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-16 w-full" />)}</CardContent></Card>;
}

function HistoryError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Card className="rounded-3xl border-rose-100 bg-white py-0 shadow-sm shadow-rose-100/50"><CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-slate-950">Purchase history unavailable</p><p className="mt-1 text-sm text-slate-500">{message}</p></div><Button type="button" variant="outline" onClick={onRetry} className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"><RefreshCw /> Retry</Button></CardContent></Card>;
}

function HistoryEmpty() {
  return <Card className="rounded-3xl border-slate-200 bg-white py-0 text-center shadow-sm shadow-slate-200/50"><CardContent className="px-6 py-14"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><ReceiptText className="h-7 w-7" /></span><h2 className="mt-4 font-extrabold text-slate-950">No successful purchases yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">When an AI product payment succeeds, its frozen purchase snapshot and entitlement will appear here.</p><Button asChild className="mt-5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"><Link href={AI_PLACE_ROUTES.marketplace}>Browse AI Place</Link></Button></CardContent></Card>;
}
