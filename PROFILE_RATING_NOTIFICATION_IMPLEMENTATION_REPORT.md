# Profile, Rating, Notification & Deeplink Implementation Report

## 1. Executive Summary

Implemented the four requested scopes without a database migration or a new service. Notification delivery now uses the Notification Service's existing native WebSocket/STOMP endpoint instead of SockJS. AI Place exposes set-based rating aggregates in its existing marketplace contracts. Client and Expert self-profile editors persist through the existing Identity update endpoints, while public expert profiles expose only appropriate information plus published AI Products. Notification navigation is centralized and limited to known, identifier-backed types.

## 2. Files Changed

### Frontend

- `components/layout/Header.tsx`
- `features/ai-place/components/AiPlaceMarketplaceFoundation.tsx`
- `features/ai-place/components/AiPlaceProductDetailFoundation.tsx`
- `features/ai-place/components/ProductRatingSummary.tsx`
- `features/ai-place/types/index.ts`
- `features/notification/NotificationBell.tsx`
- `features/notification/components/NotificationRow.tsx`
- `features/profile/client/ClientProfileView.tsx`
- `features/profile/client/components/ClientProfileFormField.tsx`
- `features/profile/expert/ExpertProfileView.tsx`
- `features/profile/expert/PublicExpertProfileView.tsx`
- `features/profile/expert/components/ExpertProfileEditor.tsx`
- `features/profile/expert/components/ExpertProfileHeader.tsx`
- `hooks/useNotificationSocket.ts`
- `services/ai-available-product.service.ts`
- `services/ai-available-rating.service.ts`
- `services/user.service.ts`
- `types/notification.type.ts`
- `types/user/user.type.ts`
- `utils/notification-destination.ts`
- `utils/notification.utils.ts`

### Backend

- `D:\FA2026\PRN232\Neuro-bridge-BE\ai-available-service\Application\ProductApplicationService.cs`
- `D:\FA2026\PRN232\Neuro-bridge-BE\ai-available-service\Contracts\ProductContracts.cs`
- `D:\FA2026\PRN232\Neuro-bridge-BE\ai-available-service\Controllers\MarketplaceProductsController.cs`
- `D:\FA2026\PRN232\Neuro-bridge-BE\ai-available-service\Program.cs`
- `D:\FA2026\PRN232\Neuro-bridge-BE\notification-service\Models\DTOs\Responses\NotificationResponse.cs`
- `D:\FA2026\PRN232\Neuro-bridge-BE\notification-service\Services\NotificationService.cs`

An existing, unrelated `docker-compose.yml` modification in the backend working tree was preserved and not changed.

## 3. Notification Transport Root Cause

The frontend used SockJS, but the Notification Service accepts a native WebSocket and raw STOMP frames at `/ws/notifications`. Its small `/info` response was not a complete SockJS implementation, so the client never completed a SockJS session and retried every five seconds.

## 4. Notification Transport Implementation

`useNotificationSocket` now creates a browser `WebSocket` through `@stomp/stompjs`. The socket URL derives `ws:` from an HTTP API base URL and `wss:` from an HTTPS API base URL, then preserves the gateway/API path before appending `/notification/ws/notifications?userId=...`.

The existing `/user/queue/notifications` subscription is retained. One client is activated per mounted bell/provider instance, and cleanup calls `deactivate()`. Strict Mode cleanup therefore stops the old connection before the replacement mount connects.

## 5. Reconnect Policy

- Initial retry delay: one second.
- Retry mode: exponential.
- Maximum delay: 30 seconds.
- Terminal STOMP `ERROR`: connection is deactivated and marked paused.
- Repeated WebSocket failures: after six consecutive closes without a successful STOMP connection, the client deactivates and logs a clear paused state.
- Unmount: disables subsequent reconnect work via `deactivate()`.

Incoming notifications are de-duplicated by notification ID before incrementing the cached unread count. REST notification queries remain query-driven; no polling was added.

## 6. Notification Payload and Type Changes

