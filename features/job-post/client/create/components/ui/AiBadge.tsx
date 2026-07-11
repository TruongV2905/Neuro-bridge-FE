import { Sparkles } from "lucide-react";

export function AiBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-[0_6px_18px_rgba(99,102,241,0.28)]">
        <Sparkles size={14} strokeWidth={2.4} />
      </span>
      AI Assisted
    </span>
  );
}