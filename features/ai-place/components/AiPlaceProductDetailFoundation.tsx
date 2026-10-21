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
    <main className="min-h-screen bg-[#061128] px-5 py-10 text-white sm:px-8 lg:px-[7.5%] lg:py-16">
      <div className="mx-auto max-w-6xl space-y-7">
        <Button asChild variant="ghost" className="px-0 text-slate-300 hover:bg-transparent hover:text-white"><Link href={AI_PLACE_ROUTES.marketplace}><ArrowLeft /> Back to AI Place</Link></Button>
        {productQuery.isLoading ? <DetailLoading /> : null}
        {!productQuery.isLoading && (productQuery.isError || !product) ? <DetailError message={productQuery.isError ? getAiPlaceErrorMessage(productQuery.error) : "This AI product could not be found."} onRetry={() => void productQuery.refetch()} /> : null}
        {product ? <ProductDetail product={product} /> : null}
      </div>
    </main>
  );
}

function ProductDetail({ product }: { product: MarketplaceProductDetail }) {
  return <section className="grid gap-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]"><div className="space-y-7"><Card className="overflow-hidden border-white/10 bg-white/[0.06] py-0 text-white shadow-2xl shadow-indigo-950/20"><MarketplacePreview preview={product.preview} priority className="max-h-[440px] rounded-none" /><CardContent className="py-4"><PreviewKindLabel preview={product.preview} /></CardContent></Card><Card className="border-white/10 bg-white/[0.06] text-white shadow-xl shadow-indigo-950/20"><CardHeader><CardTitle className="text-xl text-white">About this product</CardTitle></CardHeader><CardContent className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{product.description}</CardContent></Card><CapabilitySection title="Technologies" values={product.technologies} /><CapabilitySection title="AI capabilities" values={product.aiCapabilities} checked /></div><aside className="space-y-5"><Card className="border-white/10 bg-white/[0.06] text-white shadow-2xl shadow-indigo-950/20"><CardHeader className="space-y-4"><div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-300/30 bg-indigo-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-100"><Sparkles className="h-3.5 w-3.5" /> AI Place product</div><CardTitle className="text-3xl text-white">{product.name}</CardTitle><span className="w-fit rounded-full border border-indigo-200/20 bg-indigo-400/10 px-2.5 py-1 text-xs font-bold text-indigo-100">{product.categoryCode}</span></CardHeader><CardContent className="space-y-4"><div className="rounded-2xl border border-emerald-200/15 bg-emerald-300/10 p-4"><p className="text-xs font-medium uppercase tracking-wide text-emerald-100/80">Price</p><p className="mt-1 text-2xl font-bold text-emerald-100">{formatVnd(product.priceVnd)}</p></div><DetailRow label="Published" value={formatDate(product.lastPublishedAt)} /></CardContent></Card><Card className="border-white/10 bg-white/[0.06] text-white shadow-xl shadow-indigo-950/20"><CardHeader><CardTitle className="text-base text-white">Seller</CardTitle></CardHeader><CardContent className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-400/15 text-indigo-100"><CircleUserRound className="h-5 w-5" /></div><div><p className="font-semibold text-white">{product.seller.displayName}</p><p className="text-xs text-slate-400">Verified seller profile</p></div></CardContent></Card></aside></section>;
}

function CapabilitySection({ title, values, checked = false }: { title: string; values: string[]; checked?: boolean }) { return <Card className="border-white/10 bg-white/[0.06] text-white shadow-xl shadow-indigo-950/20"><CardHeader><CardTitle className="text-xl text-white">{title}</CardTitle></CardHeader><CardContent>{values.length ? <div className="flex flex-wrap gap-2">{values.map((value) => <span key={value} className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/20 bg-indigo-400/10 px-3 py-1.5 text-sm text-indigo-50">{checked ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}{value}</span>)}</div> : <p className="text-sm text-slate-400">No {title.toLowerCase()} listed.</p>}</CardContent></Card>; }
function DetailRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4 text-sm"><span className="text-slate-400">{label}</span><span className="text-right text-slate-100">{value}</span></div>; }
function DetailLoading() { return <div className="grid gap-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]"><Skeleton className="h-[520px] rounded-3xl bg-white/10" /><div className="space-y-5"><Skeleton className="h-72 rounded-3xl bg-white/10" /><Skeleton className="h-36 rounded-3xl bg-white/10" /></div></div>; }
function DetailError({ message, onRetry }: { message: string; onRetry: () => void }) { return <Card className="border-red-300/20 bg-red-950/30 text-white"><CardContent className="flex flex-col items-start gap-4 py-8 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Product unavailable</p><p className="mt-1 text-sm text-red-100/80">{message}</p></div><Button type="button" variant="outline" onClick={onRetry} className="border-red-200/30 bg-white/[0.06] text-white hover:bg-white/15 hover:text-white"><RefreshCw /> Retry</Button></CardContent></Card>; }
