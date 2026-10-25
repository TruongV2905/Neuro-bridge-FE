# Phase 7A — Final Integration Audit and Cleanup Plan

**Repository:** D:\FA2026\PRN232\Neuro-bridge-FE  
**Branch audited:** feature/available-ai-product  
**Backend reference inspected:** D:\FA2026\PRN232\BE  
**Audit date:** 2026-10-25  
**Scope:** Read-only audit. No source, route, service, backend, database, migration, or storage-object changes were made. This report is the only Phase 7A artifact created.

## 1. Executive Summary

AI Place is functionally integrated around one client marketplace implementation and one expert product-management implementation. The current client canonical routes exist, the legacy AI Place URLs redirect correctly, and the frontend calls the gateway through the centralized Axios bearer client. Backend inspection confirms that Client-only and Expert-only policies protect the corresponding AI Place API surface, purchase settlement remains server-to-server, and protected asset access is entitlement-gated.

There are no P0 AI Place, payment-authority, or protected-storage security defects found in this audit. Two P1 navigation defects should be corrected before calling the application a final-pass candidate: the Client sidebar exposes a 404 Hiring target, and the Client dashboard exposes three 404 quick-action targets. These are historical/dashboard integration defects, not AI Place contract defects.

The known pending-purchase read limitation is real: the backend durably creates a pending intent but its Client purchase-history and detail reads deliberately return successful purchases only. The UI safely retains a retryable pending purchase only in component memory when the error supplies a purchase ID. It must not invent browser persistence. This is an accepted backend limitation and a deferred backend enhancement, not a reason to add fake frontend state.

The requested final E2E is otherwise ready to execute against a new clean current-flow product after the P1 navigation cleanup and a network-capable production-build environment are available. The legacy product de118e5d-7616-4e7a-a479-0a1a4fd28a4c is explicitly excluded.

## 2. Current Phase Status

| Area | Status | Evidence |
| --- | --- | --- |
| Expert product lifecycle | Ready | Current product list, draft creation, edit, publish/unpublish/republish, preview, and four protected-asset flows are implemented under features/ai-place/expert. |
| Client marketplace and purchases | Ready with pending-read limitation | Canonical marketplace/detail, confirmation, purchase history/detail, protected package, and rating UI are present. |
| Legacy AI Place URLs | Compatible | app/(main)/ai-place/page.tsx and app/(main)/ai-place/[productId]/page.tsx server-redirect to the canonical Client routes. |
| Wallet integration | Ready | Both role routes render the shared PaymentWalletView and include AI_PRODUCT_PAYMENT in transaction filtering. |
| Workspace/Project regression | No new AI Place coupling found | AI Place source does not import Workspace modules. The prior route restoration added thin route wrappers and shared workspace changes only. |
| Build verification | Environment-blocked | TypeScript passes; lint has warnings only; production build stops at Google Fonts network retrieval. |
| Final-pass decision | Not ready yet | P1 navigation cleanup and a production build in a network-capable environment remain. |

### Working-tree note

The branch was already dirty before this audit. The pre-existing changed/untracked AI Place purchase-confirmation and protected-package files were inspected as the current source snapshot but were not edited. They include the requested follow-up UI work. This report must be reviewed alongside that intended working tree before a commit is made.

## 3. Client Route Audit

