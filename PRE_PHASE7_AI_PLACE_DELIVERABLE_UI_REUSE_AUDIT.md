# Pre-Phase 7 — AI Place Deliverable UI Reuse Audit

**Date:** 2026-10-24  
**Repository / branch:** `Neuro-bridge-FE` / `feature/available-ai-product`  
**Audit mode:** read-only. No existing source, route, service, storage helper, or backend code was changed. This report is the only artifact created by this audit.

## 1. Existing Expert deliverable UI found

### Current Expert workspace UI

| Path / component | Current feature | Classification | Presentation dependencies | Data/API/auth/storage dependencies | Reuse decision |
| --- | --- | --- | --- | --- | --- |
| `features/workspace/submission/components/ProjectSubmissionPanel.tsx` / `ProjectSubmissionPanel` | Expert panel in `WorkspaceChatRoomView` | Workspace-specific | Lucide slot icons, custom overlay, Tailwind card states, `Skeleton` | Reads submission packages/files through `services/submission-package.service.ts`; creates/resubmits packages; uploads through `useSubmissionFileUpload`; maps returned `fileUrl` directly to preview/download/storage-path fields | **C — PRESENTATION REFERENCE ONLY.** Do not reuse the component or its models. Its visual slot/card/empty/error patterns may be adapted locally. |
| same file / `packageFileSlots`, inline preview overlay | Expert delivery-slot composition | Workspace-specific | `Code2`, `Database`, `FileText`, `Video`, `Download`, `ImageIcon`, `X` | Same workspace package data and public-url mapping | **B — SAFE COPY/ADAPT INTO AI PLACE** for only the static slot arrangement, icon mapping, and visual states; replace every data/action path. |
| `features/workspace/submission/hooks/useSubmissionFileUpload.ts` / `useSubmissionFileUpload` | Expert package upload | Workspace-specific | None beyond upload state | Calls public Supabase upload helper and tracks upload state | **D — UNSAFE — DO NOT REUSE.** |
| `features/workspace/submission/utils/submission-upload.ts` / `formatSubmissionFileSize` | Expert package upload mapping | Workspace-specific module | The isolated number-to-size formatter is presentation-only | The module also declares bucket/path creation and maps public URL/object path into drafts | **B — SAFE COPY/ADAPT** only for a locally owned size formatter if needed; do not import this storage module. |

`features/workspace/chat-room/WorkspaceChatRoomView.tsx` chooses `ProjectSubmissionPanel` for the Redux `EXPERT` role and `ClientProjectSubmissionPanel` for the Redux `CLIENT` role after loading workspace data. That role/workspace gating is not an AI Place authorization pattern and must not be reused.

### Historical Expert workspace UI

The historical `origin/Feature/workspace_Hai` and `origin/hotfix/workspace_Hai` refs contain richer, but still workspace-bound, Expert panels:

| Path / component | Classification | Reason |
| --- | --- | --- |
| `features/workspace/submission/components/ExpertSubmissionPackagePanel.tsx` / `ExpertSubmissionPackagePanel` | **C — PRESENTATION REFERENCE ONLY** | Rich package status, slot cards, loading, revision feedback, file review status, and upload/edit controls. It also uses Redux identity, workspace submission mutations, and public delivery URLs. |
| `features/workspace/submission/components/expert/ExpertSubmissionDialog.tsx` / `ExpertSubmissionDialog` | **C — PRESENTATION REFERENCE ONLY** | Good four-slot card layout and busy/error states, but it is an upload form tied to `SubmissionDraftFile`, input refs, and submission lifecycle. |
| `features/workspace/submission/constants/submission-file-slots.tsx` / `submissionFileSlots`, `getSubmissionFileSlot` | **B — SAFE COPY/ADAPT INTO AI PLACE** | Pure static labels/icons for the same four categories, but the module is historical and its descriptions/accept rules describe Workspace uploads, not purchased protected assets. |

## 2. Existing Client deliverable UI found