Frontend notification fields now align with the service response: `isRead`, `deeplink`, and optional `purchaseId`. The backend maps the already-persisted `PurchaseId` into `NotificationResponse`; it does not add a field to the database. Backend `deeplink` remains metadata and is not trusted as a frontend route.

## 7. Rating Backend Changes

The existing marketplace list and detail DTOs now include `averageScore` and `ratingCount`. Aggregates are calculated only from ratings belonging to successful purchases. Marketplace browse gets the aggregates in one grouped query for the page of product IDs; it does not issue one database query per card.

The existing browse endpoint now accepts optional `sellerExpertCode`. It keeps the published-product predicate, existing filters, ordering, pagination, preview handling, and protected-asset boundary unchanged.

## 8. Rating Frontend Changes

`ProductRatingSummary` is the shared compact rendering component. It displays `New` when there is no aggregate and otherwise renders `4.8 (12 ratings)`.

Marketplace cards consume the aggregate fields returned with their page. Rating mutations now invalidate marketplace queries so card/profile aggregates refresh after create, update, or delete.

## 9. Marketplace Aggregate Strategy

The implementation uses the scalable option: marketplace list/detail DTO enrichment, not one HTTP summary request per marketplace card. `MarketplaceRead` authorizes authenticated Client and Expert users for the existing read controller only; purchase, assets, and mutation authorization remain unchanged.

## 10. Product Detail Rating Strategy

Product Detail makes the approved existing rating-summary request and displays its aggregate. It also uses the existing paginated public rating-list endpoint for a compact first-page Reviews section showing only score, review text, and dates. No reviewer identity or rating distribution is invented.

## 11. Client Profile Changes

Client Profile now sends a complete `PUT /identity/user/client` request with supported persisted fields: full name, phone, address, gender, date of birth, company name, industry, company description, email, and avatar URL. Email, code, role, and status remain non-editable where appropriate.

Avatar changes accept a durable URL only. The local `FileReader` preview/save behavior was removed. Successful saves update Redux so header/profile identity data changes without a fresh login, while retaining existing access/refresh tokens when the update response omits them.

## 12. Expert Profile Changes

Expert Profile now sends `PUT /identity/user/expert` with its complete base data and a non-empty preserved `skillIds` set. The editor preserves existing skills and does not alter portfolio or certificate behavior. Avatar changes accept a durable URL only.

The unsupported hard-coded `5 / 5 Rating` and derived `Legit Score` were removed. No Expert rating is inferred from Product ratings.

## 13. Public Expert Profile Changes

The public page exposes the expert's name, avatar, role, skills, portfolio, certificates where the current authorization permits them, and published AI Products. It intentionally does not render email, phone, or address. Product cards show product-level—not expert-level—ratings.

## 14. Expert AI Product Seller Filtering

The public/self Expert Profile calls the existing marketplace browse contract with `sellerExpertCode`, page zero, and a small size. The backend always applies `Status == Published`, so Draft and Unpublished products cannot appear. No protected asset location is included in the response.

## 15. Fake Profile Data Removed

- Removed local-only avatar FileReader/localStorage behavior from the active Expert Profile surface.
- Removed the hard-coded Expert `5 / 5 Rating`.
- Removed the derived `Legit Score`.
- Removed the Client Profile's local-only save path and profile console logging.

## 16. Notification Deeplink Resolver

`resolveNotificationDestination(notification, currentRole)` is the only notification route resolver. It supports known types, validates identifiers, URL-encodes route IDs, is role aware, and returns `null` for unsupported/informational types. It never parses title/message or consumes arbitrary backend deeplink strings.

Notification rows mark unread entries as read and navigate if a destination is returned. Navigation is issued independently of the mark-read mutation result. Non-navigating rows remain usable for mark-read.

## 17. Notification Type-to-Route Matrix

