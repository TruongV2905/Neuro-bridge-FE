# Client & Expert Dashboard Audit

## 1. Executive Summary

The Client dashboard is a static placeholder. Its four KPI values, project rows, weekly activity, and success rate are hard-coded; only its **Create Job Post** link is live.

The Expert root route is a live Jobpost Marketplace, not a dashboard. `app/expert/dashboard/browse-job-posts/page.tsx` redirects back to that root, so changing the root without first moving the Marketplace would remove an active feature.

A useful operational dashboard can be built mostly from existing read APIs. The baseline should show reliable totals, current bounded lists, wallet balance, and feature links. It should deliberately avoid fabricated trend/change data, status totals derived from a single page, a unified synthetic activity feed, and any N+1 application query pattern.

No backend change is required for the recommended baseline. A small frontend hook can adopt the already-existing paginated expert-application endpoint for an accurate bounded application count.

## 2. Current Client Dashboard

`app/client/dashboard/page.tsx` is a client-side static screen. It currently renders hard-coded values for **Active Projects (3)**, **Total Proposals (12)**, **Saved Experts (8)**, **Success Rate (94%)**, three static project rows, and static weekly ratios. Those values are not connected to any API or hook.

The existing Client sidebar correctly treats `/client/dashboard` as Dashboard. It already exposes live destinations for My Jobpost, Create Jobpost, Projects, AI Place, My Purchases, and Wallet.

## 3. Current Expert Dashboard / Marketplace Conflict

`app/expert/dashboard/page.tsx` renders `ExpertJobpostMarketplaceView`. This is the active Expert Jobpost Marketplace.

`app/expert/dashboard/browse-job-posts/page.tsx` is not a browse page; it redirects to `/expert/dashboard`. The Expert sidebar's **Browse Jobpost** item and all three “Back to Marketplace” links in `ExpertJobpostDetailView` currently target the root.

Therefore the root cannot become a dashboard until the Browse Jobpost route renders the same existing Marketplace view and all Marketplace-intended links are moved to it.

## 4. Expert Route Migration Analysis

Recommended safe end state:

* `/expert/dashboard` renders the new operational Expert dashboard.
* `/expert/dashboard/browse-job-posts` renders the unchanged `ExpertJobpostMarketplaceView`; it must stop redirecting.
* `/expert/dashboard/jobpost/[id]` remains the existing job-detail route.

| Current reference | Current meaning | Desired route / behavior | Change required |
|---|---|---|---|
| `app/expert/dashboard/page.tsx` | Live Jobpost Marketplace | Expert Dashboard at `/expert/dashboard` | Replace root rendering only after browse route is live |
| `app/expert/dashboard/browse-job-posts/page.tsx` | Reverse compatibility redirect to Marketplace root | Live Marketplace at `/expert/dashboard/browse-job-posts` | Replace redirect with the existing Marketplace view |
| Expert sidebar: `Browse Jobpost` | Intended Marketplace navigation | `/expert/dashboard/browse-job-posts` | Update URL |
| Expert sidebar | No Dashboard entry exists | Add Dashboard entry to `/expert/dashboard` | Add navigation item |
| `Header.tsx` Expert `dashboardPath` | Generic Expert home | `/expert/dashboard` | No URL change; it becomes semantically correct |
| `ExpertJobpostDetailView` error fallback, breadcrumb, and top button | Return to Marketplace | `/expert/dashboard/browse-job-posts` | Update all three links together |
| `ExpertJobpostCard` detail link | Jobpost detail | `/expert/dashboard/jobpost/{id}` | No change |
| Notification destination resolver | Workspace notification navigation | `/expert/dashboard/projects/{workspaceId}` | No change |
| AI Product routes | Product management | `/expert/dashboard/ai-place/products...` | No change |
| Homepage CTA / other direct root reference | No root Marketplace CTA was found | N/A | No change |

There is no current notification deeplink to the Expert root or Marketplace route. The migration is therefore separate from recently implemented notification routing.

## 5. Client Data-Source Inventory

| Dashboard need | Existing endpoint / service owner | FE hook / service | Fields and reliable use | Pagination / request |
|---|---|---|---|---|
| My Job Posts | `GET /jobpost/job-post/client` — Jobpost service | `useGetClientJobPosts` | `totalElements`; item `id`, `title`, `status`, budgets, `expertApplyCodes` | Paged; one bounded query is sufficient |
| Projects | `GET /workspace/api/v1/workspaces/dashboard` — Workspace service | `useWorkspaceDashboard` | `totalElements`; `projectName`, `projectStatus`, `progressPercentage`, `deadline`, partner | Paged; server sorts `createdAt DESC` |
| AI Products Owned | `GET /ai-available/v1/ai-place/client/purchases` — AI Available | `useAiPlacePurchaseHistory` | `totalElements`; product snapshot, `purchasedAt`, entitlement status | Paged, successful purchases only, sorted purchase date descending |
| Wallet Balance | `GET /payment/api/wallet/mine` — Payment | `useGetMyWallet` | `walletBalance`, wallet status; existing VND formatter | Single read |
| Notifications | Existing Notification service list/count/socket initialized by dashboard layout | `NotificationBell` / `useNotificationBell` | unread count and preview list are already React Query cached | Do not initialize another bell/socket from dashboard content |

