"use client";

import { motion } from "framer-motion";
import { Briefcase, PlusCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  variant: "empty" | "no-results";
  onReset?: () => void;
};

export function EmptyState({ variant, onReset }: Props) {
  const isEmpty = variant === "empty";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto flex w-full max-w-md flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/40 px-8 py-14 text-center"
    >
      <div
        className={cn(
          "flex h-20 w-20 items-center justify-center rounded-3xl shadow-inner",
          isEmpty
            ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-indigo-500/40"
            : "bg-white text-slate-400 ring-1 ring-slate-200",
        )}
      >
        {isEmpty ? (
          <Briefcase className="h-8 w-8" />
        ) : (
          <Search className="h-8 w-8" />
        )}
      </div>

      <h3 className="mt-5 text-lg font-extrabold tracking-tight text-slate-900">
        {isEmpty ? "No job posts yet" : "No results found"}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
        {isEmpty
          ? "Start by creating your first listing. We'll guide you through each step with AI-powered recommendations."
          : "We couldn't find any jobs matching your filters. Try adjusting the criteria to see more results."}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {isEmpty ? (
          <Button
            asChild
            className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-violet-600"
          >
            <Link href="/client/dashboard/create-job-post">
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Create your first job post
            </Link>
          </Button>
        ) : (
          <>
            <Button
              onClick={onReset}
              className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-violet-600"
            >
              Reset filters
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-10 rounded-xl border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/60"
            >
              <Link href="/client/dashboard/create-job-post">
                <PlusCircle className="mr-1.5 h-4 w-4" />
                New post
              </Link>
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}
