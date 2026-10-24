"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleUserRound, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MarketplacePreview, PreviewKindLabel } from "@/features/ai-place/components/MarketplacePreview";
import { AI_PLACE_ROUTES } from "@/features/ai-place/constants/routes";
import type { MarketplaceProductDetail } from "@/features/ai-place/types";
import { formatDate, formatVnd } from "@/features/ai-place/expert/utils/presentation";
import { getAiPlaceErrorMessage } from "@/features/ai-place/utils/error";
import { useMarketplaceProduct } from "@/services/ai-available-product.service";

export function AiPlaceProductDetailFoundation({ productId }: { productId: string }) {
  const productQuery = useMarketplaceProduct(productId);
  const product = productQuery.data?.result;

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 text-slate-950 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <Button asChild variant="ghost" className="w-fit px-0 text-indigo-700 hover:bg-transparent hover:text-indigo-900"><Link href={AI_PLACE_ROUTES.marketplace}><ArrowLeft /> Back to AI Place</Link></Button>
        {productQuery.isLoading ? <DetailLoading /> : null}
        {!productQuery.isLoading && (productQuery.isError || !product) ? <DetailError message={productQuery.isError ? getAiPlaceErrorMessage(productQuery.error) : "This AI product could not be found."} onRetry={() => void productQuery.refetch()} /> : null}
        {product ? <ProductDetail product={product} /> : null}
      </div>
    </main>
  );
}

function ProductDetail({ product }: { product: MarketplaceProductDetail }) {
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
        <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-200/60"><CardHeader className="px-6 pt-6"><CardTitle className="text-base font-extrabold text-slate-950">Seller</CardTitle></CardHeader><CardContent className="flex items-center gap-3 px-6 pb-6"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><CircleUserRound className="h-5 w-5" /></div><div className="min-w-0"><p className="truncate font-bold text-slate-950">{product.seller.displayName}</p><p className="mt-0.5 text-xs text-slate-500">AI Product seller</p></div></CardContent></Card>
      </aside>
    </section>
  );
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
