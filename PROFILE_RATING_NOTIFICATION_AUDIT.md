# Neuro Bridge — Profile, Rating & Notification Audit

**Scope:** read-only audit of `Neuro-bridge-FE` and `Neuro-bridge-BE` on 2026-11-12.  No application source, contract, route, migration, or producer was changed.  The only artifact created is this report.

## 1. Executive summary

The smallest safe next scope is:

1. Repair notification transport first. The frontend uses the SockJS client but the .NET notification service implements a raw WebSocket/STOMP protocol, not SockJS. The connection cannot complete the SockJS/STOMP handshake and `@stomp/stompjs` retries every five seconds indefinitely.
2. Add product-rating read display using the existing summary/review endpoints. Use a one-request-per-product summary only on product detail initially; enrich the marketplace list DTO before placing ratings on every card.
3. Turn the current profile screens into real editors using the already-persisted Identity fields and existing `PUT /identity/user/client` / `PUT /identity/user/expert` APIs. Do not create a profile service or a general profile table.
4. Add notification click routing separately, after transport is stable. The backend already persists a `deeplink`, but the FE type discards it and no click resolver exists. Several template links also do not match current Next routes.

The core profile model is already owned correctly by Identity. Client company data, expert skills, portfolios, certificates, base identity fields, and an avatar URL are persisted. Expert bio/about and explicit experience are not persisted. Published AI products can be associated with an expert in the AI Available database, but no consumer-safe query exists for a profile to list another expert's published products.

## 2. Recommended implementation order

1. **Notification transport/reconnect fix** — isolated FE transport change, with a protocol-level integration test against Notification Service.
2. **AI Place rating display** — product detail first; marketplace aggregate contract second if cards must show ratings.
3. **Real Client/Expert profile** — wire existing Identity APIs; add only the narrowly required AI-product seller filter and any deliberately approved profile fields.
4. **Notification deeplink resolver and route-contract alignment** — a separate click/navigation batch, not coupled to the transport repair.

This keeps Rating before Expert Profile only where the profile's AI Product section displays product ratings. Core profile editing does not depend on rating.

## 3. Profile audit

### Current FE state

| Surface | Route | Current data / behavior | Status |
|---|---|---|---|
| Client self profile | `/profile` | Renders Redux login user: full name, email, phone, address, avatar, company name, industry, company description, code/status. | UI exists; editor is local-only. `handleSave` only logs to console. |
| Expert self profile | `/expert-profile` | Uses Redux owner data; loads portfolios, skills and certificates by expert code. | Partial data display; no real profile editor. |
| Public expert profile | `/experts/[id]` | Loads user and skills by expert code. | Partial; does not show portfolio, certificates, bio, history, or AI products. |
| Header profile entry | Header dropdown | Chooses `/profile` for Client and `/expert-profile` for Expert. | Exists. |
| Dashboard navigation | Client/Expert sidebars | No dedicated Profile entry. | Missing navigation only, not a route/API gap. |
| Expert link from job-post applicant | Client applicant card | Builds `/experts/{expertCode}`. | Existing public-expert entry point. |

Both avatars are mock/local behavior: `ClientProfileView` previews a `FileReader` data URL only in React state; `ExpertProfileHeader` saves base64 only in browser `localStorage` as `expert-avatar`. Neither invokes an upload API or persists `avatarUrl`. The Header listens for that local browser event. This is not durable avatar support.

`ExpertProfileHeader` displays a hard-coded `5 / 5 Rating` and derived `Legit Score`; neither is backed by a product-rating or expert-rating contract. `types/profile-types.ts` is an unused/inconsistent profile model (`AI_EXPERT`, invented portfolio/completed/rating fields) and must not be treated as API evidence.

`UserResponse` in FE omits `id` even though the Identity response includes it. The actual login payload likely still carries it at runtime, but the declared type is incomplete; notification bootstrap depends on `currentUser.id`.

### Current BE state and ownership

Identity owns the correct core entities:

| Owner | Persisted fields |
|---|---|
| `users` / `User` | UUID id, immutable code, full name, gender, status, address, date of birth, `avatarUrl`, role, phone, email, created time, password. |
| `ClientProfile` (one-to-one) | `companyName`, `industry`, `companyDescription`. |
| `ExpertProfile` (one-to-one) | `completedProjects`, `rating`, many-to-many skills, one-to-many portfolios and certificates. |
| `Portfolio` | title, description, technologies, completed date, role in project, URL. |
| `Certificate` | name, issuer, issue/expiry dates, credential ID/URL, image URL. |

