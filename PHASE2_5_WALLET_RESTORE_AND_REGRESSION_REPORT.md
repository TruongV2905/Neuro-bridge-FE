# 1. Executive Summary

Phase 2.5 restores role-specific Wallet routes using the current Gateway/Payment contract, not the historical branch contract. Both dashboard routes use one shared, live-data `PaymentWalletView` with wallet balance/status, role-appropriate metrics, bank-information update, private transaction history, server-backed type/status filters, pagination, and transaction detail.

No AI Place source was altered. The `/availableAI` to `/ai-place` migration remains intentional. No accidental regression caused by the current feature working tree was found.

Strict Phase 2.5 runtime acceptance is not proven: the available local Gateway returns `401 Unauthenticated` without role credentials, so CLIENT and EXPERT real-data flows, transaction detail/filter data, and bank mutation could not be authenticated and verified.

# 2. Git Baseline

- Current branch: `feature/available-ai-product`.
- `HEAD`, `origin/main`, and `git merge-base HEAD origin/main` all resolve to `b5ac7754b7ba2281f1af07d5f461499f91cdd55c`.
- Therefore `git diff --name-status <merge-base>..HEAD` is empty. The AI Place and Wallet work under audit is present as uncommitted tracked/untracked working-tree changes, not committed feature-branch history.
- Working-tree route/navigation changes were audited directly against `HEAD`.
- Historical commits `6bc8c84` and `3ee9587` are not ancestors of `HEAD` (`git merge-base --is-ancestor` returned `1` for each). They are historical/unmerged evidence, not a deletion baseline.

# 3. Route Regression Matrix

| Role | Navigation label | Expected route | Route exists | Sidebar exists | Reachable | Regression classification |
|---|---|---|---|---|---|---|
| CLIENT | Dashboard | `/client/dashboard` | Yes | Yes | Yes | — |
| CLIENT | My Jobpost | `/client/dashboard/my-job-post` | Yes | Yes | Yes | — |
| CLIENT | Create Jobpost | `/client/dashboard/create-job-post` | Yes | Yes | Yes | — |
| CLIENT | Hiring | `/client/dashboard/hiring` | No | Yes | No (404) | C. PRE_EXISTING_MISSING |
| CLIENT | Project | `/client/dashboard/projects` | No | Yes | No (404) | C. PRE_EXISTING_MISSING |
| CLIENT | Wallet | `/client/dashboard/wallet` | Yes | Yes | Yes | D. HISTORICAL_UNMERGED_FEATURE, explicitly restored for Phase 2.5 |
| EXPERT | Dashboard | `/expert/dashboard` | Yes | Yes | Yes | — |
| EXPERT | My Services | `/expert/dashboard/my-services` | Yes | Yes | Yes | — |
| EXPERT | AI Products | `/expert/dashboard/ai-place/products` | Yes | Yes | Yes | A. INTENTIONAL_AI_PLACE_CHANGE |
| EXPERT | My Applications | `/expert/dashboard/my-applications` | Yes | Yes | Yes | — |
| EXPERT | Browse Jobpost | `/expert/dashboard/browse-job-posts` | No | Yes | No (404) | C. PRE_EXISTING_MISSING |
| EXPERT | Project | `/expert/dashboard/projects` | No | Yes | No (404) | C. PRE_EXISTING_MISSING |
| EXPERT | Wallet | `/expert/dashboard/wallet` | Yes | Yes | Yes | D. HISTORICAL_UNMERGED_FEATURE, explicitly restored for Phase 2.5 |
| Public | AI Place | `/ai-place` | Yes | Homepage link | Yes | A. INTENTIONAL_AI_PLACE_CHANGE |
| Public | legacy Available AI | `/availableAI` | No | No | No (404) | A. INTENTIONAL_AI_PLACE_CHANGE |

Additional existing Client dashboard quick actions point to missing `/create-jobpost`, `/client/dashboard/create-proposal`, and `/client/dashboard/saved`; these routes and links are unchanged from `HEAD`, so each is C. PRE_EXISTING_MISSING. `/profile`, `/expert-profile`, and `/experts` remain reachable.

# 4. Feature Regression Findings

