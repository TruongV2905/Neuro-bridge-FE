import Link from "next/link";
import {
  BriefcaseBusiness,
  Folder,
  MessageCircle,
  Search,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ExpertDashboardPage() {
  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-7">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/50 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            Expert Workspace
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Expert Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Choose a workspace area to continue. Marketplace browsing now lives
            in its own Browse Jobpost route.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              className="h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-5 text-sm font-bold text-white"
            >
              <Link href="/expert/dashboard/browse-job-posts">
                <Search className="mr-2 h-4 w-4" />
                Browse Jobposts
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-slate-200 bg-white px-5 text-sm font-bold text-slate-700"
            >
              <Link href="/expert/dashboard/my-applications">
                <Sparkles className="mr-2 h-4 w-4" />
                My Applications
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                <item.Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-sm font-extrabold text-slate-950">
                {item.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {item.description}
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

const dashboardLinks = [
  {
    href: "/expert/dashboard/browse-job-posts",
    title: "Browse Jobposts",
    description: "Open the public marketplace.",
    Icon: Search,
  },
  {
    href: "/expert/dashboard/my-applications",
    title: "My Applications",
    description: "Review submitted applications.",
    Icon: BriefcaseBusiness,
  },
  {
    href: "/expert/dashboard/projects",
    title: "Projects",
    description: "Open project workspaces.",
    Icon: Folder,
  },
  {
    href: "/expert/dashboard/chat",
    title: "Chat",
    description: "Continue project conversations.",
    Icon: MessageCircle,
  },
  {
    href: "/expert/dashboard/wallet",
    title: "Wallet",
    description: "View balance and transactions.",
    Icon: WalletCards,
  },
] as const;
