import type { MutableRefObject } from "react";
import { CheckCircle2, UploadCloud, X } from "lucide-react";

import type {
  SubmissionDraftFile,
  SubmissionFileType,
} from "@/types/submission-package.type";

import { submissionFileSlots } from "../../constants/submission-file-slots";
import { SubmissionPanelNotice } from "../shared/SubmissionPanelPrimitives";

type DraftFileMap = Partial<Record<SubmissionFileType, SubmissionDraftFile>>;

export function ExpertSubmissionDialog({
  isEditMode,
  note,
  releaseDay,
  draftFiles,
  uploadedCount,
  uploadingType,
  isUploading,
  isSubmitting,
  canSubmit,
  formError,
  submitError,
  uploadError,
  inputRefs,
  onNoteChange,
  onReleaseDayChange,
  onChooseFile,
  onFileChange,
  onSubmit,
  onClose,
}: {
  isEditMode: boolean;
  note: string;
  releaseDay: string;
  draftFiles: DraftFileMap;
  uploadedCount: number;
  uploadingType: SubmissionFileType | null;
  isUploading: boolean;
  isSubmitting: boolean;
  canSubmit: boolean;
  formError?: string | null;
  submitError?: string | null;
  uploadError?: string | null;
  inputRefs: MutableRefObject<
    Partial<Record<SubmissionFileType, HTMLInputElement | null>>
  >;
  onNoteChange: (value: string) => void;
  onReleaseDayChange: (value: string) => void;
  onChooseFile: (type: SubmissionFileType) => void;
  onFileChange: (type: SubmissionFileType, file?: File) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/40 px-4 py-10 backdrop-blur-sm">
      <div className="my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="shrink-0 border-b border-slate-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {isEditMode ? "Resubmit Package" : "Submit Package"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Upload all 4 required deliverables before submitting the
                package.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Close submission dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            className={`mt-5 grid gap-4 ${
              isEditMode ? "grid-cols-1" : "sm:grid-cols-[1fr_180px]"
            }`}
          >
            <div>
              <label className="text-sm font-semibold text-slate-800">
                Note
              </label>
              <input
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                placeholder="Enter note for this submission"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--primary)] focus:bg-white"
              />
            </div>

            {!isEditMode && (
              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Release day
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={releaseDay}
                  onChange={(event) => onReleaseDayChange(event.target.value)}
                  placeholder="Default"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--primary)] focus:bg-white"
                />
              </div>
            )}
          </div>

          {(formError || submitError || uploadError) && (
            <div className="mt-4 space-y-2">
              {formError && (
                <SubmissionPanelNotice tone="warning" message={formError} />
              )}
              {submitError && (
                <SubmissionPanelNotice tone="error" message={submitError} />
              )}
              {uploadError && (
                <SubmissionPanelNotice tone="error" message={uploadError} />
              )}
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {submissionFileSlots.map((slot) => {
              const file = draftFiles[slot.type];

              return (
                <div
                  key={slot.type}
                  className={`rounded-2xl border p-4 text-left transition ${
                    file
                      ? "border-[var(--primary)]/40 bg-[var(--primary)]/5"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        file
                          ? "bg-[var(--primary)] text-white"
                          : "bg-white text-[var(--primary)]"
                      }`}
                    >
                      {file ? <CheckCircle2 className="h-5 w-5" /> : slot.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {slot.label}
                      </p>

                      {file ? (
                        <>
                          <p className="mt-1 truncate text-xs font-medium text-slate-600">
                            {file.fileName}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {file.fileSize}
                          </p>
                        </>
                      ) : (
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          {slot.description}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => onChooseFile(slot.type)}
                        disabled={uploadingType === slot.type || isSubmitting}
                        className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <UploadCloud className="h-4 w-4" />
                        {uploadingType === slot.type
                          ? "Uploading..."
                          : file
                            ? "Upload again"
                            : "Upload file"}
                      </button>
                    </div>
                  </div>

                  <input
                    ref={(element) => {
                      inputRefs.current[slot.type] = element;
                    }}
                    type="file"
                    accept={slot.accept}
                    className="hidden"
                    onChange={(event) => {
                      onFileChange(slot.type, event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 p-5">
          <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Uploaded{" "}
              <span className="font-semibold text-slate-800">
                {uploadedCount}/4
              </span>{" "}
              required files
            </p>

            <div className="grid gap-3 sm:flex">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onSubmit}
                disabled={
                  uploadedCount !== submissionFileSlots.length ||
                  !note.trim() ||
                  isSubmitting ||
                  isUploading ||
                  !canSubmit
                }
                className="h-11 rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "Submitting..."
                  : isEditMode
                    ? "Resubmit Package"
                    : "Submit Package"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