- `app/(main)/availableAI/page.tsx` deletion, homepage links, and the new `/ai-place` route family are A. INTENTIONAL_AI_PLACE_CHANGE.
- The Expert `AI Products` sidebar entry is A. INTENTIONAL_AI_PLACE_CHANGE and its target exists.
- The current working tree contains no deletion/rename of a base Wallet route because neither Wallet route existed in the actual base.
- No current service/type/component consumer disappeared due to the AI Place changes. Legacy `features/available-ai` presentation remains intentionally used by homepage mock visuals until later marketplace cleanup.
- `ExpertWalletCard.tsx` is currently imported only into commented-out profile sidebar UI. It is an orphaned historical fragment, not a regression from this feature branch.

# 5. Wallet Historical Evidence

`6bc8c84` added CLIENT/EXPERT Wallet routes, shared `features/payment/wallet/PaymentWalletView.tsx`, sidebar entries, VNPay UI, and recent transactions. `3ee9587` later refined wallet formatting and the VNPay return view. Neither commit is an ancestor of the actual base.

Their UI intent was inspected selectively. Nothing was cherry-picked. The current implementation uses the current Payment DTOs/endpoints and only preserves the general dashboard-wallet presentation intent.

# 6. Current Payment Backend Contract

Gateway routing is `http://localhost:8080/api/payment/**` to `payment-service`; browser code continues to use the existing `configs/api.ts` client and relative `/payment/...` paths.

| Capability | Current endpoint / behavior | Wallet decision |
|---|---|---|
| Current wallet | `GET /payment/api/wallet/mine` | Used |
| Bank update | `PUT /payment/api/wallet/me/bank-info`; all three fields required, account number `6–20` digits | Used |
| Private history | `GET /payment/payment-transactions/mine?page&size&sortBy&direction&search` | Used for unfiltered pages |
| Server filters | `POST /payment/payment-transactions/filter` with page fields and `filter.{involvingUserCode,type,status,...}` | Used for type/status filter pages, scoped by the wallet’s returned user code |
| Transaction detail | `GET /payment/payment-transactions/{id}` | Used from a row selected from current-user history |
| Pagination | Zero-based `page`; `size`; `PageResponse.data` and `metadata` | Used |
| Wallet fields | balance, earned, withdrawn, status, bank fields | Used |
| VNPay initiation | `POST /payment/api/wallet/deposit/vnpay` | Not exposed |
| Deposit completion | `POST /payment/api/wallet/deposit/success` | Not exposed |
| Withdrawal request | `POST /payment/api/wallet/withdrawal-request` | Not exposed |
| Withdrawal processing / requests | `PATCH /payment/api/wallet/{userCode}/withdraw-to-bank`, `GET /payment/api/wallet/withdrawal-requests` | Not exposed |

The backend currently exposes the same wallet DTO to both roles; it does not provide a role-specific Wallet API. The view therefore labels Expert earnings only for EXPERT and does not apply Expert earnings wording to CLIENT.

Current limitations preserved rather than hidden by the frontend:

- `/mine` replaces nested filters with the current user’s `involvingUserCode`; it does not honor submitted type/status filters. The UI uses the actual `/filter` contract only for filtered pages.
- `search` is accepted by the page DTO but is not applied by `PaymentTransactionSpecification`; no misleading search control was added.
- The filter/detail endpoints do not enforce user ownership in the inspected controller/service. The UI only requests details from rows returned to the current user and sends `involvingUserCode` when filtering, but backend authorization remains required.
- VNPay initiation exists, but the configured return URL is `/payment`, which has no current route, and the completion endpoint is browser-callable without server-side VNPay signature verification. Restoring an active frontend top-up/confirmation flow would be unsafe.
- Withdrawal request exists, but the current contract has no safe user-facing request status and the processing/list endpoints are admin-labelled without controller role enforcement. No withdrawal action was exposed.

# 7. Client Wallet

`/client/dashboard/wallet` is added inside the existing Client dashboard layout. It renders live current balance, wallet status, total withdrawn, bank information, bank update, and private transaction history. It has no Expert earnings label and no active VNPay or withdrawal control.

# 8. Expert Wallet

`/expert/dashboard/wallet` is added inside the existing Expert dashboard layout. It renders current balance, total earned, total withdrawn, bank information, bank update, and private transaction history/detail. It has no unsupported withdrawal control.

# 9. Transaction History / Detail

