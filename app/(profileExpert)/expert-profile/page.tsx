"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

import { RootState } from "@/redux/store"
import { UserResponse } from "@/types/user"

import { expertProfile } from "./mock-expert-profile"
import { ExpertProfileHeader } from "./_components/expert-profile-header"
import { ExpertStatsCard } from "./_components/expert-stats-card"
import { ExpertPortfolioCard } from "./_components/expert-portfolio-card"
import { ExpertTestimonialCard } from "./_components/expert-testimonial-card"
import { ExpertSidebarCard } from "./_components/expert-sidebar-card"
import { ExpertWalletCard } from "./_components/expert-wallet-card"
import { ExpertSkillCard } from "./_components/expert-skill-card"
import { ExpertCertificateCard } from "./_components/expert-certificate-card"
import { getUserByCode } from "@/services/user-api"

import {
  getCertificates,
  CertificateApiItem,
} from "@/services/certificate-api"
import {
  getPortfoliosByExpertCode,
  PortfolioApiItem,
} from "@/services/portfolio-api"
import { getSkills, SkillApiItem } from "@/services/skill-api"
import Header from "@/components/layout/Header"

export default function ProfileExpertPage() {
  const [expertUser, setExpertUser] = useState<UserResponse | null>(null)
  const [expertUserLoading, setExpertUserLoading] = useState(true)
  const [portfolios, setPortfolios] = useState<PortfolioApiItem[]>([])
  const [portfolioLoading, setPortfolioLoading] = useState(true)

  const [skills, setSkills] = useState<SkillApiItem[]>([])
  const [skillLoading, setSkillLoading] = useState(true)

  const [certificates, setCertificates] = useState<CertificateApiItem[]>([])
  const [certificateLoading, setCertificateLoading] = useState(true)

  const currentUser = useSelector(
    (state: RootState) => state.user
  ) as UserResponse | null

  const expertCode =
    currentUser?.code ?? "EXP-TAAIEE8J88"

  const token =
    currentUser?.accessToken ||
    localStorage.getItem("accessToken")

  const isOwnerExpert = currentUser?.role === "EXPERT"

  useEffect(() => {
    async function fetchExpertUser() {
      try {
        if (currentUser?.role === "EXPERT") {
          setExpertUser(currentUser)
          return
        }

        const data = await getUserByCode(expertCode, token)
        setExpertUser(data)
      } catch (error) {
        console.error("Fetch expert user error:", error)
      } finally {
        setExpertUserLoading(false)
      }
    }

    fetchExpertUser()
  }, [currentUser, expertCode, token])

  useEffect(() => {
    async function fetchPortfolios() {
      if (!expertCode) {
        setPortfolioLoading(false)
        return
      }

      try {
        const data = await getPortfoliosByExpertCode(expertCode, token)
        setPortfolios(data)
      } catch (error) {
        console.error("Fetch portfolios error:", error)
      } finally {
        setPortfolioLoading(false)
      }
    }

    fetchPortfolios()
  }, [expertCode, token])

  useEffect(() => {
    async function fetchSkills() {
      try {
        const data = await getSkills(token)
        setSkills(data)
      } catch (error) {
        console.error("Fetch skills error:", error)
      } finally {
        setSkillLoading(false)
      }
    }

    fetchSkills()
  }, [token])

  useEffect(() => {
    async function fetchCertificates() {
      try {
        const data = await getCertificates(token)
        setCertificates(data)
      } catch (error) {
        console.error("Fetch certificates error:", error)
      } finally {
        setCertificateLoading(false)
      }
    }

    fetchCertificates()
  }, [token])

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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {expertProfile.stats.map((stat) => (
              <ExpertStatsCard
                key={stat.label}
                stat={{
                  ...stat,
                  icon: stat.icon as "rocket" | "award" | "zap",
                }}
              />
            ))}
          </div>

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

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {expertProfile.testimonials.map((item) => (
                <ExpertTestimonialCard key={item.name} item={item} />
              ))}
            </div>
          </section>
        </section>

        <div className="space-y-6">
          <ExpertSidebarCard expert={expertProfile} />

          {isOwnerExpert && <ExpertWalletCard wallet={expertProfile.wallet} />}
        </div>
      </div>
    </main>
  )
}