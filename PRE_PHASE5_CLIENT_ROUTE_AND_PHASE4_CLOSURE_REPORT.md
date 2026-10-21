# 1. Executive Summary

Client AI Place has moved to the Client dashboard without duplicating marketplace code. The new canonical list and detail routes render the existing Phase 4 React Query views inside the Client dashboard layout; the legacy public paths now use App Router server redirects.

The reported Client Projects 404 was a missing route layer, not a Workspace-service failure. Git history proves that Client list and detail routes existed on the historical Workspace branch, and the current workspace list/detail components and service are already available. Both routes were restored with Client-aware links while preserving Expert behavior.

The current backend remains the authoritative marketplace contract. The supplied authenticated Client runtime evidence establishes the live published-product, search/filter/paging, detail, and image-preview flows. Independent browser smoke tests in a fresh in-app-browser profile verified route/layout behavior and safe unauthenticated states; that profile did not contain a Client access token.

# 2. AI Place Route Migration

- Added `app/client/dashboard/ai-place/page.tsx`, which renders the existing `AiPlaceMarketplaceFoundation`.
- Added `app/client/dashboard/ai-place/[productId]/page.tsx`, which renders the existing `AiPlaceProductDetailFoundation`.
- Changed `AI_PLACE_ROUTES.marketplace` to `/client/dashboard/ai-place`, so cards and the detail return link use the canonical Client route.
- The Client dashboard layout supplies the existing Client sidebar, header, notifications, and dashboard context; no second marketplace implementation or auth layer was added.
- Updated the Client sidebar AI Place item to `/client/dashboard/ai-place`.

# 3. Legacy Redirect Compatibility

- `app/(main)/ai-place/page.tsx` now calls `redirect("/client/dashboard/ai-place")`.
- `app/(main)/ai-place/[productId]/page.tsx` awaits the dynamic parameter and redirects to the URL-encoded canonical Client detail path.
- Browser validation confirmed `/ai-place` resolves to `/client/dashboard/ai-place` and `/ai-place/00000000-0000-0000-0000-000000000000` resolves to the matching canonical detail URL.
- The homepage remains unchanged and its existing `/ai-place` links continue to work through this compatibility redirect.

# 4. Client Projects Regression Root Cause

`/client/dashboard/projects` was a Next.js route 404 because neither the list nor detail App Router entry existed in the current tree. It was not an API failure.

The current Workspace API client, dashboard hook, reusable list view, reusable detail view, and Client sidebar link were already present. When the restored route is opened without an available Workspace backend, it renders the controlled **Unable to load projects / Network Error** state rather than a 404.

# 5. Git History Evidence

- Historical commit `1fb2a61` added Client Projects list and `[workspaceId]` detail route files.
- Historical commit `2dcfa3f` changed the Client list route to use `WorkspaceProjectsListView` with a Client role.
- These commits are on historical/unmerged Workspace branches, not the current branch ancestry; the current tree nevertheless contains the compatible Workspace views and `/workspace/api/v1/workspaces/dashboard` service contract recovered during the Expert Projects work.
- The historical Client Hiring route also existed in unmerged commit `a7ccba5`, but its 809-line `ClientHiringView` and export are absent from the current source. It remains a separately classified historical/unmerged missing route, not an AI Place or Projects regression and not recreated in this focused task.

# 6. Files Changed

- `app/client/dashboard/ai-place/page.tsx`
- `app/client/dashboard/ai-place/[productId]/page.tsx`
- `app/client/dashboard/projects/page.tsx`
- `app/client/dashboard/projects/[workspaceId]/page.tsx`
- `app/(main)/ai-place/page.tsx`
- `app/(main)/ai-place/[productId]/page.tsx`
- `components/layout/ClientSideBar.tsx`
- `features/ai-place/constants/routes.ts`
- `features/workspace/WorkspaceProjectsListView.tsx`
- `features/workspace/WorkspaceDetailView.tsx`

# 7. Client Route Regression Matrix

| Route / sidebar target | Result | Classification |
| --- | --- | --- |
| `/client/dashboard` | Renders Client dashboard and current sidebar | Current |
| `/client/dashboard/ai-place` | Renders Client layout and live marketplace view | Restored canonical route |
| `/client/dashboard/ai-place/[productId]` | Renders Client layout and marketplace detail view | Restored canonical route |
| `/client/dashboard/projects` | Renders Client Projects; Workspace-network failure is controlled, not a 404 | Restored historical Workspace route |
| `/client/dashboard/projects/[workspaceId]` | Source-backed Client detail route using the existing Workspace detail view | Restored historical Workspace route |
| `/client/dashboard/wallet` | Renders the existing Client Wallet and its controlled unavailable state | Existing |
| `/client/dashboard/my-job-post` | Existing route file | Current |
| `/client/dashboard/create-job-post` | Existing route file | Current |
| `/client/dashboard/hiring` | Still a Next.js 404; historical/unmerged feature absent from current source | Deferred, pre-existing |

# 8. Expert Regression Matrix

| Route | Result |
| --- | --- |
| `/expert/dashboard` | Existing route remains present |
| `/expert/dashboard/ai-place/products` | Browser-verified Expert layout and AI Products UI render; no route regression |
| `/expert/dashboard/projects` | Browser-verified Expert Projects UI renders; a Workspace network error is controlled |
| `/expert/dashboard/wallet` | Browser-verified existing Wallet UI renders its controlled unavailable state |

No Expert AI Product route, service, hook, preview/protected-asset component, or management control was changed by this migration.

