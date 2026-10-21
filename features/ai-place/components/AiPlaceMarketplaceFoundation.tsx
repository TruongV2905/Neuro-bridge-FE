"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RefreshCw, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { MarketplacePreview, PreviewKindLabel } from "@/features/ai-place/components/MarketplacePreview";
import { AI_PLACE_ROUTES } from "@/features/ai-place/constants/routes";
import type { BrowseMarketplaceProductsParams, MarketplaceProductListItem } from "@/features/ai-place/types";
import { formatDate, formatVnd } from "@/features/ai-place/expert/utils/presentation";
import { getAiPlaceErrorMessage } from "@/features/ai-place/utils/error";
import { useMarketplaceProducts } from "@/services/ai-available-product.service";

const PAGE_SIZE = 9;

type AppliedFilters = {
  categoryCode: string;
  minPriceVnd?: number;
  maxPriceVnd?: number;
};

export function AiPlaceMarketplaceFoundation() {
  const [keyword, setKeyword] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({ categoryCode: "" });
  const [page, setPage] = useState(0);
  const [filterError, setFilterError] = useState<string | null>(null);
  const debouncedKeyword = useDebounce(keyword.trim(), 350);

  const params = useMemo<BrowseMarketplaceProductsParams>(() => ({
    page,
    size: PAGE_SIZE,
    ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
    ...(appliedFilters.categoryCode ? { categoryCode: appliedFilters.categoryCode } : {}),
    ...(appliedFilters.minPriceVnd !== undefined ? { minPriceVnd: appliedFilters.minPriceVnd } : {}),
    ...(appliedFilters.maxPriceVnd !== undefined ? { maxPriceVnd: appliedFilters.maxPriceVnd } : {}),
  }), [appliedFilters, debouncedKeyword, page]);
  const marketplaceQuery = useMarketplaceProducts(params);
  const result = marketplaceQuery.data?.result;
  const hasActiveFilters = Boolean(debouncedKeyword || appliedFilters.categoryCode || appliedFilters.minPriceVnd !== undefined || appliedFilters.maxPriceVnd !== undefined);

  const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedMin = parseWholeVnd(minPrice, "Minimum price");
    const parsedMax = parseWholeVnd(maxPrice, "Maximum price");
    const validationMessage = typeof parsedMin === "string"
      ? parsedMin
      : typeof parsedMax === "string"
        ? parsedMax
        : null;
    if (validationMessage) {
      setFilterError(validationMessage);
      return;
    }
    if (parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax) {
      setFilterError("Minimum price must be less than or equal to maximum price.");
      return;
    }

    setFilterError(null);
    setAppliedFilters({
      categoryCode: categoryCode.trim(),
      minPriceVnd: typeof parsedMin === "number" ? parsedMin : undefined,
      maxPriceVnd: typeof parsedMax === "number" ? parsedMax : undefined,
    });
    setPage(0);
  };

  const clearFilters = () => {
    setKeyword("");
    setCategoryCode("");
    setMinPrice("");
    setMaxPrice("");
    setFilterError(null);
    setAppliedFilters({ categoryCode: "" });
    setPage(0);
  };

  return (
    <main className="min-h-screen bg-[#061128] px-5 py-10 text-white sm:px-8 lg:px-[7.5%] lg:py-16">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/30 bg-indigo-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-100"><Sparkles className="h-3.5 w-3.5" /> AI Place</div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">Discover published AI products.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">Explore production-ready AI products and their capabilities before purchase becomes available.</p>
        </section>

        <form className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-indigo-950/20 backdrop-blur sm:p-5" onSubmit={applyFilters} noValidate>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(150px,0.7fr)_minmax(130px,0.45fr)_minmax(130px,0.45fr)_auto]">
            <div className="relative min-w-0"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(0); }} placeholder="Search by product name" className="h-11 rounded-xl border-white/10 bg-slate-950/30 pl-10 text-slate-100 placeholder:text-slate-500" aria-label="Search by product name" /></div>
            <Input value={categoryCode} onChange={(event) => setCategoryCode(event.target.value)} placeholder="Category code" className="h-11 rounded-xl border-white/10 bg-slate-950/30 text-slate-100 placeholder:text-slate-500" aria-label="Category code" />
            <Input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} inputMode="numeric" placeholder="Min VND" className="h-11 rounded-xl border-white/10 bg-slate-950/30 text-slate-100 placeholder:text-slate-500" aria-label="Minimum price in VND" />
            <Input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} inputMode="numeric" placeholder="Max VND" className="h-11 rounded-xl border-white/10 bg-slate-950/30 text-slate-100 placeholder:text-slate-500" aria-label="Maximum price in VND" />
            <Button type="submit" className="h-11 rounded-xl bg-indigo-500 hover:bg-indigo-400"><SlidersHorizontal /> Apply</Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"><p className={filterError ? "text-red-300" : "text-slate-400"}>{filterError ?? "Category codes and whole-VND prices are validated by the marketplace."}</p>{hasActiveFilters || categoryCode || minPrice || maxPrice ? <Button type="button" variant="ghost" onClick={clearFilters} className="h-7 px-2 text-slate-300 hover:bg-white/10 hover:text-white"><X /> Clear filters</Button> : null}</div>
        </form>

        {marketplaceQuery.isLoading ? <MarketplaceLoading /> : null}
        {marketplaceQuery.isError ? <MarketplaceError message={getAiPlaceErrorMessage(marketplaceQuery.error)} onRetry={() => void marketplaceQuery.refetch()} /> : null}
        {!marketplaceQuery.isLoading && !marketplaceQuery.isError && result ? (
          <section className="space-y-5" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-300">{result.metadata.totalElements} published {result.metadata.totalElements === 1 ? "product" : "products"}{marketplaceQuery.isFetching ? " · Refreshing…" : ""}</p><p className="text-xs text-slate-400">Newest published products first</p></div>
            {result.data.length === 0 ? <MarketplaceEmpty filtered={hasActiveFilters} onClear={clearFilters} /> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{result.data.map((product) => <MarketplaceCard key={product.id} product={product} />)}</div>}
            {result.data.length > 0 ? <MarketplacePagination page={result.metadata.page} totalPages={result.metadata.totalPages} hasPrevious={result.metadata.hasPrevious} hasNext={result.metadata.hasNext} onPageChange={setPage} /> : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}

function MarketplaceCard({ product }: { product: MarketplaceProductListItem }) {
  return (
    <Card className="overflow-hidden border-white/10 bg-white/[0.06] py-0 text-white shadow-xl shadow-indigo-950/20 transition-transform hover:-translate-y-1 hover:border-indigo-300/30">
      <MarketplacePreview preview={product.preview} className="rounded-none" />
      <CardHeader className="gap-3 pt-5"><div className="flex items-start justify-between gap-3"><CardTitle className="line-clamp-2 text-xl text-white">{product.name}</CardTitle><span className="shrink-0 rounded-full border border-indigo-200/20 bg-indigo-400/10 px-2 py-1 text-[11px] font-bold text-indigo-100">{product.categoryCode}</span></div><p className="text-lg font-bold text-emerald-200">{formatVnd(product.priceVnd)}</p></CardHeader>
      <CardContent className="space-y-4 pb-5"><PreviewKindLabel preview={product.preview} /><TagList values={product.technologies} emptyLabel="No technologies listed" /><div className="flex items-center justify-between gap-3 text-xs text-slate-400"><span>Published {formatDate(product.lastPublishedAt)}</span><Button asChild size="sm" variant="outline" className="border-indigo-200/30 bg-white/[0.04] text-indigo-50 hover:bg-indigo-300/15 hover:text-white"><Link href={`${AI_PLACE_ROUTES.marketplace}/${encodeURIComponent(product.id)}`}>View details <ArrowRight /></Link></Button></div></CardContent>
    </Card>
  );
}

function MarketplacePagination({ page, totalPages, hasPrevious, hasNext, onPageChange }: { page: number; totalPages: number; hasPrevious: boolean; hasNext: boolean; onPageChange: (page: number) => void }) {
  return <nav className="flex items-center justify-center gap-3 pt-2" aria-label="Marketplace pagination"><Button type="button" variant="outline" disabled={!hasPrevious} onClick={() => onPageChange(page - 1)} className="border-white/15 bg-white/[0.04] text-slate-100 hover:bg-white/10 hover:text-white"><ArrowLeft /> Previous</Button><span className="text-sm text-slate-300">Page {page + 1} of {Math.max(totalPages, 1)}</span><Button type="button" variant="outline" disabled={!hasNext} onClick={() => onPageChange(page + 1)} className="border-white/15 bg-white/[0.04] text-slate-100 hover:bg-white/10 hover:text-white">Next <ArrowRight /></Button></nav>;
}

function MarketplaceLoading() { return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: PAGE_SIZE }, (_, index) => <Card key={index} className="overflow-hidden border-white/10 bg-white/[0.06] py-0"><Skeleton className="h-48 rounded-none bg-white/10" /><CardContent className="space-y-3 py-5"><Skeleton className="h-6 w-3/4 bg-white/10" /><Skeleton className="h-4 w-1/3 bg-white/10" /><Skeleton className="h-8 w-full bg-white/10" /></CardContent></Card>)}</div>; }
function MarketplaceError({ message, onRetry }: { message: string; onRetry: () => void }) { return <Card className="border-red-300/20 bg-red-950/30 text-white"><CardContent className="flex flex-col items-start gap-4 py-7 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Marketplace unavailable</p><p className="mt-1 text-sm text-red-100/80">{message}</p></div><Button type="button" variant="outline" onClick={onRetry} className="border-red-200/30 bg-white/[0.06] text-white hover:bg-white/15 hover:text-white"><RefreshCw /> Retry</Button></CardContent></Card>; }
function MarketplaceEmpty({ filtered, onClear }: { filtered: boolean; onClear: () => void }) { return <Card className="border-white/10 bg-white/[0.06] text-white"><CardContent className="py-12 text-center"><Sparkles className="mx-auto h-9 w-9 text-indigo-200" /><p className="mt-4 font-semibold">{filtered ? "No products match these filters" : "No published products yet"}</p><p className="mx-auto mt-2 max-w-md text-sm text-slate-300">{filtered ? "Try a different product name, category code, or VND price range." : "Published AI products will appear here when they are available."}</p>{filtered ? <Button type="button" variant="outline" onClick={onClear} className="mt-5 border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white"><X /> Clear filters</Button> : null}</CardContent></Card>; }
function TagList({ values, emptyLabel }: { values: string[]; emptyLabel: string }) { return values.length > 0 ? <div className="flex flex-wrap gap-1.5">{values.slice(0, 4).map((value) => <span key={value} className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-slate-200">{value}</span>)}</div> : <p className="text-xs text-slate-400">{emptyLabel}</p>; }
function parseWholeVnd(value: string, label: string): number | undefined | string { if (!value.trim()) return undefined; const parsed = Number(value); return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : `${label} must be a non-negative whole-VND amount.`; }
