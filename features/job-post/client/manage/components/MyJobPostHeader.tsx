"use client";

import { motion } from "framer-motion";
import { Briefcase, Eye, PlusCircle, Users } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Stat = {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  gradient: string;
};

type Props = {
  totalJobPosts: number;
  visibleJobPosts: number;
  totalApplicants: number;
};

export function MyJobPostHeader({
  totalJobPosts,
  visibleJobPosts,
  totalApplicants,
}: Props) {
  const stats: Stat[] = [
    {
      label: "Total posts",
      value: totalJobPosts,
      icon: Briefcase,
      tone: "from-indigo-500/15 to-indigo-500/5",
      gradient: "from-indigo-500 to-violet-500",
    },
    {
      label: "Visible to experts",
      value: visibleJobPosts,
      icon: Eye,
      tone: "from-sky-500/15 to-sky-500/5",
      gradient: "from-sky-500 to-blue-500",
    },
    {
      label: "Total applicants",
      value: totalApplicants,
      icon: Users,
      tone: "from-violet-500/15 to-violet-500/5",
      gradient: "from-violet-500 to-fuchsia-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-md shadow-indigo-500/30">
              Workspace
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Client · Job posts
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            My Job Posts
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
            Track every listing you&apos;ve created, monitor incoming applications,
            and fine-tune each project with smart filters and quick actions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <Button
            asChild
            size="lg"
            className="h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-600 hover:to-violet-600 hover:shadow-xl hover:shadow-indigo-500/40"
          >
            <Link href="/client/dashboard/create-job-post">
              <PlusCircle className="mr-1.5 h-4 w-4" />
              New job post
            </Link>
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3 }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40",
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                stat.tone,
              )}
            />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110",
                  stat.gradient,
                )}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 group-hover:scale-x-100",
                stat.gradient,
              )}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
