# Pre-Phase 7 AI Place Purchase and Download Reuse Audit

**Audit date:** 2026-10-24  
**Repository / branch:** `Neuro-bridge-FE` / `feature/available-ai-product`  
**Audit mode:** read-only. No existing source, route, backend, workspace, payment, or layout file was changed. This report is the only audit artifact created.

## 1. Current Buy flow behavior

The Client product-detail route delegates to `features/ai-place/components/AiPlaceProductDetailFoundation.tsx`.

1. The **Buy product** button calls `onBuy`.
2. `onBuy` calls `buyProduct()` immediately.
3. `buyProduct()` calls `useBuyAiProduct().mutate(productId)` immediately.
4. `useBuyAiProduct` invokes `buyAiProduct` in `services/ai-available-purchase.service.ts`.
5. `buyAiProduct` sends `POST /ai-available/v1/ai-place/client/products/{productId}/purchases` through the existing centralized Axios client.

There is currently no confirmation screen/modal and no wallet read before that POST. The POST is therefore the first Buy-click action and is the backend settlement trigger. The existing pending/retry handling begins only after the backend response/error. The current known backend limitation remains unchanged: successful-purchase history is the only durable product lookup, so `PENDING_PAYMENT` is retained only while the current product-detail session has its returned purchase ID; it is not reconstructed after navigation/reload.

## 2. Existing reusable payment-confirmation UI found

There is no current, active payment-specific confirmation component.

- `components/ui/alert-dialog.tsx` is the safe, generic Radix alert-dialog primitive.
- `components/dashboard/crud/ConfirmActionDialog.tsx` is a current generic confirmation shell. It accepts only title/description/confirm/cancel/loading/danger props and is used by CRUD and Expert AI Product destructive actions, including `features/ai-place/expert/ExpertAiProductDetailView.tsx`, `features/ai-place/expert/components/PreviewManager.tsx`, and `features/ai-place/expert/components/ProtectedAssetsManager.tsx`. It is not a payment summary and has no wallet/payment data logic.
- `features/job-post/client/manage/components/ClientProposalDetailDialog.tsx` currently reads wallet data and presents an **inactive** proposal-unlock readiness display. Its `Unlock with Wallet` controls are deliberately disabled; it does not submit a payment or open a confirmation dialog in the active source.
- `features/payment/wallet/PaymentWalletView.tsx` is a wallet page, not a confirmation component. It displays the same read-only wallet result and transaction history.

`ConfirmActionDialog` could be used unchanged for a minimal yes/no acknowledgement, but it cannot safely present a product/payment review without expanding a shared component already used by protected Expert and CRUD flows. It should not be modified for this work.

## 3. Historical payment-confirmation UI found

Historical remote branches contain three relevant precedents.

- `origin/feature/workspace`, commit `653be67` (**Waiting for payment**), implemented an in-file `PaymentConfirmationDialog` in `features/job-post/client/manage/components/ClientProposalDetailDialog.tsx`. It opened before `usePayProposalByWallet().mutateAsync`, displayed unlock cost, wallet balance, and a client-calculated remaining balance, and closed after the call. Equivalent implementations exist on `origin/Feature/workspace_Hai` and `origin/hotfix/workspace_Hai`.
- `origin/Feature/workspace_Hai:features/contract/ContractSigningView.tsx` had an AlertDialog titled **Confirm workspace payment**. `handleOpenFinalizeConfirm` opened it, and `handleConfirmFinalizeWorkspace` then finalized the workspace. It displayed the contract proposed budget as the payment amount.
- `origin/Feature/workspace_Hai:features/workspace/submission/components/SubmissionPackageReviewPanel.tsx` contained a transfer-release review. It fetched an escrow record before displaying held amount, platform fee, and escrow amount, then exposed **Confirm transfer**. This is a release/escrow flow, not a buyer wallet-debit flow.

The separate historical `origin/Feature/payment-result` route (`app/(payment)/payment/page.tsx` and `_components/payment-status-card.tsx`) is only a success/failed result page driven by a `status` query parameter. It is not a checkout confirmation step.

