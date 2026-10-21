# 1. Executive Summary

Phase 3 replaces the Expert product-detail storage placeholders with secure Preview and Protected Asset management. The implementation follows the current `ai-available-service` storage controller and application service, preserves the centralized gateway Axios client for AI Available APIs, and uses browser `fetch` only for the backend-issued signed storage destination.

No Client marketplace, purchase, entitlement, protected-download, or rating UI was added.

# 2. Backend Storage Contract Verified

The current authoritative backend exposes these Expert-only routes below `/v1/ai-place/expert/products`:

| Flow | Endpoint | Request |
| --- | --- | --- |
| Preview authorization | `POST /{productId}/preview/upload-authorizations` | `previewType`, `originalFilename`, `contentType`, `byteSize` |
| Preview confirmation | `PUT /{productId}/preview` | `uploadToken`, optional `objectETag` |
| Preview delete | `DELETE /{productId}/preview` | — |
| Asset authorization | `POST /{productId}/assets/{assetType}/upload-authorizations` | `originalFilename`, `contentType`, `byteSize` |
| Asset confirmation | `PUT /{productId}/assets/{assetType}` | `uploadToken`, optional `objectETag` |
| Asset delete | `DELETE /{productId}/assets/{assetType}` | — |

The backend accepts IMAGE and VIDEO preview media types by their `image/` or `video/` MIME prefix. It validates general protected-asset MIME syntax, a nonblank filename up to 255 characters, and a nonnegative byte size; it has no slot-specific MIME/extension/size allowlist to duplicate in the frontend.

Preview mutation is permitted only while status is `DRAFT` or `UNPUBLISHED`. Protected-asset mutation is permitted only while status is `DRAFT` and `firstPublishedAt` is null. The implementation uses `firstPublishedAt`, not current status alone, to represent the permanent lock.

# 3. Files Changed

- `features/ai-place/utils/direct-storage-upload.ts`
- `features/ai-place/expert/components/PreviewManager.tsx`
- `features/ai-place/expert/components/ProtectedAssetsManager.tsx`
- `features/ai-place/expert/ExpertAiProductDetailView.tsx`
- `features/ai-place/utils/error.ts`
- `PHASE3_AI_PLACE_FE_PREVIEW_PROTECTED_ASSETS_REPORT.md`

# 4. Direct Upload Architecture

The flow is authorization → direct signed storage upload → backend confirmation → relevant React Query invalidation/refetch. `uploadToAuthorizedStorage` uses native `fetch` with the authorization's method and required headers, then sets the exact selected `File.type` as `Content-Type`. It does not import the gateway Axios client, add a Neuro Bridge bearer token, log the signed URL/token, construct object keys, or persist storage identifiers.

Confirmation is never attempted when the direct upload request fails. No optimistic “present” state is written before backend confirmation succeeds.

# 5. Preview IMAGE

Draft and Unpublished products can select an image with a recognized actual MIME type. The UI requests authorization, uploads directly, confirms with only the upload token, refetches the product detail, and displays backend-derived filename, MIME type, byte size, and the temporary backend access URL when available. Existing previews can be replaced without deleting first and deleted after confirmation.

# 6. Preview VIDEO

VIDEO follows the same signed flow using the original `File.type`; no duration is submitted from the browser. `MEDIA_INSPECTION_UNAVAILABLE` maps to: “Video preview validation is temporarily unavailable. Please use an image preview or try again later.” `PREVIEW_VIDEO_TOO_LONG` remains surfaced from the backend response. The UI makes no attempt to bypass trusted inspection.

# 7. Protected Assets

Exactly four slots are rendered: `SOURCE_CODE`, `VIDEO`, `DATASET`, and `DOCUMENT`. Each displays present/missing state, filename, content type, size, and Editable/Locked state. A never-published Draft can upload, replace, or delete each slot. Once `firstPublishedAt` is present, all controls are removed permanently.

# 8. Permanent Lock UX

The product-detail page explicitly states: “Protected assets are permanently locked after first publication. Unpublishing does not unlock them.” This remains true for an Unpublished product because the condition uses `firstPublishedAt`. Preview controls follow their separate status-based lifecycle and become available again after unpublishing.

# 9. Publish Readiness

The lifecycle panel now shows a five-item readiness checklist for Description, Source Code, Video, Dataset, and Document. The existing Publish mutation remains backend-authoritative and is only enabled when all five items are ready.

# 10. Error Mapping

Added safe mappings for `UPLOAD_OBJECT_NOT_FOUND`, `UPLOAD_AUTHORIZATION_EXPIRED`, `INVALID_UPLOAD_TOKEN`, and `STORAGE_UNAVAILABLE`; retained mappings cover `INVALID_PRODUCT_STATE`, `DELIVERABLE_LOCKED`, `UPLOAD_METADATA_MISMATCH`, `MEDIA_INSPECTION_UNAVAILABLE`, `VALIDATION_ERROR`, auth, and ownership/product errors. Direct-upload failures have a safe generic message and do not expose raw fetch/Supabase details.

# 11. React Query / Cache Behavior

Existing storage mutations invalidate only Expert product list/detail keys. The active detail view explicitly refetches after confirmation or deletion. No Wallet, payment, purchase, or marketplace cache is invalidated by the Phase 3 flows.

# 12. Security Review

- AI Place uses no `getPublicUrl()` call.
- No service-role key, bucket secret, signed URL, or upload token is logged or persisted.
- The browser never chooses a bucket or object key; those values remain backend-issued authorization data and are not rendered.
- The signed storage request uses `fetch`, not the interceptor-backed gateway Axios instance, and therefore carries no Neuro Bridge bearer token.
- Existing Workspace public-upload helpers and unrelated `services/supabase-storage.service.ts` are not imported by AI Place.
- Temporary preview access URLs are rendered only from the current product response and are not cached in Redux or local storage.

# 13. Lint / Type / Build

| Check | Result |
| --- | --- |
| `npx eslint 'features/ai-place/**/*.{ts,tsx}' 'services/ai-available-storage.service.ts'` | PASS, no warnings or errors |
| `npx --no-install tsc --noEmit` | PASS |
| `npm run lint` | PASS with 41 pre-existing warnings outside Phase 3 |
| `git diff --check` | PASS |
| `npm run build -- --webpack` | BLOCKED before application compilation: existing DNS failure for `fonts.googleapis.com`, then existing `.next` EPERM while handling the failure |

# 14. Runtime Test Results

The frontend dev server is already owned by another local process. The expected gateway (`localhost:8080`) and AI Available service were not listening from this execution environment, and no authenticated Expert session/test product was supplied. Therefore authenticated authorization, direct upload, confirmation, preview display/delete, protected slot CRUD, publish/unpublish/republish, and DevTools network verification were not executed.

Static contract verification confirms the UI sends the required three-step sequence and implements the backend lifecycle rules, but it does not substitute for an authenticated end-to-end test.

# 15. Deferred Items

- Client marketplace and product discovery (Phase 4).
- Purchase, entitlement, and protected downloads (Phase 5).
- Rating (Phase 6).

# 16. Unresolved Blockers

- Start the Gateway and AI Available service and supply an authenticated Expert session plus a test Draft product to execute the Phase 3 runtime matrix.
- Restore DNS access to `fonts.googleapis.com` (or adopt the repository-approved local-font approach) and resolve the `.next` filesystem permission issue before production-build validation.

# 17. Phase 4 Readiness

The Expert storage surface is implemented and isolated from later marketplace/purchase work. Strict Phase 3 sign-off remains blocked until the authenticated runtime matrix and production build can complete.
