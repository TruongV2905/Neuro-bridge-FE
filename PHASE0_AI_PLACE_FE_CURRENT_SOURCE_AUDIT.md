# 1. Executive Summary

This is a source-only audit of branch `feature/available-ai-product` as inspected on 2026-10-18. No application source, API configuration, environment file, route, deployment configuration, or Supabase behaviour was changed. The only new artifact is this audit report.

The application is a Next.js App Router frontend with a sound shared Axios/React Query foundation, but AI Place is not integrated with the completed backend. The existing `/availableAI` experience is an active, public, mock-backed showcase: it has no backend calls, authentication decisions, product CRUD, purchase, entitlement, rating mutation, or storage logic. It should be treated as a visual prototype rather than a partial implementation.

The one central API client currently derives its base from `NEXT_PUBLIC_API_BASE_URL`; its current local value is the Gateway base `http://localhost:8080/api`. Consequently, the local AI Available base should be formed through that same client as the relative prefix `/ai-available` (resulting in `http://localhost:8080/api/ai-available`), not by embedding `8089` or a second base URL. There is no source evidence of ngrok, a server-side proxy, rewrites, or a direct AI Available service call.

The repository needs a small, domain-focused AI Place feature that reuses the existing Axios client, JWT interceptor, React Query, toast provider, shadcn-style controls, and four-slot submission presentation. It must not reuse the Workspace Submission public-URL storage flow for protected AI Product assets.

# 2. Current Technology Stack

| Area | Current source evidence |
|---|---|
| Framework / routing | Next.js `16.2.6`, App Router only (`app/` exists; no `pages/`) |
| React / TypeScript | React and React DOM `19.2.4`; TypeScript `^5`, strict mode, bundler module resolution |
| Package manager | npm (`package-lock.json`) |
| Styling | Tailwind CSS `^4` through `@tailwindcss/postcss`; global CSS; utility-first component styling |
| UI | shadcn-style local `components/ui`, Radix Dialog/Dropdown/Select, Base UI, `class-variance-authority`, `clsx`, `tailwind-merge` |
| Forms / validation | React Hook Form, Zod v4, `@hookform/resolvers` |
| HTTP / server state | Axios, TanStack React Query v5, React Query Devtools in development |
| Client/global state | Redux Toolkit, React Redux, redux-persist (local browser storage) |
| Auth / realtime | JWT-style access/refresh tokens; STOMP/SockJS notifications |
| Supabase | `@supabase/supabase-js` v2.105.4, browser client only |
| Upload / editor | react-dropzone; Tiptap |
| Feedback / icons / dates | react-toastify; lucide-react; date-fns, moment, moment-timezone |
| Tables / animation | TanStack Table; Framer Motion, GSAP, animate.css |
| Tests | No test runner or test scripts found |
| Deployment packages | None: no Vercel, Docker, PM2, or nginx package/config evidence |

# 3. Current Project Structure

The repository is root-based (no `src/` directory).

```text
app/                 App Router pages, route-group layouts, role dashboard layouts
features/            Domain-facing views (auth, job posts, workspace, profile, notification, available-ai)
services/            API-facing hooks and direct API functions by backend domain
hooks/               Generic React Query factories and small UI/realtime hooks
configs/             Axios, Supabase, Query Client, CRUD registry
components/          Local UI primitives, layouts, tables, forms, common components
types/               API/feature TypeScript types
schemas/             Zod form schemas
redux/               Persisted user store
utils/               Formatting, upload, notification helpers
modules/              Generic admin CRUD modules
public/              Images and videos
```

Relevant existing documentation is limited: `README.md` is empty, `CLAUDE.md` contains no useful setup/deployment guidance, and `PHASE2_FE_SUPABASE_AUDIT.md` is an untracked historical audit. Its core claims about the Workspace direct-public-Supabase flow were confirmed against current source; its statement that no AI Product contract had been implemented remains true.

# 4. Deployment / Server / Ngrok Audit

## Current API connection

- The only Axios instance is `configs/api.ts`; its `baseURL` is `process.env.NEXT_PUBLIC_API_BASE_URL`.
- The currently tracked `.env` supplies that variable with the local Gateway base `http://localhost:8080/api`.
- All inspected domain services use relative paths through this instance. Examples include `/identity/...`, `/workspace/...`, `/payment/...`, and `/notification/...`.
- The refresh call is the one exception to using the Axios instance, but it still constructs its URL from the same variable plus `/identity/auth/refresh`.
- `utils/notification.utils.ts` also derives its SockJS URL from the same variable.

