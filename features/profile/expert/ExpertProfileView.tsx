"use client"

import { useSelector } from "react-redux"

import Header from "@/components/layout/Header"
import { ProductRatingSummary } from "@/features/ai-place/components/ProductRatingSummary"
import { formatVnd } from "@/features/ai-place/expert/utils/presentation"
import { useMarketplaceProducts } from "@/services/ai-available-product.service"
import { useGetCertificatesByExpertCode } from "@/services/certificate.service"
import { useGetPortfoliosByExpertCode } from "@/services/portfolio.service"
import { useGetSkillsByExpertCode } from "@/services/skill.service"
import type { RootState } from "@/redux/store"
import type { UserResponse } from "@/types/user/user.type"

import { ExpertCertificateCard } from "./components/ExpertCertificateCard"
import { ExpertPortfolioCard } from "./components/ExpertPortfolioCard"
import { ExpertProfileEditor } from "./components/ExpertProfileEditor"
import { ExpertProfileHeader } from "./components/ExpertProfileHeader"
import { ExpertSkillCard } from "./components/ExpertSkillCard"

export function ExpertProfileView() {
  const currentUser = useSelector((state: RootState) => state.user) as UserResponse | null
  const expertCode = currentUser?.role === "EXPERT" ? currentUser.code : ""
  const isExpert = Boolean(expertCode)

  const portfoliosQuery = useGetPortfoliosByExpertCode(
    { code: expertCode },
    { enabled: isExpert },
  )
  const skillsQuery = useGetSkillsByExpertCode(
    { code: expertCode },
    { enabled: isExpert },
  )
  const certificatesQuery = useGetCertificatesByExpertCode(
    { code: expertCode },
    { enabled: isExpert },
  )
  const productsQuery = useMarketplaceProducts({
    page: 0,
    size: 6,
    sellerExpertCode: expertCode,
  }, { enabled: isExpert })

  if (!currentUser || !isExpert) {
    return (
      <main className="min-h-screen bg-background px-6 pb-10 pt-32 text-foreground">
        <Header />
        <ProfileState message="This profile is available only to the signed-in expert." />
      </main>
    )
  }

  const portfolios = portfoliosQuery.data?.result ?? []
  const skills = skillsQuery.data?.result ?? []
  const certificates = certificatesQuery.data?.result ?? []
  const products = productsQuery.data?.result.data ?? []

  return (
    <main className="min-h-screen bg-background px-6 pb-10 pt-32 text-foreground">
      <Header />
      <div className="mx-auto max-w-7xl space-y-8">
        <ExpertProfileHeader expert={currentUser} skills={skills} showContact />
        <ExpertProfileEditor key={getExpertProfileKey(currentUser)} user={currentUser} skills={skills} />

        <ProfileSection title="Published AI Products">
          {productsQuery.isLoading ? <ProfileState message="Loading published AI products..." compact /> : null}
          {productsQuery.isError ? <ProfileState message="Unable to load published AI products." compact /> : null}
          {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 ? <ProfileState message="No published AI products yet." compact /> : null}
          {products.length > 0 ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <article key={product.id} className="rounded-2xl border border-border bg-card p-5"><p className="line-clamp-2 font-semibold text-foreground">{product.name}</p><p className="mt-2 text-sm font-medium text-primary">{formatVnd(product.priceVnd)}</p><ProductRatingSummary averageScore={product.averageScore} ratingCount={product.ratingCount} className="mt-3" /></article>)}</div> : null}
        </ProfileSection>

        <ProfileSection title="Featured Portfolio">
          {portfoliosQuery.isLoading ? <ProfileState message="Loading portfolio..." compact /> : null}
          {!portfoliosQuery.isLoading && portfolios.length === 0 ? <ProfileState message="No portfolio items yet." compact /> : null}
          {portfolios.length > 0 ? <div className="grid grid-cols-1 gap-6 md:grid-cols-3">{portfolios.map((item) => <ExpertPortfolioCard key={item.id} item={item} />)}</div> : null}
        </ProfileSection>

        <ProfileSection title="Skills">
          {skillsQuery.isLoading ? <ProfileState message="Loading skills..." compact /> : null}
          {!skillsQuery.isLoading && skills.length === 0 ? <ProfileState message="No skills assigned yet." compact /> : null}
          {skills.length > 0 ? <div className="grid grid-cols-1 gap-6 md:grid-cols-3">{skills.map((item) => <ExpertSkillCard key={item.id} item={item} />)}</div> : null}
        </ProfileSection>

        <ProfileSection title="Certificates">
          {certificatesQuery.isLoading ? <ProfileState message="Loading certificates..." compact /> : null}
          {certificatesQuery.isError ? <ProfileState message="Certificates are not available for this account." compact /> : null}
          {!certificatesQuery.isLoading && !certificatesQuery.isError && certificates.length === 0 ? <ProfileState message="No certificates yet." compact /> : null}
          {certificates.length > 0 ? <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{certificates.map((item) => <ExpertCertificateCard key={item.id} item={item} />)}</div> : null}
        </ProfileSection>
      </div>
    </main>
  )
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="mb-4 text-base font-semibold text-foreground">{title}</h2>{children}</section>
}

function getExpertProfileKey(user: UserResponse) {
  return [user.code, user.fullName, user.email, user.phone, user.address, user.gender, user.dateOfBirth, user.avatarUrl, user.skillIds?.join(",")].join("|")
}

function ProfileState({ message, compact = false }: { message: string; compact?: boolean }) {
  return <div className={compact ? "rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground" : "rounded-[2rem] border border-border bg-card p-8 text-sm text-muted-foreground"}>{message}</div>
}
