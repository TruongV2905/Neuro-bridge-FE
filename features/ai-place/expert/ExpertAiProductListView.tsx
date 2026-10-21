"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, Boxes, Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AI_PLACE_ROUTES } from "@/features/ai-place/constants/routes";
import { useExpertProducts } from "@/services/ai-available-product.service";
import { getAiPlaceErrorMessage } from "@/features/ai-place/utils/error";
import { AiProductStatusBadge } from "./components/AiProductStatusBadge";
import { formatDate, formatVnd } from "./utils/presentation";

const PAGE_SIZE = 10;

export function ExpertAiProductListView({ page }: { page: number }) {
  const productQuery = useExpertProducts({ page, size: PAGE_SIZE });
  const productPage = productQuery.data?.result;

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-md shadow-indigo-500/20">
                Expert Workspace
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                AI Place
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              My AI Products
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Create drafts, prepare deliverables, and manage the lifecycle of your AI products.
            </p>
          </div>

          <Button asChild className="h-11 rounded-xl bg-indigo-600 px-5 hover:bg-indigo-700">
            <Link href={`${AI_PLACE_ROUTES.expertProducts}/new`}>
              <Plus className="mr-2 h-4 w-4" />
              New AI Product
            </Link>
          </Button>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <LifecycleGuide title="Draft" detail="Editable. Only never-published drafts can be deleted." />
          <LifecycleGuide title="Published" detail="Live in the marketplace. Unpublish before editing." />
          <LifecycleGuide title="Unpublished" detail="Hidden from clients and ready to update or republish." />
        </section>

        <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-xl text-slate-950">Products</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {productQuery.isLoading ? <ProductListLoading /> : null}

            {productQuery.isError ? (
              <ListError
                message={getAiPlaceErrorMessage(productQuery.error)}
                onRetry={() => void productQuery.refetch()}
              />
            ) : null}

            {!productQuery.isLoading && !productQuery.isError && productPage ? (
              productPage.data.length === 0 ? (
                <EmptyProducts />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="pb-3 pr-4">Product</th>
                          <th className="pb-3 pr-4">Category</th>
                          <th className="pb-3 pr-4">Status</th>
                          <th className="pb-3 pr-4">Price</th>
                          <th className="pb-3 pr-4">Last updated</th>
                          <th className="pb-3"> </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {productPage.data.map((product) => (
                          <tr key={product.id} className="transition-colors hover:bg-slate-50/80">
                            <td className="py-4 pr-4">
                              <div className="font-semibold text-slate-900">{product.name}</div>
                              <div className="mt-1 text-xs text-slate-500">
                                {product.lastPublishedAt
                                  ? `Last published ${formatDate(product.lastPublishedAt)}`
                                  : "Not published yet"}
                              </div>
                            </td>
                            <td className="py-4 pr-4 text-slate-600">{product.categoryCode}</td>
                            <td className="py-4 pr-4"><AiProductStatusBadge status={product.status} /></td>
                            <td className="py-4 pr-4 font-medium text-slate-800">{formatVnd(product.priceVnd)}</td>
                            <td className="py-4 pr-4 text-slate-600">{formatDate(product.updatedAt)}</td>
                            <td className="py-4 text-right">
                              <Button asChild variant="ghost" className="text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800">
                                <Link href={`${AI_PLACE_ROUTES.expertProducts}/${product.id}`}>
                                  Manage <ArrowRight className="ml-1" />
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <PaginationControls
                    page={productPage.metadata.page}
                    hasNext={productPage.metadata.hasNext}
                    hasPrevious={productPage.metadata.hasPrevious}
                    totalElements={productPage.metadata.totalElements}
                  />
                </>
              )
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function LifecycleGuide({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm shadow-slate-200/40">
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function ProductListLoading() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="grid grid-cols-5 gap-4 border-b border-slate-100 pb-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ))}
    </div>
  );
}

function ListError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-red-100 bg-red-50 p-6 text-red-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">We could not load your AI products.</p>
          <p className="mt-1 text-sm text-red-700">{message}</p>
        </div>
      </div>
      <Button variant="outline" onClick={onRetry}><RefreshCw /> Retry</Button>
    </div>
  );
}

function EmptyProducts() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Boxes /></div>
      <h2 className="mt-4 text-lg font-bold text-slate-900">No AI products yet</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Start with a draft, then add its product information and protected deliverables before publishing.</p>
      <Button asChild className="mt-5 bg-indigo-600 hover:bg-indigo-700">
        <Link href={`${AI_PLACE_ROUTES.expertProducts}/new`}><Plus /> Create draft</Link>
      </Button>
    </div>
  );
}

function PaginationControls({
  page,
  hasNext,
  hasPrevious,
  totalElements,
}: {
  page: number;
  hasNext: boolean;
  hasPrevious: boolean;
  totalElements: number;
}) {
  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <p>{totalElements} product{totalElements === 1 ? "" : "s"} total</p>
      <div className="flex gap-2">
        {hasPrevious ? (
          <Button asChild variant="outline"><Link href={`${AI_PLACE_ROUTES.expertProducts}?page=${Math.max(0, page - 1)}`}>Previous</Link></Button>
        ) : <Button variant="outline" disabled>Previous</Button>}
        <span className="flex items-center px-2 text-xs font-semibold text-slate-500">Page {page + 1}</span>
        {hasNext ? (
          <Button asChild variant="outline"><Link href={`${AI_PLACE_ROUTES.expertProducts}?page=${page + 1}`}>Next</Link></Button>
        ) : <Button variant="outline" disabled>Next</Button>}
      </div>
    </div>
  );
}