The persisted `ExpertProfile.rating` must not be surfaced as a product-rating aggregate without a documented business rule. It is a separate value today and is not emitted by `UserResponse`.

### Existing profile-related APIs

| API | Use |
|---|---|
| `GET /identity/user/{code}` | Existing user lookup; used by public expert profile. It returns core fields plus Client fields or expert `skillIds`. |
| `PUT /identity/user/client` | Authenticated Client self-update. Requires the complete `ClientRequest`: base required fields plus company name, industry, and description. |
| `PUT /identity/user/expert` | Authenticated Expert self-update. Requires complete base fields plus non-empty `skillIds`. |
| `GET /identity/skill/expert/{code}` | Existing public skill display. |
| `GET /identity/portfolio/expert/{code}` | Existing portfolio display. |
| `GET /identity/certificate/expert/{code}` | Existing certificate display (controller authorization should be checked against the intended public experience). |
| Existing portfolio/certificate CRUD and skill assignment APIs | Available for expert profile-management UI, subject to their existing ownership/authorization behavior. |

There is no HTTP `GET /identity/user/me`, even though an internal `getCurrentUser()` service method exists. A self page can reuse its Redux code and `GET /identity/user/{code}` in the smallest batch; a dedicated self endpoint is an optional hardening improvement, not required to make the current scope real.

### Available fields and gaps

**Client fields available now:** id (backend/login payload), code, full name, email, phone, address, gender, date of birth, avatar URL, status, role, created time, company name, industry, and company description. Project/job summaries can be queried from their owning services; they are not profile fields.

**Expert fields available now:** base identity fields and avatar URL; skill IDs and skill records; portfolios; certificates; persisted but currently unexposed `completedProjects` and separate `rating`. There is no persisted expert bio/about, explicit years/experience summary, public availability, rate, work-history summary, or AI product collection in Identity.

**Missing API/schema only if the product decision requires it:**

- A binary avatar upload capability is absent. `avatarUrl` already exists, so no migration is needed if the approved first release accepts a URL managed by an existing media system. A general avatar upload flow requires a storage/upload contract; do not repurpose private AI-product asset storage.
- Bio/about and explicit experience need deliberate Identity fields and an Identity migration/update-response mapping if they are required. Do not infer them from portfolio text.
- `completedProjects`/separate expert rating require response/API work before display; neither should be synthesized from product ratings.

### Proposed minimal real profile scope

Client: durable self editor for the fields already in `ClientRequest`, display immutable code/role/status, durable avatar URL only when an approved URL source exists, and links to Wallet/Jobs/Projects rather than duplicate their data.

Expert: durable self editor for base fields and `skillIds`, existing portfolio/certificate management surfaces, and public expert presentation using the existing lookup/skills/portfolio/certificate endpoints. Exclude fabricated expert rating, "Legit Score", fake hire/message actions, and local-only avatar state. Add bio/experience only after the business fields are approved.

### AI Products on Expert Profile

AI Available persists `SellerExpertId` and `SellerExpertCode` for every product; Marketplace detail also returns seller id/code/display name/avatar. The existing expert endpoint (`GET /v1/ai-place/expert/products`) returns only the authenticated expert's own products and cannot serve another expert's profile. Marketplace browse lacks a seller filter and its list item does not include seller data.

The smallest contract change is to extend the existing marketplace browse endpoint with an explicit `sellerExpertCode` (or immutable seller id) filter restricted to published products. The profile already knows the expert code, so the list DTO need not repeat seller metadata. Its present `ClientOnly` policy must be intentionally broadened or a public profile-oriented read policy added if `/experts/[id]` is meant to work for anonymous or Expert viewers. A separate profile microservice is not warranted.

## 4. Rating audit

### Existing contract and CRUD

| Capability | Existing endpoint / contract | Notes |
|---|---|---|
| Create own purchase rating | `POST /ai-available/v1/ai-place/client/purchases/{purchaseId}/rating` | Successful purchaser only; score must be integer 1–5; one rating per purchase. |
| Update own rating | `PUT .../rating` | Successful purchaser only. |
| Delete own rating | `DELETE .../rating` | Deletes the record; no soft-delete behavior. |
| Purchase detail own rating | Purchase detail contains optional `rating`. | Already used by `PurchaseRatingPanel`. |
| Public list/reviews | `GET /ai-available/v1/ai-place/products/{productId}/ratings?page=&size=` | Paginated, newest first, returns score/review text/created/updated; only ratings on successful purchases. |
| Aggregate | `GET /ai-available/v1/ai-place/products/{productId}/ratings/summary` | `{ productId, ratingCount, averageScore }`; average is nullable for no ratings. |