None of these historical implementations is safe to reuse as AI Place payment logic: the proposal version sends amount/expert data from the browser, the contract version derives amount from a different domain model, and the escrow version implements project-release semantics. They are visual and interaction references only.

## 4. Recommended AI Place confirmation UX

Add an **AI Place-local** alert dialog, opened by the initial Buy click. Opening it must make no financial request.

- Show the current marketplace product name and `priceVnd` strictly as review information from the Product DTO.
- Optionally query the existing `useGetMyWallet()` hook while the dialog is open and show **current wallet balance** and **wallet status** as advisory, read-only information. Do not calculate a remaining balance, determine payment eligibility, or block/approve settlement from those values. The result can be stale and the Payment service remains authoritative.
- Label the displayed price as subject to backend validation at confirmation; do not show derived platform fee, seller net, or a browser-created total.
- **Cancel** closes the dialog without calling the purchase endpoint.
- **Confirm purchase** is the sole handler that calls the existing `useBuyAiProduct` mutation. It must remain disabled while that mutation is pending and preserve the existing success/pending/already-owned handling.
- Keep the existing retry action explicit. Never create a second purchase and do not alter the documented pending-purchase reload limitation.

Use `components/ui/alert-dialog.tsx`, `components/ui/button.tsx`, and existing formatting utilities as primitives. Create a local AI Place wrapper rather than modifying `ConfirmActionDialog`, workspace, job-post, payment, or shared layout code.

## 5. Backend changes required: NO

No backend change is required for a client-side review gate: the browser can simply wait until the user presses **Confirm purchase** before sending the existing purchase POST.

The existing Payment API also exposes sufficient **read-only** wallet information through `GET /payment/api/wallet/mine`, implemented by `getMyWallet` / `useGetMyWallet` in `services/payment.service.ts`. `UserWallet` includes `walletBalance` and `status` (`ACTIVE`, `INACTIVE`, `LOCKED`, or `PENDING_VERIFICATION`). This is appropriate for advisory display only.

A backend change would be required only for a different requirement such as a durable checkout session, a price quote/lock, server-calculated pre-authorisation, or a persisted abandoned/cancelled checkout. Those features must not be inferred or fabricated for the proposed confirmation gate.

## 6. Current MP4 behavior root cause

The confirmed frontend cause is in `features/ai-place/components/ClientPurchaseDetailView.tsx`:

1. The entitlement endpoint is called only after the user chooses an allowed asset.
2. On success, the handler creates an anchor with the temporary `accessUrl`, sets `target = "_blank"`, and clicks it.
3. It sets no `download` attribute and does not request a Blob.

That explicitly navigates a new tab. For an MP4 response that the browser can render inline, the expected result is its native video viewer/player in that tab. This matches the verified runtime behavior.

The source does not expose the signed URL response headers, so this audit cannot prove whether Supabase/the signed URL also omits `Content-Disposition: attachment`. That header and the returned `Content-Type` should be checked in browser DevTools Network before implementation. Adding `<a download>` alone is not a guaranteed solution: browsers can ignore that hint for cross-origin HTTP(S) URLs, while an attachment-oriented `Content-Disposition` response can force download. The existing AI Place response type provides `originalFilename`, `contentType`, `byteSize`, `accessUrl`, and `accessUrlExpiresAt`, but no explicit attachment/download mode.

No Blob/object-URL download implementation or `Content-Disposition` handling exists in the current project file flows. A future implementation must keep the entitlement request as the only source of the temporary URL and must not persist that URL in Redux, localStorage, or React Query.

## 7. Existing Project/Workspace file-review components found

Current source:

- `features/workspace/submission/components/ProjectSubmissionPanel.tsx` is the Expert submission package panel. Its preview overlay renders image, video, and PDF previews and has a generic Download link.
- `features/workspace/submission/components/ClientProjectSubmissionPanel.tsx` is the Client read-only delivery/review panel. It provides asset cards, Preview actions, `FilePreviewModal`, image/video/PDF rendering, file-kind detection, and generic Download links.
- `features/workspace/chat-room/components/ChatMessage.tsx` has visual image/file chat bubbles only. The file bubble does not implement a download or file-preview action.

Historical source:

- `origin/Feature/workspace_Hai` and `origin/hotfix/workspace_Hai` contained the factored `features/workspace/submission/components/shared/SubmissionFilePreviewModal.tsx`. It receives a `fileUrl`, renders image/video/PDF previews, and exposes a generic Download link.
- The same branches contained `SubmissionPackageReviewPanel.tsx`, `ExpertSubmissionPackagePanel.tsx`, `ExpertSubmissionDialog.tsx`, and `SubmissionPanelPrimitives.tsx`, which built package-review UI around submission-domain files.
- `origin/feature/workspace` contains the earlier inline Client and Expert submission-preview implementations, including the original Client `FilePreviewModal`.

## 8. Existing download implementations found

- Expert package preview: `ProjectSubmissionPanel.tsx` renders `<a href={previewFile.previewUrl} download={previewFile.fileName}>`.
- Client delivery cards and preview modal: `ClientProjectSubmissionPanel.tsx` render `<a href={file.fileUrl} download={file.fileName || true} target="_blank" rel="noreferrer noopener">`.
- Historical `SubmissionFilePreviewModal.tsx` uses the same direct-URL anchor pattern with `download`, `_blank`, and `noreferrer noopener`.

Repository-wide search found no workspace/project implementation using `fetch` to a Blob, `URL.createObjectURL` for downloads, `URL.revokeObjectURL`, or `Content-Disposition` parsing. The only current `URL.createObjectURL` use is the unrelated avatar-image preview in `components/fields/AvatarDropzoneField.tsx`.

## 9. Existing video-preview implementations found

`ProjectSubmissionPanel.tsx`, `ClientProjectSubmissionPanel.tsx`, and the historical `SubmissionFilePreviewModal.tsx` all use a direct `<video src={fileUrl} controls>` for video assets. The Client preview classifies `.mp4`, `.webm`, `.ogg`, and `.mov` as video by filename/URL; the Expert panel primarily uses `fileMimeType.startsWith("video/")`.

These are inline-preview implementations, not forced-download implementations. They reinforce why a new-tab navigation to a playable MP4 produces a player instead of a downloaded file.

## 10. Safe reusable components

Safe **component/primitives** reuse:

- `components/ui/alert-dialog.tsx` for accessible confirm/cancel/focus behavior.
- `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/badge.tsx`, and existing formatting helpers for the AI Place-local review UI.
- Existing AI Place asset labels/icons in `ClientPurchaseDetailView.tsx`.

Safe **presentational patterns only** (reimplement locally with entitlement data):

- The visual file-card and metadata arrangement from Client/Expert submission panels.
- The image/video/PDF conditional preview layout from `SubmissionFilePreviewModal.tsx`.
- File type icons and accessible Preview/Download labeling.

The existing workspace preview components themselves are not drop-in safe components because their props model accepts durable, direct `fileUrl` values and their downloads are direct anchors.

## 11. Unsafe components/helpers that must NOT be reused

- `services/supabase-storage.service.ts`: directly calls `supabase.storage.from(bucket).upload(...)` and `getPublicUrl(...)`.
- `features/workspace/submission/hooks/useSubmissionFileUpload.ts` and `features/workspace/submission/utils/submission-upload.ts`: upload to the public `submission-files` bucket, retain `storagePath`, and map permanent `publicUrl` values to `previewUrl`/`downloadUrl`.
- `utils/uploadFile.ts`: uploads to public `image_url` storage and returns a public URL.
- The workspace submission components and historical preview modal as data/auth implementations: they render the returned direct `fileUrl` and can expose it in DOM, navigation, and persisted submission DTOs.
- Historical proposal/contract/escrow payment confirmation logic: it derives/uses workflow-specific financial values and invokes unrelated payment/project APIs.

AI Place must continue to call only `requestProtectedDownloadAccess` in `services/ai-available-purchase.service.ts`, use the backend-issued temporary `accessUrl` immediately, and never use a public bucket, object path, storage helper, or a browser-created protected URL.

## 12. Exact files that would need modification for AI Place

For the narrowly scoped future implementation:

| File | Intended change |
| --- | --- |
| `features/ai-place/components/AiPlaceProductDetailFoundation.tsx` | Change the initial Buy click from immediately mutating to opening an AI Place-local review dialog; call the existing buy mutation only from dialog confirmation. Optionally invoke the existing read-only wallet hook while the dialog is open. |
| `features/ai-place/components/AiPlacePurchaseConfirmationDialog.tsx` **(new)** | Local dialog wrapper using existing UI primitives. It must accept display-only product/wallet values and an explicit confirm callback; it must own no payment math or persistence. |
| `features/ai-place/components/ClientPurchaseDetailView.tsx` | Replace the unconditional `_blank` launch with the chosen, tested protected-download interaction. Preserve the entitlement endpoint call and do not cache/persist the returned URL. |

No route page needs modification. `services/ai-available-purchase.service.ts` already owns the required purchase and entitlement calls; `services/payment.service.ts` already owns the optional read-only wallet query. Neither needs a change for this plan.

## 13. Exact files/components that must remain untouched

Protected route entries confirmed present and out of scope:

- `app/client/dashboard/page.tsx`
- `app/client/dashboard/projects/`
- `app/client/dashboard/wallet/page.tsx`
- `app/client/dashboard/ai-place/page.tsx`
- `app/client/dashboard/ai-place/[productId]/page.tsx` (the product-detail route itself remains; only its imported feature component is a planned target)
- `app/expert/dashboard/page.tsx`
- `app/expert/dashboard/ai-place/products/page.tsx`
- `app/expert/dashboard/projects/`
- `app/expert/dashboard/wallet/page.tsx`
- `app/expert/dashboard/my-services/`

Also leave untouched:

- `features/payment/wallet/PaymentWalletView.tsx` and all payment settlement/top-up behavior.
- `features/workspace/**`, `services/supabase-storage.service.ts`, and `utils/uploadFile.ts`.
- `features/job-post/**`, including `ClientProposalDetailDialog.tsx`.
- Expert AI Product components, homepage behavior, dashboard layout/sidebar, notifications, and shared `ConfirmActionDialog.tsx`.

## 14. Regression risk assessment

**Low** for the confirmation gate if it remains feature-local: no route, shared navigation, wallet settlement, or backend contract must change. Main risks are accidentally sending the existing POST from both the initial click and confirmation, using stale wallet data as an authorization decision, or losing the existing pending/retry/error handling. Keep a single mutation invocation in the confirm handler and retain current React Query invalidations.

**Medium** for the download UX because browser behavior depends on the temporary URL response headers as well as client code. Reusing workspace direct-URL helpers would be a **high** security regression: they are built around public storage URLs and object paths, which violates the AI Place entitlement contract. Test the chosen behavior against real signed URLs for MP4, document, dataset, and source code before changing the label or interaction.

The known `PENDING_PAYMENT` lookup limitation is not a regression introduced by this proposal and must remain documented: no durable backend product lookup means it cannot be restored across navigation/reload without backend support.

## 15. Recommended implementation plan

1. Add the AI Place-local confirmation dialog and only open it from Buy; make no API call at this step.
2. Feed it the already-loaded product name/price. If wallet context is desired, query `useGetMyWallet` as advisory display and handle loading/error without browser-side balance eligibility decisions.
3. On explicit confirm, call the existing `useBuyAiProduct` exactly once; retain its existing backend-driven success, pending, already-owned, and error paths. Cancel does nothing.
4. Do not change purchase lookup/query behavior, routes, Payment service mutation behavior, or the pending-across-reload limitation.
5. Capture an actual protected MP4 network response in browser DevTools (response `Content-Type`, `Content-Disposition`, redirect/final response, and origin) before selecting the download approach.
6. Implement only an AI Place-local protected-download interaction that invokes the entitlement endpoint on demand and uses its temporary URL without persistence. Do not import public-storage or workspace data helpers.
7. Manually verify: cancel makes no purchase POST; confirm makes one POST; insufficient balance/pending/retry/already-owned remain backend-driven; every protected asset remains entitlement-gated; MP4 behavior matches the tested response-header decision.

## 16. Audit decision: READY

The requested confirmation gate can be implemented safely without backend or route changes, and the MP4 root cause has a confirmed frontend component plus a clearly bounded header-validation step. The implementation must remain AI Place-local and must not reuse the workspace public-storage data path.
