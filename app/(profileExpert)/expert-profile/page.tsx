import { expertProfile } from "./mock-expert-profile"
import { ExpertProfileHeader } from "./_components/expert-profile-header"
import { ExpertStatsCard } from "./_components/expert-stats-card"
import { ExpertPortfolioCard } from "./_components/expert-portfolio-card"
import { ExpertTestimonialCard } from "./_components/expert-testimonial-card"
import { ExpertSidebarCard } from "./_components/expert-sidebar-card"
import { ExpertWalletCard } from "./_components/expert-wallet-card"

export default function ProfileExpertPage() {
  const currentUser = {
    id: "EXP-001",
    role: "AI_EXPERT",
  }

  const isOwnerExpert =
    currentUser.role === "AI_EXPERT"
  return (
    <main className="min-h-screen bg-background px-6 pb-10 pt-32 text-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-8">
          <ExpertProfileHeader expert={expertProfile} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {expertProfile.stats.map((stat) => (
              <ExpertStatsCard key={stat.label} stat={stat} />
            ))}
          </div>

          <section>
            <h2 className="mb-4 text-base font-semibold text-foreground">
              Featured Portfolio
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {expertProfile.portfolios.map((item) => (
                <ExpertPortfolioCard key={item.title} item={item} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-base font-semibold text-foreground ">
              Verified Testimonials
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {expertProfile.testimonials.map((item) => (
                <ExpertTestimonialCard key={item.name} item={item} />
              ))}
            </div>
          </section>
        </section>

        <div className="space-y-6">
          <ExpertSidebarCard expert={expertProfile} />

          {isOwnerExpert && (
            <ExpertWalletCard wallet={expertProfile.wallet} />
          )}
        </div>
      </div>
    </main>
  )
}