| Route / target | Current result | Classification | Notes |
| --- | --- | --- | --- |
| /client/dashboard | Exists | Active | Static dashboard shell; its quick actions include three stale destinations listed below. |
| /client/dashboard/ai-place | Exists | Active / canonical | Renders AiPlaceMarketplaceFoundation under Client dashboard layout. |
| /client/dashboard/ai-place/[productId] | Exists | Active / canonical | Renders AiPlaceProductDetailFoundation under Client dashboard layout. |
| /client/dashboard/ai-place/purchases | Exists | Active | Renders ClientPurchaseHistoryView. |
| /client/dashboard/ai-place/purchases/[purchaseId] | Exists | Active | Renders ClientPurchaseDetailView and protected package/rating UI. |
| /client/dashboard/projects | Exists | Active | Uses WorkspaceProjectsListView with CLIENT role. |
| /client/dashboard/projects/[workspaceId] | Exists | Active | Uses WorkspaceDetailView with CLIENT role. |
| /client/dashboard/wallet | Exists | Active | Uses PaymentWalletView with CLIENT role. |
| /client/dashboard/my-job-post | Exists | Active | Current Client Jobpost management route. |
| /client/dashboard/my-job-post/[id] | Exists | Active | Current Client Jobpost detail/applicants/hire route. |
| /client/dashboard/create-job-post | Exists | Active | Current create-jobpost route. |
| /client/dashboard/hiring | Missing / 404 | **P1 compatibility defect** | Linked in the Client sidebar but no current page exists. |
| /create-jobpost | Missing / 404 | **P1 stale dashboard link** | Used by Client dashboard “Post a New Project”; current route is /client/dashboard/create-job-post. |
| /client/dashboard/create-proposal | Missing / 404 | **P1 stale dashboard link** | Used by Client dashboard “Create Proposal”; no current route exists. |
| /client/dashboard/saved | Missing / 404 | **P1 stale dashboard link** | Used by Client dashboard “Saved Experts”; no current route exists. |

The Client dashboard, not the AI Place navigation, is the only route surface with confirmed immediate 404s beyond Hiring. No duplicate Client AI Place sidebar item was found.

## 4. Expert Route Audit

| Route / target | Current result | Classification | Notes |
| --- | --- | --- | --- |
| /expert/dashboard | Exists | Active | Current Expert Jobpost marketplace. |
| /expert/dashboard/ai-place/products | Exists | Active | Expert AI product list. |
| /expert/dashboard/ai-place/products/new | Exists | Active | Draft-product creation. |
| /expert/dashboard/ai-place/products/[productId] | Exists | Active | Product metadata, lifecycle, preview, and protected-assets management. |
| /expert/dashboard/projects | Exists | Active | WorkspaceProjectsListView default Expert role. |
| /expert/dashboard/projects/[workspaceId] | Exists | Active | WorkspaceDetailView default Expert role. |
| /expert/dashboard/wallet | Exists | Active | PaymentWalletView with EXPERT role. |
| /expert/dashboard/my-services | Exists | Placeholder / duplicate concept | See Section 6. |
| /expert/dashboard/my-applications | Exists | Active | Expert application route. |
| /expert/dashboard/browse-job-posts | Exists | Compatibility redirect | Redirects to /expert/dashboard. |
| /expert/dashboard/jobpost/[id] | Exists | Active | Expert Jobpost detail. |

The Expert sidebar has no 404 targets. “Dashboard” and “Browse Jobpost” currently both go to /expert/dashboard, while the historical /expert/dashboard/browse-job-posts route redirects there. This is a visible duplicate navigation entry, not a broken route.

## 5. AI Place Canonical Route Audit

The canonical current Client routes are confirmed as:

- /client/dashboard/ai-place
- /client/dashboard/ai-place/[productId]

The following legacy compatibility routes are present:

| Legacy route | Current behavior | Recommendation |
| --- | --- | --- |
| /ai-place | App Router server redirect to /client/dashboard/ai-place | Keep during Phase 7B for existing homepage links/bookmarks. |
| /ai-place/[productId] | Awaits params and redirects to the URL-encoded canonical Client product route | Keep during Phase 7B for deep links/bookmarks. |

Removal is not currently safe because the shared homepage still intentionally navigates to /ai-place. Remove the compatibility routes only after homepage destinations are changed, legacy usage is assessed, and a release/deprecation window has elapsed. They are small, correct, and should be classified **B. KEEP FOR COMPATIBILITY**.

## 6. Expert My Services Audit

