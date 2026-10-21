# 1. Executive Summary

Phase 1 implemented the AI Place frontend foundation on `feature/available-ai-product` without adding a second API client, state library, proxy, environment variable, or Supabase upload behavior.

The implementation adds source-accurate AI Available DTOs, four service modules using the existing `configs/api.ts` Axios instance, structured React Query keys, a typed error-envelope utility, canonical `/ai-place` route shells, and separate Expert dashboard route shells. The previous `/availableAI` route was removed and all active internal navigation now targets `/ai-place`.

The backend source is authoritative: all 25 controller endpoints are implemented under the Gateway-relative prefix `/ai-available/v1/ai-place`, protected by the existing Bearer JWT, and use the existing `{ code, message, result }` envelope. No request is issued at module initialization. No protected asset is uploaded, downloaded, or exposed through a public Supabase URL in this phase.

Source linting passes with pre-existing warnings only. A full production build could not complete in this execution environment because existing `next/font/google` imports cannot resolve `fonts.googleapis.com`; the standalone TypeScript invocation also retains nine pre-existing static-image declaration errors. Therefore, despite the implementation foundation being complete, the required build exit criterion is not proven here.

# 2. Backend Contract Source

The following current backend source was inspected and takes precedence over historic design documentation:

- `D:\FA2026\PRN232\BE\ai-available-service\Controllers\*.cs`
- `D:\FA2026\PRN232\BE\ai-available-service\Contracts\ProductContracts.cs`, `PurchaseContracts.cs`, and `RatingContracts.cs`
- `D:\FA2026\PRN232\BE\ai-available-service\Api\ApiEnvelope.cs`, `ApiError.cs`, `PageResponse.cs`, and `Pagination.cs`
- `D:\FA2026\PRN232\BE\ai-available-service\Program.cs`
- `D:\FA2026\PRN232\BE\PHASE4_API_INTEGRATION_CONTRACT.md`
- `D:\FA2026\PRN232\BE\PHASE8_FINAL_BACKEND_VALIDATION_REPORT.md`

Confirmed contract facts:

- Gateway base: `/api/ai-available`; frontend relative base: `/ai-available`.
- Service route base: `/v1/ai-place`; frontend service prefix: `/ai-available/v1/ai-place`.
- All AI Place business endpoints require a Bearer JWT. Marketplace endpoints are `CLIENT`-only in current controller source; they are not anonymous endpoints.
- Successful responses use `ApiEnvelope<T>` serialized as `{ code, message, result }`.
- Error responses use the same envelope with `result: { errorCode, fieldErrors?, details?, requestId? }`.
- Paging is zero-based with `page` default `0`, `size` default `10`, and `size` constrained to `1..50`. The exact response shape is `data` plus `metadata: { page, size, currentElements, totalElements, totalPages, hasNext, hasPrevious }`.
- Service Swagger JSON is `/v3/api-docs`; Gateway access is expected below `/api/ai-available`.

# 3. Endpoint Inventory

Every route below is relative to `/ai-available/v1/ai-place`. Every authenticated route can return `401 UNAUTHORIZED` or `403 FORBIDDEN` in addition to the stated business errors.