Rating summary and list both require an existing **published** product. The controller currently has `ClientOnly` authorization; it is not a general public/expert-rating read API. The FE already has `getProductRatings`, `getProductRatingSummary`, `useProductRatings`, and `useProductRatingSummary`, but no marketplace/detail display uses the summary hook.

### Placement and strategy

**Product detail:** call the existing summary endpoint directly. One product page means one bounded extra request and it allows a simple `4.8 (12 ratings)` / `New` component. Add paginated reviews only if the approved UI includes a review section.

**Marketplace cards:** do **not** make N summary requests for a page of N products. It is technically cacheable through React Query but remains N HTTP requests, N DB aggregate queries, and creates a thundering refresh pattern. Prefer extending `MarketplaceProductListItemResponse` and detail response with `averageScore` and `ratingCount`, calculated set-wise in the list query/application service. This is the simpler scalable end state for cards. Do not add a distribution; the existing product-rating business need does not require it.

**Expert profile reuse:** display the same per-product rating summary next to each published product. Do not calculate or label an Expert Rating from those values. The seller profile query should include aggregates in its product list contract, rather than issue a summary request per product.

### Existing FE integration points

- Marketplace cards: `features/ai-place/components/AiPlaceMarketplaceFoundation.tsx`.
- Product detail: `features/ai-place/components/AiPlaceProductDetailFoundation.tsx`.
- Rating mutation UI: `features/ai-place/components/PurchaseRatingPanel.tsx`.
- API/hooks: `services/ai-available-rating.service.ts`.

## 5. Notification request-loop audit

### Exact repeating traffic and expected frequency

`useNotificationBell` makes one initial REST request each for:

- `GET /notification/api/v1/notifications/user/{userId}`
- `GET /notification/api/v1/notifications/user/{userId}/unread-count`

There is no polling or notification-query retry (`retry: 0`). React Query can refetch those queries on browser window focus and browser network reconnect because the global defaults enable both. They should not repeat on a timer during a stable mounted session.

The repeating transport is the SockJS/STOMP connection established by `useNotificationSocket`. Its configured `reconnectDelay: 5000` has no attempt cap, backoff, terminal-auth handling, or error handler. Therefore a failed connection creates a new attempt every **five seconds** for as long as the bell remains mounted. Browser DevTools normally shows SockJS `/info` discovery plus WebSocket/transport attempts under `/notification/ws/notifications...`; it may be described as repeated notification requests although it is not a repeating REST list fetch.

### Root cause (confirmed by source)

The protocols do not match:

- FE creates `new SockJS(socketUrl)` and hands that transport to `@stomp/stompjs`.
- BE only writes a minimal SockJS-looking `GET /ws/notifications/info` response, but then accepts native WebSockets and reads/writes **raw STOMP frames**.
- A SockJS WebSocket session uses a SockJS open frame and JSON-wrapped message frames (`o`, `a[...]`, etc.), not raw STOMP. The server neither sends the initial SockJS open frame nor unwraps/wraps SockJS messages. Its raw handler never completes a valid SockJS + STOMP session.

This is a **FE+BE protocol-compatibility defect**, with the visible reconnect loop driven by FE's unconditional 5-second reconnect policy. It is not caused by Kafka, notification REST polling, React Strict Mode, duplicate Bell instances, or healthy-connection reconnect logic.

### Lifecycle findings

- Exactly one `NotificationBell` is rendered in each dashboard layout; no second consumer was found for a given route.
- The socket effect has correct React cleanup (`deactivate()`), keyed by stable `queryClient` and `userId`. React Strict Mode can intentionally produce a mount/cleanup/remount development sequence, but it is not the recurring five-second loop.
- A healthy STOMP client does not schedule reconnects itself; reconnection follows failure/disconnect. There is no application heartbeat configured on the FE; BE raw WebSocket keep-alive is 30 seconds.
- Authentication failure has no terminal state: the client passes a query-string user id, no bearer STOMP CONNECT header, and reconnects forever after any connection failure. BE accepts any query `userId` and substitutes `anonymous` when missing, so it currently does not provide a clean auth rejection for the client to classify.
- A newly received notification increments unread count blindly, including when an existing notification id is replaced. That can overcount duplicate deliveries, but it does not create reconnect traffic.
- BE response uses `isRead` and includes `deeplink`; FE declares `read` and omits `deeplink`. That causes read-state/deeplink defects, not the transport loop.

