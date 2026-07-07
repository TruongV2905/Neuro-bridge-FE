"use client";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
type Props = {
  title: string;
  icon?: LucideIcon;
  iconClassName?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
};
export function AnalysisCard({
  title,
  icon: Icon,
  iconClassName,
  children, className, delay = 0,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } }}
      className={cn(
        "group mt-5 rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm",
        "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:border-indigo-200/90 hover:shadow-[0_14px_40px_rgba(99,102,241,0.13)]",
        className
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              "group-hover:scale-110 group-hover:shadow-md",
              iconClassName ??
              "bg-indigo-50 text-indigo-500")} >
            <Icon size={20} strokeWidth={2.25} />
          </div>
        )}
        <p className="text-xs font-bold tracking-[0.18em] text-slate-400">
          {title}
        </p>
      </div>
      <div className="text-slate-900">{children}</div>
    </motion.div>
  );
}