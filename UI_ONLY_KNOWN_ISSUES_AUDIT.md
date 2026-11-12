# FE UI-Only Known Issues Audit

**Repository:** `D:\FA2026\PRN232\Neuro-bridge-FE`  
**Audit mode:** read-only application audit; no application source, API, hook, or service was changed.  
**Reference-document note:** `Neuro Bridge - Known Issues.docx` is not present in the repository, so this report validates the supplied known-state statements against the checked-in frontend only.

## 1. Executive Summary

| Area | Decision | Why |
| --- | --- | --- |
| Rating display in marketplace/product detail | **NOT UI-ONLY** | Aggregate data is typed and has an existing endpoint, but neither marketplace DTO already loaded by those screens contains it. Rendering it would require the unused rating-summary query (an additional request). |
| Purchased product / My Purchases | **UI-ONLY READY** | A complete purchase-history and purchase-detail library already exists, including frozen purchase snapshots and protected-download entry points. It is discoverable from the marketplace but not from the client sidebar. |
| Notification deeplinks | **UNKNOWN / not safely implementable from current contract** | The UI has no deeplink code. `type` is an unconstrained string and the only identifiers are untyped `resourceId` and `workspaceId`; no type-to-route contract or mappings exist in the repository. |
| Homepage AI product mock UI | **UI-ONLY READY** | The home section is wholly mock driven and can be reframed as a static AI Place promotional entry point while retaining the existing role-aware destination and making no request. |

The smallest safe first implementation is a client-sidebar **My Purchases** link to the existing history route. It changes discoverability only, uses no new data, and preserves access to purchases after a product is unpublished.

## 2. UI-only Definition Used

A candidate qualified only when it can change rendering, labels, cards, empty states, sidebar/navigation entries, or links to an already existing route using data already loaded by that surface. It did **not** qualify if it would add or enable a request, hook, query key, endpoint, mutation, response transformation, entitlement/payment behavior, or transport behavior.

## 3. Rating Display Audit

### Evidence inspected

- `MarketplaceProductListItem` has product identity, name, category, price, technologies, capabilities, preview, and `lastPublishedAt`.
- `MarketplaceProductDetail` adds description and seller. Neither DTO has `averageRating`, `ratingCount`, `averageScore`, or a rating summary.
- `PurchaseDetail` has an optional `rating`, but that is the signed-in buyer's own `ProductRating`, not a marketplace aggregate. It is already rendered by `PurchaseRatingPanel` in the purchase-detail screen.
- `ProductRatingSummary` is typed as `{ productId, ratingCount, averageScore? }`; `getProductRatingSummary` and `useProductRatingSummary` exist in `services/ai-available-rating.service.ts`.
- Those hooks are unused. Calling one in a marketplace card or product detail would call `/products/{productId}/ratings/summary`, which is an additional fetch and therefore prohibited here.
- No existing public rating-list or aggregate-rating display component was found. The only rating UI is the buyer-owned rating CRUD panel.

### Classification: **NOT UI-ONLY**

The required marketplace/product-detail aggregate cannot be displayed from already fetched data. The existing aggregate endpoint is not an exception: wiring its hook is a new query behavior. A future non-UI-only change could either include the summary in the marketplace responses or explicitly authorize the existing summary query; neither belongs in this phase.

**Existing rating data available now:**

- Purchase detail: optional current buyer rating (`score`, review text, timestamps), already displayed.
- Marketplace list/detail: no rating data.
- Separate service capability: aggregate `ratingCount` and optional `averageScore`, not loaded.

## 4. Purchased Product / My Purchases Audit

### Existing library route and data

- History route: `/client/dashboard/ai-place/purchases`.
- Detail route: `/client/dashboard/ai-place/purchases/[purchaseId]`.
- `ClientPurchaseHistoryView` loads the existing successful-purchase history once per page state and renders product name at purchase, seller, price, purchase date, entitlement status, and a `View purchase` link.
- `ClientPurchaseDetailView` loads the existing purchase detail by `purchaseId`, displays the frozen snapshot, protected-package UI, entitlement state, and buyer rating panel.
- The marketplace already exposes a **My purchases** CTA in its header. The client sidebar only exposes **AI Place**; it has no direct purchase-library item.

### Unpublished-product reachability

**Yes.** The history view uses the client purchase-history API and its cards link by `purchaseId`, not marketplace product visibility. Its detail view uses the purchase-detail API, not the marketplace product-detail API. Its rendered copy also explicitly describes the snapshot as permanent. Consequently, an item returned in purchase history remains reachable even after its product is unpublished, subject only to the existing backend history/detail authorization and entitlement rules.

### Classification: **UI-ONLY READY**

Add a client-sidebar sibling item labelled **My Purchases** (or **My AI Library**) that links to `/client/dashboard/ai-place/purchases`. It reuses the existing library, data, pagination, detail route, protected-file view, and rating screen; it must not add a second history query or product lookup.

## 5. Notification Deeplink Audit

