"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type UseFormSetError } from "react-hook-form";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  PencilLine,
  RefreshCw,
  Rocket,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmActionDialog } from "@/components/dashboard/crud/ConfirmActionDialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AI_PLACE_ROUTES } from "@/features/ai-place/constants/routes";
import type { ExpertProductDetail, ProductAssetType } from "@/features/ai-place/types";
import {
  useDeleteAiProduct,
  useExpertProduct,
  usePublishAiProduct,
  useUnpublishAiProduct,
  useUpdateAiProduct,
} from "@/services/ai-available-product.service";
import { extractAiPlaceError, getAiPlaceErrorMessage } from "@/features/ai-place/utils/error";
import { AiProductStatusBadge } from "./components/AiProductStatusBadge";
import { StringTagInput } from "./components/StringTagInput";
import { updateAiProductSchema, type UpdateAiProductFormValues } from "./schemas/productSchemas";
import { formatDate, formatVnd } from "./utils/presentation";
import { PreviewManager } from "./components/PreviewManager";
import { ProtectedAssetsManager } from "./components/ProtectedAssetsManager";

const REQUIRED_ASSET_TYPES: ProductAssetType[] = [
  "SOURCE_CODE",
  "VIDEO",
  "DATASET",
  "DOCUMENT",
];

type ConfirmationAction = "delete" | "unpublish" | null;

