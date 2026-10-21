# 1. Executive Summary

Phase 2 implements the Expert-only AI Place product-management surface without changing the Phase 1 API, auth, storage, or client marketplace foundations. Experts can list their products, create DRAFT products, edit allowed fields, inspect lifecycle and asset readiness, publish, unpublish/republish, and delete only an eligible never-published draft.

All interactions reuse the established AI Available React Query services and the existing `configs/api.ts` Axios client. No direct Supabase operation, Workspace Submission helper, new Axios client, or state library was added.

# 2. Scope Implemented

Implemented Expert routes:

- `/expert/dashboard/ai-place/products`
- `/expert/dashboard/ai-place/products/new`
- `/expert/dashboard/ai-place/products/[productId]`

The implementation is based on current `ai-available-service` source, specifically `ExpertProductsController`, `ProductContracts`, and `ProductApplicationService`.

# 3. Expert Product List

The product list now uses `useExpertProducts` with the backend zero-based page/size contract and URL-backed pagination. It provides:

- loading skeletons, error/retry state, and empty state;
- product name, category code, status, VND price, last updated date, and available last-published information;
- a management link for each product; and
- a create-draft CTA.

The list follows the existing Expert dashboard card/table visual language rather than the public marketplace-card style.

# 4. Create Draft Flow

`/new` now provides a React Hook Form + Zod draft form for the exact create contract:

- `name`
- `categoryCode`
- `priceVnd`

Name and category code are required. Price is constrained to a positive whole-VND number. Backend field errors are placed on the matching form fields when supplied. On a successful create, the existing create mutation invalidates the Expert product family, a success toast is shown, and the user is sent to the product-management route.

# 5. Product Detail / Edit

The detail route uses `useExpertProduct` and renders a dashboard management surface with:

- product status, ID, category, price, created/updated/last-published dates;
- an editable Product Information form for name, description, category code, price, technologies, and AI capabilities;
- feature-local, dependency-free tag entry controls for technologies and capabilities; and
- read-only overview, preview, protected asset, and lifecycle panels.

The edit form is disabled for `PUBLISHED` products and explains that the Expert must unpublish before editing. `DRAFT` and `UNPUBLISHED` products follow the existing update service. An `INVALID_PRODUCT_STATE` response is surfaced safely and causes a detail refetch so the backend remains authoritative.

# 6. Lifecycle Actions

The detail view reflects the current service lifecycle rules:

- `DRAFT`: editable; Publish is available only when current response data proves the description and all four assets are ready; deletion is offered only if it has never been published.
- `PUBLISHED`: visible/live status; basic editing is disabled; Unpublish is offered with confirmation.
- `UNPUBLISHED`: hidden status; editing is available; Republish is offered when prerequisites are ready.

Unpublish confirmation explains that it hides the product from the marketplace, does not revoke existing buyer entitlement, and does not unlock protected assets. Lifecycle mutations use the Phase 1 service hooks, which invalidate the exact product/list keys and marketplace family, then refetch the current detail.

# 7. Asset / Preview Status

Phase 2 intentionally implements no file upload or deletion behavior.

The detail view displays:

- preview state: none, `IMAGE`, or `VIDEO`, including filename and size when present;
- each required protected slot: `SOURCE_CODE`, `VIDEO`, `DATASET`, and `DOCUMENT`;
- present/missing state and safe asset metadata; and
- a permanent-lock explanation when `firstPublishedAt` exists.

Disabled, clearly deferred “Manage preview/assets in Phase 3” affordances make the next step explicit. No `getPublicUrl`, Workspace Submission storage helper, bucket/key construction, or public protected URL is used.

# 8. Validation / Error Handling

The Phase 1 AI Place error extractor and messages are reused throughout. The Expert UI handles:

- `PRODUCT_NOT_FOUND` and permission-safe detail/list error states;
- `PRODUCT_NOT_OWNED` through the shared safe backend message;
- `INVALID_PRODUCT_STATE` with feedback and detail refetch;
- `VALIDATION_ERROR` with inline field errors where the backend provides fields;
- `REQUIRED_DELIVERABLES_MISSING` with an inline lifecycle message; and
- `DELIVERABLE_LOCKED` through the shared error foundation and permanent asset-lock presentation.

Raw Axios errors are not rendered in the new Expert UI.

# 9. Query Invalidation

Existing Phase 1 mutation behavior remains the source of truth:

- create: Expert product keys;
- update: Expert product list/detail keys;
- delete: Expert product list and its exact cached detail;
- publish/unpublish: Expert product list/detail plus AI Place marketplace keys.

The detail screen additionally refetches after successful mutations and after stale-state/not-found actions where current backend state must win.

# 10. Client / Expert UI Separation

Only the Expert dashboard route family was changed. The client/public `/ai-place` marketplace foundation, client purchase routes, mock marketplace components, and client navigation are untouched.

Expert product management uses dashboard cards, forms, table/listing, lifecycle controls, and the existing sidebar entry. It does not import client marketplace cards, purchase controls, or review UI.

# 11. Files Added / Changed

## Added

- `features/ai-place/expert/ExpertAiProductListView.tsx`
- `features/ai-place/expert/CreateAiProductView.tsx`
- `features/ai-place/expert/ExpertAiProductDetailView.tsx`
- `features/ai-place/expert/components/AiProductStatusBadge.tsx`
- `features/ai-place/expert/components/StringTagInput.tsx`
- `features/ai-place/expert/schemas/productSchemas.ts`
- `features/ai-place/expert/utils/presentation.ts`

## Changed

- `app/expert/dashboard/ai-place/products/page.tsx`
- `app/expert/dashboard/ai-place/products/new/page.tsx`
- `app/expert/dashboard/ai-place/products/[productId]/page.tsx`

## Removed

- `features/ai-place/expert/ExpertAiProductsFoundation.tsx` — Phase 1 route-only placeholders were replaced rather than retained as unused duplicate UI.

# 12. Build / Lint Results

- `npm run lint`: passed with 41 existing repository warnings and no warning/error from Phase 2 AI Place files.
- Targeted lint of `features/ai-place/expert` and `app/expert/dashboard/ai-place`: passed with no output.
- `npx --no-install tsc --noEmit`: still reports the existing nine static image-module declaration errors in Auth/Homepage files. No Phase 2 AI Place type error was reported.
- `npm run build -- --webpack`: could not complete because existing `next/font/google` imports cannot resolve `fonts.googleapis.com` in this environment. After those DNS failures, Next also reported an `.next` directory `EPERM` while aborting. This did not identify a Phase 2 source defect.

# 13. Known Deferred Items

The following remain intentionally deferred to later approved phases:

- direct preview authorization/upload/confirmation/deletion;
- protected asset authorization/upload/confirmation/deletion;
- real client marketplace fetching and detail rendering;
- buy/retry, purchase history, protected downloads, and ratings;
- broader responsive/mobile polish and Phase 7 cleanup of the legacy prototype.

# 14. Phase 3 Readiness

Phase 3 can add upload interactions into the existing Preview and Protected Assets panels using the Phase 1 storage services. The product detail already exposes the exact current asset slots, preview state, lifecycle state, and post-first-publication asset lock messaging needed for the authorized-upload flow.

Phase 2 is scope-ready: no P0/P1 Expert Product defect remains in the implemented source. Full production-build confirmation remains externally blocked by the existing font DNS/static-image issues described above.
