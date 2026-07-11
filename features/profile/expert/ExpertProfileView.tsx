"use client"

import { useSelector } from "react-redux"

import type { RootState } from "@/redux/store"
import type { User as UserType, UserResponse } from "@/types/user/user.type"

// import { expertProfile } from "./data/mockExpertProfile"
import { ExpertProfileHeader } from "./components/ExpertProfileHeader"
import { ExpertStatsCard } from "./components/ExpertStatsCard"
import { ExpertPortfolioCard } from "./components/ExpertPortfolioCard"
import { ExpertTestimonialCard } from "./components/ExpertTestimonialCard"
import { ExpertSidebarCard } from "./components/ExpertSidebarCard"
import { ExpertWalletCard } from "./components/ExpertWalletCard"
import { ExpertSkillCard } from "./components/ExpertSkillCard"
import { ExpertCertificateCard } from "./components/ExpertCertificateCard"

import { useGetUserByCode } from "@/services/user.service"
import { useGetSkillsByExpertCode } from "@/services/skill.service"
import { useGetPortfoliosByExpertCode } from "@/services/portfolio.service"
import { useGetCertificatesByExpertCode } from "@/services/certificate.service"

import Header from "@/components/layout/Header"

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
    { enabled: !!expertCode && !isOwnerExpert },
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
    ? currentUser
    : expertUserData?.result ?? null

  const portfolios = portfolioData?.result ?? []
  const skills = skillData?.result ?? []
  const certificates = certificateData?.result ?? []

  return (
    <main className="min-h-screen bg-background px-6 pb-10 pt-32 text-foreground">
      <Header />
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
            />
          ) : (
            <div className="rounded-[2rem] border border-border bg-card p-8 text-sm text-muted-foreground">
              Không tải được thông tin expert.
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
                Chưa có portfolio nào.
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
                Chưa có skill nào.
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
                Chưa có certificate nào.
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