## No alternate routing mechanism found

- `next.config.ts` contains no rewrites, redirects, proxy configuration, environment mapping, or remote patterns.
- No `middleware.*`, `app/api/*` proxy route, `pages/`, custom server, fetch wrapper, or additional Axios instance was found.
- No hardcoded `localhost:8089`, `/api/ai-available`, ngrok host, `ngrok-free.app`, `ngrok.io`, `API_URL`, `BASE_URL`, `BACKEND_URL`, or `GATEWAY_URL` reference was found.

## Required local AI Available integration pattern (not implemented)

Use the existing `api` client and relative AI Available endpoints prefixed `/ai-available`. With the current local base, this resolves to `http://localhost:8080/api/ai-available`. Do not configure the browser to call `http://localhost:8089` directly unless a later explicit deployment/API decision changes the gateway convention.

## Cross-service conventions

Identity, Workspace, Payment, Notification, Job Post, and profile-related APIs mostly share the single client. Their endpoint path conventions are inconsistent (`/payment/api/wallet` versus `/payment/payment-transactions`, for example), but the base URL and bearer-token mechanism are centralized. AI Available is not referenced anywhere.

# 5. Environment Configuration

## Files and tracking

- `.env` exists and is tracked by Git even though `.gitignore` contains `.env`; Git ignores do not affect already tracked files.
- `.env.local`, `.env.example`, `.env.development`, and `.env.production` do not exist and are not tracked.
- `.env.local` is not explicitly ignored by the current `.gitignore`.
- `next.config.ts` does not read or expose additional variables.

## Variable names only

| Variable | Classification | Current use | Audit assessment |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Frontend-public backend/API routing | Axios base URL, refresh request, notification socket URL | Required and actively used; its public prefix is appropriate for a browser-visible Gateway origin |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend-public Supabase configuration | `configs/supabase.ts` browser client | Required and actively used |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend-public Supabase anon credential | `configs/supabase.ts` browser client | Expected to be public only with correct Supabase RLS/storage policies; never substitute a service-role key |

No stale ngrok-named variable was found. No potentially sensitive non-public variable, service-role key, or AI Available-specific variable was found in source. The tracked `.env` is a configuration-management risk: move local values to an ignored `.env.local` and commit a variable-name-only `.env.example` in a later, authorized cleanup phase. That recommendation is not an instruction to change it in this phase.

# 6. Authentication / Authorization

## Current flow

- Login route: `/login` (`app/(auth)/login/page.tsx`), rendered by `features/auth/login/LoginForm.tsx`.
- Register route: `/register`; separate Client and Expert forms post through `services/authentication.service.ts`.
- Login calls `POST /identity/auth/login`, stores `accessToken` and `refreshToken` in `localStorage`, and stores the remaining returned user object in persisted Redux state.
- `configs/api.ts` injects `Authorization: Bearer <accessToken>` from `localStorage`.
- A 401 refresh is attempted only when the response message is exactly `Expired token!`; it posts the refresh token to `/identity/auth/refresh`, updates both local-storage tokens, queues concurrent failed requests, and retries the original request.
- Refresh failure shows a toast, clears `token` and `refreshToken` (but not `accessToken`), then redirects to `/auth/login`.
- Header and profile logout clear `accessToken`/`refreshToken`, reset Redux state, and route to `/login`.
- `useCurrentUser` reads Redux state. No current-user (`/me`) fetch or token bootstrap/validation request exists.

## Roles and guards

- The canonical user enum is `EXPERT`, `CLIENT`, and `ADMIN` (`types/user/user.type.ts`).
- UI uses `EXPERT` and `CLIENT` for dashboards, sidebars, profile choices, Workspace views, and role-specific registration. Thus it can distinguish the two AI Available roles required by the backend.
- There is no `middleware.ts`, server-side role guard, route guard component, or centralized 403 redirect. Dashboard layouts choose a sidebar by route, not by verified identity.
- Existing role-specific UI is therefore navigational/presentational, while backend authorization remains the actual protection.

## AI Place reuse decision

Reuse the current Axios bearer-token interceptor, Redux `useCurrentUser` role lookup for navigation/visibility, React Query error paths, and backend authorization. Do not create a second auth provider or token mechanism. Before implementation, resolve the logout redirect inconsistency (`/auth/login` is not an App Router route; `/login` is) and decide whether token bootstrap/current-user validation belongs in a separate hardening task.

