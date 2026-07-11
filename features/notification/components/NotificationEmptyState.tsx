import { Inbox } from "lucide-react";

type NotificationEmptyStateProps = {
  title: string;
  description?: string;
  tone?: "default" | "error";
  action?: React.ReactNode;
};

export function NotificationEmptyState({
  title,
  description,
  tone = "default",
  action,
}: NotificationEmptyStateProps) {
  const toneClassName =
    tone === "error"
      ? "bg-rose-50 text-rose-600"
      : "bg-slate-100 text-slate-500";

  return (
    <div className="flex flex-col items-center px-6 py-8 text-center">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full ${toneClassName}`}
      >
        <Inbox className="h-5 w-5" />
      </span>

      <p className="mt-3 text-sm font-semibold text-slate-950">{title}</p>

      {description && (
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      )}

      {action}
    </div>
  );
}