The job-post statuses are exactly `PRIVATE`, `PUBLIC`, and `ASSIGNED`. They must not be relabelled as Open/In Progress/Closed without a confirmed business mapping. The list response does not include `createdAt`; a bounded first page can be shown as “Latest job posts” only when requested in the established sort order, without displaying a fabricated date.

## 6. Expert Data-Source Inventory

| Dashboard need | Existing endpoint / service owner | FE hook / service | Fields and reliable use | Pagination / request |
|---|---|---|---|---|
| AI Products | `GET /ai-available/v1/ai-place/expert/products` — AI Available | `useExpertProducts` | `totalElements`; name, status, price, `updatedAt`, `lastPublishedAt` | Paged; server orders own products by `updatedAt DESC` |
| My Applications count | `GET /jobpost/apply-job-post/my-applies` — Jobpost service | No FE hook currently; endpoint already exists | Spring page `totalElements` from current expert's applications | Use page 0 / size 1 for a bounded count query |
| Current applications UI | `GET /jobpost/job-post/expert-apply` plus one applicants call per returned job — Jobpost service | `useGetExpertAppliedJobPosts` plus `useQueries` in `ExpertMyApplicationsView` | Job-post list followed by per-job application detail lookup | Existing screen is N+1; do not mount this data flow on the dashboard |
| Projects | `GET /workspace/api/v1/workspaces/dashboard` — Workspace service | `useWorkspaceDashboard` | Same role-aware project summary as Client | Paged; server sorts `createdAt DESC` |
| Wallet Balance | `GET /payment/api/wallet/mine` — Payment | `useGetMyWallet` | `walletBalance`, status | Single read |
| Notifications | Existing layout notification system | `NotificationBell` / cached query state | unread count / preview already loaded | Do not create a second socket |

`/my-applies` is owned by the current expert and returns a paginated `Page<ApplyJobPostResponse>`, so its total is reliable. Its DTO includes application/proposal data but not the job-post summary needed for a useful dashboard row. It is appropriate for the count card, not for a recent-application list. The existing `expert-apply` route is a complete but unbounded distinct job-post list and has no documented sort; it is not a good long-term dashboard summary source.

## 7. Client KPI Feasibility Matrix

| Proposed card / section | Classification | Evidence / recommendation |
|---|---|---|
| My Job Posts | READY | Use `PageResponse.totalElements` from Client job posts. |
| Job-post status breakdown | NEEDS EXISTING API EXTENSION | A current page cannot represent global status totals. Three filtered calls would be avoidable fan-out; omit from baseline. |
| Active Projects | NEEDS EXISTING API EXTENSION | Workspace response has total projects and per-item project state, but no filtered aggregate. “Active” business semantics span more than one possible state. Use **Projects** total instead. |
| Projects total | READY | `WorkspaceDashboardPage.totalElements`. |
| AI Products Owned | READY | Purchase history totals only successful purchases and is ordered newest first. |
| Wallet Balance | READY | Existing wallet endpoint and VND formatting. |
| Recent/current projects | READY | Use first three workspace summaries; server ordering is newest workspace first. |
| Latest purchases | READY | Use first three purchase-history rows, ordered `PurchasedAt DESC`. |
| Latest job posts | READY WITH FE DERIVATION | Query a small sorted first page and render only returned title/status/budget; do not claim date if omitted by response. |
| Dashboard notifications | READY WITH CACHE REUSE | Read existing cache only if a small notification indicator is desired; default baseline should rely on the persistent Bell. |
| Revenue/trends/success rate/activity ratios | NOT RECOMMENDED | No explicit historical aggregation contract supports these. |

## 8. Expert KPI Feasibility Matrix