# 7. HTTP / API Service Architecture

`configs/api.ts` is the central Axios client. `hooks/userAPI.ts` supplies generic React Query factories for GET, POST-as-query, mutations, and infinite queries. They:

- resolve `:pathParam` placeholders and pass the remaining values as query parameters;
- expect the usual `{ result, message, code }` response envelope;
- default many calls to `retry: 0`;
- optionally invalidate supplied query keys after successful mutations.

There are also domain-specific direct hooks/functions in `workspace.service.ts`, `submission-package.service.ts`, `payment.service.ts`, and `notification.service.ts`. The notification service defensively unwraps both envelope and raw responses. Consequently, response handling is useful but not fully uniform.

Pagination conventions are mixed: generic infinite queries default to zero-based `page`, `size`, `search`, `sortBy`, and `direction`; other services use backend-specific page response types. No generic DTO mapper or standardized API-error-code mapper exists.

Recommended fit: retain `services/` for thin transport/query hooks and add an `features/ai-place/` domain boundary for DTOs, UI, constants, and feature-specific helpers. The AI Available transport should use the existing client, not introduce fetch or an additional Axios client.

# 8. Existing AI Product / Marketplace UI

| File / route | Purpose and data source | Status / reuse | What changes for backend integration |
|---|---|---|---|
| `app/(main)/availableAI/page.tsx` → `/availableAI` | Renders `AvailableAIPage` | Active route; thin reusable route shell | Rename/migrate only when target routes are approved; replace body with marketplace feature |
| `features/available-ai/components/AvailableAIPage.tsx` | Grid and selected-detail dialog state from `availableAIData` | Prototype-only; MEDIUM presentation reuse | Add React Query browse state, filters/pagination/loading/empty/error, server IDs, and real detail navigation/state |
| `features/available-ai/components/AvailableAICard.tsx` | Product-looking card with local bookmark toggle and unconnected comment callback | Static; MEDIUM visual reuse, LOW behavioural reuse | Replace non-backend fields/statuses, make actions role/entitlement-aware, remove/implement unsupported bookmark/comment affordances |
| `features/available-ai/components/AvailableAICardDetail.tsx` | Dialog with mock reviews and inert View Profile/Get Started/Contact controls | Static; LOW-MEDIUM reuse | Needs a real product-detail page/route, rating summary/list, product state/price/preview, purchase/download/rating UX |
| `features/available-ai/mocks/availableAIData.ts` | Nine hardcoded product-like records | Active only as mock source; not backend-ready | Replace later; do not use as contract data |
| `features/homepage/data/homepage.ts` and `features/homepage/components/SolutionSection.tsx` | Homepage cards derive directly from the same mock data; detail action goes to `/availableAI` | Active visual dependency; LOW-MEDIUM reuse | Decide a real featured-products query or intentionally retain marketing-only content; remove mock coupling in integration phase |

The mock type has `Available`/`Trending`/`Sold`, success score, timeline, budget strings, and local reviews. These do not represent the backend product lifecycle (`DRAFT`, `PUBLISHED`, `UNPUBLISHED`), currency/price, purchases, protected assets, entitlement, or persisted ratings. No Expert product-management UI exists.

# 9. Routing / Navigation

Routes are implemented through App Router route groups. Relevant active routes are:

| Audience | Existing routes |
|---|---|
| Public | `/`, `/availableAI`, `/experts`, `/experts/[id]`, `/login`, `/register` |
| Expert | `/expert/dashboard`, `/expert/dashboard/my-services`, `/expert/dashboard/my-applications`, `/expert/dashboard/jobpost/[id]` |
| Client | `/client/dashboard`, `/client/dashboard/create-job-post`, `/client/dashboard/my-job-post`, `/client/dashboard/my-job-post/[id]` |
| Shared project | `/chat-room/[workspaceId]` |
| Profile/admin | `/profile`, `/expert-profile`, `/admin/dashboard`, `/admin/dashboard/[entities]` |

`components/layout/ClientSideBar.tsx` contains separate static CLIENT and EXPERT menus; neither currently exposes AI Place. The public header's “AI Models” link is an on-page homepage anchor, while homepage cards navigate to `/availableAI`. There is no breadcrumb component in the audited app routes.

