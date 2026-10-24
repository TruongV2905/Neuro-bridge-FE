"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, RefreshCw, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MarketplacePreview, PreviewKindLabel } from "@/features/ai-place/components/MarketplacePreview";
import { AI_PLACE_ROUTES } from "@/features/ai-place/constants/routes";
import type { BrowseMarketplaceProductsParams, MarketplaceProductListItem } from "@/features/ai-place/types";
import { formatDate, formatVnd } from "@/features/ai-place/expert/utils/presentation";
import { getAiPlaceErrorMessage } from "@/features/ai-place/utils/error";
import { useDebounce } from "@/hooks/useDebounce";
import { useMarketplaceProducts } from "@/services/ai-available-product.service";

const PAGE_SIZE = 9;

type AppliedFilters = { categoryCode: string; minPriceVnd?: number; maxPriceVnd?: number; };

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
    const validationMessage = typeof parsedMin === "string" ? parsedMin : typeof parsedMax === "string" ? parsedMax : null;
    if (validationMessage) { setFilterError(validationMessage); return; }
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
    setKeyword(""); setCategoryCode(""); setMinPrice(""); setMaxPrice("");
    setFilterError(null); setAppliedFilters({ categoryCode: "" }); setPage(0);
  };

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 text-slate-950 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-md shadow-indigo-500/20"><Sparkles className="h-3.5 w-3.5" /> AI Place</div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Discover published AI products.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Explore production-ready AI products and their capabilities before purchase becomes available.</p>
        </section>

        <Card className="rounded-3xl border-slate-200/80 bg-white py-0 shadow-sm shadow-slate-200/50">
          <CardContent className="p-4 sm:p-5">
            <form onSubmit={applyFilters} noValidate>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(150px,0.7fr)_minmax(130px,0.45fr)_minmax(130px,0.45fr)_auto] xl:items-end">
                <FilterField label="Product name" className="sm:col-span-2 xl:col-span-1"><div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(0); }} placeholder="Search by product name" className="h-11 rounded-xl border-slate-200 bg-white pl-10 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-200" aria-label="Search by product name" /></div></FilterField>
                <FilterField label="Category"><Input value={categoryCode} onChange={(event) => setCategoryCode(event.target.value)} placeholder="Category code" className="h-11 rounded-xl border-slate-200 bg-white text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-200" aria-label="Category code" /></FilterField>
                <FilterField label="Minimum price"><Input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} inputMode="numeric" placeholder="Min VND" className="h-11 rounded-xl border-slate-200 bg-white text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-200" aria-label="Minimum price in VND" /></FilterField>
                <FilterField label="Maximum price"><Input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} inputMode="numeric" placeholder="Max VND" className="h-11 rounded-xl border-slate-200 bg-white text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-200" aria-label="Maximum price in VND" /></FilterField>
                <Button type="submit" className="h-11 rounded-xl bg-indigo-600 px-5 text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-700"><SlidersHorizontal /> Apply</Button>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"><p className={filterError ? "text-red-600" : "text-slate-500"}>{filterError ?? "Category codes and whole-VND prices are validated by the marketplace."}</p>{hasActiveFilters || categoryCode || minPrice || maxPrice ? <Button type="button" variant="ghost" onClick={clearFilters} className="h-7 px-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"><X /> Clear filters</Button> : null}</div>
            </form>
          </CardContent>
        </Card>

        {marketplaceQuery.isLoading ? <MarketplaceLoading /> : null}
        {marketplaceQuery.isError ? <MarketplaceError message={getAiPlaceErrorMessage(marketplaceQuery.error)} onRetry={() => void marketplaceQuery.refetch()} /> : null}
        {!marketplaceQuery.isLoading && !marketplaceQuery.isError && result ? (
          <section className="space-y-5" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1"><p className="text-sm font-medium text-slate-600">{result.metadata.totalElements} published {result.metadata.totalElements === 1 ? "product" : "products"}{marketplaceQuery.isFetching ? " · Refreshing…" : ""}</p><p className="text-xs font-medium text-slate-400">Newest published products first</p></div>
            {result.data.length === 0 ? <MarketplaceEmpty filtered={hasActiveFilters} onClear={clearFilters} /> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{result.data.map((product) => <MarketplaceCard key={product.id} product={product} />)}</div>}
            {result.data.length > 0 ? <MarketplacePagination page={result.metadata.page} totalPages={result.metadata.totalPages} hasPrevious={result.metadata.hasPrevious} hasNext={result.metadata.hasNext} onPageChange={setPage} /> : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}

function FilterField({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode; }) {
  return <label className={`grid gap-1.5 text-xs font-semibold text-slate-600 ${className}`}><span>{label}</span>{children}</label>;
}

function MarketplaceCard({ product }: { product: MarketplaceProductListItem }) {
  return (
    <Card className="overflow-hidden rounded-3xl border-slate-800/70 bg-[radial-gradient(circle_at_90%_4%,rgba(129,140,248,0.34),transparent_28%),linear-gradient(145deg,#111b3b,#26134c)] py-0 text-white shadow-lg shadow-slate-900/15 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300/70 hover:shadow-xl hover:shadow-indigo-950/20">
      <div className="aspect-[16/10] overflow-hidden border-b border-white/10"><MarketplacePreview preview={product.preview} className="h-full min-h-0 w-full rounded-none" /></div>
      <CardHeader className="gap-3 px-5 pt-5"><div className="flex items-start justify-between gap-3"><CardTitle className="line-clamp-2 text-xl font-extrabold text-white">{product.name}</CardTitle><span className="shrink-0 rounded-full border border-indigo-200/25 bg-indigo-300/15 px-2.5 py-1 text-[11px] font-bold text-indigo-100">{product.categoryCode}</span></div><p className="text-xl font-extrabold tracking-tight text-emerald-200">{formatVnd(product.priceVnd)}</p></CardHeader>
      <CardContent className="space-y-4 px-5 pb-5"><PreviewKindLabel preview={product.preview} /><TagList values={product.technologies} emptyLabel="No technologies listed" /><div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-indigo-100/75"><span>Published {formatDate(product.lastPublishedAt)}</span><Button asChild size="sm" className="rounded-lg bg-white px-3 text-indigo-800 shadow-sm hover:bg-indigo-50"><Link href={`${AI_PLACE_ROUTES.marketplace}/${encodeURIComponent(product.id)}`}>View details <ArrowRight /></Link></Button></div></CardContent>
    </Card>
  );
}

function MarketplacePagination({ page, totalPages, hasPrevious, hasNext, onPageChange }: { page: number; totalPages: number; hasPrevious: boolean; hasNext: boolean; onPageChange: (page: number) => void; }) {
  return <nav className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/40" aria-label="Marketplace pagination"><Button type="button" variant="outline" disabled={!hasPrevious} onClick={() => onPageChange(page - 1)} className="rounded-xl border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-800"><ArrowLeft /> Previous</Button><span className="text-sm font-semibold text-slate-600">Page {page + 1} of {Math.max(totalPages, 1)}</span><Button type="button" variant="outline" disabled={!hasNext} onClick={() => onPageChange(page + 1)} className="rounded-xl border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-800">Next <ArrowRight /></Button></nav>;
}

function MarketplaceLoading() {
  return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: PAGE_SIZE }, (_, index) => <Card key={index} className="overflow-hidden rounded-3xl border-slate-200 bg-white py-0 shadow-sm"><Skeleton className="aspect-[16/10] rounded-none bg-slate-100" /><CardContent className="space-y-3 px-5 py-5"><Skeleton className="h-6 w-3/4 bg-slate-100" /><Skeleton className="h-4 w-1/3 bg-slate-100" /><Skeleton className="h-8 w-full bg-slate-100" /></CardContent></Card>)}</div>;
}