| Area / role | Method and route | Input | Success response | Success status | Relevant business errors |
|---|---|---|---|---|---|
| Expert product | `POST /expert/products` | body `CreateDraftProductRequest`: `name`, `categoryCode`, `priceVnd` | `OwnerProductDetailResponse` | 201 | `VALIDATION_ERROR` |
| Expert product | `GET /expert/products` | query `page`, `size` | `PageResponse<OwnerProductListItemResponse>` | 200 | `VALIDATION_ERROR` |
| Expert product | `GET /expert/products/{productId}` | `productId` path | `OwnerProductDetailResponse` | 200 | `PRODUCT_NOT_FOUND`, `PRODUCT_NOT_OWNED` |
| Expert product | `PUT /expert/products/{productId}` | path + full editable body `name`, `description`, `categoryCode`, `technologies`, `aiCapabilities`, `priceVnd` | `OwnerProductDetailResponse` | 200 | `PRODUCT_NOT_FOUND`, `PRODUCT_NOT_OWNED`, `INVALID_PRODUCT_STATE`, `VALIDATION_ERROR` |
| Expert product | `DELETE /expert/products/{productId}` | `productId` path | no response body | 204 | `PRODUCT_NOT_FOUND`, `PRODUCT_NOT_OWNED`, `INVALID_PRODUCT_STATE` |
| Expert product | `POST /expert/products/{productId}/publish` | `productId` path, no body | `LifecycleActionResponse` | 200 | `PRODUCT_NOT_FOUND`, `PRODUCT_NOT_OWNED`, `INVALID_PRODUCT_STATE`, `VALIDATION_ERROR`, `REQUIRED_DELIVERABLES_MISSING` |
| Expert product | `POST /expert/products/{productId}/unpublish` | `productId` path, no body | `LifecycleActionResponse` | 200 | `PRODUCT_NOT_FOUND`, `PRODUCT_NOT_OWNED`, `INVALID_PRODUCT_STATE` |
| Expert preview | `POST /expert/products/{productId}/preview/upload-authorizations` | path + `previewType`, `originalFilename`, `contentType`, `byteSize` | `SupabaseUploadAuthorizationResponse` | 200 | `PRODUCT_NOT_FOUND`, `PRODUCT_NOT_OWNED`, `INVALID_PRODUCT_STATE`, `VALIDATION_ERROR` |
| Expert preview | `PUT /expert/products/{productId}/preview` | path + `uploadToken`, optional `objectETag`, optional `clientObservedVideoDurationSeconds` | `PublicPreviewResponse` | 200 | `PRODUCT_NOT_FOUND`, `PRODUCT_NOT_OWNED`, `INVALID_PRODUCT_STATE`, `UPLOAD_METADATA_MISMATCH`, `MEDIA_INSPECTION_UNAVAILABLE`, `VALIDATION_ERROR` |
| Expert preview | `DELETE /expert/products/{productId}/preview` | `productId` path | no response body | 204 | `PRODUCT_NOT_FOUND`, `PRODUCT_NOT_OWNED`, `INVALID_PRODUCT_STATE` |
| Expert protected asset | `POST /expert/products/{productId}/assets/{assetType}/upload-authorizations` | path + `originalFilename`, `contentType`, `byteSize` | `SupabaseUploadAuthorizationResponse` | 200 | `PRODUCT_NOT_FOUND`, `PRODUCT_NOT_OWNED`, `DELIVERABLE_LOCKED`, `VALIDATION_ERROR` |
| Expert protected asset | `PUT /expert/products/{productId}/assets/{assetType}` | path + `uploadToken`, optional `objectETag` | `ProtectedAssetResponse` | 200 | `PRODUCT_NOT_FOUND`, `PRODUCT_NOT_OWNED`, `DELIVERABLE_LOCKED`, `UPLOAD_METADATA_MISMATCH`, `VALIDATION_ERROR` |
| Expert protected asset | `DELETE /expert/products/{productId}/assets/{assetType}` | paths | no response body | 204 | `PRODUCT_NOT_FOUND`, `PRODUCT_NOT_OWNED`, `DELIVERABLE_LOCKED` |
| Client marketplace | `GET /products` | `page`, `size`, optional `keyword`, `categoryCode`, `minPriceVnd`, `maxPriceVnd` | `PageResponse<MarketplaceProductListItemResponse>` | 200 | `VALIDATION_ERROR` |
| Client marketplace | `GET /products/{productId}` | `productId` path | `MarketplaceProductDetailResponse` | 200 | `PRODUCT_NOT_FOUND`, `PRODUCT_NOT_PUBLISHED` |
| Client rating read | `GET /products/{productId}/ratings` | path + `page`, `size` | `PageResponse<ProductRatingResponse>` | 200 | `PRODUCT_NOT_FOUND`, `PRODUCT_NOT_PUBLISHED`, `VALIDATION_ERROR` |
| Client rating read | `GET /products/{productId}/ratings/summary` | `productId` path | `ProductRatingSummaryResponse` | 200 | `PRODUCT_NOT_FOUND`, `PRODUCT_NOT_PUBLISHED` |
| Client payment | `POST /client/products/{productId}/purchases` | `productId` path, no body | `PurchaseSettlementResponse` | 200 | `PRODUCT_NOT_FOUND`, `PRODUCT_NOT_PUBLISHED`, `SELF_PURCHASE_NOT_ALLOWED`, `PURCHASE_ALREADY_OWNED`, `PAYMENT_INSUFFICIENT_BALANCE`, `PAYMENT_SERVICE_UNAVAILABLE` |
| Client payment | `POST /client/purchases/{purchaseId}/retry-payment` | `purchaseId` path, no body | `PurchaseSettlementResponse` | 200 | `PURCHASE_NOT_FOUND`, `PURCHASE_ALREADY_OWNED`, `PAYMENT_INSUFFICIENT_BALANCE`, `PAYMENT_SERVICE_UNAVAILABLE` |
| Client purchase read | `GET /client/purchases` | `page`, `size` | `PageResponse<PurchaseHistoryItemResponse>` | 200 | `VALIDATION_ERROR` |
| Client purchase read | `GET /client/purchases/{purchaseId}` | `purchaseId` path | `PurchaseDetailResponse` | 200 | `PURCHASE_NOT_FOUND` |
| Client download | `GET /client/purchases/{purchaseId}/products/{productId}/assets/{assetType}/download-access` | paths | `ProtectedDownloadAccessResponse` | 200 | `PURCHASE_NOT_FOUND`, `ENTITLEMENT_EXPIRED` |
| Client rating write | `POST /client/purchases/{purchaseId}/rating` | path + `score`, optional `reviewText` | `ProductRatingResponse` | 201 | `PURCHASE_NOT_FOUND`, `RATING_NOT_ALLOWED`, `RATING_ALREADY_EXISTS`, `VALIDATION_ERROR` |
| Client rating write | `PUT /client/purchases/{purchaseId}/rating` | path + `score`, optional `reviewText` | `ProductRatingResponse` | 200 | `PURCHASE_NOT_FOUND`, `RATING_NOT_ALLOWED`, `VALIDATION_ERROR` |
| Client rating write | `DELETE /client/purchases/{purchaseId}/rating` | `purchaseId` path | no response body | 204 | `PURCHASE_NOT_FOUND`, `RATING_NOT_ALLOWED` |