export function ExpertAiProductDetailView({ productId }: { productId: string }) {
  const router = useRouter();
  const detailQuery = useExpertProduct(productId);
  const updateProduct = useUpdateAiProduct();
  const deleteProduct = useDeleteAiProduct();
  const publishProduct = usePublishAiProduct();
  const unpublishProduct = useUnpublishAiProduct();
  const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction>(null);
  const [lifecycleError, setLifecycleError] = useState<string | null>(null);
  const product = detailQuery.data?.result;
  const canEdit = product?.status !== "PUBLISHED";

  const form = useForm<UpdateAiProductFormValues>({
    resolver: zodResolver(updateAiProductSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryCode: "",
      technologies: [],
      aiCapabilities: [],
      priceVnd: undefined,
    },
  });

  useEffect(() => {
    if (!product) {
      return;
    }

    form.reset({
      name: product.name,
      description: product.description ?? "",
      categoryCode: product.categoryCode,
      technologies: product.technologies,
      aiCapabilities: product.aiCapabilities,
      priceVnd: product.priceVnd,
    });
  }, [form, product]);

  const assetMap = useMemo(
    () => new Map(product?.assets.map((asset) => [asset.assetType, asset])),
    [product?.assets],
  );
  const missingAssetTypes = REQUIRED_ASSET_TYPES.filter((assetType) => !assetMap.has(assetType));
  const hasDescription = Boolean(product?.description?.trim());
  const assetComplete =
    missingAssetTypes.length === 0 &&
    (product?.assets.length ?? 0) === REQUIRED_ASSET_TYPES.length;
  const canAttemptPublish = product?.status === "DRAFT" || product?.status === "UNPUBLISHED";
  const canDelete = product?.status === "DRAFT" && !product.firstPublishedAt;

  const handleUpdate = async (values: UpdateAiProductFormValues) => {
    if (!product) {
      return;
    }

    try {
      await updateProduct.mutateAsync({
        productId: product.id,
        request: {
          name: values.name.trim(),
          description: values.description.trim() || null,
          categoryCode: values.categoryCode.trim(),
          technologies: values.technologies,
          aiCapabilities: values.aiCapabilities,
          priceVnd: values.priceVnd,
        },
      });
      toast.success("AI product information saved.");
      await detailQuery.refetch();
    } catch (error) {
      applyUpdateFieldErrors(error, form.setError);
      toast.error(getAiPlaceErrorMessage(error));
      await refetchWhenStateChanged(error, detailQuery.refetch);
    }
  };

  const handlePublish = async () => {
    if (!product) {
      return;
    }

    setLifecycleError(null);

    try {
      await publishProduct.mutateAsync(product.id);
      toast.success(product.status === "UNPUBLISHED" ? "AI product republished." : "AI product published.");
      await detailQuery.refetch();
    } catch (error) {
      const extracted = extractAiPlaceError(error);
      const message = getAiPlaceErrorMessage(error);

      if (extracted?.code === "REQUIRED_DELIVERABLES_MISSING" || extracted?.code === "VALIDATION_ERROR") {
        setLifecycleError(message);
      }

      toast.error(message);
      await refetchWhenStateChanged(error, detailQuery.refetch);
    }
  };

  const handleUnpublish = async () => {
    if (!product) {
      return;
    }

    try {
      await unpublishProduct.mutateAsync(product.id);
      toast.success("AI product unpublished. Existing buyer access is unchanged.");
      setConfirmationAction(null);
      await detailQuery.refetch();
    } catch (error) {
      toast.error(getAiPlaceErrorMessage(error));
      await refetchWhenStateChanged(error, detailQuery.refetch);
    }
  };

  const handleDelete = async () => {
    if (!product) {
      return;
    }

    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success("Draft AI product deleted.");
      router.replace(AI_PLACE_ROUTES.expertProducts);
    } catch (error) {
      toast.error(getAiPlaceErrorMessage(error));
      await refetchWhenStateChanged(error, detailQuery.refetch);
    }
  };

  if (detailQuery.isLoading) {
    return <DetailLoading />;
  }

  if (detailQuery.isError || !product) {
    return (
      <ProductPageError
        message={detailQuery.isError ? getAiPlaceErrorMessage(detailQuery.error) : "This AI product could not be found."}
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const confirmLoading = deleteProduct.isPending || unpublishProduct.isPending;

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <Button asChild variant="ghost" className="px-0 text-slate-600 hover:bg-transparent hover:text-slate-900">
          <Link href={AI_PLACE_ROUTES.expertProducts}><ArrowLeft /> Back to My AI Products</Link>
        </Button>

        <section className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/50 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <AiProductStatusBadge status={product.status} />
              {product.firstPublishedAt ? <span className="text-xs font-medium text-slate-500">First published {formatDate(product.firstPublishedAt)}</span> : null}
            </div>
            <h1 className="mt-3 break-words text-3xl font-extrabold tracking-tight text-slate-950">{product.name}</h1>
            <p className="mt-2 break-all font-mono text-xs text-slate-400">Product ID: {product.id}</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {canAttemptPublish ? (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={!hasDescription || !assetComplete || publishProduct.isPending}
                onClick={() => void handlePublish()}
              >
                {publishProduct.isPending ? <LoaderCircle className="animate-spin" /> : <Rocket />}
                {product.status === "UNPUBLISHED" ? "Republish" : "Publish"}
              </Button>
            ) : null}
            {product.status === "PUBLISHED" ? (
              <Button variant="outline" disabled={unpublishProduct.isPending} onClick={() => setConfirmationAction("unpublish")}>
                <ShieldAlert /> Unpublish
              </Button>
            ) : null}
            {canDelete ? (
              <Button variant="destructive" disabled={deleteProduct.isPending} onClick={() => setConfirmationAction("delete")}>
                <Trash2 /> Delete draft
              </Button>
            ) : null}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
          <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-600"><PencilLine className="h-5 w-5" /><CardTitle className="text-xl text-slate-950">Product information</CardTitle></div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {canEdit ? "Keep product information accurate before publishing." : "This product is published. Unpublish it before editing product information."}
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <form className="space-y-6" onSubmit={form.handleSubmit(handleUpdate)} noValidate>
                <FieldGroup>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field data-invalid={Boolean(form.formState.errors.name)}>
                      <FieldLabel htmlFor="ai-product-name">Name</FieldLabel>
                      <Input id="ai-product-name" disabled={!canEdit} aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
                      <FieldError errors={[form.formState.errors.name]} />
                    </Field>
                    <Field data-invalid={Boolean(form.formState.errors.categoryCode)}>
                      <FieldLabel htmlFor="ai-product-category">Category code</FieldLabel>
                      <Input id="ai-product-category" disabled={!canEdit} aria-invalid={Boolean(form.formState.errors.categoryCode)} {...form.register("categoryCode")} />
                      <FieldError errors={[form.formState.errors.categoryCode]} />
                    </Field>
                  </div>

                  <Field data-invalid={Boolean(form.formState.errors.description)}>
                    <FieldLabel htmlFor="ai-product-description">Description</FieldLabel>
                    <Textarea id="ai-product-description" disabled={!canEdit} placeholder="Describe the product, its intended use, and what a buyer receives." aria-invalid={Boolean(form.formState.errors.description)} {...form.register("description")} />
                    <FieldDescription>A nonblank description is required before publishing.</FieldDescription>
                    <FieldError errors={[form.formState.errors.description]} />
                  </Field>

                  <Field data-invalid={Boolean(form.formState.errors.priceVnd)}>
                    <FieldLabel htmlFor="ai-product-price">Price (VND)</FieldLabel>
                    <Input id="ai-product-price" type="number" min="1" step="1" inputMode="numeric" disabled={!canEdit} aria-invalid={Boolean(form.formState.errors.priceVnd)} {...form.register("priceVnd", { valueAsNumber: true })} />
                    <FieldError errors={[form.formState.errors.priceVnd]} />
                  </Field>

                  <Controller
                    name="technologies"
                    control={form.control}
                    render={({ field }) => (
                      <Field data-invalid={Boolean(form.formState.errors.technologies)}>
                        <FieldLabel>Technologies</FieldLabel>
                        <StringTagInput id="ai-product-technologies" value={field.value} onChange={field.onChange} disabled={!canEdit} placeholder="e.g. Python" />
                        <FieldError errors={[form.formState.errors.technologies]} />
                      </Field>
                    )}
                  />

                  <Controller
                    name="aiCapabilities"
                    control={form.control}
                    render={({ field }) => (
                      <Field data-invalid={Boolean(form.formState.errors.aiCapabilities)}>
                        <FieldLabel>AI capabilities</FieldLabel>
                        <StringTagInput id="ai-product-capabilities" value={field.value} onChange={field.onChange} disabled={!canEdit} placeholder="e.g. Text classification" />
                        <FieldError errors={[form.formState.errors.aiCapabilities]} />
                      </Field>
                    )}
                  />
                </FieldGroup>

                {canEdit ? (
                  <div className="flex justify-end border-t border-slate-100 pt-5">
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={updateProduct.isPending || !form.formState.isDirty}>
                      {updateProduct.isPending ? <LoaderCircle className="animate-spin" /> : null}
                      Save product information
                    </Button>
                  </div>
                ) : null}
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <OverviewCard product={product} />
            <PreviewManager product={product} onMetadataChanged={detailQuery.refetch} />
            <ProtectedAssetsManager product={product} onMetadataChanged={detailQuery.refetch} />
            <LifecycleCard
              product={product}
              assetComplete={assetComplete}
              hasDescription={hasDescription}
              lifecycleError={lifecycleError}
              canDelete={canDelete}
            />
          </div>
        </section>
      </div>

      <ConfirmActionDialog
        open={confirmationAction !== null}
        loading={confirmLoading}
        variant={confirmationAction === "delete" ? "danger" : "default"}
        title={confirmationAction === "delete" ? "Delete this draft?" : "Unpublish this AI product?"}
        description={
          confirmationAction === "delete"
            ? "This permanently deletes a never-published draft. This action cannot be undone."
            : "This hides the product from the marketplace. Existing buyer entitlement remains active, and protected assets remain locked after first publication."
        }
        confirmText={confirmationAction === "delete" ? "Delete draft" : "Unpublish"}
        onOpenChange={(open) => { if (!open && !confirmLoading) setConfirmationAction(null); }}
        onConfirm={confirmationAction === "delete" ? handleDelete : handleUnpublish}
      />
    </main>
  );
}

