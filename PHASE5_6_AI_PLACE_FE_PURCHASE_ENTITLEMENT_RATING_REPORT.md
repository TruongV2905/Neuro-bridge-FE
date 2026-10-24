# Phase 5–6 — AI Place Client Purchase, Entitlement & Rating Report

Date: 2026-10-24  
Frontend branch: `feature/available-ai-product`  
Backend audited: `D:\FA2026\PRN232\BE\ai-available-service`

## 1. Backend Contract Audit

The AI Available service is the source of truth. Controllers are protected by
`[Authorize(Policy = "ClientOnly")]`; the policy requires an authenticated JWT
with role `CLIENT`. Every normal response is an `ApiEnvelope<T>`:
`{ code, message, result }`. Errors use the same envelope with
`result: { errorCode, fieldErrors?, details?, requestId? }`. The service's
Swagger/OpenAPI document is generated from these controllers at
`/v3/api-docs` (configured in `Program.cs`).

The frontend uses the existing gateway path `/ai-available` before the service
routes below; it does not call a service directly.

| Purpose | Method and service route | Request | Successful response | Relevant exact errors |
| --- | --- | --- | --- | --- |
| Marketplace product detail | `GET /v1/ai-place/products/{productId}` | Path UUID | `MarketplaceProductDetailResponse` | `PRODUCT_NOT_FOUND`, `PRODUCT_NOT_PUBLISHED` |
| Buy product | `POST /v1/ai-place/client/products/{productId}/purchases` | No body | `PurchaseSettlementResponse` (only `purchaseStatus: SUCCESS`) | `PURCHASE_ALREADY_OWNED`, `PAYMENT_INSUFFICIENT_BALANCE`, `WALLET_NOT_ACTIVE`, `PAYMENT_IN_PROGRESS`, `PAYMENT_IDEMPOTENCY_CONFLICT`, `PAYMENT_FAILED`, `PAYMENT_SERVICE_UNAVAILABLE`, `PRODUCT_NOT_PUBLISHED`, `SELLER_IDENTITY_INVALID` |
| Retry same purchase | `POST /v1/ai-place/client/purchases/{purchaseId}/retry-payment` | No body | `PurchaseSettlementResponse` (only `SUCCESS`) | Same payment/reconciliation errors plus `PURCHASE_NOT_FOUND`, `PURCHASE_ALREADY_OWNED` |
| Successful purchase history | `GET /v1/ai-place/client/purchases?page={page}&size={size}` | Zero-based page; size 1–50 | `PageResponse<PurchaseHistoryItemResponse>` | Standard authentication/validation errors |
| Successful purchase detail | `GET /v1/ai-place/client/purchases/{purchaseId}` | Path UUID | `PurchaseDetailResponse` | `PURCHASE_NOT_FOUND`, `FORBIDDEN` |
| Temporary protected download access | `GET /v1/ai-place/client/purchases/{purchaseId}/products/{productId}/assets/{assetType}/download-access` | `assetType`: `SOURCE_CODE`, `VIDEO`, `DATASET`, `DOCUMENT` | `ProtectedDownloadAccessResponse` with temporary `accessUrl` and `accessUrlExpiresAt` | `ENTITLEMENT_EXPIRED`, `PRODUCT_ASSET_NOT_FOUND`, `PURCHASE_NOT_FOUND`, `STORAGE_UNAVAILABLE` |
| Create rating | `POST /v1/ai-place/client/purchases/{purchaseId}/rating` | `{ score: 1..5, reviewText?: string }` | 201 `ProductRatingResponse` | `RATING_NOT_ALLOWED`, `RATING_ALREADY_EXISTS`, `PURCHASE_NOT_FOUND`, `VALIDATION_ERROR` |
| Update rating | `PUT /v1/ai-place/client/purchases/{purchaseId}/rating` | `{ score: 1..5, reviewText?: string }` | `ProductRatingResponse` | `RATING_NOT_ALLOWED`, `PURCHASE_NOT_FOUND`, `VALIDATION_ERROR` |
| Delete rating | `DELETE /v1/ai-place/client/purchases/{purchaseId}/rating` | None | 204 No Content | `RATING_NOT_ALLOWED`, `PURCHASE_NOT_FOUND` |

`PurchaseSettlementResponse` contains the frozen name/seller snapshot, gross
price, platform fee, expert net, payment transaction ID, `purchasedAt`, and
`accessExpiresAt`. `PurchaseDetailResponse` returns the same purchase
snapshot plus backend-computed `entitlementStatus`, `canDownload`, allowed
asset types, and nullable current `rating`.

### Contract mismatch / limitation

The marketplace detail DTO has no ownership or purchase field. More
importantly, `PurchaseReadApplicationService.ListAsync` filters to
`PurchaseStatus.Success`, and `GetDetailAsync` returns `PURCHASE_NOT_FOUND`
for pending purchases. There is no client endpoint to look up a pending
purchase by product or purchase ID.