Current rendering is a static “My Services” placeholder with “coming soon” text and a link back to /expert/dashboard. It has no query, mutation, catalog, product, service-management, or unique business functionality.

It overlaps conceptually with /expert/dashboard/ai-place/products because both claim to manage AI offerings. The AI Products route is the functional, backend-connected product surface; My Services is not an earlier implementation of that surface in the current tree. Git history places this page before the final AI Place work and offers no evidence of a current service API or active product prototype behind it.

The Expert sidebar still points to My Services. Recommendation: **do not remove during Phase 7A**; in Phase 7B, make an explicit product decision:

1. Preferred minimal option: redirect My Services to AI Products and rename/remove the sidebar entry.
2. Keep it only if a future non-product service catalog has funded scope and an API contract.

Classification: **SHOULD FIX — obsolete placeholder / conceptual overlap**, not a P1 route failure.

## 7. Homepage AI Solutions Audit

The shared Homepage is static, not API-backed:

- features/homepage/data/homepage.ts imports features/available-ai/mocks/availableAIData.
- It selects three mock “Trending” entries and passes them to SolutionSection.
- SolutionSection renders AvailableAICard and sends every card and the “View all AI solutions” CTA to /ai-place.

Client, Expert, anonymous, and any other role receive identical cards and identical destinations. Because /ai-place redirects to the Client dashboard marketplace and the backend marketplace policy is ClientOnly, the current shared CTA is suitable as a backward-compatible Client entry but is misleading for Expert and anonymous users.

Safest future cleanup: keep the legacy /ai-place redirect during migration, then replace the homepage destination logic with a small role-aware entry component:

- authenticated Client: canonical Client marketplace;
- authenticated Expert: Expert AI Products or a neutral explanation page, based on product decision;
- anonymous: login/register path with a return intent, or a deliberately public discovery route only if the backend authorizes one.

Do not wire homepage cards directly to product IDs from the static mock data. Replace mock content only when a public/role-aware product-discovery contract exists. Classification: **D. NEEDS FURTHER REVIEW** for the active mock cards/data, and **SHOULD FIX** for role-unaware navigation.

## 8. Client Hiring Audit

The Client sidebar points to /client/dashboard/hiring, but no current App Router page exists. History confirms that non-ancestor commit a7ccba5 created an 809-line ClientHiringView and its page wrapper. That implementation is not in the active source, so this is not an accidental deletion introduced by AI Place.

The backend does support hiring through POST /job-posts/{jobPostId}/expert-applies/{expertApplyId}/hire, restricted to CLIENT. Current Client Jobpost detail already has the applicants/hiring workflow through ClientApplicantsSection; therefore no backend contract is missing for the supported per-Jobpost flow.

Classification: **COMPATIBILITY ISSUE — historical/unmerged aggregate Hiring page**.

Recommended minimal remedy: redirect /client/dashboard/hiring to /client/dashboard/my-job-post or remove the sidebar entry. Recover the former aggregate Hiring page only if it has a confirmed unique product requirement. Either choice requires regression testing of Client Jobpost navigation; neither requires AI Place changes.

## 9. Wallet Regression Audit

Both routes exist and use the same audited shared Wallet implementation:

| Role | Route | Current integration |
| --- | --- | --- |
| Client | /client/dashboard/wallet | PaymentWalletView role="CLIENT" |
| Expert | /expert/dashboard/wallet | PaymentWalletView role="EXPERT" |

The sidebar includes the correct role-specific routes. PaymentWalletView reads the current wallet, transaction history, transaction detail, and bank information through services/payment.service.ts. It contains AI_PRODUCT_PAYMENT in its type filter and displays server-returned transaction references/types/statuses; this supports Client debit and Expert credit visibility after a successful AI Place settlement.