# 4. Types / Enums Added

`features/ai-place/types/index.ts` now models the controller DTOs and enums without inventing fields:

- Product lifecycle: `ProductStatus`, `PreviewType`, `ProductAssetType`, `ExpertProductListItem`, `ExpertProductDetail`, `MarketplaceProductListItem`, `MarketplaceProductDetail`, seller, preview, protected-asset, create/update, and lifecycle DTOs.
- Storage: authorization request/response, explicit `uploadToken`, `uploadUrl`, `uploadMethod`, `requiredHeaders`, expiry, preview confirmation, asset confirmation, and safe asset metadata.
- Purchases: `PurchaseStatus`, `PurchaseSettlement`, purchase history/detail, entitlement status/dates, settlement snapshot, and protected download access.
- Ratings: rating, summary, create/update request, and paged rating list type.
- Error payload: the current backend `ApiError` shape (`errorCode`, optional field errors/details/request ID).

Dates remain JSON strings and VND amounts remain JSON numbers, matching backend serialization. Existing `APIResponse<T>` and `PageResponse<T>` are reused rather than duplicated.

# 5. Service Modules Added

The following thin modules all import and use the existing `configs/api.ts` instance:

- `services/ai-available-product.service.ts`
  - Expert create/list/detail/update/delete/publish/unpublish.
  - Client marketplace browse/detail.
- `services/ai-available-storage.service.ts`
  - Preview and protected-asset authorization, confirmation, and deletion contract functions/mutations only.
  - No direct browser upload is implemented.
- `services/ai-available-purchase.service.ts`
  - Buy/retry, history/detail, and protected-download-access request.
- `services/ai-available-rating.service.ts`
  - Rating list/summary and purchase-rating create/update/delete.

All paths begin with the shared `AI_PLACE_API_BASE` constant: `/ai-available/v1/ai-place`. They use the existing Axios interceptor, so AI Available requests receive the current `Authorization: Bearer <accessToken>` header. No `localhost:8089`, API environment variable, proxy, or extra Axios instance was added.

# 6. Query Key Strategy

`features/ai-place/constants/query-keys.ts` adds stable structured keys below `['ai-place']`:

- Expert products: list with page params and per-product detail.
- Marketplace: browse list with exact query params, per-product detail, rating-list prefix, list page, and summary.
- Purchases: history with page params and per-purchase detail.

Mutation invalidation is narrow:

- Expert product changes invalidate Expert product keys; lifecycle changes also invalidate the AI Place marketplace family because visibility can change.
- Preview/asset confirmation and deletion invalidate the affected Expert product/list only.
- Purchase settlement invalidates AI Place purchase keys only.
- Rating changes invalidate that purchase detail and the known product's ratings prefix/summary/list.

# 7. Error Mapping

`features/ai-place/utils/error.ts` adds a typed known-code union, Axios-envelope extractor, server-message fallback, default display messages, and field-error support. It covers the required codes:

- `PRODUCT_NOT_FOUND`, `INVALID_PRODUCT_STATE`, `DELIVERABLE_LOCKED`
- `PURCHASE_ALREADY_OWNED`, `PURCHASE_NOT_FOUND`
- `PAYMENT_INSUFFICIENT_BALANCE`, `PAYMENT_SERVICE_UNAVAILABLE`
- `ENTITLEMENT_EXPIRED`, `RATING_NOT_ALLOWED`, `VALIDATION_ERROR`
- `UPLOAD_METADATA_MISMATCH`, `MEDIA_INSPECTION_UNAVAILABLE`

It also covers current-source adjacent codes such as `PRODUCT_NOT_OWNED`, `PRODUCT_NOT_PUBLISHED`, `REQUIRED_DELIVERABLES_MISSING`, `RATING_ALREADY_EXISTS`, `SELF_PURCHASE_NOT_ALLOWED`, `UNAUTHORIZED`, and `FORBIDDEN`. It does not replace global Axios refresh handling; future screens can call it for consistent AI Place UX.

# 8. API / Auth Integration

The existing `configs/api.ts` setup remains unchanged:

- Base URL comes from `NEXT_PUBLIC_API_BASE_URL`.
- Request interceptor reads `accessToken` from local storage and sends a Bearer header.
- Existing refresh/token/Redux flows are reused; no auth provider or token store was added.

The known, unrelated refresh/logout inconsistency remains documented from Phase 0: refresh failure clears `token`/`refreshToken` and redirects to `/auth/login`, while normal login/logout use `accessToken` and `/login`. It does not prevent AI Place requests from receiving the same interceptor header, so it was not changed in this phase.

# 9. Route Migration

Canonical routes now are:

| Audience | Route | Phase 1 status |
|---|---|---|
| Client/public shell | `/ai-place` | Added |
| Client/public detail shell | `/ai-place/[productId]` | Added |
| Expert product list shell | `/expert/dashboard/ai-place/products` | Added |
| Expert create shell | `/expert/dashboard/ai-place/products/new` | Added |
| Expert detail shell | `/expert/dashboard/ai-place/products/[productId]` | Added |

`app/(main)/availableAI/page.tsx` was removed. Homepage card actions and the “View all AI solutions” CTA now navigate to `/ai-place`. A source scan excluding historical reports found no active `/availableAI` internal link. No legacy redirect was introduced.

# 10. Client UI Foundation

`features/ai-place/components/AiPlaceMarketplaceFoundation.tsx` establishes a marketplace-oriented shell: AI Place identity, discovery copy, search/filter space, and an intentionally empty catalog foundation. `AiPlaceProductDetailFoundation.tsx` supplies the separate detail/read route shell.

Selected Client/public pattern: the dark, discovery-oriented public/main layout and marketplace spacing. Shared primitives reused: `Button`, `Card`, and `Input`. Intentionally not shared: Expert dashboard management panels, lifecycle controls, and any purchase-history navigation.

No static prototype record is presented as real backend product data, and no marketplace request/rendering is implemented until Phase 4.

# 11. Expert UI Foundation

`features/ai-place/expert/ExpertAiProductsFoundation.tsx` provides the Expert list/new/detail route shells. They use the existing Expert dashboard's light workspace background, page padding, headers, cards, action-button styling, and status language.

`components/layout/ClientSideBar.tsx` now adds the EXPERT-only **AI Products** navigation item pointing to `/expert/dashboard/ai-place/products`. No Client purchase item was added to the Expert menu.

Selected Expert pattern: the functional dashboard management layout used by Expert job-post and service pages. Shared primitives reused: dashboard page spacing, `Button`, `Card`, Lucide icons, and simple status guides. Intentionally not shared: public gradient marketplace cards, mock review dialog, local bookmark state, and client purchase actions.

# 12. Storage Contract Foundation

Phase 1 models only this sequence:

```text
AI Place frontend -> AI Available authorization -> returned URL/headers/upload token
                  -> direct browser upload (Phase 3)
                  -> AI Available confirmation with upload token (Phase 3)
```

The storage module contains no uploader, no Supabase SDK call, no bucket/key construction, and no `getPublicUrl`. It deliberately does not import any Workspace Submission helper, `submission-files` path logic, `uploadPublicStorageObject`, or public URL persistence. Protected download access is modeled as a one-time backend request returning a temporary URL; it is not opened or persisted in this phase.

# 13. Mock / Legacy Status

The route-level `/availableAI` dependency was removed. The following legacy prototype files remain intentionally because the homepage still uses their mock-derived visual cards until Phase 4 replaces marketplace rendering:

- `features/available-ai/components/AvailableAICard.tsx`
- `features/available-ai/components/AvailableAIPage.tsx`
- `features/available-ai/components/AvailableAICardDetail.tsx`
- `features/available-ai/mocks/availableAIData.ts`
- `features/available-ai/types.ts`
- `features/homepage/data/homepage.ts`
- `features/homepage/components/SolutionSection.tsx`
- `types/homepage.ts`

The homepage’s links now use `/ai-place`; only temporary visual data remains under `features/available-ai/`. No duplicate backend implementation was created. Removal/migration of this prototype is deferred to the Phase 4/Phase 7 replacement and cleanup work.

# 14. Files Added / Changed

## Added

- `features/ai-place/types/index.ts`
- `features/ai-place/constants/query-keys.ts`
- `features/ai-place/constants/routes.ts`
- `features/ai-place/utils/error.ts`
- `features/ai-place/index.ts`
- `features/ai-place/components/AiPlaceMarketplaceFoundation.tsx`
- `features/ai-place/components/AiPlaceProductDetailFoundation.tsx`
- `features/ai-place/expert/ExpertAiProductsFoundation.tsx`
- `services/ai-available-product.service.ts`
- `services/ai-available-storage.service.ts`
- `services/ai-available-purchase.service.ts`
- `services/ai-available-rating.service.ts`
- `app/(main)/ai-place/page.tsx`
- `app/(main)/ai-place/[productId]/page.tsx`
- `app/expert/dashboard/ai-place/products/page.tsx`
- `app/expert/dashboard/ai-place/products/new/page.tsx`
- `app/expert/dashboard/ai-place/products/[productId]/page.tsx`

## Changed

- `components/layout/ClientSideBar.tsx`: adds Expert **AI Products** navigation.
- `features/homepage/components/SolutionSection.tsx`: changes all marketplace route links to `/ai-place`.
- `package-lock.json`: restores the platform SWC package record needed by Next 16's lockfile validator; no package dependency or version was changed.

## Removed

- `app/(main)/availableAI/page.tsx`: removes the old canonical marketplace route rather than leaving redirect debt.

Existing untracked Phase 0/Phase 2 audit files were preserved and not treated as Phase 1 implementation files.

# 15. Build Results

| Command | Result | Details |
|---|---|---|
| `npm install` | PASS | Existing dependencies were already current; no new dependency was installed. Npm reported its existing audit findings. |
| `npm run lint` | PASS with warnings | 0 ESLint errors. It reports 41 existing warnings in unrelated source; no warning is in the added AI Place code. |
| `npx --no-install tsc --noEmit` | BLOCKED by existing project errors | Nine pre-existing static image-import declaration errors in auth/homepage files (`*.png` imports). No error referenced an AI Place file. This command is not a package script. |
| `npm run build -- --webpack` | BLOCKED by environment | Next reached optimized-build compilation but failed after DNS resolution of the repository's existing `next/font/google` imports to `fonts.googleapis.com`, then reported an `.next/types` `EPERM` after the failed compile. |
| `npm run build` | NOT PROVEN | After correcting the stale SWC lockfile record, Turbopack started the optimized build but the task runner did not return a completed result before termination/left its generated build lock. The existing Google-font DNS blocker remains the independently reproduced build blocker. |

No application-source build failure attributable to AI Place code was reported. The generated `.next` output is ignored and was not kept as a source change.

# 16. Known Deferred Items

- Expert product list/create/edit/detail/delete/publish/unpublish UI and mutations: Phase 2.
- Browser-direct preview/protected asset upload, progress, confirmation UI, and permanent deliverable lock UX: Phase 3.
- Backend marketplace querying, filter UI, cards, and real detail display: Phase 4.
- Buy/retry, purchase history/detail, temporary download opening, and entitlement UX: Phase 5.
- Rating form and mutation UX: Phase 6.
- Legacy `features/available-ai` mock visual replacement/removal: Phase 4/Phase 7.
- Existing auth refresh/logout inconsistency and pre-existing lint/typecheck warnings: outside Phase 1 unless separately authorized.
- Re-running build in an environment that can resolve the existing Google Fonts requests (and permits normal `.next` type-directory creation).

# 17. Phase 2 Readiness

The contract, DTO, service, query, error, route, and role-specific UI foundations are ready for Phase 2 product-management implementation. Phase 2 can use `useExpertProducts`, `useExpertProduct`, and product lifecycle mutations without guessing endpoint paths or response shapes.

**Phase 1 decision: FAIL for the strict exit criteria in this environment, solely because the required production build did not complete.** The AI Place implementation itself is foundation-ready; rerun `npm run build` with available Google-font network access (or the repository's approved offline-font setup) before promoting the phase to PASS.