Recommended eventual route families (recommendation only):

- Client/public browse and detail: `/ai-place` and `/ai-place/[productId]`.
- Client purchase history/detail: `/client/dashboard/ai-place/purchases` and `/client/dashboard/ai-place/purchases/[purchaseId]`.
- Expert management: `/expert/dashboard/ai-place/products`, `/expert/dashboard/ai-place/products/new`, and `/expert/dashboard/ai-place/products/[productId]`.

This keeps role-specific operational screens inside existing dashboard layouts and leaves discovery reachable from the public/main layout. Implement route protection in the same future scope or a prior auth-hardening scope.

# 10. Supabase / Storage

## Confirmed current use

`configs/supabase.ts` creates one browser Supabase client with public URL and anon-key variables. `services/supabase-storage.service.ts` calls `supabase.storage.from(bucket).upload(...)` and immediately calls `getPublicUrl(...)`. It does not use `createSignedUrl`, `remove`, `download`, a service role, or server-side Supabase access.

Current consumers:

- Workspace Submission: `features/workspace/submission/hooks/useSubmissionFileUpload.ts` uploads four package slots to bucket `submission-files`, then persists public URLs through the Workspace API.
- Generic `utils/uploadFile.ts`: uploads profile/general files to bucket `image_url` and returns a public URL. Its consumer path includes avatar/profile flows.

The Phase 2 audit's public-URL finding remains correct. No source can prove bucket visibility/RLS policies, and no protected AI Product code exists.

## AI Place rule

The Workspace helper and its path-generation/business mapping must **not** be reused for protected AI Product assets. AI Place must obtain authorization and an upload token from AI Available, upload to the authorized URL/headers, confirm with that token, and retain backend metadata—not a permanent public URL. Downloads must request short-lived access from AI Available immediately before opening/downloading. The frontend must not construct AI protected object keys, call `getPublicUrl` for those assets, or use a service-role key.

At most, generic presentational utilities such as safe display of browser file name/size and a generic browser upload-progress component could be extracted later after their API assumptions are removed.

# 11. Existing Submission UI Reusability

`ProjectSubmissionPanel.tsx` provides four visible slots: `SOURCE_CODE`, `DOCUMENT`, `VIDEO`, `DATASET`; file pickers, upload-pending state, replacement selection, filename/size display, a complete-four-slots submission gate, slot icons, and previews. The client panel displays read-only submitted packages, native video/PDF/image previews, and direct-link downloads.

| Classification | Current assets |
|---|---|
| A. Reusable presentation | Four-slot card layout, slot labels/icons, selected filename and formatted byte size, upload-pending affordance, replacement affordance, completeness display, generic preview modal pattern |
| B. Workspace-only business logic | Workspace/package IDs; create/resubmit request mapping; latest-version selection; release-day/note rules; Workspace queries and cache keys; client package history |
| C. Public-storage logic not reusable | `submission-files` bucket, frontend-created object path, direct `uploadPublicStorageObject`, `getPublicUrl`, persisted `fileUrl`, preview/download by permanent URL |

The source does not enforce MIME/extension/size constraints for these slots beyond the browser `accept` hint. Its UI must not dictate the AI Available validation contract. AI Place needs backend-driven/error-code-aware validation and permanently locked asset states after first publication.

# 12. Shared UI / Design System

| UI concern | Existing asset | AI Place assessment |
|---|---|---|
| Basic input/button/select/textarea/dialog/tabs/badges/cards | `components/ui/*` | REUSE AS-IS |
| Tables/pagination/filters | `components/dashboard/table/*`, `components/dashboard/crud/*` | REUSE WITH SMALL CHANGES for Expert lists; assess visual fit before choosing CRUD framework |
| Toast | App-wide React Toastify container | REUSE AS-IS |
| Loading/error/empty | Skeleton primitives and several domain-specific implementations | REFACTOR into AI Place-local consistent states; no single standard component |
| Confirm destructive action | `components/dashboard/crud/ConfirmActionDialog.tsx`, alert dialog | REUSE WITH SMALL CHANGES |
| File upload | Workspace slot cards and `file-upload-03.tsx` demo | REFACTOR slot presentation; do not reuse public-storage behavior; `file-upload-03.tsx` is a dead/demo candidate |
| Rating stars | Local renderer inside `AvailableAICardDetail.tsx` | REFACTOR/extract if visual style is retained |
| Money / dates | `utils/formatMoney.ts`, other domain-local formatters; date-fns/moment | REFACTOR: choose one AI Place formatter with backend currency/date types |
| Available AI cards/dialog | `features/available-ai` | REWRITE behaviour; selectively reuse visual language |