AI Place uses useGetMyWallet only to display non-authoritative confirmation context. Purchase, retry, transaction creation, money movement, fee calculation, and entitlement activation remain backend-owned. The AI Place source imports neither Wallet view components nor wallet persistence. React Query invalidation after AI Place purchase refreshes AI Place purchase data; Wallet refresh remains user/server-query driven. No current dependency was found that could remove or break the Wallet routes.

Status: **PASS — no current Wallet regression found.**

## 10. Project/Workspace Regression Audit

Client and Expert list/detail route wrappers are present and use the shared WorkspaceProjectsListView / WorkspaceDetailView. Workspace navigation is built from role-aware paths, and the submission/deliverable UI remains in features/workspace/submission.

The AI Place package UI shares visual ideas only. It does not import WorkspaceProject, WorkspaceDetail, submission, workspace service, or workspace types. Conversely, Workspace source does not import AI Place. The Phase 7 branch history shows the Workspace route/view/service changes were part of prior recovery, not the current uncommitted protected-package follow-up.

Status: **PASS — no AI Place-to-Workspace coupling or new Project regression found.** Continue to retest the existing Client deliverable review and Expert submission paths after any shared UI-library upgrade, but no Workspace refactor is warranted.

## 11. AI Place Feature Audit

### Expert flow

| Capability | Status | Audit observation |
| --- | --- | --- |
| Product list / pagination | Active | Server pagination and current owner list hook. |
| Create draft | Active | Validated React Hook Form flow. |
| Edit metadata | Active | Disabled while published; backend is authoritative. |
| Publish | Active | UI checks description/four slots; backend repeats the required-deliverables rule. |
| Unpublish / republish | Active | Unpublish confirmation; republish shown for UNPUBLISHED. |
| First-publish lock | Active | Delete only when DRAFT and firstPublishedAt is null; UI explains locked assets after first publication. |
| Preview upload | Active | Backend authorization, direct temporary upload, backend confirmation/deletion. |
| Four protected assets | Active | SOURCE_CODE, VIDEO, DATASET, DOCUMENT slots use the same authorization/confirmation boundary. |

### Client flow

| Capability | Status | Audit observation |
| --- | --- | --- |
| Marketplace | Active | Server search/filter/pagination parameters and debounced keyword flow. |
| Product detail | Active | Uses Marketplace DTO, not Expert owner DTO. |
| Purchase confirmation | Active in current working tree | Confirmation dialog reads wallet context and requires explicit confirm. |
| Buy / successful ownership | Active | Successful outcome invalidates product/purchase queries and links to purchase detail. |
| Pending / retry | Safe but session-local | See Section 12. |
| Purchase history/detail | Active | Backend exposes successful records only. |
| Entitlement/protected package | Active in current working tree | Requests a new temporary access URL for each preview/download action. |
| Preview/download | Active | Video, image and PDF previews; unsupported types have download-only fallback. |
| Rating CRUD | Active | Create, update, delete under purchase-scoped Client endpoints. |

### Cleanup observations

- The current protected package correctly replaces the older inline EntitlementPanel, avoiding a duplicate protected-file UI. It is a current uncommitted follow-up and must be committed/tested as a unit rather than copied elsewhere.
- The four AI Place service files are cohesive by concern (product, purchase, storage, rating). No duplicate AI Place service implementation was found.
- Ownership lookup scans paginated successful purchase history because the backend does not provide a purchase-by-product read endpoint. This is correct but has predictable scale cost; defer a dedicated backend endpoint until history size makes it material.
- AI Place modules contain no direct storage bucket, object-key, service-role, ngrok, or port 8089 references.

## 12. Pending Purchase Limitation

**Classification: accepted backend limitation / deferred improvement; not a P0 or P1 frontend blocker.**

Backend evidence:

- ProductPurchase starts as PendingPayment.
- The Client history query filters to PurchaseStatus.Success.
- Client purchase-detail returns not found for a non-successful purchase.
- Retry payment exists, but it accepts a purchase ID.