| Proposed card / section | Classification | Evidence / recommendation |
|---|---|---|
| AI Products total | READY | Use the paginated own-product response `totalElements`. |
| Published / Draft / Unpublished totals | NEEDS EXISTING API EXTENSION | Current list page status counts are not all-product totals. Do not count only the current page. |
| My Applications | READY WITH FE HOOK ADOPTION | Add a narrow frontend hook/type for existing `/apply-job-post/my-applies?page=0&size=1`; use `totalElements`. No backend API change. |
| Active Projects | NEEDS EXISTING API EXTENSION | Same Workspace limitation as Client. Use **Projects** total in baseline. |
| Projects total | READY | Use `WorkspaceDashboardPage.totalElements`. |
| Wallet Balance | READY | Existing wallet endpoint. |
| Recent AI Products | READY | First bounded page is ordered `updatedAt DESC`; show actual product status. |
| Recent projects | READY | First bounded workspace page is ordered `createdAt DESC`. |
| Recent applications | NOT RECOMMENDED FOR BASELINE | Current detailed UI is N+1; `/my-applies` lacks job-post summary and unspecified default sorting should not be presented as recent. |
| Product performance/revenue/rates | NOT RECOMMENDED | No approved aggregation semantics. |

## 9. Recommended Client Dashboard

Use a modest Client home screen:

* Header: “Welcome back” plus current authenticated display name; no fabricated activity statement.
* Overview cards: **My Job Posts**, **Projects** (not “Active Projects”), **AI Products Owned**, **Wallet Balance**.
* Separate bounded sections, not one synthetic chronological feed: **Latest Job Posts**, **Current Projects**, and optionally **Recent AI Purchases**. Each section should have its own feature link and honest empty state.
* Quick actions: Create Job Post, My Job Posts, Projects, AI Place, My Purchases, Wallet.

The newest-first Workspace and purchase contracts make those two recent sections sound. The Jobpost section should be labelled as a small current/latest list only; it should not display an unavailable creation timestamp.

## 10. Recommended Expert Dashboard

Use a modest Expert home screen:

* Header: “Welcome back” plus current authenticated display name.
* Overview cards: **AI Products**, **My Applications**, **Projects** (not “Active Projects”), **Wallet Balance**.
* Bounded sections: **Recently Updated AI Products** and **Current Projects**. Show `AiProductStatusBadge` for real product status.
* Quick actions: Create AI Product, Manage AI Products, Browse Jobposts, My Applications, Projects, Wallet.
* The Browse Jobposts action must target `/expert/dashboard/browse-job-posts` after migration.

Do not show per-status AI Product totals until the service returns aggregate status facets (or an equivalent reliable bounded contract). Do not add a recent-applications list in this batch.

## 11. Recent Activity Feasibility

Do not merge Jobpost, Workspace, purchase, product, and wallet timestamps into a single “activity feed.” They come from separate services and contracts; some list DTOs omit the timestamp needed for transparent ordering.

Use labelled source-specific rows instead:

| Role | Approved sections | Not approved |
|---|---|---|
| Client | Latest Job Posts; Current Projects; Recent AI Purchases | Synthetic cross-service timeline, weekly ratios |
| Expert | Recently Updated AI Products; Current Projects | Detailed recent applications using the existing N+1 UI flow |

Recent transactions are possible through `GET /payment/payment-transactions/mine`, but are optional and should be deferred from the initial dashboard request budget. They are not needed to make the Wallet card real.

## 12. Quick Action Routes

| Client | Route |
|---|---|
| Create Job Post | `/client/dashboard/create-job-post` |
| My Job Posts | `/client/dashboard/my-job-post` |
| Projects | `/client/dashboard/projects` |
| AI Place | `/client/dashboard/ai-place` |
| My Purchases | `/client/dashboard/ai-place/purchases` |
| Wallet | `/client/dashboard/wallet` |

| Expert | Route after migration |
|---|---|
| Create AI Product | Existing AI Product create flow under `/expert/dashboard/ai-place/products` |
| Manage AI Products | `/expert/dashboard/ai-place/products` |
| Browse Jobposts | `/expert/dashboard/browse-job-posts` |
| My Applications | `/expert/dashboard/my-applications` |
| Projects | `/expert/dashboard/projects` |
| Wallet | `/expert/dashboard/wallet` |

## 13. Existing Reusable UI

Reuse the established shell and primitives rather than introducing a second dashboard design system:

* `Card`, `Button`, `Badge`, `Skeleton`, `Avatar`, sidebar, and tooltip primitives from `components/ui`.
* `AiProductStatusBadge` for DRAFT/PUBLISHED/UNPUBLISHED products.
* `formatVnd` / existing AI Place presentation utilities and `utils/formatMoney.ts` for actual wallet amounts.
* The visual row/card patterns and empty/loading states in `WorkspaceProjectsListView`, `ClientPurchaseHistoryView`, `ExpertAiProductListView`, and `JobPostCard`.

`JobPostCard` is a full management card with action menu assumptions, and the Workspace project card is currently private to its list view. Reuse their styles/status logic or extract a small presentational row only if necessary; do not import a management card merely to display a compact dashboard item.

## 14. API/Hook Reuse Plan

