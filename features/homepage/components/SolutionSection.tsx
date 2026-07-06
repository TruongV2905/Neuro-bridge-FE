import { AvailableAICard } from "@/features/available-ai"
import type { HomepageActivity } from "@/types/homepage"
import { GradientCtaLink } from "./HomepagePrimitives"

interface ActivitiesSectionProps {
  activities: readonly HomepageActivity[]
}

export default function ActivitiesSection({ activities }: Readonly<ActivitiesSectionProps>) {
  return (
    <section className="relative isolate overflow-hidden bg-[#061128] px-6 py-20 text-white sm:py-24 lg:px-[7.5%]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_48%,rgba(252,56,218,0.3),transparent_24%),radial-gradient(circle_at_50%_45%,rgba(84,112,255,0.43),transparent_38%),linear-gradient(120deg,#020c1e,#061c3d_48%,#020916)]" />
      <div className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(36,194,255,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(36,194,255,0.2)_1px,transparent_1px)] [background-size:62px_62px]" />
      <div className="mx-auto max-w-[1280px] text-center">
        <p className="text-[clamp(3rem,6vw,5.5rem)] font-extrabold leading-none text-white/10">AI SOLUTIONS</p>
        <h2 className="-mt-6 text-[clamp(2rem,3vw,2.75rem)] font-extrabold uppercase">Popular AI solutions</h2>
        <div className="activities-grid mt-16 grid gap-7 lg:grid-cols-3 lg:gap-10">
          {activities.map((activity, index) => (
            <div key={`${activity.name}-${index}`} className="activity-card flex justify-center">
              <AvailableAICard {...activity} />
            </div>
          ))}
        </div>
        <GradientCtaLink href="/availableAI" className="mt-16 min-w-[280px]">
          View all AI solutions
        </GradientCtaLink>
      </div>
    </section>
  )
}