The frontend therefore searches server-paginated **successful** history to
resolve ownership. It can hold and retry a pending purchase only while the
product-detail view remains mounted and the backend error provides a
`details.purchaseId`; this occurs for `PAYMENT_INSUFFICIENT_BALANCE` with
`purchaseStatus: PENDING_PAYMENT` and `retryAllowed: true`. Other pending or
reconciliation errors do not include a purchase ID. No frontend-only pending
record is persisted or fabricated.

This prevents a fully durable pending-purchase/history UX across navigation or
reload. A backend read DTO/endpoint for the current client's purchase state by
product (including `PENDING_PAYMENT`) is required to close this gap.

## 2. Files Changed

| File | Change |
| --- | --- |
| `features/ai-place/components/AiPlaceProductDetailFoundation.tsx` | Added buy, pending/retry, already-owned recovery, owned/expired presentation, wallet link, and safe ownership verification; explicitly treats a nullable ownership lookup as the normal not-owned Buy state. |
| `features/ai-place/components/AiPlaceMarketplaceFoundation.tsx` | Added the in-dashboard “My purchases” entry point; marketplace behavior otherwise remains intact. |
| `features/ai-place/components/ClientPurchaseHistoryView.tsx` | New server-paginated successful purchase history UI. |
| `features/ai-place/components/ClientPurchaseDetailView.tsx` | New snapshot, entitlement, four-slot protected-download, and rating detail UI. |
| `features/ai-place/components/PurchaseRatingPanel.tsx` | New accessible 1–5 integer rating create/update/delete controls; form reset is keyed to the server rating identity rather than synchronously setting state from an effect. |
| `app/client/dashboard/ai-place/purchases/page.tsx` | New client purchase-history route. |
| `app/client/dashboard/ai-place/purchases/[purchaseId]/page.tsx` | New client purchase-detail route. |
| `services/ai-available-purchase.service.ts` | Added backend-paginated successful-ownership lookup and focused buy/retry invalidations; lookup now has the explicit `Promise<PurchaseHistoryItem \| null>` contract required by TanStack Query. |
| `features/ai-place/constants/query-keys.ts` | Added the product-ownership lookup key. |
| `features/ai-place/constants/routes.ts` | Added canonical purchase-history/detail route helpers. |
| `features/ai-place/utils/error.ts` | Added mappings for actual payment, seller, and protected-asset backend error codes. |

No backend, homepage, wallet implementation, Expert product management, or
existing routes were modified.

## 3. Purchase Flow

- Not-owned product details show the backend product price and one Buy action.
- Buy mutations do not retry automatically, disable repeat clicks, use the
  existing Axios client, and never calculate wallet/payment values.
- A successful backend settlement becomes an owned state immediately and leads
  to the purchase detail.
- `PURCHASE_ALREADY_OWNED` consumes the opaque backend `purchaseId` only to
  refetch/present ownership rather than reporting a generic fatal error.
- `PAYMENT_INSUFFICIENT_BALANCE` presents a local, explicit pending state with
  the backend message, a same-purchase retry action, and a link to the
  existing wallet route.
- `WALLET_NOT_ACTIVE`, `PAYMENT_IN_PROGRESS`, `PAYMENT_FAILED`, payment
  reconciliation, and service availability responses retain their actual
  backend messages. The current backend cannot always supply the ID required
  to retry these states after an error.

## 4. Purchase History / Detail

- History route: `/client/dashboard/ai-place/purchases`.
- Detail route: `/client/dashboard/ai-place/purchases/[purchaseId]`.
- History is backend-paginated and shows only data the backend returns:
  successful status, frozen product/seller snapshot, paid price, purchase
  date, expiration, and active/expired entitlement state.
- Detail displays the backend snapshot, including platform fee, seller net,
  payment reference, dates, and entitlement/download state. The API explicitly
  exposes seller net to the Client DTO, so it is shown as supplied—not derived.
- The current backend intentionally excludes pending purchases from both read
  endpoints; see the contract limitation above.

## 5. Entitlement / Downloads

- The UI uses `accessExpiresAt`, `entitlementStatus`, `canDownload`, and
  `availableAssetTypes` from the backend. It does not calculate a 30-day term.
- All four known protected slots are shown: `SOURCE_CODE`, `VIDEO`, `DATASET`,
  and `DOCUMENT`.
- Download buttons appear only when the successful purchase detail says the
  entitlement is active and the asset type is available.
- Clicking a slot calls the entitlement endpoint, validates the returned
  temporary HTTP(S) URL, and opens it through an ephemeral DOM link. The URL
  is never rendered, stored in React state, Redux, local storage, or a query
  cache.
- Expired entitlement remains visibly purchased but cannot download.

## 6. Rating CRUD

- Rating is available only on the successful purchase-detail endpoint.
- Controls accept whole values 1 through 5, with optional nonblank review
  text, and support create, update, and delete.
- Buttons have accessible labels/pressed state and disable during mutations.
- Server data is refetched after each mutation; no unsafe optimistic rating
  write is used.

## 7. Query / State Management