| Path / component | Current feature | Classification | Presentation dependencies | Data/API/auth/storage dependencies | Reuse decision |
| --- | --- | --- | --- | --- | --- |
| `features/workspace/submission/components/ClientProjectSubmissionPanel.tsx` / `ClientProjectSubmissionPanel` | Client read-only submission-package review in `WorkspaceChatRoomView` | Workspace/Project-specific | Custom card list, slot icons, status badge, preview modal, loading/error/empty states | Redux user role/code; workspace/package/review hooks; package history; revision/approval mutations; direct `DeliverableFile.fileUrl` navigation | **C — PRESENTATION REFERENCE ONLY.** Do not import/reuse the panel. |
| same file / `DeliverableFileCard` | Read-only deliverable card | Workspace/Project-specific inline function | Icon, label, filename, size/date metadata, Preview/Download controls, read-only label | Takes a `DeliverableFile` whose `fileUrl` is a durable direct URL | **B — SAFE COPY/ADAPT INTO AI PLACE** for layout only. AI Place actions must request entitlement access, never consume `fileUrl`. |
| same file / `FilePreviewModal` | Client image/video/PDF review | Workspace/Project-specific inline function | Modal styling, file-type icon, fallback copy, `<img>`, `<video controls>`, `<iframe>` | Receives direct `fileUrl`; direct download anchor | **B — SAFE COPY/ADAPT INTO AI PLACE** for presentation only. Do not import it. |
| same file / `ReadOnlyReviewNotice`, `PanelState`, `StatusBadge` | Client package state feedback | Workspace/Project-specific inline functions | Neutral/error/read-only visual language | Coupled to package review terminology and queries | **B — SAFE COPY/ADAPT** for generic loading/error/read-only visual treatment, with AI Place wording and no package review actions. |

The Client panel explicitly labels delivered files as read-only and contains loading, error, empty-package, version/history, revision, and file-approval UI. Those workflow controls are Project/Workspace-only and are outside AI Place scope.

## 3. Existing file-card components

- **Current Expert:** `ProjectSubmissionPanel.tsx` renders four slot cards from `packageFileSlots`, showing icon, label, upload/replace state, filename, size, timestamp, and a direct link in the preview overlay.
- **Current Client:** `ClientProjectSubmissionPanel.tsx` has inline `DeliverableFileCard`, with slot icon/label, filename, `fileSize` plus upload date, **Read-only deliverable**, Preview, and Download controls.
- **Historical:** `ExpertSubmissionDialog.tsx` and `ExpertSubmissionPackagePanel.tsx` supply more polished four-slot card patterns; the historical Client panel contains the same card concept.
- **Unrelated:** `components/file-upload-03.tsx` is a generic upload demo. It is not a deliverable-review component and should not be used for AI Place purchase access.

No current Workspace file card is a safe direct component reuse because all useful cards are private inline functions or pair their presentation with Workspace data and URLs.

## 4. Existing preview components

- Current Client: inline `FilePreviewModal` in `features/workspace/submission/components/ClientProjectSubmissionPanel.tsx`.
- Current Expert: inline preview overlay in `features/workspace/submission/components/ProjectSubmissionPanel.tsx`.
- Historical shared candidate: `origin/Feature/workspace_Hai:features/workspace/submission/components/shared/SubmissionFilePreviewModal.tsx` / `SubmissionFilePreviewModal` (also on `origin/hotfix/workspace_Hai`).
- Historical project-review candidate: `SubmissionPackageReviewPanel.tsx` / `FilePreviewDetail`, which renders review metadata and preview media inside a project review dialog.

All preview components take a durable direct `fileUrl` prop, so none may be imported into AI Place unchanged. Their layout and media branching are suitable copy/adapt references only.

## 5. Existing download implementations

| Location | Behavior | Security/reuse result |
| --- | --- | --- |
| `ProjectSubmissionPanel.tsx` | Preview footer uses `<a href={previewFile.previewUrl} download={previewFile.fileName}>`. | Direct Workspace URL. **Do not reuse the data/action behavior.** |
| `ClientProjectSubmissionPanel.tsx` | Card and preview use `<a href={file.fileUrl} download={file.fileName || true} target="_blank" rel="noreferrer noopener">`. | Direct Workspace URL; `download` remains only a browser hint for cross-origin requests. **Do not reuse the data/action behavior.** |
| Historical `SubmissionFilePreviewModal.tsx` | Same direct anchor pattern with `download`, `_blank`, and `noreferrer noopener`. | **C — presentation reference only.** |
| Historical `SubmissionPackageReviewPanel.tsx` | Direct `fileUrl` link, `_blank`, no Blob processing. | Project-specific. **Do not reuse.** |

No Workspace/Project download helper fetches a Blob, parses `Content-Disposition`, creates an object URL for download, or revokes a download object URL. Repository-wide `URL.createObjectURL` use is only for unrelated avatar previews.