### Evidence inspected

- `NotificationItem` is `{ id, type: string, title, message, resourceId: string | null, workspaceId: string | null, createdAt, read }`.
- `NotificationRow` click handling only marks an unread notification as read. It does not use a router or a navigation helper.
- No notification-type enum, type-to-route table, payload samples, route resolver, or other notification deeplink code exists in the repository.
- Existing role-specific workspace detail routes do exist: `/client/dashboard/projects/[workspaceId]` and `/expert/dashboard/projects/[workspaceId]`.

### Per-type classification

The repository declares no notification type values, so it is not possible to classify named runtime types individually without inventing a contract. The only defensible field-level classification is:

| Runtime condition | Classification | Reason |
| --- | --- | --- |
| Any currently declared notification `type` | **UNKNOWN** | `type` is an arbitrary string with no mapping table or documented values in FE. |
| Notification with only `resourceId` | **PAYLOAD INSUFFICIENT** | The ID does not identify its resource kind, role-specific route, or required parent context. |
| Notification with `workspaceId` but no type semantics | **UNKNOWN** | A matching workspace route exists, but the contract does not establish that `workspaceId` is always the intended click target rather than contextual metadata. |
| Notification whose future contract explicitly identifies a workspace-targeting type and guarantees `workspaceId` | **UI-ONLY MAPPING POSSIBLE** | A resolver could choose the current user's existing client/expert workspace route without a request. This is conditional evidence, not a currently confirmed type. |

### Centralized resolver conclusion

A centralized resolver is architecturally appropriate **only after** the notification producer contract supplies a finite type set and required identifier semantics. It could return a route only for explicitly supported types and otherwise return `null` (no navigation). With the checked-in payload contract alone, adding an unconditional route would risk navigating to the wrong resource and is not recommended.

## 6. Homepage AI Product Mock/Static UI Audit

### Active mock chain

`features/homepage/data/homepage.ts` imports `availableAIData`, selects three records based on mock `Trending` status (or the first three), then forces their display status to `Trending`. `HomepageView` passes this `activities` value to `SolutionSection`, which renders each record through `AvailableAICard`.

`availableAIData.ts` contains nine fictitious records (`ai-1` through `ai-9`). The active mock product schema includes names, fake availability/trending/sold state, success scores, descriptions, tech stacks, capabilities, timelines, budgets, fictional authors, and review/rating content. The homepage card visually presents these as individual product-like offers.

### Misleading affordances

- Section copy says **AI SOLUTIONS**, **Popular AI solutions**, and **View all AI solutions**.
- Cards have product-like status, price/budget, author, performance score, technologies, and a **View details** CTA.
- Each card's View details action does not open its mock ID; it sends every card to the role-aware AI Place destination. The card still falsely implies that its own content is a real item that can be viewed.
- `AvailableAICard` also renders client-local bookmark state and an enabled comment icon. Neither callback is supplied by the homepage, so these are stale, non-functional affordances.

### Classification: **UI-ONLY READY**

The safest result is not a mock-to-live substitution. Replace the product-card grid with a neutral, static **Discover AI Place** entry surface: concise product-marketplace description, a small set of non-product capability/value messages, and one CTA using the existing `getAiSolutionsDestination` result. Rename the section and CTA to make it clear that the destination is AI Place, not a mocked product detail. This preserves the role-aware Client → marketplace, Expert → product management, unauthenticated → `/ai-place` routing already present.

No home-page request, React Query hook, service call, or live product listing is necessary or recommended. Showing actual current products would be a separate **PARTIALLY UI-ONLY / non-UI data** request and is deferred.

## 7. Existing Reusable UI/Components

- `ClientPurchaseHistoryView`: ready-made library list, pagination, snapshot identity, entitlement badge, and purchase-detail links.
- `ClientPurchaseDetailView` and `AiPlaceProtectedPackage`: existing post-purchase details and protected asset surface.
- `PurchaseRatingPanel`: existing buyer-owned rating UI; not an aggregate rating component.
- `AI_PLACE_ROUTES`: existing route constants for marketplace, purchases, purchase detail, and expert products.
- `WorkspaceSideBar` / `NavMain`: current client navigation surface that can expose an existing history route.
- `getAiSolutionsDestination` in `SolutionSection`: existing role-aware home-page destination resolver.

## 8. Existing Routes That Can Be Reused

| Use | Existing route |
| --- | --- |
| Client AI Place marketplace | `/client/dashboard/ai-place` |
| Client purchase library | `/client/dashboard/ai-place/purchases` |
| One purchase, downloads, entitlement, and rating | `/client/dashboard/ai-place/purchases/[purchaseId]` |
| Expert AI product management | `/expert/dashboard/ai-place/products` |
| Compatibility/public AI Place entry | `/ai-place` → client marketplace redirect |
| Client workspace detail (only conditionally relevant to notifications) | `/client/dashboard/projects/[workspaceId]` |
| Expert workspace detail (only conditionally relevant to notifications) | `/expert/dashboard/projects/[workspaceId]` |

