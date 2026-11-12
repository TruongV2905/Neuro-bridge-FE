"use client"

import { useParams } from "next/navigation"

import { ProductRatingSummary } from "@/features/ai-place/components/ProductRatingSummary"
import { formatVnd } from "@/features/ai-place/expert/utils/presentation"
import { useMarketplaceProducts } from "@/services/ai-available-product.service"
import { useGetCertificatesByExpertCode } from "@/services/certificate.service"
import { useGetPortfoliosByExpertCode } from "@/services/portfolio.service"
import { useGetSkillsByExpertCode } from "@/services/skill.service"
import { useGetUserByCode } from "@/services/user.service"

import { ExpertCertificateCard } from "./components/ExpertCertificateCard"
import { ExpertPortfolioCard } from "./components/ExpertPortfolioCard"
import { ExpertProfileHeader } from "./components/ExpertProfileHeader"
import { ExpertSkillCard } from "./components/ExpertSkillCard"

export function PublicExpertProfileView() {
  const params = useParams<{ id?: string | string[] }>()
  const expertCode = Array.isArray(params.id) ? params.id[0] : params.id ?? ""
  const enabled = Boolean(expertCode)
  const expertQuery = useGetUserByCode({ code: expertCode }, { enabled })
  const skillsQuery = useGetSkillsByExpertCode({ code: expertCode }, { enabled })
  const portfoliosQuery = useGetPortfoliosByExpertCode({ code: expertCode }, { enabled })
  const certificatesQuery = useGetCertificatesByExpertCode({ code: expertCode }, { enabled })
  const productsQuery = useMarketplaceProducts(
    { page: 0, size: 6, sellerExpertCode: expertCode },
    { enabled },
  )

  const expert = expertQuery.data?.result ?? null
  const skills = skillsQuery.data?.result ?? []
  const portfolios = portfoliosQuery.data?.result ?? []
  const certificates = certificatesQuery.data?.result ?? []
  const products = productsQuery.data?.result.data ?? []

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {expertQuery.isLoading ? <ProfileState message="Loading expert profile..." /> : null}
      {!expertQuery.isLoading && (!enabled || expertQuery.isError || !expert) ? <ProfileState message="Unable to load this expert profile." /> : null}
      {expert ? <ExpertProfileHeader expert={expert} skills={skillsQuery.isError ? [] : skills} /> : null}

      <ProfileSection title="Published AI Products">
        {productsQuery.isLoading ? <ProfileState message="Loading published AI products..." compact /> : null}
        {productsQuery.isError ? <ProfileState message="Published AI products are unavailable." compact /> : null}
        {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 ? <ProfileState message="No published AI products yet." compact /> : null}
        {products.length > 0 ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <article key={product.id} className="rounded-2xl border border-border bg-card p-5"><p className="line-clamp-2 font-semibold text-foreground">{product.name}</p><p className="mt-2 text-sm font-medium text-primary">{formatVnd(product.priceVnd)}</p><ProductRatingSummary averageScore={product.averageScore} ratingCount={product.ratingCount} className="mt-3" /></article>)}</div> : null}
      </ProfileSection>

      <ProfileSection title="Portfolio">
        {portfoliosQuery.isLoading ? <ProfileState message="Loading portfolio..." compact /> : null}
        {portfoliosQuery.isError ? <ProfileState message="Portfolio is unavailable." compact /> : null}
        {!portfoliosQuery.isLoading && !portfoliosQuery.isError && portfolios.length === 0 ? <ProfileState message="No portfolio items are available for this expert." compact /> : null}
        {portfolios.length > 0 ? <div className="grid grid-cols-1 gap-6 md:grid-cols-3">{portfolios.map((item) => <ExpertPortfolioCard key={item.id} item={item} />)}</div> : null}
      </ProfileSection>

      <ProfileSection title="Skills">
        {skillsQuery.isLoading ? <ProfileState message="Loading skills..." compact /> : null}
        {skillsQuery.isError ? <ProfileState message="Skills are unavailable." compact /> : null}
        {!skillsQuery.isLoading && !skillsQuery.isError && skills.length === 0 ? <ProfileState message="No skills are available for this expert." compact /> : null}
        {skills.length > 0 ? <div className="grid grid-cols-1 gap-6 md:grid-cols-3">{skills.map((item) => <ExpertSkillCard key={item.id} item={item} />)}</div> : null}
      </ProfileSection>

      <ProfileSection title="Certificates">
        {certificatesQuery.isLoading ? <ProfileState message="Loading certificates..." compact /> : null}
        {certificatesQuery.isError ? <ProfileState message="Certificates are unavailable for this viewer." compact /> : null}
        {!certificatesQuery.isLoading && !certificatesQuery.isError && certificates.length === 0 ? <ProfileState message="No certificates are available for this expert." compact /> : null}
        {certificates.length > 0 ? <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{certificates.map((item) => <ExpertCertificateCard key={item.id} item={item} />)}</div> : null}
      </ProfileSection>
    </div>
  )
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="mb-4 text-base font-semibold text-foreground">{title}</h2>{children}</section>
}

function ProfileState({ message, compact = false }: { message: string; compact?: boolean }) {
  return <div className={compact ? "rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground" : "rounded-[2rem] border border-border bg-card p-8 text-sm text-muted-foreground"}>{message}</div>
}