- **Phase 5–6 runtime fix:** `Array.find()` in
  `findAiPlacePurchaseForProduct` returned `undefined` when the final
  successful-history page did not contain the product. Because that function
  was used directly as the `purchases/by-product` query function, TanStack
  Query rejected the normal not-owned result with “Query data cannot be
  undefined.” It now returns `null` explicitly for not-owned, returns a
  `PurchaseHistoryItem` for owned, and continues to throw actual API/network
  failures. The product detail handles `null` as Buy state, an item as owned,
  and `isError` as an unavailable ownership check.
- Audited the other Phase 5–6 purchase query functions. History and purchase
  detail return typed API envelopes; protected download, purchase, retry, and
  rating operations are mutations. None of their query functions can resolve
  `undefined` in normal control flow.
- Buy/retry invalidate the `purchases` prefix (history, detail, and
  product-ownership lookup), the settled purchase detail, and the marketplace
  product detail.
- Ratings invalidate that purchase detail and the product rating list/summary
  prefix. Marketplace product DTOs have no aggregate rating fields, so no
  fabricated marketplace aggregate is written.
- The only component state is transient UI/form state and the retryable ID
  provided in a backend error. There is no duplicated persisted server-state
  store.

## 8. Security

- Authentication remains with the existing centralized Axios Bearer-token
  interceptor.
- The client calls the existing API-gateway base path only.
- No access token is attached to a signed URL. No signed protected URL is
  persisted.
- No client code renders protected bucket/object keys or uses a Supabase
  service-role credential/API.
- Payment amounts and access dates are received from the backend; there is no
  browser-side settlement arithmetic.
- The backend download endpoint continues to enforce ownership, `SUCCESS`,
  product/purchase correlation, asset availability, and expiration.
- Purchase IDs are opaque path values returned by the service; the UI never
  selects a buyer/user ID.

## 9. Route Regression

Verified present without modification:

- Client: `/client/dashboard`, `/client/dashboard/ai-place`,
  `/client/dashboard/ai-place/[productId]`, `/client/dashboard/projects`, and
  `/client/dashboard/wallet`.
- Expert: `/expert/dashboard`, `/expert/dashboard/ai-place/products`,
  `/expert/dashboard/projects`, `/expert/dashboard/wallet`, and
  `/expert/dashboard/my-services`.

The legacy `/ai-place` compatibility redirects remain unchanged. Homepage AI
Solutions logic was not changed.

## 10. Quality Checks

| Check | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npx tsc --noEmit` | PASS |
| `git diff --check` | PASS |
| `npm run build` | BLOCKED by three pre-existing/external `next/font` Google Fonts fetch failures for Archivo Black, Geist, and Roboto; no AI Place source diagnostic was reported. |

Follow-up query-runtime correction verification:

| Check | Result |
| --- | --- |
| `npm run lint` | PASS (41 pre-existing repository warnings; 0 errors) |
| `npx tsc --noEmit` | PASS |
| `git diff --check` | PASS |

## 11. Runtime Status

- **SOURCE VERIFIED:** Yes — static lint, strict TypeScript validation, route
  presence, and diff checks passed.
- **BUILD VERIFIED:** No — the production build cannot fetch Google Fonts in
  this environment.
- **RUNTIME VERIFIED:** No.
- **RUNTIME NOT YET VERIFIED:** Yes — authenticated payment, entitlement, and
  rating paths require a live gateway, AI Available service, Payment service,
  Identity service, storage, and test Client data.

Manual runtime matrix:

| Area | Cases to exercise |
| --- | --- |
| Purchase | Successful payment; insufficient balance; already-owned prevention; double-click prevention; unavailable/unpublished product. |
| Retry | Retry the same returned `purchaseId`; current-price retry after a pending state; in-progress/reconciliation response. |
| History/detail | Successful item visible; frozen values; expired purchase stays visible; pending-state API limitation observed/documented. |
| Entitlement | Active access to each of the four asset types; absent asset; expired denial; no asset before success. |
| Rating | Create scores 1–5; update; delete; duplicate create rejection; non-success denial. |
| Security | Confirm protected URL appears only after the entitlement endpoint succeeds and no permanent bucket/key/service-role value appears in browser storage/UI. |

## 12. Deferred Items

- A durable pending-purchase view/history and reload-safe retry for every
  pending reason. This is blocked by the audited backend read contract, not
  deferred frontend behavior.
- Runtime verification against integrated backend dependencies.
- All explicitly out-of-scope items from the phase request (refunds,
  repurchase, subscriptions, cart, promotions, new wallet/top-up UI, seller
  purchase dashboard, ProductVersion, admin UI, Saga/Outbox UI, analytics,
  browser-side authorization).

## 13. Phase Decision

**PARTIAL** — the supported purchase, retry, successful history/detail,
entitlement/download, and rating flows are implemented and statically
validated. It cannot be a full PASS because the current backend does not
provide a pending-purchase read/ownership contract required for a durable
pending/retry client experience, and runtime integration remains unverified.