| Notification type | Required data | Role | Route | Status |
|---|---|---|---|---|
| `WORKSPACE_INVITED` | `workspaceId` | Client | `/client/dashboard/projects/{workspaceId}` | Supported |
| `WORKSPACE_INVITED` | `workspaceId` | Expert | `/expert/dashboard/projects/{workspaceId}` | Supported |
| `PROJECT_COMPLETED_PAYMENT_RELEASED` | `workspaceId` | Expert | `/expert/dashboard/projects/{workspaceId}` | Supported |
| `JOBPOST_APPLIED` | `resourceId` | Client | `/client/dashboard/my-job-post/{resourceId}` | Supported |
| `PACKAGE_SUBMITTED` | `workspaceId` | Client/Expert | Role-specific project route | Supported |
| `PACKAGE_RESUBMITTED` | `workspaceId` | Client/Expert | Role-specific project route | Supported |
| `PACKAGE_APPROVED` | `workspaceId` | Client/Expert | Role-specific project route | Supported |
| `PACKAGE_REJECTED` | `workspaceId` | Client/Expert | Role-specific project route | Supported |
| `AI_PRODUCT_PURCHASED` | `purchaseId` | Client | `/client/dashboard/ai-place/purchases/{purchaseId}` | Supported |

## 18. Unsupported Notification Types

`CONTRACT_SIGN_REQUIRED`, `CONTRACT_FULLY_SIGNED`, unknown types, historical types, and payloads missing their required identifier return `null`. They remain readable and markable as read; no nonexistent contract/package route was created.

## 19. API and Contract Changes

No new endpoint was introduced.

- Existing `GET /v1/ai-place/products` accepts optional `sellerExpertCode` and returns `averageScore` / `ratingCount` for each list item.
- Existing `GET /v1/ai-place/products/{productId}` returns `averageScore` / `ratingCount` for consistency.
- Existing notification response/socket payload exposes `purchaseId` where it was already stored.
- Existing profile update endpoints are reused unchanged.

## 20. DB Migration Status

No migration was created or changed. The implementation uses existing Identity profile fields, existing seller fields, existing ratings, and existing persisted notification purchase IDs.

## 21. Frontend Validation

- `npx tsc --noEmit`: passed.
- `npm run lint`: completed with zero errors. It reports 37 pre-existing repository warnings, including image optimization and unrelated hook/compiler warnings.
- `git diff --check`: passed.

There is no configured frontend test runner in `package.json`, so no focused automated tests could be added and executed within the existing test infrastructure.

## 22. Backend Validation

- `dotnet build ai-available-service.csproj`: passed, zero warnings/errors.
- `dotnet build NotificationService.csproj`: passed, zero warnings/errors.

No Identity source was changed, so no Maven build was required.

## 23. Runtime Status

Manual runtime testing was not run. The following must be exercised in an integrated environment: native STOMP connect/reconnect/cleanup; one unread increment per delivery; marketplace and detail rating displays; rating CRUD refresh; Client and Expert profile persistence; public expert product filtering; and each supported notification deeplink.

## 24. Regression Risks

- Native WebSocket gateway/proxy configuration must allow upgrade requests at the derived notification URL in each deployed environment.
- The notification middleware currently identifies a session from the query `userId`; this implementation preserves the existing server protocol and does not add browser header authentication.
- The Expert update endpoint rejects missing/invalid base fields or an empty skill collection; the UI blocks those saves, but validation should be checked with real account data.
- Public profile portfolio/certificate visibility continues to depend on existing Identity authorization.
- Marketplace browsing is now available to authenticated Experts as well as Clients; mutation, purchase, and protected asset policies were not broadened.

## 25. Deferred Items

- Binary avatar storage/upload and any migration.
- New bio, experience, availability, hourly-rate, or other profile schema.
- An Expert rating business rule or Product-rating aggregation.
- Rating distribution and reviewer identity.
- Contract-detail/package-detail frontend routes.
- Automated tests, pending introduction of a project test runner/configuration.

## 26. Final Decision

The controlled implementation is complete and ready for integrated manual runtime validation. It reuses existing Identity, AI Available, rating, and notification services; introduces no database migration and no new endpoint; and keeps transport stabilization separate from deeplink routing.
