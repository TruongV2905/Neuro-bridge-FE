# Pre-Phase 3 Expert Route Regression Report

## 1. Executive Summary

The two reported Expert sidebar 404s did not result from a deletion on
`feature/available-ai-product`. `HEAD`, `origin/main`, and the merge base are
the same commit, `b5ac7754b7ba2281f1af07d5f461499f91cdd55c`; the active feature
work is uncommitted. Browse Jobpost was a stale sidebar reference to an
unmerged duplicate route. Projects was an unmerged Workspace feature whose
current backend contract remains available. The supported route surface was
recovered without merging historical branches.

## 2. Current Source Audit

Current Expert app routes before this recovery were:

- `/expert/dashboard`
- `/expert/dashboard/my-services`
- `/expert/dashboard/ai-place/products`, `/new`, and `/[productId]`
- `/expert/dashboard/my-applications`
- `/expert/dashboard/jobpost/[id]`
- `/expert/dashboard/wallet`

`/expert/dashboard` renders `ExpertJobpostMarketplaceView`, so it is the live
Browse Jobpost experience. No Projects route existed in the current app tree.
The Expert layout renders `WorkspaceSideBar` with role `EXPERT`.

## 3. Git Baseline and Historical Evidence

`git merge-base HEAD origin/main` returned
`b5ac7754b7ba2281f1af07d5f461499f91cdd55c`. `git diff --name-status
<merge-base>..HEAD` is empty. Therefore neither route can be classified as an
accidental deletion by this feature branch.

The non-ancestor commit `2dcfa3f` (`List project`) added:

- `app/expert/dashboard/browse-job-posts/page.tsx`, a duplicate renderer of
  `ExpertJobpostMarketplaceView`;
- `app/expert/dashboard/projects/page.tsx` and
  `features/workspace/WorkspaceProjectsListView.tsx`.

The non-ancestor commit `1fb2a61` added the matching
`/expert/dashboard/projects/[workspaceId]` detail route and view. Neither
commit is an ancestor of `HEAD`.

## 4. Expert Sidebar Route Matrix

| Label | Sidebar href after audit | Actual current route | Status | Classification | Action taken |
| --- | --- | --- | --- | --- | --- |
| Dashboard | `/expert/dashboard` | `/expert/dashboard` | Exists | Current active route | None |
| My Services | `/expert/dashboard/my-services` | Same | Exists | Current active route | None |
| AI Products | `/expert/dashboard/ai-place/products` | Same | Exists | Intentional AI Place route | None |
| My Applications | `/expert/dashboard/my-applications` | Same | Exists | Current active route | None |
| Browse Jobpost | `/expert/dashboard` | `/expert/dashboard` | Exists | **B. STALE_SIDEBAR_LINK** | Corrected href and added legacy redirect |
| Project | `/expert/dashboard/projects` | Same | Recovered | **D. HISTORICAL_UNMERGED_ROUTE** | Restored against current contract |
| Wallet | `/expert/dashboard/wallet` | Same | Exists | Current Wallet recovery | None |

The navigation component marks a dashboard root active only on an exact match;
the updated Browse Jobpost and Dashboard entries intentionally share the live
marketplace URL, so both can highlight on that one page. This is a presentation
duplication inherited from the sidebar labels, not a route failure.

## 5. Root-Cause Findings

### Browse Jobpost

The current Expert dashboard is the active marketplace. The historical Browse
page was only a duplicate alias and was never merged into the actual branch
base. Root cause: **B. STALE_SIDEBAR_LINK**. It was not renamed and was not
accidentally deleted. The legacy URL now performs an App Router redirect to the
current marketplace for bookmarks and the requested smoke test.

### Project

The Project sidebar referenced an implementation available only on the
unmerged `2dcfa3f` / `1fb2a61` workspace line. Root cause:
**D. HISTORICAL_UNMERGED_ROUTE**. It was not accidentally deleted and no
current replacement existed.

## 6. Current Workspace Contract Check

The current Workspace backend implements authenticated endpoints under the
gateway’s Workspace prefix:

- `GET /workspace/api/v1/workspaces/dashboard?pageNo=&pageSize=` returns
  `PagedResponse<WorkspaceSummaryResponse>` with `content`, `pageNo`,
  `pageSize`, `totalElements`, `totalPages`, and `last`.
- `GET /workspace/api/v1/workspaces/{workspaceId}` returns the current
  workspace detail payload for an authorized participant.

The recovered React Query hook calls only those endpoints via the existing
`services/workspace.service.ts` API client. It handles loading, empty, error,
retry, and pagination; detail handles loading, error/retry, and a return route.

## 7. Recovery Changes

- Corrected the Browse Jobpost sidebar target to the existing Expert
  marketplace.
- Added a compatibility redirect at `/expert/dashboard/browse-job-posts`.
- Restored the Expert Projects list and detail routes only.
- Restored the existing Workspace dashboard query function and hook using the
  present backend contract.
- Added no new API client, did not cherry-pick historical commits, and did not
  change AI Place, Wallet, JobPost, or Identity/Gateway architecture.

## 8. Files Changed for This Recovery

- `components/layout/ClientSideBar.tsx`
- `services/workspace.service.ts`
- `features/workspace/index.ts`
- `features/workspace/WorkspaceProjectsListView.tsx`
- `features/workspace/WorkspaceDetailView.tsx`
- `app/expert/dashboard/browse-job-posts/page.tsx`
- `app/expert/dashboard/projects/page.tsx`
- `app/expert/dashboard/projects/[workspaceId]/page.tsx`

## 9. Validation

- `npm run lint`: PASS — 0 errors; 41 pre-existing warnings.
- `npx tsc --noEmit`: PASS.
- `git diff --check`: PASS.
- Local runtime smoke on `http://localhost:3000`: PASS (HTTP 200) for
  `/expert/dashboard`, `/expert/dashboard/my-services`,
  `/expert/dashboard/ai-place/products`,
  `/expert/dashboard/my-applications`,
  `/expert/dashboard/browse-job-posts`, `/expert/dashboard/projects`, and
  `/expert/dashboard/wallet`.

## 10. Remaining Issues and Decision

No route blocker remains. The repeated Dashboard/Browse Jobpost navigation
label is historical presentation duplication; both lead to the same live
marketplace by design of this minimal recovery. No accidental route deletion
was found. **Decision: PASS.**