The shared view supports current private history, zero-based pagination, current backend type/status filters, loading, empty, retry, error, and row-driven transaction detail. Error presentation maps actual Gateway statuses (`401`, `403`, `400`, `503`) to safe user-facing messages and never displays raw Axios errors.

# 10. Sidebar / Navigation

Both existing role configurations in `components/layout/ClientSideBar.tsx` now include Wallet with the existing `WalletCardsIcon` convention. Browser inspection confirmed the links appear in both the Client and Expert off-canvas sidebars and target their restored routes.

# 11. Profile Wallet Fragments

- `features/profile/client/ClientProfileView.tsx` previously displayed fabricated wallet ID, bank, account, balance, and withdrawn values. It now removes those values and links to the live Wallet dashboard.
- `features/profile/expert/components/ExpertWalletCard.tsx` is inside currently commented-out profile-side UI and has no live consumer. It is deferred for Phase 7 profile cleanup rather than duplicating Wallet querying/business logic.

# 12. Files Restored / Added / Changed

## Added

- `app/client/dashboard/wallet/page.tsx`
- `app/expert/dashboard/wallet/page.tsx`
- `features/payment/index.ts`
- `features/payment/wallet/PaymentWalletView.tsx`
- `PHASE2_5_WALLET_RESTORE_AND_REGRESSION_REPORT.md`

## Changed

- `components/layout/ClientSideBar.tsx`
- `services/payment.service.ts`
- `types/payment.type.ts`
- `features/profile/client/ClientProfileView.tsx`

# 13. Intentional Changes Preserved

- `/availableAI` remains removed and `/ai-place` remains canonical.
- Homepage AI solution links remain `/ai-place`.
- Expert AI Product navigation and all Phase 2 AI Place files remain untouched.
- No AI Available query key is invalidated by Wallet mutations.

# 14. Historical Features Not Restored

- Historical VNPay top-up and browser-return confirmation UI.
- Historical active withdrawal UI/status presentation.
- Historical Chat sidebar entry and any other non-ancestor historical feature.
- No historical branch was merged or broadly cherry-picked.

# 15. Build / Lint Results

- `npm run lint`: PASS, 0 errors, 41 existing warnings. No Wallet error/warning was introduced; the Client Profile image warning predates this phase’s wallet-fragment replacement.
- Targeted Wallet lint: PASS with no errors.
- `npx tsc --noEmit`: PASS.
- `git diff --check`: PASS.
- `npm run build -- --webpack`: BLOCKED by the known environment issue: existing `next/font/google` imports cannot resolve `fonts.googleapis.com`; after that failure Next reported an `.next` `EPERM` while aborting. No Wallet source error was reported.

# 16. Runtime Test Results

- Existing Next dev server: `http://localhost:3000`.
- Gateway unauthenticated request to `http://localhost:8080/api/payment/api/wallet/mine`: actual `401` response.
- Browser route validation: CLIENT Wallet and EXPERT Wallet both render successfully and display the safe unauthenticated Wallet-unavailable state rather than raw Axios data.
- Browser sidebar validation: both role sidebars visibly include Wallet and link to the correct role route.
- Local HTTP smoke checks: all existing implemented Client/Expert dashboard routes requested for the audit returned `200`; the pre-existing missing dashboard targets listed in the route matrix returned `404`; `/ai-place` returned `200`; legacy `/availableAI` returned `404` as intended.
- Authenticated CLIENT/EXPERT real-data, filters with records, details with records, and bank-update mutation were not run because no role credentials/current authenticated local session were available. Network inspection was limited to the local Gateway response; no browser DevTools session was available.

# 17. Remaining Issues

- Strict runtime role validation is blocked by missing authenticated CLIENT/EXPERT test credentials/session.
- Payment backend authorization is incomplete for global transaction filter/detail and admin-labelled withdrawal endpoints; this is a backend blocker before exposing those broader controls.
- Payment backend VNPay return/completion must be server-verified and given a valid frontend return route before an active top-up UI can be safely restored.
- Existing sidebar/dashboard 404 links are pre-existing and outside the proven AI Place regression scope.

# 18. Phase 3 Readiness

Wallet restoration is source-ready and does not alter AI Place storage work. Phase 3 storage may proceed independently. Phase 2.5 itself remains **FAIL** against the stated strict exit criteria until authenticated CLIENT and EXPERT runtime validation can be completed.
