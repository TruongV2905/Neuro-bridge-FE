import { cn } from "@/lib/utils";

export const jobPostFieldClassName = cn(
  "h-14 w-full rounded-2xl border border-slate-200/90 bg-white/90 px-5",
  "text-base text-slate-800 outline-none",
  "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
  "placeholder:text-slate-400",
  "hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white",
  "hover:shadow-[0_8px_28px_rgba(99,102,241,0.12)]",
  "focus:border-indigo-500 focus:bg-white focus:shadow-[0_10px_32px_rgba(99,102,241,0.16)]",
  "focus:ring-4 focus:ring-indigo-500/10"
);

export const jobPostSelectClassName = cn(
  jobPostFieldClassName,
  "cursor-pointer appearance-none text-slate-600"
);

export const jobPostFieldLabelClassName =
  "mb-2.5 block text-sm font-bold tracking-wide text-slate-800";

export const jobPostInteractiveCardClassName = cn(
  "rounded-2xl border border-slate-200/80 bg-white/90",
  "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
  "hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_8px_28px_rgba(99,102,241,0.1)]"
);