## 6. Existing video-preview implementation

Current and historical Workspace implementations render video with a native player:

- `ProjectSubmissionPanel.tsx`: `<video src={previewFile.previewUrl} controls>` when `fileMimeType.startsWith("video/")`.
- `ClientProjectSubmissionPanel.tsx`: `<video src={file.fileUrl} controls>` when its filename/URL extension classifier sees `.mp4`, `.webm`, `.ogg`, or `.mov`.
- Historical `SubmissionFilePreviewModal.tsx`: `<video src={fileUrl} controls>` using MIME type first and extension fallback.
- Historical `SubmissionPackageReviewPanel.tsx`: `<video src={file.fileUrl} controls>` for the same extensions.

Each is a modal/overlay preview distinct from its Download anchor. None uses Blob download, signed-URL refresh, cross-origin signed-URL handling, or `Content-Disposition` logic.

## 7. Existing PDF/document-preview implementation

- Current Expert `ProjectSubmissionPanel.tsx` uses `<iframe src={previewFile.previewUrl}>` only when MIME type is `application/pdf`.
- Current Client `FilePreviewModal` uses `<iframe src={file.fileUrl}>` for `.pdf` URLs/names; other documents show **Preview is not available** with a download link.
- Historical shared `SubmissionFilePreviewModal.tsx` uses MIME type `application/pdf` then extension fallback. Other document types show the generic fallback.
- Historical `SubmissionPackageReviewPanel.tsx` also frames `.pdf`, `.txt`, `.html`, and `.htm` as a document.

The existing UI does not provide a DOC/DOCX viewer. For AI Place, PDF preview is the safe initial supported-document case; other document types should remain download-only unless a separate safe viewer is intentionally introduced.

## 8. Existing file-type icons/badges/utilities

| Candidate | Classification | Notes |
| --- | --- | --- |
| `lucide-react` icons `FileCode2`/`Code2`, `Film`/`Video`, `FileArchive`/`Database`, `FileText`, `ImageIcon`, `Download`, `Eye` | **A — SAFE DIRECT REUSE** | Pure visual dependencies with no workflow/data behavior. AI Place already uses the four protected-asset icons in `ClientPurchaseDetailView.tsx`. |
| `features/ai-place/expert/utils/presentation.ts` / `formatFileSize` | **A — SAFE DIRECT REUSE** | Pure byte-size formatter. Client Purchase Detail already imports other presentation helpers from this file. No Expert flow modification is needed. |
| Historical `submission-file-slots.tsx` | **B — SAFE COPY/ADAPT** | Same four labels/icons, but Workspace-upload descriptions and MIME accept lists are not Client entitlement metadata. |
| `formatStatusLabel`, `formatDateTime`, `joinDisplayParts` in current Client panel or historical `submission-display.ts` | **B — SAFE COPY/ADAPT** | Pure functions in places tied to Workspace semantics; keep AI Place wording/date policy local rather than importing a Workspace module. |
| `formatSubmissionFileSize` in `submission-upload.ts` | **B — SAFE COPY/ADAPT** | Pure function, but its containing module also owns public bucket/path mapping. Do not import the module. |
| Workspace status/review badges | **C — PRESENTATION REFERENCE ONLY** | Their labels represent package/version/review status, not entitlement. |

## 9. Safe direct-reuse candidates

There is **no whole Workspace/Project deliverable component** safe to use directly.

Safe direct reuse is limited to already-shared/pure resources:

- `components/ui/card.tsx`, `components/ui/button.tsx`, `components/ui/dialog.tsx`, `components/ui/skeleton.tsx`, and `components/ui/badge.tsx`.
- Lucide file/action icons.
- `formatFileSize` from `features/ai-place/expert/utils/presentation.ts`.
- Existing AI Place error mapping and `useProtectedDownloadAccess` mutation, used only through the current entitlement endpoint.

## 10. Safe copy/adapt candidates

Copy/adapt presentation into AI Place-local files; do not import Workspace components:

- The four-slot package/card composition from `DeliverableFileCard` and historical `ExpertSubmissionDialog`.
- The `FilePreviewModal` / `SubmissionFilePreviewModal` visual hierarchy: metadata header, close button, bounded media frame, unsupported-preview fallback, and action footer.
- Native `<video controls>` for an entitlement-issued video URL held only in component-local transient state.
- PDF `<iframe>` presentation for an entitlement-issued URL when the returned content type is `application/pdf`.
- Client card empty/loading/error/read-only state styling, with entitlement-specific copy such as **Access expired**, **Not available**, and **Requesting secure access**.
- A locally owned extension/MIME classifier that receives the access response's `originalFilename` and `contentType`, not a Workspace `fileUrl` model.

## 11. Unsafe storage/data helpers

| File | Why it must not be reused |
| --- | --- |
| `services/supabase-storage.service.ts` | Direct Supabase browser upload and `getPublicUrl`; returns bucket, path, and permanent public URL. |
| `features/workspace/submission/hooks/useSubmissionFileUpload.ts` | Calls the public storage helper for Workspace submission files. |
| `features/workspace/submission/utils/submission-upload.ts` | Declares `submission-files` bucket, generates storage paths, and stores public URL/object path in draft state. |
| `utils/uploadFile.ts` | Uploads directly to public `image_url` bucket and returns a public URL. |
| `types/submission-package.type.ts` / `DeliverableFile`, `SubmissionDraftFile` | Includes `fileUrl`, `downloadUrl`, and `storagePath` as package data. Not an AI Place entitlement model. |
| `services/submission-package.service.ts` | Workspace package/file APIs, mutations, and query keys; not AI Place authorization. |
| Any Workspace preview/download component's direct `fileUrl` path | Skips the AI Place entitlement endpoint and would expose/persist a data model that AI Place must not own. |

AI Place must keep `services/ai-available-purchase.service.ts` / `requestProtectedDownloadAccess` as the only access path. `ProtectedDownloadAccess` already returns `originalFilename`, `contentType`, `byteSize`, temporary `accessUrl`, and expiry after entitlement verification.

## 12. Recommended AI Place Protected Package UI

Replace the simple four-row section only with an AI Place-local package presentation:

```text
Protected deliverables                         ACTIVE / EXPIRED

[source icon] Source code
              Protected source deliverable
              [Download]

[video icon]  Video
              Protected video deliverable
              [Preview] [Download]

[dataset icon] Dataset
               Protected dataset deliverable
               [Download]

[document icon] Document
                Protected document deliverable
                [Preview when PDF/image] [Download]
```

- Before an action, use only the four known asset type labels and availability from `PurchaseDetail.availableAssetTypes`; do not pre-request URLs.
- On Preview or Download, call the existing entitlement endpoint for that specific asset type.
- After the response, display returned filename/type/size in the transient preview dialog or immediate action context. Do not add it to React Query, Redux, localStorage, or a durable purchase model.
- Use a fresh entitlement access request for each Download action. Do not reuse a preview URL as a stored download URL.
- Expired/not-available cards remain visible with disabled/no-action treatment; they must not request access.

**Contract limitation:** `PurchaseDetail` exposes `availableAssetTypes`, not protected-asset filename/content type/byte size. The target's pre-action `filename / size / type` card line is therefore not presently available without either (a) minting access URLs just to render cards, which is not recommended, or (b) a new backend metadata read contract, which is out of scope. This UI should initially show metadata only after the user requests access.

## 13. Recommended AI Place component structure

```text
ClientPurchaseDetailView
└─ AiPlaceProtectedPackage
   ├─ AiPlaceProtectedAssetCard × 4
   │  └─ requestProtectedDownloadAccess on Preview/Download only
   └─ AiPlaceProtectedAssetPreviewDialog (conditional)
      ├─ image / video / PDF / unsupported branches
      └─ transient access response metadata and URL
```

- `AiPlaceProtectedPackage` owns entitlement-active/expired presentation and action dispatch.
- `AiPlaceProtectedAssetCard` receives only asset label/type/availability/loading callbacks; it must never receive bucket/key/public URLs.
- `AiPlaceProtectedAssetPreviewDialog` receives a component-local access response and clears it when closed. It renders a native video/image/PDF preview only when support is determined from returned metadata.
- A local `protected-asset-presentation` utility owns label/icon/kind/size formatting. It must not import Workspace submission types, public URLs, or storage functions.

## 14. Exact AI Place files to add

Recommended future files:

- `features/ai-place/components/AiPlaceProtectedPackage.tsx`
- `features/ai-place/components/AiPlaceProtectedAssetCard.tsx`
- `features/ai-place/components/AiPlaceProtectedAssetPreviewDialog.tsx`
- `features/ai-place/utils/protected-asset-presentation.ts`