Client can issue four independent dashboard queries in parallel: small Client-jobpost page, small workspace page, small purchase page, and wallet. Existing React Query keys will deduplicate a request if the user already visited the corresponding feature with identical parameters.

Expert can issue four independent dashboard queries in parallel: small own-product page, existing paginated application-count page, small workspace page, and wallet. The new application hook is an FE adoption of an existing endpoint, not a new backend contract.

The dashboard layouts already mount exactly one `NotificationBell`, which loads notification list/count and owns the STOMP connection. Dashboard content must not call `useNotificationBell` or `useNotificationSocket` itself. If it reads notification data at all, it should observe the existing React Query cache without fetching or connecting.

## 15. Request / Performance Budget

| Route | Dashboard-owned initial HTTP reads | Layout-owned notification reads | Socket | Recommended total behavior |
|---|---:|---:|---:|---|
| Client | 4 | 2 (existing list and unread count) | 1 existing connection | Six bounded HTTP reads maximum on a cold load; run dashboard reads in parallel. |
| Expert | 4 | 2 (existing list and unread count) | 1 existing connection | Six bounded HTTP reads maximum on a cold load; no per-application requests. |

Avoid additional status-specific calls, purchase/detail calls, transaction calls, and the `ExpertMyApplicationsView` per-job applicant fan-out. Defer nonessential recent transactions and notifications sections. Cached queries reduce the count after navigation; the budget above is the cold-load ceiling, not a polling plan.

## 16. Backend / API Gaps

No backend/API change is required for the recommended baseline.

Optional future extensions, only if product requirements require the exact labels below:

1. Workspace service: filtered/aggregate project-state counts with an explicitly approved definition of “active.” Do not derive active totals from a paginated page.
2. AI Available: status facets/counts for an Expert's complete product catalogue, if global Published/Draft/Unpublished totals are required.
3. Jobpost service: a bounded expert-application summary containing job-post identity/title and a documented newest-first order, if a real recent-applications section is required. The existing `/my-applies` endpoint is already sufficient for a count.

These are narrow extensions to owning services, not candidates for a Dashboard microservice or cross-service aggregate endpoint.

## 17. Files Likely to Change

Frontend baseline:

* `app/client/dashboard/page.tsx`
* `app/expert/dashboard/page.tsx`
* `app/expert/dashboard/browse-job-posts/page.tsx`
* `components/layout/ClientSideBar.tsx`
* `features/job-post/expert/marketplace/ExpertJobpostDetailView.tsx`
* New, tightly scoped Client/Expert dashboard feature views and small presentational card/list components as needed.
* `services/job-post.service.ts` and the relevant job-post types only to adopt the existing paginated `/apply-job-post/my-applies` count endpoint.

Not expected to change for baseline: notification transport/deeplinks, payment behavior, workspace service, AI Available service, Identity, database schema, rating, purchase, entitlement, protected-asset authorization, and Jobpost apply semantics.

## 18. Regression Risks

* Moving the Expert root before making the browse route live would hide the working Marketplace.
* Updating only the sidebar would leave breadcrumbs and detail-page back links pointing to Dashboard rather than Marketplace.
* Reusing `ExpertMyApplicationsView` data flow would introduce N+1 calls on dashboard mount.
* Treating page-local product/project statuses as global totals would render inaccurate KPIs.
* Adding another notification bell/hook would create another socket lifecycle and regress the recently fixed transport behavior.
* Calling purchase details per history item, or wallet transactions by default, would exceed the intended request budget.
* Changing routes beyond the explicit Marketplace migration could affect protected routes, deeplink expectations, and bookmarked URLs.

## 19. Recommended Implementation Scope

### Batch 1 — Safe Expert route migration

Make browse-job-posts render the existing Marketplace; then make the root a dashboard route. Update the Sidebar and all three Marketplace back/breadcrumb links together. Verify direct detail navigation and browser Back behavior.

### Batch 2 — Client operational dashboard

Replace static values with the four approved queries/cards, source-specific recent sections, quick actions, loading/error/empty states, and no fabricated metrics.

### Batch 3 — Expert operational dashboard

Use four approved bounded reads, including a thin frontend hook for the existing paginated application count. Add the two approved recent sections and quick actions. Keep Browse Jobposts prominent.

### Batch 4 — Optional, separately approved API extensions

Only pursue filtered project/product counts or application summary rows if the product explicitly requires them. Each is independent of the route migration and baseline dashboard.

## 20. Final Decision

Proceed with a frontend-led operational dashboard implementation and the carefully sequenced Expert Marketplace route migration. The baseline needs no database migration, no new backend endpoint, no dashboard microservice, and no notification changes. It should use real totals and bounded feature lists, omit unsupported analytics, and preserve the current Marketplace by rendering it at `/expert/dashboard/browse-job-posts` before reassigning the root route.
