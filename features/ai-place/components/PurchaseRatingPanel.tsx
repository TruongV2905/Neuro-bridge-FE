"use client";

import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ProductRating } from "@/features/ai-place/types";
import { getAiPlaceErrorMessage } from "@/features/ai-place/utils/error";
import {
  useCreatePurchaseRating,
  useDeletePurchaseRating,
  useUpdatePurchaseRating,
} from "@/services/ai-available-rating.service";

type PurchaseRatingPanelProps = {
  purchaseId: string;
  productId: string;
  rating?: ProductRating;
};

export function PurchaseRatingPanel({
  purchaseId,
  productId,
  rating,
}: PurchaseRatingPanelProps) {
  return (
    <PurchaseRatingForm
      key={rating?.ratingId ?? "new-rating"}
      purchaseId={purchaseId}
      productId={productId}
      rating={rating}
    />
  );
}

function PurchaseRatingForm({
  purchaseId,
  productId,
  rating,
}: PurchaseRatingPanelProps) {
  const [score, setScore] = useState<number>(rating?.score ?? 0);
  const [reviewText, setReviewText] = useState(rating?.reviewText ?? "");
  const createMutation = useCreatePurchaseRating();
  const updateMutation = useUpdatePurchaseRating();
  const deleteMutation = useDeletePurchaseRating();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const saveRating = () => {
    if (score < 1 || score > 5) {
      toast.error("Select a whole-star rating from 1 to 5.");
      return;
    }

    const request = {
      score,
      ...(reviewText.trim() ? { reviewText: reviewText.trim() } : {}),
    };
    const mutation = rating ? updateMutation : createMutation;

    mutation.mutate(
      { purchaseId, productId, request },
      {
        onSuccess: () => {
          toast.success(rating ? "Your rating was updated." : "Your rating was saved.");
        },
        onError: (error) => toast.error(getAiPlaceErrorMessage(error)),
      },
    );
  };

  const deleteRating = () => {
    deleteMutation.mutate(
      { purchaseId, productId },
      {
        onSuccess: () => toast.success("Your rating was removed."),
        onError: (error) => toast.error(getAiPlaceErrorMessage(error)),
      },
    );
  };

  return (
    <section
      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60"
      aria-labelledby="purchase-rating-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="purchase-rating-title" className="text-lg font-extrabold text-slate-950">
            Your rating
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {rating
              ? "Update or remove the one active rating attached to this purchase."
              : "Rate this purchased AI product from 1 to 5 whole stars."}
          </p>
        </div>
        {rating ? (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-800 ring-1 ring-amber-200">
            {rating.score}/5
          </span>
        ) : null}
      </div>

      <div className="mt-5" role="radiogroup" aria-label="Product rating">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((value) => {
            const selected = score === value;

            return (
              <Button
                key={value}
                type="button"
                variant="outline"
                onClick={() => setScore(value)}
                disabled={isSaving || deleteMutation.isPending}
                aria-pressed={selected}
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                className={
                  selected
                    ? "h-11 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                    : "h-11 border-slate-200 text-slate-600 hover:bg-slate-50"
                }
              >
                <Star
                  className={`h-4 w-4 ${selected ? "fill-current" : ""}`}
                  aria-hidden="true"
                />
                {value}
              </Button>
            );
          })}
        </div>
      </div>

      <label className="mt-5 grid gap-1.5 text-sm font-semibold text-slate-700">
        <span>Review (optional)</span>
        <Textarea
          value={reviewText}
          onChange={(event) => setReviewText(event.target.value)}
          disabled={isSaving || deleteMutation.isPending}
          placeholder="Share concise feedback about this product"
          className="min-h-24 resize-y rounded-xl border-slate-200"
        />
      </label>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={saveRating}
          disabled={isSaving || deleteMutation.isPending}
          className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {isSaving ? "Saving…" : rating ? "Update rating" : "Save rating"}
        </Button>
        {rating ? (
          <Button
            type="button"
            variant="outline"
            onClick={deleteRating}
            disabled={isSaving || deleteMutation.isPending}
            className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
          >
            <Trash2 />
            {deleteMutation.isPending ? "Removing…" : "Remove rating"}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