The existing purple/gradient marketplace prototype is visually consistent with the homepage but differs from the dashboard's functional styling. The implementation should reuse primitives and tokens, not preserve every prototype component solely to avoid a rewrite.

# 13. State Management

- Authenticated user: persisted Redux `user` slice plus local access/refresh tokens.
- Server data: TanStack React Query with a shared `QueryClient`; domain-specific query keys and mutation invalidation are common.
- Forms: React Hook Form + Zod in auth/admin-style forms; some job-post flows use local state/manual validation.
- Query filters/pagination: React Query keys plus local state; table/CRUD components use their own patterns.
- Modal and upload state: local component state; Workspace upload has a local `uploadingType` state.
- Notifications: React Query cache updated by SockJS/STOMP hook.

AI Place should use the existing Axios + React Query architecture. Use React Hook Form/Zod for product basics and rating forms where it makes validation clearer; use local state for transient upload modal/progress state; use Redux only for current-user/role context. No new state library is warranted.

# 14. Backend Contract Mapping

No AI Available endpoint, DTO, query key, hook, or page exists today. The following maps the supplied completed backend groups to frontend work.

| Backend group | Existing FE implementation / reuse | Required FE additions and states |
|---|---|---|
| Expert Product | None. Reuse Axios/React Query, form primitives, Expert dashboard layout | Product DTOs, list/create/detail/edit/delete/publish/unpublish hooks, Expert pages; draft/published/unpublished, validation, confirmation, saving/error/empty states |
| Expert Storage | None. Reuse four-slot presentation only | Upload authorization/confirm/delete DTOs and hooks, direct authorized PUT/POST transport/progress, token flow, preview upload UX, immutable asset lock states |
| Client Marketplace | Static `available-ai` cards/dialog only | Browse/detail DTOs/hooks, paging/search/filter/sort states, detail page, rating summary/list, loading/empty/error |
| Client Purchase | Existing wallet/proposal payment service is unrelated but offers React Query mutation conventions | Buy/retry/history/detail DTOs/hooks/pages, pending/success/retryable failure UI, idempotency-safe disabled actions |
| Client Download | No suitable implementation; Workspace direct URL flow is incompatible | Download-access request hook, browser opening/downloading only the returned short-lived URL, expiry/error/retry state |
| Client Rating | Mock review display and local star renderer only | Rating create/update/delete DTOs/hooks/form, purchaser eligibility and one-per-purchase state, public list refresh |

The backend OpenAPI at `/v3/api-docs` was not present in this frontend repository and no live endpoint call was made in this read-only source audit. Exact request/response field names, page schemas, upload URL/headers payload, code envelope shape, preview MIME rules, and payment response details must be confirmed against that OpenAPI before implementation.

# 15. Business Rule Compatibility

| Rule | Current compatibility |
|---|---|
| `DRAFT`, `PUBLISHED`, `UNPUBLISHED` | Incompatible: prototype uses Available/Trending/Sold mock labels |
| Description + exactly four protected assets before first publish | Missing: submission UI offers four slots but is tied to Workspace and has no product publish check |
| Protected assets lock permanently after first publish | Missing |
| Published basics/price/preview locked until unpublish | Missing |
| Unpublish does not unlock assets | Missing |
| Purchase PENDING_PAYMENT/SUCCESS and single purchase/retry behavior | Missing |
| No repurchase after success/expiry | Missing |
| 30-day entitlement, repeated downloads, history after expiry, unpublish does not revoke access | Missing; Workspace's persistent public URLs conflict with this model |
| Purchaser-only one active rating per purchase, integer 1..5, update/delete | Missing; mock review list only |
| Optional image/video preview and `MEDIA_INSPECTION_UNAVAILABLE` | Missing; prototype has no upload/preview backend state |

No existing AI Place screen is compatible enough to be wired directly to these business rules without new state/UI. The reusable value is primarily visual/layout level.

# 16. Error Handling

Current conventions are mixed: React Toastify handles short mutation feedback; React Hook Form/Field displays inline form errors; data pages commonly show local error panels with retry; `configs/api.ts` refreshes only one exact expired-token response. No global error-code mapping exists.