### Correct fix scope

Pick exactly one protocol and test it end-to-end:

1. **Recommended smallest FE-oriented fix:** replace SockJS use with a native WebSocket factory/broker URL targeting the existing raw STOMP endpoint. Construct `ws`/`wss` from the API base and retain the current raw STOMP server. Add explicit `onStompError`, `onWebSocketClose`, bounded exponential backoff, and terminal handling for authentication/authorization failures.
2. **Alternative BE-oriented fix:** implement a real SockJS server (all required transport/session framing), then keep the FE SockJS client. The current `/info` shim is insufficient.

Keep the socket singleton at dashboard/provider scope if later navigation creates multiple consumers. Do not mix this change with deeplink click routing. Verify success with one connected session, one `SUBSCRIBE`, no reconnect over several minutes, Strict-Mode mount cleanup, authenticated/unauthenticated behavior, and delivery/read-count reconciliation.

## 6. Notification deeplink audit

### Current payload contract

The notification database/REST/WebSocket response already persists and emits `type`, `resourceId`, `workspaceId`, `deeplink`, `isRead`, and `createdAt`. FE currently models only `type`, `resourceId`, `workspaceId`, `read`, and `createdAt`; `deeplink` is silently unused. `NotificationRow` only marks a notification read; it never navigates.

The authoritative normal-event producers use `common-starter` `NotificationEvent`. Commented-out orchestration examples and the unused `PackageNotificationEvent` were excluded because they do not emit runtime notifications.

### Actual producer/type matrix

| Type | Producer | Recipient | `resourceId` means | `workspaceId` | Backend deeplink produced | Current FE destination / assessment |
|---|---|---|---|---|---|---|
| `PACKAGE_SUBMITTED` | Workspace `SubmissionPackageService` | Client | submission package id | workspace id | `/workspaces/{workspaceId}/packages/{packageId}` | Client project/chat package surface exists, but this exact route does not. **CONTRACT/route mapping gap**. |
| `PACKAGE_RESUBMITTED` | `SubmissionPackageService` | Client | submission package id | workspace id | same as above | Same gap. |
| `PACKAGE_APPROVED` | `DeliverableFileService` | Expert | submission package id | workspace id | same as above | Expert project/chat package surface exists, but exact route absent. **CONTRACT/route mapping gap**. |
| `PACKAGE_REJECTED` | `DeliverableFileService` | Expert | submission package id | workspace id | same as above | Same gap. |
| `WORKSPACE_INVITED` | `WorkspaceInitializationService` | Client and Expert | workspace id | workspace id | `/workspaces/{workspaceId}` | Role-specific project routes exist: `/client/dashboard/projects/{id}` and `/expert/dashboard/projects/{id}`. **FE mapping only** if resolver uses role + workspace id; persisted backend link is stale. |
| `PROJECT_COMPLETED_PAYMENT_RELEASED` | `ProjectDetailService` | Expert | project detail id | workspace id | `/workspaces/{workspaceId}/projects/{projectId}` | Expert workspace route is available but not a project-detail subroute. **FE mapping only** to Expert project, unless a project-detail route is later added. |
| `JOBPOST_APPLIED` | JobPost `ApplyJobPostService` | Client | job-post id | null | `/job-posts/{jobPostId}/applies` | Existing client job-post detail is `/client/dashboard/my-job-post/{id}`. **FE mapping only** to detail; backend string is stale. |
| `CONTRACT_SIGN_REQUIRED` | JobPost `ContractService` | whichever counterparty has not signed | contract id | null | `/contracts/{contractId}` | No contract route was found. **NO current deeplink target / contract-product gap**. |
| `CONTRACT_FULLY_SIGNED` | `ContractService` | Client | contract id | null | `/contracts/{contractId}` | Same gap. |
| `AI_PRODUCT_PURCHASED` | AI Available purchase-payment event, consumed specially by Notification Service | Buyer Client | product id | null; persisted `purchaseId` separately | `/ai-place/client/purchases/{purchaseId}` | Actual FE route is `/client/dashboard/ai-place/purchases/{purchaseId}`. Payload has enough ids but FE's declared type lacks `purchaseId`; **contract mapping gap** unless resolver trusts/corrects the backend deeplink. |