Frontend behavior is therefore intentionally narrow: when a purchase call returns a recognized pending/error payload containing a purchase ID, AiPlaceProductDetailFoundation holds that ID and retry state in component memory. Navigating away or reloading loses that state. No fake localStorage/sessionStorage state should be added because it would be non-authoritative and could reintroduce stale/unsafe purchase messaging.

Deferred backend improvement: expose an authenticated Client read endpoint for the current pending purchase by product and/or purchase ID, with a clear terminal/retry state. When available, replace the history scan and local-only recovery with that endpoint.

## 13. Legacy Test Data Exclusion

Product **de118e5d-7616-4e7a-a479-0a1a4fd28a4c** is excluded from final E2E. It references legacy storage metadata for bucket **phase7b-test**, which no longer exists.

Do not repair, delete, recreate storage for, mutate database rows for, or use this product as the E2E product. Create a clean current-flow Expert-owned product with a current preview and all four current protected asset slots. Record its identifiers only in the E2E run log, not in source.

## 14. Build/Tooling Audit

| Check | Result | Classification |
| --- | --- | --- |
| npm run lint | Pass: 0 errors, 42 warnings | Pre-existing warning backlog plus one warning in the current protected preview dialog. |
| npx tsc --noEmit | Pass | No TypeScript errors in the current working tree. |
| npm run build | Failed before application compilation completed | Environment/tooling failure: next/font/google could not fetch Archivo Black, Geist, or Roboto from fonts.googleapis.com. |

The current build imports all three Google fonts from app/layout.tsx. The error is network/DNS access, not a source type or route error. The previous documented .next EPERM cleanup behavior did not occur in this run; this run stopped at the Google Fonts fetch failure. Do not change the build configuration in Phase 7A. Re-run production build in a network-capable environment before final acceptance. If the same failure blocks normal CI, decide separately whether to self-host fonts or establish a build-cache/network policy.

Lint warnings are unrelated to final AI Place correctness except the native img warning in features/ai-place/components/AiPlaceProtectedAssetPreviewDialog.tsx. Signed arbitrary hosts make native img a defensible current choice; do not configure remote image hosts merely to silence the warning.

## 15. Dead Code / Stale References

| Finding | Classification | Future action |
| --- | --- | --- |
| app/(main)/ai-place redirects | **B. KEEP FOR COMPATIBILITY** | Keep until homepage/legacy-link migration is complete. |
| /expert/dashboard/browse-job-posts redirect | **B. KEEP FOR COMPATIBILITY** | Keep for bookmarks; correct/remove duplicate sidebar label separately. |
| Client sidebar /client/dashboard/hiring | **D. NEEDS FURTHER REVIEW** | Resolve as P1 compatibility issue. |
| Client dashboard /create-jobpost, /client/dashboard/create-proposal, /client/dashboard/saved | **A. SAFE TO REMOVE OR REPOINT** | Resolve as P1 stale dashboard actions. |
| features/available-ai/components/AvailableAIPage.tsx | **A. SAFE TO REMOVE** | Unreferenced old mock-page implementation. |
| features/available-ai/components/AvailableAICardDetail.tsx | **A. SAFE TO REMOVE** | Only used by the unreferenced old mock page. |
| features/available-ai/mocks/availableAIData.ts and AvailableAICard | **C. KEEP — ACTIVE** | Currently drive the shared Homepage mock section; replace only with intentional homepage work. |
| app/(main)/availableAI/page.tsx | **A. ALREADY REMOVED** | c4b4c89 removed the old route; no current route reference remains. |
| AI Place service files | **C. KEEP — ACTIVE** | One implementation per product/purchase/storage/rating boundary. |
| Direct AI Place storage / ngrok / :8089 / service_role source references | **C. NO FINDING** | None found in frontend AI Place source. |
| Console logs in registration, profiles, jobpost-create and Workspace error reporting | **D. NEEDS FURTHER REVIEW** | Not AI Place-specific; remove/replace intentional diagnostics in a separate low-risk cleanup. |
| Client dashboard static stats/projects and placeholder quick actions | **D. NEEDS FURTHER REVIEW** | Existing dashboard mock content; do not broaden Phase 7B into a dashboard rewrite. |

