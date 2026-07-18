"use client"

import { useSelector } from "react-redux"

import type { RootState } from "@/redux/store"
import type { User as UserType, UserResponse } from "@/types/user/user.type"

// import { expertProfile } from "./data/mockExpertProfile"
import { ExpertProfileHeader } from "./components/ExpertProfileHeader"
import { ExpertPortfolioCard } from "./components/ExpertPortfolioCard"
import { ExpertSkillCard } from "./components/ExpertSkillCard"
import { ExpertCertificateCard } from "./components/ExpertCertificateCard"

import { useGetUserByCode } from "@/services/user.service"
import { useGetSkillsByExpertCode } from "@/services/skill.service"
import { useGetPortfoliosByExpertCode } from "@/services/portfolio.service"
import { useGetCertificatesByExpertCode } from "@/services/certificate.service"
import { useExpertRatingSummary } from "@/services/rating.service"

export function ExpertProfileView() {
  const currentUser = useSelector(
    (state: RootState) => state.user
  ) as UserResponse | null

  const isOwnerExpert = currentUser?.role === "EXPERT"

  const expertCode = isOwnerExpert
    ? currentUser?.code
    : "EXP-TAAIEE8J88"

  const {
    data: expertUserData,
    isLoading: expertUserLoading,
  } = useGetUserByCode(
    { code: expertCode },
    { enabled: !!expertCode },
  )

  const {
    data: portfolioData,
    isLoading: portfolioLoading,
  } = useGetPortfoliosByExpertCode(
    { code: expertCode },
    { enabled: !!expertCode },
  )

  const {
    data: skillData,
    isLoading: skillLoading,
  } = useGetSkillsByExpertCode(
    { code: expertCode },
    { enabled: !!expertCode },
  )

  const {
    data: certificateData,
    isLoading: certificateLoading,
  } = useGetCertificatesByExpertCode(
    { code: expertCode },
    { enabled: !!expertCode },
  )

  const expertUser: UserType | UserResponse | null = isOwnerExpert
    ? expertUserData?.result ?? currentUser
    : expertUserData?.result ?? null
  const expertId = getExpertId(expertUser)
  const {
    data: ratingSummary,
    isLoading: ratingSummaryLoading,
  } = useExpertRatingSummary(expertId, {
    enabled: Boolean(expertId),
  })

  const portfolios = portfolioData?.result ?? []
  const skills = skillData?.result ?? []
  const certificates = certificateData?.result ?? []

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-8">
          {expertUserLoading ? (
            <div className="rounded-[2rem] border border-border bg-card p-8 text-sm text-muted-foreground">
              Loading expert profile...
            </div>
          ) : expertUser ? (
            <ExpertProfileHeader
              expert={expertUser}
              skills={skills}
              editable
              ratingSummary={ratingSummary}
              ratingLoading={ratingSummaryLoading}
            />
          ) : (
            <div className="rounded-[2rem] border border-border bg-card p-8 text-sm text-muted-foreground">
              Unable to load the expert profile.
            </div>
          )}

          {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {expertProfile.stats.map((stat) => (
              <ExpertStatsCard
                key={stat.label}
                stat={{
                  ...stat,
                  icon: stat.icon as "rocket" | "award" | "zap",
                }}
              />
            ))}
          </div> */}

          <section>
            <h2 className="mb-4 text-base font-semibold text-foreground">
              Featured Portfolio
            </h2>

            {portfolioLoading ? (
              <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                Loading portfolio...
              </div>
            ) : portfolios.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {portfolios.map((item) => (
                  <ExpertPortfolioCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                No portfolio items yet.
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-base font-semibold text-foreground">
              Skills
            </h2>

            {skillLoading ? (
              <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                Loading skills...
              </div>
            ) : skills.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {skills.map((item) => (
                  <ExpertSkillCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                No skills added yet.
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-base font-semibold text-foreground">
              Certificates
            </h2>

            {certificateLoading ? (
              <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                Loading certificates...
              </div>
            ) : certificates.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {certificates.map((item) => (
                  <ExpertCertificateCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                No certificates added yet.
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-base font-semibold text-foreground">
              Verified Testimonials
            </h2>

            {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {expertProfile.testimonials.map((item) => (
                <ExpertTestimonialCard key={item.name} item={item} />
              ))}
            </div> */}
          </section>
        </section>

        {/* <div className="space-y-6">
          <ExpertSidebarCard expert={expertProfile} />

          {isOwnerExpert && <ExpertWalletCard wallet={expertProfile.wallet} />}
        </div> */}
      </div>
    </main>
  )
}

function getExpertId(expert?: UserType | UserResponse | null) {
  if (!expert || !("id" in expert)) return ""

  return expert.id
}
