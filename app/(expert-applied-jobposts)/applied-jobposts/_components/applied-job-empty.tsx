import { BriefcaseBusiness } from "lucide-react"

export function AppliedJobEmpty() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-[var(--primary)]/25 bg-white p-10 text-center shadow-sm">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--primary)]/10 blur-3xl" />
      <div className="absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-[var(--secondary)]/10 blur-3xl" />

      <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
        <BriefcaseBusiness className="h-7 w-7" />
      </div>

      <h3 className="relative mt-5 text-lg font-bold text-foreground">
        No applied jobs found
      </h3>

      <p className="relative mt-2 text-sm text-muted-foreground">
        Try changing your filter or apply to a new job post.
      </p>
    </div>
  )
}