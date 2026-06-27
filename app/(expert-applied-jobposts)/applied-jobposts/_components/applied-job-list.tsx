import type { AppliedJob } from "@/types/applied-job.type"
import { AppliedJobCard } from "./applied-job-card"
import { AppliedJobEmpty } from "./applied-job-empty"

type Props = {
  jobs: AppliedJob[]
}

export function AppliedJobList({ jobs }: Props) {
  if (jobs.length === 0) {
    return <AppliedJobEmpty />
  }

  return (
    <div className="grid gap-5">
      {jobs.map((job) => (
        <AppliedJobCard key={job.id} job={job} />
      ))}
    </div>
  )
}