## 16. Security Audit

| Control | Result |
| --- | --- |
| Centralized Axios bearer handling | Intact. configs/api.ts adds the accessToken bearer header to gateway API requests and refreshes only through the identity path. |
| Client protected asset gating | Intact. The frontend requests download access only from the Client purchase endpoint; backend ClientOnly policy, purchaser ownership, successful purchase, entitlement, and asset availability are enforced server-side. |
| Temporary URL persistence | Intact. Protected asset URLs are held only in mutation response/component state and used immediately; no local/session storage or Redux persistence is used. |
| Service-role exposure | No frontend service-role key found. AI Place does not import the browser Supabase client. The backend owns the Supabase service-role credential. |
| Protected bucket/object path exposure | No AI Place bucket/object key is rendered or constructed by normal UI. The browser receives backend-issued access/upload URLs only. |
| Financial authority | Intact. Browser calls purchase/retry endpoints only; Payment settlement is backend-to-backend through the AI Available payment gateway. No browser balance calculation or ledger mutation exists. |
| Direct protected Supabase access | None found. Expert uploads use an authorization URL from AI Available; Client reads use a download-access URL from AI Available. |
| Role boundary | Backend policies are intact: ClientOnly for marketplace/purchase/rating/download and ExpertOnly for owner product/storage APIs. The frontend has no route-level role gate, so an incorrect dashboard URL can render its shell before the protected API returns 401/403; no data authority is granted. |

Security status: **PASS, with a non-blocking UX recommendation to make shared homepage CTA destinations role-aware.**

## 17. Final E2E Readiness

### Preconditions

1. Use separate active Client and Expert test identities with sufficient Client wallet balance.
2. Create a new clean current-flow product; do not use the excluded legacy product.
3. Prepare one allowed preview plus SOURCE_CODE, VIDEO, DATASET, and DOCUMENT test files. Use a PDF for document-preview validation and a browser-supported video.
4. Capture the created product ID, purchase ID, payment transaction ID, and both wallet transaction records in the run log.
5. Run against the same gateway/backend/storage environment; do not substitute mock response data.

### Primary scenario

1. Expert logs in, creates a Draft Product, edits metadata, uploads preview and all four protected assets, then publishes.
2. Client logs in, opens canonical Marketplace, searches, filters, pages, opens detail, opens and cancels purchase confirmation, then reopens it and confirms purchase.
3. Verify payment SUCCESS, ownership state, successful purchase-history record, purchase detail, entitlement state, and protected package.
4. Verify video preview; verify PDF document preview when supplied; download source, dataset, document, and video behavior. Confirm each is requested through a fresh temporary URL and no asset URL is persisted after reload.
5. Create, update, then delete the rating and verify product rating summary/list refresh.
6. Verify Client and Expert wallet transaction records using the payment transaction ID/reference.
7. Expert verifies product status/details are unchanged by the purchase.

### Negative scenario set

- Cancel purchase confirmation: no purchase call, wallet movement, history record, or entitlement.
- Insufficient Client balance: backend error is shown; no ownership/entitlement/download.
- Already-owned product: backend duplicate-prevention response; UI reaches the existing purchase instead of paying again.
- Concurrent/duplicate purchase click: client disables active mutation and backend idempotency prevents duplicate settlement.
- Pending/retry: induce a backend-recognized pending response if environment supports it; verify retry works only while purchase ID is present; reload-loss is recorded as expected limitation.
- Missing/unavailable protected asset: applicable slot is unavailable or backend error is shown; no object path is disclosed.
- Expired entitlement where practical: history remains, protected access is denied/expired, no download URL is issued.
- Invalid role access: Client attempts Expert endpoint/route and Expert attempts Client purchase endpoint/route; expect 401/403 and no protected data.
- Direct protected access denial: attempt a protected object without backend-issued temporary URL in a controlled test; expect provider/backend denial.
- Legacy product exclusion: confirm the listed legacy ID is not selected or altered.

