import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ExpertMyServicesPage() {
  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/50">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Expert Workspace
        </p>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
          My Services
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Manage your AI services and offerings. This area is coming soon.
        </p>

        <Button asChild className="mt-6 rounded-xl">
          <Link href="/expert/dashboard/browse-job-posts">Back to Marketplace</Link>
        </Button>
      </div>
    </main>
  );
}
