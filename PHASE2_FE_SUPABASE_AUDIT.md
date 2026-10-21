# 1. Supabase Configuration

The frontend initializes one Supabase JavaScript client in `configs/supabase.ts` with these environment-variable names only:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The module throws during initialization if either value is absent. No values are reproduced in this report. The client is used directly in the browser-side submission upload flow.

The storage helper is `uploadPublicStorageObject` in `services/supabase-storage.service.ts`. It accepts a bucket, object path, browser `File`, and optional `cacheControl`, `upsert`, and `contentType` options. It uploads with `supabase.storage.from(bucket).upload(...)`, then calls `getPublicUrl(...)` for the resulting object path.

The source contains no submission-specific signed-URL creation, object deletion, or download helper.

# 2. Existing Submission Upload Flow

The existing expert Submission UI defines four required slots: `SOURCE_CODE`, `DOCUMENT`, `VIDEO`, and `DATASET`.

```text
Expert selects one file for a required slot
  -> ProjectSubmissionPanel.handleFileChange(type, file)
  -> useSubmissionFileUpload.uploadSubmissionFile(type, file)
  -> createSubmissionStoragePath(type, file.name)
  -> uploadPublicStorageObject({ bucket, path, file, options })
  -> Supabase Storage upload, then getPublicUrl(uploadedPath)
  -> Uploaded object is mapped to a SubmissionDraftFile
  -> Expert submits all four slots
  -> Workspace frontend POSTs file metadata to the Workspace API
```

Details verified in source:

- The upload occurs before the package create/resubmit API call.
- Upload options are `cacheControl: "3600"`, `upsert: true`, and `contentType: file.type || "application/octet-stream"`.
- The helper returns the Storage response path when available (otherwise the requested path), the generated public URL, the original browser filename, the selected/fallback content type, and the browser-reported byte size.
- The draft maps the public URL to both `previewUrl` and `downloadUrl`. The subsequent API payload maps `previewUrl` to `fileUrl`.
- The UI enables submission only when all four slots are present, a non-empty note is entered, a release-day value is entered, and no upload/submission is pending.
- Storage-operation failures produce the generic UI message `Upload file failed. Please try again.` Backend submission failures display a response message when present, otherwise a generic retry message.

# 3. Bucket and Object Path Convention

- Bucket: `submission-files`.
- Object path: `submission-packages/{lowercase-file-type}/{uuid}-{sanitized-original-filename}`.
- `uuid` is created with `crypto.randomUUID()` for every selected upload.
- Filename sanitization normalizes Unicode to NFD, removes combining accents, and replaces every character other than ASCII letters, digits, `.`, and `-` with `-`.
- The path does **not** include `userId`, `workspaceId`, or `packageId`.
- The frontend specifies `upsert: true`; however, the random UUID makes a path collision and therefore a normal overwrite unlikely.

The frontend calls `getPublicUrl`, not `createSignedUrl`. It therefore constructs a public Storage URL with no frontend-configured expiry. Whether the bucket is actually configured as public, and its Storage policies, cannot be verified from this frontend source.

# 4. File Validation

There is no runtime validation function for extension, MIME type, archive contents, or maximum file size in the Submission/Deliverable code. The `accept` attribute below is a browser file-picker filter, not source-enforced validation; `handleFileChange` uploads the received `File` without checking it.

| Asset type | File-picker `accept` hint | MIME validation | Maximum size | Archive requirement | Validation location / error handling |
|---|---|---|---|---|---|
| `SOURCE_CODE` | `.zip,.rar,.7z` | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED as an enforced rule; archives are only suggested | `ProjectSubmissionPanel` input; unsupported files are not programmatically rejected |
| `VIDEO` | `video/*` | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | `ProjectSubmissionPanel` input; no type/size error path exists |
| `DATASET` | `.zip,.rar,.7z,.csv,.xlsx,.json` | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED as an enforced rule; archive and non-archive options are only suggested | `ProjectSubmissionPanel` input; no type/size error path exists |
| `DOCUMENT` | `.pdf,.doc,.docx` | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | `ProjectSubmissionPanel` input; no type/size error path exists |

`file.type` is forwarded as the upload `contentType` (falling back to `application/octet-stream`), but it is not checked against an allow-list. The report does not treat unrelated profile-avatar validation as Submission validation.

# 5. Download / View Behavior

The client Submission panel first requests package and deliverable metadata from the Workspace API:

- package list: `GET /workspace/api/v1/submission-packages/workspaces/{workspaceId}`;
- selected package detail: `GET /workspace/api/v1/submission-packages/{packageId}`.

It then reuses the returned `DeliverableFile.fileUrl` directly for preview and download. The download action is an anchor (`href={file.fileUrl}` with a `download` attribute); it does not call the backend or Supabase SDK at click time. Thus the browser downloads directly from the persisted URL after the metadata read.

- Video can be played in-browser with a native `<video controls>` element when the filename or URL extension is `.mp4`, `.webm`, `.ogg`, or `.mov`.
- PDFs are displayed in an `<iframe>` when the filename or URL extension is `.pdf`.
- Image extensions are displayed in an `<img>` element. Other types, including source archives and datasets, have no browser preview and expose download only.
- No signed URLs are generated anywhere in this flow, so no signed-URL expiration is configured.
- The expert-side draft also previews from the same public URL, using the browser-reported MIME type for image/video/PDF rendering.
- The file URL is persisted/reused through the `fileUrl` request/response field. A Storage object path is retained only in the local draft and is not sent in the Workspace metadata payload.

Replacement and deletion behavior verified from the frontend:

- Choosing “Upload again” uploads a new UUID-named object, replaces that slot in local draft state, and then sends the resulting set of URLs in the resubmission request.
- No Submission code calls `supabase.storage.remove`, nor is there a frontend deletion API call. The old object is therefore not removed by the frontend when a file is replaced.
- `DeliverableFile` includes an `isDelete` response field. The expert panel filters `isDelete` files when rendering the latest package; no source establishes what server-side deletion does to Storage or prior public URLs. That behavior is unknown.

# 6. Backend Metadata Payload

The source DTO/interface is `SubmissionFileRequest`:

```ts
type SubmissionFileRequest = {
  fileName: string;
  fileUrl: string;
  fileSize: string;
  fileType: SubmissionFileType;
};
```

`SubmissionFileType` is typed as `string`; the four required UI values are not a TypeScript union.

For creation, the frontend sends this request to `POST /workspace/api/v1/submission-packages`:

```ts
{
  workspaceId: string;
  notes: string;
  customReleaseDays: number;
  files: SubmissionFileRequest[];
}
```

For resubmission, it sends this request to `POST /workspace/api/v1/submission-packages/{packageId}/resubmit`:

```ts
{
  currentPackageId: string;
  notes: string;
  updatedFiles: SubmissionFileRequest[];
}
```

The frontend sends no raw byte count, MIME type, Storage bucket, object path, checksum, owner ID, workspace ID per file, or package ID per file. `fileSize` is a display-formatted string (for example, B/KB/MB), rather than raw bytes. The response type `DeliverableFile` adds `fileId`, `packageId`, `uploadedAt`, and `isDelete`, but those are not part of the file-create payload.

# 7. Reusability for AI Product Assets

| Concern | Current Implementation | Reusability | Notes |
|---|---|---|---|
| AI Product `SOURCE_CODE` | Existing `SOURCE_CODE` slot suggests `.zip,.rar,.7z`; direct browser upload and metadata mapping already exist. | REUSABLE WITH SMALL CHANGES | Add actual validation and an AI-product metadata contract/path. The current public-URL delivery model is not suitable for purchaser-restricted downloads. |
| AI Product `VIDEO` | Existing `VIDEO` slot suggests `video/*`; returned URL can be rendered by the browser video player for recognized extensions. | REUSABLE WITH SMALL CHANGES | Add enforceable file rules and product-scoped metadata/path. Protected playback/download requires an access-design change. |
| AI Product `DATASET` | Existing `DATASET` slot suggests archives, CSV, XLSX, and JSON. | REUSABLE WITH SMALL CHANGES | Add enforceable format/size rules and product-scoped metadata/path. Dataset download restriction requires an access-design change. |
| AI Product `DOCUMENT` | Existing `DOCUMENT` slot suggests PDF, DOC, and DOCX; PDF preview is supported. | REUSABLE WITH SMALL CHANGES | Add enforceable file rules and product-scoped metadata/path. Protected document download requires an access-design change. |
| Four required asset slots | The Submission UI already has the same four named slots and prevents package submission until all four are present. | REUSABLE AS-IS | This is only UI completeness logic; its generic `string` file-type typing and lack of runtime validation remain limitations. |
| Direct Supabase upload helper | Shared helper uploads a browser `File` and returns path plus public URL. | REUSABLE WITH SMALL CHANGES | It can be generalized for AI Product upload inputs, but currently has public-URL semantics and does not verify asset policy. |
| Object naming | Random UUID plus sanitized filename under a file-type folder. | REUSABLE WITH SMALL CHANGES | An AI Product should need a product-aware ownership/organization convention; the current path cannot identify a product, expert, or purchase. |
| Buyer download/view | Persisted `fileUrl` is handed to a browser preview or anchor directly. | NEEDS NEW DESIGN | This has no entitlement check at access time and uses no short-lived signed URL. |

# 8. 30-Day Access Compatibility

The current pattern is not compatible as-is with a 30-day purchaser download entitlement. The frontend uploads to a public-URL workflow, persists that URL as `fileUrl`, and later lets the browser request it directly. It performs no entitlement check or URL generation immediately before download. A copied or previously saved URL is not constrained by any frontend-configured expiry.

Supabase Storage can technically participate in restricted access, but this frontend's current public-URL/persisted-URL pattern would require additional access-control and URL-issuance design. This report intentionally does not prescribe that design.

# 9. Unknowns

- The actual bucket public/private setting and Storage policies are not present in the frontend repository.
- The Workspace backend's validation, authorization, database persistence, URL handling, resubmission semantics, and deletion/cleanup behavior are outside this audit scope and cannot be inferred as facts from frontend types.
- The source does not establish whether a generated public URL is reachable for every object; it only shows the client constructing one with `getPublicUrl`.
- The source does not establish whether the Workspace backend retains historical URLs, marks prior deliverables deleted, or revokes anything on replacement.
- The source does not establish accepted source-code archive contents, video codecs, document safety checks, dataset schema requirements, or size limits.
- No AI Product or `ai-available-service` frontend contract was inspected or implemented.

# 10. Files Inspected

- `configs/supabase.ts`
- `.env` (variable names only; values were not read into this report)
- `services/supabase-storage.service.ts`
- `types/storage.type.ts`
- `features/workspace/submission/utils/submission-upload.ts`
- `features/workspace/submission/hooks/useSubmissionFileUpload.ts`
- `features/workspace/submission/utils/submission-upload-error.ts`
- `types/submission-package.type.ts`
- `services/submission-package.service.ts`
- `features/workspace/submission/components/ProjectSubmissionPanel.tsx`
- `features/workspace/submission/components/ClientProjectSubmissionPanel.tsx`
