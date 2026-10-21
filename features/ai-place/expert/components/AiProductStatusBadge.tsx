import { Badge } from "@/components/ui/badge";
import type { ProductStatus } from "@/features/ai-place/types";

const STATUS_STYLES: Record<ProductStatus, string> = {
  DRAFT: "border-amber-200 bg-amber-50 text-amber-800",
  PUBLISHED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  UNPUBLISHED: "border-slate-200 bg-slate-100 text-slate-700",
};

const STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  UNPUBLISHED: "Unpublished",
};

export function AiProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