| Backend code | Desired AI Place treatment |
|---|---|
| `PRODUCT_NOT_FOUND` | Detail/list mutation: inline page not-found/error state; offer return to marketplace or product list |
| `INVALID_PRODUCT_STATE` | Action-level toast plus immediately refetch product; disable invalid publish/unpublish/edit action based on latest state |
| `DELIVERABLE_LOCKED` | Inline locked asset notice and disabled replacement/delete controls; refetch product |
| `PURCHASE_ALREADY_OWNED` | Inline purchase panel state that links to owned purchase/history; not merely an error toast |
| `PURCHASE_NOT_FOUND` | Purchase detail not-found state; history link |
| `PAYMENT_INSUFFICIENT_BALANCE` | Prominent inline payment failure with wallet/top-up destination only if such functionality is in scope; no automatic retry |
| `PAYMENT_SERVICE_UNAVAILABLE` | Retry action plus toast/status copy; retain a pending/retryable purchase context |
| `ENTITLEMENT_EXPIRED` | Download panel inline expiry state; preserve purchase history, remove/disable direct download action |
| `RATING_NOT_ALLOWED` | Disable/hide rating editor with eligibility explanation; toast only if stale action is attempted |
| `VALIDATION_ERROR` | Map field-specific errors inline where provided; use toast for form-level validation |
| `UPLOAD_METADATA_MISMATCH` | Inline upload card failure, prevent confirmation, let user request fresh authorization/retry according to contract |
| `MEDIA_INSPECTION_UNAVAILABLE` | Non-destructive warning/retry state specific to video preview confirmation; do not discard successfully selected data unless backend requires it |

Implementation should introduce an AI Place-local error-code extractor/mapping rather than baking strings into each component.

# 17. Dead Code / Cleanup Candidates

These are candidates only. No code was deleted or changed. “Unused” is source-reference evidence, not runtime telemetry.

| File/path | Why it appears unused | Confidence | Dependency risk | Recommendation |
|---|---|---|---|---|
| `components/file-upload-03.tsx` | No repository import/reference; contains placeholder cloud-storage/Lorem Ipsum demo | HIGH | Low unless dynamically imported outside source | DELETE LATER |
| `components/layout/AdminSideBar.tsx` | No repository import/reference; admin layout contains a commented sidebar import/use | HIGH | Low; verify intended admin restoration first | DELETE LATER or REFACTOR if admin nav is planned |
| `redux/rootReducer.ts` | No import/reference; `redux/store.ts` creates and uses a duplicate root reducer inline | HIGH | Low | DELETE LATER after a focused Redux cleanup |
| `modules/users/user.mock.ts` | Its import in `user.config.tsx` is only used in commented-out mock configuration | HIGH | Low for current runtime | DELETE LATER |
| `features/available-ai/mocks/availableAIData.ts` | Deliberately active in `/availableAI` and homepage, but all data is prototype/mock rather than backend data | HIGH as obsolete after migration, not unused today | High: homepage depends on it | REFACTOR/REMOVE LATER as part of AI Place migration |
| `features/workspace/chat-room/data/mock-chat-room.ts` | Source is actively imported by chat view; mock naming and console-only composer signal incomplete feature, but it is not unused | LOW for deletion | High | KEEP pending chat scope decision |
| `components/dashboard/crud/*` and `modules/*` | Used by admin/user CRUD routes; some mock code is inactive | LOW as a deletion claim | Medium | KEEP; refactor only in separate admin work |
| `utils/formatMoney.ts` and job-post-local money formatters | Duplicated formatting responsibility | MEDIUM | Medium | REFACTOR LATER; no safe deletion without consolidation |

Additional cleanup findings: debug `console.log` calls remain in login, registration, profile, chat, and job-post creation paths; `payment.service.ts` retains a backend-contract TODO; `configs/api.ts` has an inconsistent refresh-logout route/token removal behavior. These are maintainability/security-hardening candidates, not AI Place prerequisites unless their behavior affects its token refresh.

# 18. Deployment Evidence

What source proves:

- Standard Next scripts exist: `next dev`, `next build`, `next start`.
- The active environment API base is local Gateway-oriented.
- The project has no Next rewrites/proxy and is therefore browser-to-Gateway in local development.

What source does not prove:

