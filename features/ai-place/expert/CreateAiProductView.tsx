"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AI_PLACE_ROUTES } from "@/features/ai-place/constants/routes";
import { createAiProductSchema, type CreateAiProductFormValues } from "./schemas/productSchemas";
import { extractAiPlaceError, getAiPlaceErrorMessage } from "@/features/ai-place/utils/error";
import { useCreateAiProduct } from "@/services/ai-available-product.service";

export function CreateAiProductView() {
  const router = useRouter();
  const createProduct = useCreateAiProduct();
  const form = useForm<CreateAiProductFormValues>({
    resolver: zodResolver(createAiProductSchema),
    defaultValues: { name: "", categoryCode: "", priceVnd: undefined },
  });

  const onSubmit = async (values: CreateAiProductFormValues) => {
    try {
      const response = await createProduct.mutateAsync({
        name: values.name.trim(),
        categoryCode: values.categoryCode.trim(),
        priceVnd: values.priceVnd,
      });

      toast.success("Draft AI product created.");
      router.replace(`${AI_PLACE_ROUTES.expertProducts}/${response.result.id}`);
    } catch (error) {
      applyFieldErrors(error, form.setError);
      toast.error(getAiPlaceErrorMessage(error));
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button asChild variant="ghost" className="px-0 text-slate-600 hover:bg-transparent hover:text-slate-900">
          <Link href={AI_PLACE_ROUTES.expertProducts}><ArrowLeft /> Back to My AI Products</Link>
        </Button>

        <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
          <CardHeader>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Sparkles /></div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">AI Place / Draft</p>
            <CardTitle className="mt-1 text-2xl text-slate-950">Create AI Product</CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-500">Start with the essentials. Product information, preview, and deliverables are managed after the draft is created.</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FieldGroup>
                <Field data-invalid={Boolean(form.formState.errors.name)}>
                  <FieldLabel htmlFor="ai-product-name">Name</FieldLabel>
                  <Input id="ai-product-name" placeholder="e.g. Clinical Note Classifier" aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
                  <FieldError errors={[form.formState.errors.name]} />
                </Field>

                <Field data-invalid={Boolean(form.formState.errors.categoryCode)}>
                  <FieldLabel htmlFor="ai-product-category">Category code</FieldLabel>
                  <Input id="ai-product-category" placeholder="e.g. HEALTHCARE_NLP" aria-invalid={Boolean(form.formState.errors.categoryCode)} {...form.register("categoryCode")} />
                  <FieldDescription>Use the backend-recognized category code for this product.</FieldDescription>
                  <FieldError errors={[form.formState.errors.categoryCode]} />
                </Field>

                <Field data-invalid={Boolean(form.formState.errors.priceVnd)}>
                  <FieldLabel htmlFor="ai-product-price">Price (VND)</FieldLabel>
                  <Input id="ai-product-price" type="number" min="1" step="1" inputMode="numeric" placeholder="0" aria-invalid={Boolean(form.formState.errors.priceVnd)} {...form.register("priceVnd", { valueAsNumber: true })} />
                  <FieldDescription>Use a positive whole-VND amount.</FieldDescription>
                  <FieldError errors={[form.formState.errors.priceVnd]} />
                </Field>
              </FieldGroup>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" disabled={createProduct.isPending} asChild>
                  <Link href={AI_PLACE_ROUTES.expertProducts}>Cancel</Link>
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={createProduct.isPending}>
                  {createProduct.isPending ? <LoaderCircle className="animate-spin" /> : null}
                  Create draft
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function applyFieldErrors(
  error: unknown,
  setError: ReturnType<typeof useForm<CreateAiProductFormValues>>["setError"],
) {
  const fieldErrors = extractAiPlaceError(error)?.fieldErrors;

  if (!fieldErrors) {
    return;
  }

  (Object.keys(fieldErrors) as Array<keyof CreateAiProductFormValues>).forEach((field) => {
    const message = fieldErrors[field]?.[0];
    if (message) {
      setError(field, { type: "server", message });
    }
  });
}