## 9. Files That Would Need UI-Only Modification

### Safest recommended scope

- `components/layout/ClientSideBar.tsx` — add a client-only **My Purchases** / **My AI Library** link to the existing history route.

### Optional approved UI cleanup scope

- `features/homepage/components/SolutionSection.tsx` — replace mock-card framing with a neutral promotional AI Place entry surface and keep the current role-aware resolver.
- `features/homepage/data/homepage.ts` — remove the active `availableAIData` dependency and provide static promotional copy only, if the chosen section design keeps data outside the component.
- `features/homepage/HomepageView.tsx` — optionally change the navigation-dot label from **AI Solutions** to **AI Place** for copy consistency.

### Conditional only; do not change until a notification contract is supplied

- `features/notification/components/NotificationRow.tsx` — call a resolver only when it returns a verified route.
- A new presentation-only notification-route resolver adjacent to the notification feature — return `null` for unsupported types; do not change services, hooks, or socket lifecycle.

There is no safe UI-only source modification for marketplace aggregate rating in the current data shape.

## 10. Files That Must Remain Untouched

The following are functional/API/transport code and must not be changed for this UI-only work:

- `configs/api.ts`
- `services/ai-available-product.service.ts`
- `services/ai-available-purchase.service.ts`
- `services/ai-available-rating.service.ts`
- `services/notification.service.ts`
- `hooks/useNotificationBell.ts`
- `hooks/useNotificationSocket.ts`
- `features/ai-place/constants/query-keys.ts`
- `features/ai-place/constants/routes.ts` (existing routes are sufficient)
- `features/ai-place/types/index.ts`
- `types/notification.type.ts` (until producer contract requirements are agreed)
- `utils/notification.utils.ts`
- All AI Place purchase, entitlement, asset, payment, rating mutation, wallet, workspace, project, JobPost, authentication, and backend modules.

`features/available-ai/components/AvailableAICard.tsx` and `features/available-ai/mocks/availableAIData.ts` are best left untouched in the smallest cleanup: the homepage can simply stop importing/using them. They are not a source for real AI Place data.

## 11. API/Fetch Impact Verification

**Network/API changes required for the recommended scope: NO.**

- My Purchases link points to an existing route and its already implemented history query; no new query or duplicate data layer is added.
- Homepage cleanup removes mock presentation only; it does not fetch products.
- Rating aggregate is deliberately deferred because its existing summary hook would make an additional request.
- Notification deeplinks are deliberately deferred until a payload mapping exists; no socket, polling, notification query, mark-read mutation, or reconnect behavior changes.

## 12. UI-Only Candidates

1. **My Purchases sidebar entry — ready.** Add one client navigation item to the existing history route.
2. **Purchase-library copy/discoverability polish — ready.** Optional label/title refinements inside existing presentation components without altering hook invocation or data.
3. **Homepage Discover AI Place entry surface — ready.** Remove mock-product signals and retain a single role-aware CTA.
4. **Notification deeplink resolver — conditional.** Only after the backend contract documents type values and identifier semantics. Unsupported notifications must remain non-navigating.

## 13. Non-UI Blockers

- Marketplace average score/count is not present in already loaded product responses.
- Notification `type` values, mapping rules, and `resourceId` resource kinds are not represented in FE.
- `workspaceId` lacks a contract guarantee that it is the intended destination for each notification type.
- Live home-page product cards require a live-data integration, expressly out of scope.

## 14. Recommended Implementation Scope

Implement in two safe, independent UI-only increments:

1. Add **My Purchases** to the client sidebar, pointing to the existing purchase history. This directly resolves lost discoverability and unpublished-product reachability.
2. Reframe the homepage section as **Discover AI Place** with no mock product cards or inert product-like actions; retain only the existing role-aware CTA.

Defer ratings and notification routing. Do not alter APIs, services, hooks, query behavior, product visibility, entitlement, payments, or rating CRUD.

## 15. Regression Risks

- Sidebar: preserve the existing **AI Place** marketplace entry and active-route styling; add rather than replace navigation.
- Purchases: never link an item through marketplace product detail; always use the existing `purchaseId` history/detail flow.
- Homepage: do not leave card-level **View details**, bookmark, comment, prices, sellers, ratings, or availability claims after reframing; those imply real item-specific data.
- Notifications: a guessed route is worse than a non-navigating notification. Do not infer a target from title/message text or a bare `resourceId`.
- Ratings: calling `useProductRatingSummary` changes network/query behavior even though the service already exists; keep it out of a UI-only patch.

## 16. Final Decision

Proceed only with the purchase-library discoverability improvement and, if desired, homepage mock-to-promotional cleanup. Both are strictly presentation/navigation changes with **no network/API changes**. Do not implement marketplace aggregate rating display or notification deeplinks in this phase. The former needs data already loaded into product responses (or an additional query); the latter needs a reliable notification payload/type mapping contract.