function MarketplaceError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Card className="rounded-3xl border-red-100 bg-white py-0 shadow-sm shadow-red-100/50"><CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-slate-950">Marketplace unavailable</p><p className="mt-1 text-sm text-slate-500">{message}</p></div><Button type="button" variant="outline" onClick={onRetry} className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"><RefreshCw /> Retry</Button></CardContent></Card>;
}

function MarketplaceEmpty({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  return <Card className="rounded-3xl border-slate-200 bg-white py-0 text-center shadow-sm shadow-slate-200/40"><CardContent className="px-6 py-12"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Sparkles className="h-7 w-7" /></div><p className="mt-4 font-bold text-slate-950">{filtered ? "No products match these filters" : "No published products yet"}</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{filtered ? "Try a different product name, category code, or VND price range." : "Published AI products will appear here when they are available."}</p>{filtered ? <Button type="button" variant="outline" onClick={onClear} className="mt-5 rounded-xl border-slate-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"><X /> Clear filters</Button> : null}</CardContent></Card>;
}

function TagList({ values, emptyLabel }: { values: string[]; emptyLabel: string }) {
  return values.length > 0 ? <div className="flex flex-wrap gap-1.5">{values.slice(0, 4).map((value) => <span key={value} className="rounded-full border border-white/10 bg-white/[0.09] px-2.5 py-1 text-[11px] font-medium text-indigo-50">{value}</span>)}</div> : <p className="text-xs text-indigo-100/70">{emptyLabel}</p>;
}

function parseWholeVnd(value: string, label: string): number | undefined | string {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : `${label} must be a non-negative whole-VND amount.`;
}
