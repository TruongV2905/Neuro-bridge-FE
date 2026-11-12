import { Star } from "lucide-react";

type ProductRatingSummaryProps = {
  averageScore?: number | null;
  ratingCount?: number | null;
  className?: string;
};

export function ProductRatingSummary({
  averageScore,
  ratingCount = 0,
  className = "",
}: ProductRatingSummaryProps) {
  if (!ratingCount || averageScore == null) {
    return <span className={`text-xs font-medium text-slate-500 ${className}`}>New</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold text-amber-700 ${className}`}>
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden />
      {averageScore.toFixed(1)} ({ratingCount} {ratingCount === 1 ? "rating" : "ratings"})
    </span>
  );
}