# 9. Marketplace Runtime Validation

The previously supplied authenticated Client runtime evidence confirms the current local Gateway and AI Available deployment returns live marketplace data, excludes draft/unpublished records, and provides real preview content.

Fresh local browser smoke tests after migration confirmed the Client dashboard layout, sidebar target, legacy redirects, detail route, retry/error presentation, Projects route, and Wallet route. That isolated in-app-browser profile had no `accessToken`, so the Client-only marketplace safely displayed **Unauthenticated** rather than making live-data assertions from an unauthenticated context. This is consistent with the current `[Authorize(Policy = "ClientOnly")]` backend contract and does not contradict the supplied authenticated-session evidence.

# 10. Product Detail DTO Verification

Current `MarketplaceProductsController` exposes only Client-authorized `GET /v1/ai-place/products` and `GET /v1/ai-place/products/{productId}` for the Phase 4 product data.

- Browse applies `Status == Published`, name keyword matching, exact category code, inclusive min/max VND price, newest-publication ordering, and server pagination.
- Direct detail access returns `PRODUCT_NOT_FOUND` for absent IDs and `PRODUCT_NOT_PUBLISHED` for draft/unpublished IDs.
- The list DTO contains product ID, name, category, VND price, technologies, AI capabilities, temporary preview, and publication date.
- The detail DTO adds description and `BasicSellerSummaryResponse`; it does not include protected assets, ownership, purchase state, or lifecycle-management fields.
- The UI uses those marketplace DTOs only. It does not reuse the Expert owner DTO.

# 11. Search / Filter / Pagination Validation

- Existing list view remains a single React Query marketplace-list request keyed by page, size, keyword, category code, and min/max VND price.
- Keyword search is debounced by 350 ms and resets to page zero.
- Category is sent as the backend-supported exact `categoryCode`; no unsupported discovery service or taxonomy was added.
- Whole-VND, non-negative min/max validation and min-less-than-or-equal-to-max validation occur before a request; criteria changes reset page zero.
- Previous/Next use backend `hasPrevious`, `hasNext`, page, and total-page metadata. No client-side all-record filtering, sorting, or paging was introduced.
- Supplied authenticated runtime evidence covers known-name search, category/price include/exclude behavior, paging, and clearing a search. The new routes reuse this exact component/query path.

# 12. Preview Validation

`MarketplacePreview` continues to render only the API-provided temporary `preview.accessUrl`:

- IMAGE uses a safely lazy-loaded native image.
- VIDEO uses a native player with `preload="none"`.
- Absent preview/access URL produces the visual fallback.
- No Supabase public URL is constructed, no signed URL is persisted, and no protected deliverable is requested.

Supplied authenticated runtime evidence includes a successful IMAGE preview. The migrated route renders the same component; no preview request or media behavior changed.

# 13. Security Review

- Client marketplace routes never render Expert `assets`, protected download access, upload authorization, storage bucket/key, upload token, or original protected-asset data.
- The marketplace UI uses only temporary backend-derived preview access URLs and does not call `getPublicUrl()` or build storage URLs.
- No Supabase service-role credential is present in frontend source; the only configured browser credential is the expected public anon key.
- No JWT is placed in a route or query string. The centralized Axios interceptor remains the sole bearer-token mechanism.
- Seller display is a backend-provided detail snapshot only; no private contact field or frontend Identity lookup is added.
- No purchase, entitlement, protected-download, retry-payment, or rating mutation API is called by the migrated marketplace routes.

# 14. Performance Review

- Migration adds thin server pages only; it does not duplicate React Query providers, hooks, requests, or cached data identities.
- Cards continue to use one paginated list DTO and perform no detail or seller N+1 requests.
- Detail performs one detail query.
- Preview images remain lazy except the currently viewed detail preview; video remains non-preloaded.
- No invalidation or refetch loop was added.

# 15. Lint / Type / Build

| Check | Result |
| --- | --- |
| Targeted route/workspace ESLint | PASS, no errors or warnings |
| `npx --no-install tsc --noEmit` | PASS |
| `npm run lint` | PASS: 0 errors, 41 existing warnings outside this change |
| `git diff --check` | PASS |
| `npm run build -- --webpack` | Blocked before application compilation by `fonts.googleapis.com` DNS (`ENOTFOUND`), followed by known `.next` cleanup `EPERM` |

# 16. Deferred Phase 7 Items

- Homepage role-aware AI Solutions behavior.
- `/expert/dashboard/my-services` cleanup.
- Broader Client/Expert role-routing policy and global route guards.
- Historical/unmerged Client Hiring recovery, which lacks its current feature implementation.
- Other unrelated legacy/dashboard cleanup.

# 17. Unresolved Blockers

- No Phase 4 migration or Client Projects blocker remains.
- The production build cannot complete in this environment until Google Fonts DNS is available; the subsequent `.next` `EPERM` is an abort-cleanup artifact.
- The existing Client Hiring sidebar target remains a separately documented historical/unmerged 404 outside this focused restoration. It is not a Marketplace, Projects, Wallet, or Expert regression introduced here.

# 18. Final Phase 4 Decision

**PASS.** The canonical Client marketplace and detail routes exist inside the Client dashboard, legacy paths redirect compatibly, cards navigate to the canonical detail route, Client Projects is restored without a Next.js 404, and the Phase 4 live marketplace implementation, DTO boundary, preview security, and Expert functionality remain intact. TypeScript and lint pass; build status is limited only by the known external DNS/cleanup environment failure.