function OverviewCard({ product }: { product: ExpertProductDetail }) {
  return (
    <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
      <CardHeader><CardTitle className="text-base text-slate-900">Overview</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <OverviewRow label="Category" value={product.categoryCode} />
        <OverviewRow label="Price" value={formatVnd(product.priceVnd)} />
        <OverviewRow label="Created" value={formatDate(product.createdAt)} />
        <OverviewRow label="Updated" value={formatDate(product.updatedAt)} />
        <OverviewRow label="Last published" value={formatDate(product.lastPublishedAt)} />
      </CardContent>
    </Card>
  );
}

function OverviewRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4"><span className="text-slate-500">{label}</span><span className="text-right font-medium text-slate-800">{value}</span></div>;
}

function LifecycleCard({
  product,
  assetComplete,
  hasDescription,
  lifecycleError,
  canDelete,
}: {
  product: ExpertProductDetail;
  assetComplete: boolean;
  hasDescription: boolean;
  lifecycleError: string | null;
  canDelete: boolean;
}) {
  const readiness = [
    { label: "Description", ready: hasDescription },
    ...REQUIRED_ASSET_TYPES.map((assetType) => ({ label: assetType.replaceAll("_", " "), ready: assetComplete || product.assets.some((asset) => asset.assetType === assetType) })),
  ];
  const missingRequirements = readiness.filter((item) => !item.ready).map((item) => item.label.toLowerCase());

  return (
    <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
      <CardHeader><div className="flex items-center gap-2"><Rocket className="h-4 w-4 text-indigo-600" /><CardTitle className="text-base text-slate-900">Lifecycle / publishing</CardTitle></div></CardHeader>
      <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
        {product.status === "PUBLISHED" ? <p>This product is live. Unpublish it to edit basic product information or preview content.</p> : <p>{product.status === "UNPUBLISHED" ? "This product is hidden. It can be updated and republished when ready." : "Complete the publish requirements, then publish this draft."}</p>}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"><p className="mb-2 text-xs font-bold tracking-wide text-slate-700">Publish readiness</p><div className="space-y-1.5">{readiness.map((item) => <p key={item.label} className={item.ready ? "flex items-center gap-2 text-xs text-emerald-700" : "flex items-center gap-2 text-xs text-slate-500"}>{item.ready ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="inline-block h-3.5 w-3.5 rounded-full border border-slate-300" />}{item.label}</p>)}</div></div>
        {!product.firstPublishedAt && canDelete ? <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">Only this never-published Draft can be deleted.</p> : null}
        {product.status !== "PUBLISHED" && missingRequirements.length > 0 ? <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">Before publishing, add: {missingRequirements.join(", ")}.</p> : null}
        {lifecycleError ? <p className="rounded-xl bg-red-50 px-3 py-2 text-xs leading-5 text-red-800">{lifecycleError}</p> : null}
      </CardContent>
    </Card>
  );
}

function DetailLoading() {
  return <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10"><div className="mx-auto max-w-6xl space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-40 rounded-3xl" /><div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-[620px] rounded-3xl" /><div className="space-y-6"><Skeleton className="h-48 rounded-3xl" /><Skeleton className="h-60 rounded-3xl" /></div></div></div></main>;
}

function ProductPageError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10"><div className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-red-100 bg-white p-7 shadow-sm"><div className="flex gap-3 text-red-800"><AlertCircle className="mt-0.5" /><div><h1 className="font-bold">AI product unavailable</h1><p className="mt-1 text-sm leading-6 text-red-700">{message}</p></div></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={onRetry}><RefreshCw /> Retry</Button><Button asChild><Link href={AI_PLACE_ROUTES.expertProducts}>Back to products</Link></Button></div></div></main>;
}

function applyUpdateFieldErrors(error: unknown, setError: UseFormSetError<UpdateAiProductFormValues>) {
  const fieldErrors = extractAiPlaceError(error)?.fieldErrors;
  if (!fieldErrors) return;
  const fields: Array<keyof UpdateAiProductFormValues> = ["name", "description", "categoryCode", "technologies", "aiCapabilities", "priceVnd"];
  fields.forEach((field) => {
    const message = fieldErrors[field]?.[0];
    if (message) setError(field, { type: "server", message });
  });
}

async function refetchWhenStateChanged(error: unknown, refetch: () => Promise<unknown>) {
  const code = extractAiPlaceError(error)?.code;
  if (
    code === "INVALID_PRODUCT_STATE" ||
    code === "PRODUCT_NOT_FOUND" ||
    code === "PRODUCT_NOT_OWNED"
  ) {
    await refetch();
  }
}
