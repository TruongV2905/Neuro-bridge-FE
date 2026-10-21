import type {
  BrowseMarketplaceProductsParams,
  PageParams,
} from "@/features/ai-place/types";

export const aiPlaceQueryKeys = {
  all: ["ai-place"] as const,
  expertProducts: {
    all: ["ai-place", "expert-products"] as const,
    list: (params: PageParams = {}) =>
      ["ai-place", "expert-products", "list", params] as const,
    detail: (productId: string) =>
      ["ai-place", "expert-products", "detail", productId] as const,
  },
  marketplace: {
    all: ["ai-place", "marketplace"] as const,
    list: (params: BrowseMarketplaceProductsParams = {}) =>
      ["ai-place", "marketplace", "list", params] as const,
    detail: (productId: string) =>
      ["ai-place", "marketplace", "detail", productId] as const,
    ratings: (productId: string) =>
      ["ai-place", "marketplace", "ratings", productId] as const,
    ratingList: (productId: string, params: PageParams = {}) =>
      ["ai-place", "marketplace", "ratings", productId, "list", params] as const,
    ratingSummary: (productId: string) =>
      ["ai-place", "marketplace", "ratings", productId, "summary"] as const,
  },
  purchases: {
    all: ["ai-place", "purchases"] as const,
    history: (params: PageParams = {}) =>
      ["ai-place", "purchases", "history", params] as const,
    detail: (purchaseId: string) =>
      ["ai-place", "purchases", "detail", purchaseId] as const,
  },
} as const;