- A currently deployed frontend, domain, hosting provider, production environment, CI/CD execution, or runtime environment.
- Docker, Docker Compose, nginx, PM2, Vercel configuration, GitHub Actions, or deployment scripts: none were found in tracked project source.
- Historic ngrok deployment: no ngrok reference is present in current source.

Conclusion: the likely current development method is `npm run dev`/standard Next server with a separately running Gateway. Production deployment status and any prior remote/ngrok configuration are unknown from this repository.

# 19. Recommended Target FE Architecture

Fit the existing root-level structure rather than introducing a parallel application architecture:

```text
features/ai-place/
  components/          product cards, forms, asset slots, purchase/rating/download UI
  expert/              Expert product management views/sections
  marketplace/         browse and public/client detail views
  purchases/           purchase history and detail views
  hooks/               AI Place composition hooks when service hooks are insufficient
  types/               frontend view types and backend DTOs
  constants/           query-key and error/action constants
  utils/               error mapping, currency/date/file presentation helpers

services/
  ai-available-product.service.ts
  ai-available-storage.service.ts
  ai-available-purchase.service.ts
  ai-available-rating.service.ts
```

Each service should use `configs/api.ts` and export named React Query hooks/functions matching current service style. Keep DTOs at `features/ai-place/types/` or a clearly named root type module; do not add a generic `api/` layer unless it reduces demonstrated duplication. Add AI Place navigation only with the matching routes. Retain Workspace submission files unchanged.

# 20. Recommended Implementation Phases

1. **Foundation and contract confirmation.** Read the AI Available OpenAPI; define DTOs/enums/query keys; use current shared Axios/JWT client; add code-aware error mapping. Confirm exact endpoint prefixes, envelopes, pagination, upload authorization protocol, preview restrictions, and payment fields.
2. **Expert product management.** Add Expert routes/navigation, list/create/detail/edit/delete, and clear lifecycle/lock UX. Enforce client-side prerequisites only as guidance; treat backend responses as authoritative.
3. **Preview and protected assets.** Implement auth URL/headers + upload token + confirmation/deletion flows. Reuse four-slot presentation only after detaching Workspace-specific public URL logic. Model permanent asset lock after first publish.
4. **Client marketplace.** Replace static mock marketplace with browse/search/filter/detail, server paging, preview display, and public rating summary/list. Decide a deliberate homepage featured-products strategy.
5. **Purchase and entitlement.** Add buy/retry/history/detail and download-access UI. Model PENDING_PAYMENT/SUCCESS/expired entitlement accurately; download only the returned temporary URL.
6. **Rating.** Add purchaser eligibility, create/update/delete, integer score validation, and invalidation of product summaries/lists.
7. **Integration, cleanup, and regression.** Add consistent empty/loading/error/retry states; responsive QA; remove prototype/mock code only once replacement routes are live; perform a separate approved cleanup of high-confidence dead files and auth/logout hardening.

# 21. Blockers / Unknowns

1. The AI Available OpenAPI/request-response definitions are not present in the frontend source. Exact DTOs, endpoint paths below `/ai-available`, pagination and error-envelope shape must be confirmed before coding.
2. The exact direct-upload authorization contract is unknown: method, signed URL versus form upload, mandatory headers, expiry, progress/CORS requirements, confirmation payload, and preview MIME/metadata behavior.
3. Payment UX details are unknown: buy/retry payloads, idempotency, wallet/balance integration, retryable-status criteria, and post-payment response timing.
4. Current auth refresh is message-string dependent and has a logout redirect/token-clearing inconsistency. It probably works for the existing backend contract, but compatibility with AI Available depends on the gateway returning the same JWT/401 convention.
5. There are no client-side route guards; determine whether backend-only protection is accepted or whether route-level UX guards are a separate requirement.
6. Production deployment, remote Gateway origin/CORS, and any historic ngrok configuration cannot be proven from this repository.
7. Supabase bucket policies and CORS are not represented in frontend source. AI Available protected upload/download must be validated end-to-end against the backend-issued authorization.

# 22. Audit Decision

**NOT READY for implementation without contract confirmation.** The source architecture is ready to host AI Place cleanly, the local Gateway integration target is clear, and the existing UI yields reusable presentation pieces. However, no AI Available frontend contract exists and the exact OpenAPI/upload/payment DTOs are mandatory to implement correctly. Once those are confirmed, proceed with the phased architecture above; do not wire AI Place to the existing Workspace public-Supabase flow.