All ten types above are actively emitted in code. Notification templates recognize the first nine normal event names. `AI_PRODUCT_PURCHASED` follows a dedicated consumer/service path and is idempotently deduplicated by event/purchase recipient indexes.

### Readiness and contract gaps

**Deeplink-ready payload data, FE mapping only:** `WORKSPACE_INVITED`, `PROJECT_COMPLETED_PAYMENT_RELEASED`, and `JOBPOST_APPLIED` have the explicit identifiers necessary for current role-aware route selection. Package events can at least navigate to their role-specific workspace/chat screen because workspace id is present; direct package drill-down is not routed today.

**Contract change or product-route decision required:** contracts have no FE destination; package events name a resource but no matching direct package page; AI purchase needs `purchaseId` in the public response/type or a corrected canonical deeplink. Current Backend-generated deeplink strings are not a reliable contract because none of the inspected strings matches its current Next route exactly.

**No deeplink required:** none of the ten current emitted types is purely informational by definition, but unsupported/unknown historical notifications should return `null`, not guess from title/message. No profile notification type is emitted, so Profile work creates no deeplink dependency.

### Centralized resolver design

Implement one FE-only resolver, e.g. `resolveNotificationDestination(notification, currentRole)`, after transport work. It should switch on known types, validate required UUID/string IDs, select the role-specific workspace/job route, use a canonical backend `deeplink` only after it is aligned/validated, and return `null` for contracts without a UI or unknown/informational types. It must never parse `title` or `message`.

Update the FE notification type to faithfully represent backend fields (`isRead`, `deeplink`, and `purchaseId` if exposed) before implementing clicks. Mark-read and navigation should be independent operations; a failed mark-read must not prevent safe navigation.

## 7. Cross-dependencies

- **Rating → Expert Profile:** product-rating summary UI/component and list aggregate contract should be reusable in the Expert AI Products section. The profile must show product-level figures only; it must not imply an Expert Rating.
- **Profile → Notification:** no current producer targets a profile. No profile route must be added to the deeplink matrix now.
- **Transport → deeplink:** independent. The reconnect fix changes connection lifecycle/protocol; deeplink adds click resolution and types. Keep them as separate patches and tests.
- **Identity ↔ AI Available:** Identity owns profile. AI Available owns published products and ratings. Integrate through the existing seller identifiers; do not copy product/rating data into Identity.

## 8. Files likely to change

### Batch 1 — notification transport

- `hooks/useNotificationSocket.ts`
- `utils/notification.utils.ts`
- potentially `hooks/useNotificationBell.ts` (only for connection/error state)
- `notification-service/WebSocket/StompWebSocketMiddleware.cs` **only if** the team chooses real SockJS rather than native WebSocket FE transport
- focused notification socket/integration tests (new test files as appropriate)

### Batch 2 — rating display and aggregate contract

- `features/ai-place/components/AiPlaceProductDetailFoundation.tsx`
- `features/ai-place/components/AiPlaceMarketplaceFoundation.tsx`
- new small rating display component
- `features/ai-place/types/index.ts`
- `services/ai-available-rating.service.ts`
- `ai-available-service/Contracts/ProductContracts.cs`
- `ai-available-service/Application/ProductApplicationService.cs`
- rating/product contract tests

### Batch 3 — real profile and expert AI products

- `features/profile/client/ClientProfileView.tsx`
- `features/profile/expert/ExpertProfileView.tsx`
- `features/profile/expert/PublicExpertProfileView.tsx`
- `features/profile/expert/components/ExpertProfileHeader.tsx`
- `services/user.service.ts`, `types/user/user.type.ts`, and dedicated profile hooks/types
- `components/layout/ClientSideBar.tsx` (and dashboard layout sidebar-role correction where relevant)
- `services/ai-available-product.service.ts`, AI Place types
- Identity DTO/mapper/entity/migration files only if bio/experience is approved
- AI Available browse query/controller/application files to add seller filtering

### Batch 4 — deeplinks