E2E readiness: **Ready after P1 navigation cleanup, clean data setup, and a network-capable build verification.**

## 18. Cleanup Findings — MUST FIX

There are **0 P0 blockers** and **2 P1 cleanup findings**.

| Priority | Exact file(s) | Minimal recommendation | Reason | Shared-module risk | Runtime retest |
| --- | --- | --- | --- | --- | --- |
| P1 | components/layout/ClientSideBar.tsx; optionally new app/client/dashboard/hiring/page.tsx | Repoint/remove Hiring sidebar item, or add a thin redirect to My Jobpost after product decision. | Current sidebar target is a 404. | Shared sidebar affects Client navigation only. | Client sidebar, My Jobpost/detail/applicant/hire navigation. |
| P1 | app/client/dashboard/page.tsx | Repoint Post a New Project; remove or disable unsupported Create Proposal and Saved Experts actions, unless routes are separately recovered. | Three confirmed interactive 404s. | Client dashboard only. | Every quick action and back navigation. |

## 19. Cleanup Findings — SHOULD FIX

There are **5 should-fix cleanup items**.

| ID | Exact file(s) | Recommendation | Reason / risk | Shared modules | Retest |
| --- | --- | --- | --- | --- | --- |
| S1 | components/layout/ClientSideBar.tsx | Remove/rename one Expert Dashboard/Browse Jobpost entry; preserve the browse-job-posts redirect. | Avoid duplicate navigation to one view; low risk. | Shared role sidebar. | Expert sidebar active states and redirect. |
| S2 | app/expert/dashboard/my-services/page.tsx; components/layout/ClientSideBar.tsx | Redirect/merge conceptually into AI Products after product sign-off. | Placeholder overlaps functional AI Products; low risk, product-copy decision required. | Expert sidebar. | Expert navigation and legacy/bookmark behavior. |
| S3 | features/homepage/components/SolutionSection.tsx; features/homepage/data/homepage.ts; app/(main)/ai-place/page.tsx | Make CTA role-aware while retaining legacy redirect. | Static mock cards send all roles to Client-only destination; medium shared-homepage risk. | Homepage, Header/auth state. | Anonymous, Client, Expert click paths and legacy URLs. |
| S4 | features/available-ai/components/AvailableAIPage.tsx; features/available-ai/components/AvailableAICardDetail.tsx; features/available-ai/index.ts | Remove unused old mock page/detail exports only after import search and lint/type check. | No current consumer beyond each other; low risk. | Homepage still needs AvailableAICard/data exports. | Homepage AI Solutions rendering and build. |
| S5 | features/auth/register/ClientRegisterForm.tsx; features/profile/client/ClientProfileView.tsx; features/job-post/client/create/CreateJobPostView.tsx, plus other identified diagnostic sites | Remove stray debug logging and turn “future API” diagnostic output into intentional UX separately. | Hygiene only; do not bundle broad cleanup into AI Place work. | Unrelated feature modules. | Affected registration/profile/jobpost flows. |

## 20. Cleanup Findings — SAFE TO DEFER

There are **4 deferred items**.

| ID | Finding | Classification / rationale |
| --- | --- | --- |
| D1 | Durable Client read/recovery of pending purchases | Accepted backend limitation; requires authoritative backend endpoint, not fake frontend persistence. |
| D2 | Purchase-by-product endpoint | Backend performance enhancement; current paginated successful-history lookup is correct for present scale. |
| D3 | Google Fonts build network failure | Environment/CI concern; not a source defect. Re-run in connected CI before final sign-off; decide self-hosting only if normal CI is also blocked. |
| D4 | 42 lint warnings | Existing non-blocking warning backlog. Treat the signed-image warning in protected preview as acceptable unless an asset-host policy changes. |

