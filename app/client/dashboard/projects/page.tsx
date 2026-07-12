import { FolderKanban } from "lucide-react"

export default function ClientProjectsPage() {
  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm shadow-slate-200/40">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FolderKanban className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
              Projects
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Project workspace listing is not connected yet. Open a workspace
              detail from a real workspace link to view its live project data.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
