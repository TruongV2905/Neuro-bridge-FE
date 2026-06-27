import Link from "next/link"
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Wallet,
} from "lucide-react"

import type { AppliedJob } from "@/types/applied-job.type"
import { AppliedJobStatusBadge } from "./applied-job-status-badge"

type Props = {
  job: AppliedJob
}

export function AppliedJobCard({ job }: Props) {
  const actionLabel =
    job.status === "ACCEPTED"
      ? "Open Chat"
      : job.status === "REJECTED"
        ? "View Feedback"
        : "View Detail"

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/20 hover:shadow-xl">
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[var(--primary)]/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] transition-colors duration-300 group-hover:bg-[var(--primary)] group-hover:text-white">
            <BriefcaseBusiness className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground">{job.title}</h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {job.companyName}
            </p>
          </div>
        </div>

        <AppliedJobStatusBadge status={job.status} />
      </div>

      <p className="relative mt-5 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {job.description}
      </p>

      <div className="relative mt-5 flex flex-wrap gap-2">
        {job.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-[var(--primary)]/8 px-3 py-1 text-xs font-semibold text-[var(--primary)] ring-1 ring-[var(--primary)]/10"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="relative mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
        <InfoItem icon={Wallet} label="Budget" value={job.budget} />
        <InfoItem icon={Clock3} label="Timeline" value={job.timeline} />
        <InfoItem icon={CalendarDays} label="Applied" value={job.appliedAt} />
      </div>

      <div className="relative mt-6 flex justify-end">
        <Link
          href={`/expert-applied-jobposts/${job.id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4564ff] hover:shadow-md"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Icon className="h-4 w-4 text-[var(--primary)]" />
        {label}
      </div>

      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  )
}