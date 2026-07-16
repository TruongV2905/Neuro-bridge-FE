import { AlertCircle, FileText } from "lucide-react";

import { formatStatusLabel } from "../../utils/submission-display";

export function SubmissionPanelNotice({
  message,
  tone,
}: {
  message: string;
  tone: "warning" | "error";
}) {
  const isError = tone === "error";

  return (
    <div
      className={`flex gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
        isError
          ? "border-rose-100 bg-rose-50 text-rose-700"
          : "border-amber-100 bg-amber-50 text-amber-700"
      }`}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function SubmissionPanelState({
  title,
  message,
  tone = "neutral",
}: {
  title: string;
  message: string;
  tone?: "neutral" | "error";
}) {
  const isError = tone === "error";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-4 ${
        isError ? "bg-rose-50" : "bg-slate-50"
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400">
        <FileText className="h-5 w-5" />
      </div>
      <div>
        <p
          className={`text-sm font-medium ${
            isError ? "text-rose-700" : "text-slate-600"
          }`}
        >
          {title}
        </p>
        <p
          className={`text-xs leading-relaxed ${
            isError ? "text-rose-600" : "text-slate-400"
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  );
}

export function SubmissionStatusBadge({ status }: { status?: string | null }) {
  return (
    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
      {formatStatusLabel(status)}
    </span>
  );
}