## 21. Proposed Phase 7B Implementation Scope

Keep Phase 7B deliberately small:

1. Resolve the two P1 Client navigation issues in components/layout/ClientSideBar.tsx and app/client/dashboard/page.tsx.
2. Resolve S1 duplicate Expert navigation and S2 My Services only after confirming the desired product language/redirect behavior.
3. Apply S4 dead mock-page cleanup only after the homepage’s active imports are retained and verified.
4. Do not change AI Place contracts, protected-storage architecture, payment settlement, Wallet behavior, Workspace, databases, migrations, storage objects, or the excluded legacy product.
5. Do not implement browser persistence for pending purchases.

Any role-aware Homepage rewrite should be a separate small change after a product decision; it touches shared entry behavior and needs Client/Expert/anonymous retesting.

## 22. Proposed Phase 7C E2E Matrix

| ID | Actor | Scenario | Expected result |
| --- | --- | --- | --- |
| E01 | Expert | Create/edit Draft | Draft persists; validation errors are shown safely. |
| E02 | Expert | Upload preview + four protected assets | Backend-authorized upload/confirmation; no bucket path shown. |
| E03 | Expert | Publish | Published only with description and all four assets. |
| E04 | Expert | Unpublish/edit/republish | Correct lifecycle; first-publish lock remains. |
| E05 | Client | Browse/search/filter/page | Published current-flow product is discoverable; filters/paging server-backed. |
| E06 | Client | Detail and public preview | Correct Marketplace DTO; image/video preview works. |
| E07 | Client | Cancel confirmation | No settlement/purchase/entitlement. |
| E08 | Client | Confirm purchase success | Backend settlement success, ownership and purchase record. |
| E09 | Client | Purchase history/detail | Successful snapshot and active entitlement shown. |
| E10 | Client | Protected package | Fresh temporary access per preview/download; video/PDF behavior as supported. |
| E11 | Client | Rating CRUD | Create/update/delete reflected in detail/summary/list. |
| E12 | Client + Expert | Wallet verification | AI_PRODUCT_PAYMENT entries/references visible to both appropriate roles. |
| E13 | Client | Insufficient balance / already owned / duplicate | No duplicate payment or entitlement; clear controlled error. |
| E14 | Client | Pending/retry/reload | Retry only when authoritative returned ID is still available; reload limitation documented. |
| E15 | Cross-role | Unauthorized/direct protected access | 401/403 or provider denial; no protected content. |
| E16 | Both | Workspace and Jobpost smoke | Existing project, deliverable, jobpost, and wallet navigation survive Phase 7B. |

## 23. Regression Risk Assessment

| Area | Risk | Basis / mitigation |
| --- | --- | --- |
| AI Place product/purchase contract | Low | No change recommended to services or backend contract. |
| Protected assets/security | Low | Preserve API-issued temporary URL pattern; test access denial. |
| Wallet | Low to medium | Shared PaymentWalletView is stable, but E2E must verify both transaction records after real settlement. |
| Client navigation | Medium until P1 fixed | Confirmed 404 links. Keep changes to small redirects/repoints. |
| Homepage | Medium | Shared static UI with different role expectations; isolate role-aware change and test all role states. |
| Expert navigation | Low | Duplicate label / placeholder, not service failure. |
| Workspace/Project | Low | No source coupling; smoke test after shared navigation changes. |
| Production build | Medium environment gate | Google Fonts access required in this environment; validate connected CI. |

## 24. Phase 7A Decision: NOT READY

**NOT READY for final pass yet.**

There are no P0 blockers. Complete the two P1 Client navigation corrections, verify the current working-tree AI Place follow-up files as part of their intended commit, and obtain one production build in a Google-Fonts-reachable environment. Then execute the clean-data Phase 7C E2E matrix. The pending-purchase read limitation is accepted and should remain deferred to backend work.