These files should be local to AI Place. They need no new API client, route, Redux state, local storage, or Supabase dependency.

## 15. Exact AI Place files to modify

- `features/ai-place/components/ClientPurchaseDetailView.tsx` — replace only its current `EntitlementPanel` presentation with the local package UI and wire its existing `useProtectedDownloadAccess` mutation into on-demand preview/download actions.

No modification is recommended for:

- `services/ai-available-purchase.service.ts`
- `features/ai-place/types/index.ts`
- routes, layouts, Wallet, Payment, Workspace, JobPost, Homepage, Expert AI Product components, or shared confirmation primitives.

## 16. Exact Workspace/Project files that must remain untouched

- `features/workspace/chat-room/WorkspaceChatRoomView.tsx`
- `features/workspace/submission/components/ProjectSubmissionPanel.tsx`
- `features/workspace/submission/components/ClientProjectSubmissionPanel.tsx`
- `features/workspace/submission/hooks/useSubmissionFileUpload.ts`
- `features/workspace/submission/utils/submission-upload.ts`
- `features/workspace/submission/utils/submission-upload-error.ts`
- `services/submission-package.service.ts`
- `services/supabase-storage.service.ts`
- `types/submission-package.type.ts`
- `utils/uploadFile.ts`

Historical refs were inspected only. No historical branch, file, or route is a migration target.

## 17. MP4 handling recommendation

Use two intentional actions:

- **Preview:** request a fresh entitlement URL, then open an AI Place-local dialog with `<video controls src={temporaryUrl}>`. Clear the local access response on close. This gives the user inline viewing without pretending it is a file download.
- **Download:** request a fresh entitlement URL and use the selected secure-download behavior. Do not reuse the Workspace direct-anchor helper.

The current Workspace implementation offers no safe download helper to adapt: it only supplies direct anchors, no Blob/object URL, no `Content-Disposition` inspection, no CORS handling, and no signed-URL renewal. An `<a download>` attribute is advisory and may be ignored for a cross-origin signed URL. Whether an MP4 becomes a real attachment download depends on the final signed response's `Content-Disposition` and browser policy. Before implementation, inspect the live entitlement URL's final response headers in DevTools. If it is inline, a backend/storage disposition capability is needed for a guaranteed attachment download; frontend code must not fabricate or proxy protected bytes.

## 18. Regression risk

- **Low:** local card/dialog presentation using current entitlement mutation and no new shared dependencies.
- **Medium:** media preview lifetime and stale temporary URLs. Mitigate by requesting on explicit user action, keeping the response only in local component state, clearing it on close, and presenting retry/error states.
- **High if violated:** importing Workspace storage/package models or direct `fileUrl` behavior would bypass entitlement authorization and expose permanent public URL/object-path semantics.
- **High if violated:** editing Workspace/Project components to extract a shared abstraction risks existing Expert/Client submission, review, upload, and route regressions.

Protected route files and all named Client/Expert dashboard paths were treated as out of scope. Existing working-tree changes from the prior AI Place confirmation task were observed but not altered by this audit.

## 19. Implementation plan

1. Keep the current purchase-detail query and `useProtectedDownloadAccess` service unchanged.
2. Add the four AI Place-local presentation files in section 14 and move only the `EntitlementPanel` rendering responsibilities into them.
3. Render all four known slots from the existing AI Place asset enum; gate actions on backend `SUCCESS` detail, active entitlement, `canDownload`, and `availableAssetTypes`.
4. On Preview, call the entitlement endpoint, validate the temporary HTTP(S) URL, put the response only in dialog-local state, and render image/video/PDF according to returned metadata.
5. On Download, call the entitlement endpoint again and use the header-verified browser behavior; keep error/loading feedback feature-local.
6. Do not prefetch access URLs, persist responses, import Workspace types/helpers, or change routes/services/backend contracts.
7. Manually test active/expired/absent slots, video preview, PDF preview, unsupported-document fallback, access-link expiry/retry, and no signed URL in storage/query cache.

## 20. Audit decision: READY

The package-style UI can be implemented safely as AI Place-local presentation. No Workspace/Project deliverable component is safe for direct reuse intact; use shared primitives and pure AI Place formatting directly, then copy/adapt visual patterns while preserving the entitlement endpoint as the sole protected-access authority.
