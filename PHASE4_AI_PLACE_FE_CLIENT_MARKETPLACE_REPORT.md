# 1. Executive Summary

Phase 4 replaces the AI Place marketplace and product-detail placeholders with live React Query views backed by the current AI Available marketplace API. The implementation preserves `/ai-place` and `/ai-place/[productId]`, adds the smallest Client-sidebar entry, and deliberately does not add any purchase, entitlement, download, wallet, or rating-mutation behavior.

# 2. Backend Marketplace Contract

The current marketplace controller is authenticated `ClientOnly`; it is not anonymous or Expert-browsable. It exposes:

| Capability | Endpoint | Contract |
| --- | --- | --- |
| Browse published products | `GET /v1/ai-place/products` | `page`, `size`, optional `keyword`, `categoryCode`, `minPriceVnd`, `maxPriceVnd` |
| Published product detail | `GET /v1/ai-place/products/{productId}` | Published product only |
| Rating summary | `GET /v1/ai-place/products/{productId}/ratings/summary` | Separate Phase 5/6-adjacent endpoint; not called in Phase 4 |

The server filters only `PUBLISHED` products, performs case-insensitive keyword matching against product name, matches category code exactly, validates nonnegative whole-VND price bounds, and sorts newest publication first. Pagination is zero-based with a maximum page size of 50. There is no category-discovery or marketplace sort endpoint.

List DTOs contain product metadata, technologies, capabilities, temporary preview access, and publication date. They do not contain description, seller, ownership, purchase, or rating data. Detail adds description and the seller snapshot. No frontend N+1 seller lookup is made.

# 3. Files Changed

- `features/ai-place/components/AiPlaceMarketplaceFoundation.tsx`
- `features/ai-place/components/AiPlaceProductDetailFoundation.tsx`
- `features/ai-place/components/MarketplacePreview.tsx`
- `components/layout/ClientSideBar.tsx`
- `PHASE4_AI_PLACE_FE_CLIENT_MARKETPLACE_REPORT.md`

# 4. Marketplace List

`/ai-place` now uses `useMarketplaceProducts` and the existing `aiPlaceQueryKeys.marketplace.list` cache identity. It renders the live backend page as responsive product cards with only actual list fields: name, category code, VND price, technologies, publication date, and preview. The browser never receives or renders protected-asset metadata.

# 5. Search / Filters / Paging

- Product-name keyword search is debounced by 350 ms.
- Category uses an authoritative free-text category-code input because no category discovery endpoint exists.
- Minimum/maximum price accept nonnegative whole VND and reject invalid ranges before a request.
- Applying filters and changing the keyword reset server pagination to page zero.
- Previous/Next controls use server metadata (`page`, `totalPages`, `hasPrevious`, `hasNext`); no client-side all-products pagination or fake sorting is used.

# 6. Product Cards

Cards contain live list-DTO fields only and link to `/ai-place/[productId]`. No mock description, seller, rating, lifecycle, ownership, protected asset, payment, or purchase data is displayed. Video elements use `preload="none"`; image previews use native lazy loading.

# 7. Product Detail

`/ai-place/[productId]` uses the existing live `useMarketplaceProduct` hook. It provides product name, description, category code, VND price, technologies, AI capabilities, seller display name, and published date. It has loading, unavailable/error, retry, and return-to-marketplace states. It contains no Expert product-management controls and no Buy CTA.

# 8. Preview Display

The shared preview component renders only the API-provided temporary `accessUrl`. Images render with a native image element because an arbitrary signed host cannot safely use the current unconfigured Next Image loader; videos render a native, non-preloaded player. Products without an access URL or preview render a fallback visual. No Supabase URL is constructed or persisted.

# 9. Seller Metadata

Seller display name is rendered only on the detail page from `MarketplaceProductDetail.seller`. The list contract has no seller field, so no per-card Identity request or fake seller data is added.

# 10. Rating Summary

Not rendered. The marketplace list/detail DTOs contain no rating fields. The separate summary endpoint is intentionally not added to Phase 4 because the requested read-only display scope is limited to fields returned by the current product/list DTOs. No rating mutation exists in the marketplace implementation.

# 11. Client Navigation

The existing Client dashboard sidebar now includes one **AI Place** entry to `/ai-place`. No Client layout redesign or routing policy was changed. The Expert navigation remains untouched.

# 12. Error / Loading / Empty States

The list has skeleton, safe error/retry, refreshing, no-published-products, and no-filter-results states. The detail page has independent skeleton and safe unavailable/retry states. Existing AI Place error mapping presents backend auth, permission, product, validation, and storage errors without raw Axios objects.

# 13. Security Review

- No Supabase credential, service role, storage bucket/key, upload token, protected asset, or private seller field is rendered.
- No `getPublicUrl()` or manually built Supabase URL is used by the marketplace.
- Temporary preview URLs are used only from the current API response and are not persisted in Redux, local storage, or query parameters.
- No JWT is placed in a URL.
- No purchase, entitlement, download, or rating-mutation API is invoked.

# 14. Performance Review

List cards use one server-side paginated API request and do not fetch detail or seller records. Detail makes one product-detail request. Query keys include all relevant page/filter parameters. Preview media is deferred where possible, and no React Query invalidation/refetch loop was added.

# 15. Regression Check

Expert AI Product, protected-asset, Wallet, project, and job-post source was not modified. The old mock marketplace components/data remain only because the homepage still depends on them; the canonical `/ai-place` routes no longer consume the mock data. Removing the homepage mock dependency remains deferred to Phase 7 as requested.

# 16. Lint / Type / Build

| Check | Result |
| --- | --- |
| Targeted Phase 4 ESLint | PASS, no warnings or errors |
| `npx --no-install tsc --noEmit` | PASS |
| `npm run lint` | PASS with 41 pre-existing warnings outside Phase 4 |
| `git diff --check` | PASS |
| `npm run build -- --webpack` | BLOCKED before application compilation by existing DNS failure for `fonts.googleapis.com` (`Archivo Black`, `Geist`, `Roboto`) |

# 17. Runtime Test Results

- Local frontend route `/ai-place` rendered successfully and showed the safe **Marketplace unavailable — Unauthenticated** state from the live Client-only contract.
- Local `/ai-place/not-a-product` rendered the detail unavailable/retry state safely.
- The Client dashboard’s mobile sidebar exposed the new **AI Place** link to `/ai-place`.
- The Gateway and AI Available service were not running in this execution environment, and no authenticated Client session/test data was supplied. Consequently, live products, search, category/price filtering, pagination, detail metadata, image/video preview, no-preview content, and unpublished direct-URL handling could not be executed end-to-end.

# 18. Deferred Phase 5 Items

Phase 5 can attach purchase CTA/state, entitlement state, protected download controls, and Client rating information/actions to the existing detail-page aside. No such capability was implemented or called in Phase 4.

# 19. Unresolved Blockers

- Start Gateway and AI Available at the expected local route and provide an authenticated CLIENT session plus published/unpublished test products for the runtime matrix.
- Restore DNS access to Google Fonts (or implement the repository-approved offline font setup) for a production-build result.

# 20. Phase 5 Readiness

The live Client marketplace and detail view are structurally ready for Phase 5 attachment points without exposing unavailable purchase behavior. Strict Phase 4 sign-off remains pending authenticated backend runtime validation.