- `types/notification.type.ts`
- `features/notification/components/NotificationRow.tsx`
- new `utils/notification-destination.ts` (or equivalent resolver)
- `hooks/useNotificationBell.ts` / `services/notification.service.ts` only for accurate field mapping
- Notification template/producers only after a canonical route-contract decision; avoid changing them merely to duplicate FE mappings.

## 9. DB/API changes potentially required

| Change | Required now? | Decision |
|---|---:|---|
| Client core profile persistence | No | Existing Identity entities and update APIs cover it. |
| Expert skills/portfolio/certificate persistence | No | Existing Identity structures/APIs cover it. |
| Avatar URL | No | Existing field/update DTOs cover a supplied URL; binary upload is separate. |
| Bio/about/explicit experience | Conditional | Requires Identity schema/DTO/mapping migration only if included in approved scope. |
| Product rating aggregate in marketplace list/detail | Yes, if card/list display is required | DTO/application API enrichment only; no new DB table/migration. |
| Query published products by seller for profile | Yes | Prefer adding a seller filter to existing marketplace browse; no DB migration (seller columns/index already exist). |
| Notification deeplink click support | No DB migration | FE type/resolver plus canonical route alignment; expose existing `purchaseId` if needed. |
| Notification transport | No DB migration | Protocol/lifecycle fix only. |

**DB migration required: NO for the recommended baseline.** It becomes **YES** only if approved Profile scope includes new persisted fields such as expert bio/experience, or a new durable avatar-storage metadata design.

**New API endpoints required: none for the baseline.** Prefer these existing-endpoint extensions/reuse decisions instead:

- Extend existing `GET /v1/ai-place/products` with `sellerExpertCode`/seller-id filter for Expert Profile products.
- Enrich existing marketplace list/detail rating DTOs if marketplace cards display rating.
- Reuse Identity update/read, portfolio, certificate and skill endpoints.
- Reuse existing product-rating summary/list endpoints for Product Detail/reviews.

Optional new endpoints only if product requirements demand them: a secure generic avatar-upload authorization flow; `GET /identity/user/me` for self-profile hardening; a public seller-product read endpoint if marketplace authorization must remain Client-only.

## 10. Regression risks

- Socket protocol changes can break notification delivery behind the API gateway, WebSocket upgrade handling, and local/prod `ws` versus `wss` URLs. Test authenticated and unauthenticated cases.
- Changing profile update wiring must preserve required request fields, role gates, authentication/session refresh, and Redux persisted-user synchronization.
- The identity lookup currently exposes contact fields; public-profile privacy/authorization needs a deliberate review before expanding its audience.
- Marketplace aggregate enrichment must preserve published-only visibility, filter/pagination totals, signed preview URL behavior, purchase checks, entitlement, and rating invalidation after CRUD.
- Product profile filtering must not expose drafts/unpublished products or protected asset locations.
- Deeplink changes can send users to a wrong role route, expose unauthorized resources, or make a notification unread change block navigation. Unsupported types must remain non-clickable.
- Preserve payment, wallet, JobPost, Workspace/Project, protected downloads, rating CRUD, Kafka event semantics, and purchase-notification idempotency.

## 11. Recommended implementation batches

1. **Transport stabilisation:** native raw WebSocket STOMP (or complete SockJS server), bounded retry, singleton/lifecycle test, payload field alignment. No routing changes.
2. **Rating read UI:** Product Detail summary; reviews only if needed; follow-up API DTO aggregates before card display.
3. **Core Profile:** replace console/local-only saves with Identity updates; sync Redux; show existing expert skills/portfolio/certificates; remove fake ratings/actions; add seller-filtered AI products and per-product rating display.
4. **Optional Profile fields:** only after business approval, add Identity-owned bio/experience and migration.
5. **Deeplinks:** establish canonical route mapping, implement resolver/click behavior, correct template strings or treat backend deeplink as non-authoritative until aligned.

## 12. Final decision

Proceed with the four batches above. The notification reconnect loop is a real high-priority **FE+BE protocol mismatch** with an FE infinite retry policy; repair it before expanding notification behavior. Rating data is already sufficient for product-detail display, but marketplace-card display should use an aggregate-enriched list instead of N requests. Profiles can become real now with Identity-owned fields and existing update APIs; defer bio/experience and binary avatar upload unless explicitly required. Expert AI Products require a narrow AI Available browse filter extension. Notification deeplinks need a centralized FE resolver and route-contract alignment, not title parsing and not a new notification service.
