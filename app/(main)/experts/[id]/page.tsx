"use client"

import { useParams } from "next/navigation"

import { ExpertSkillCard } from "@/app/(profileExpert)/expert-profile/_components/expert-skill-card"
import { ExpertProfileHeader } from "@/app/(profileExpert)/expert-profile/_components/expert-profile-header"
import { ExpertSidebarCard } from "@/app/(profileExpert)/expert-profile/_components/expert-sidebar-card"
import { expertProfile } from "@/app/(profileExpert)/expert-profile/mock-expert-profile"

import { useGetUserByCode } from "@/services/user.service"
import { useGetSkillsByExpertCode } from "@/services/skill.service"

export default function ExpertDetailPage() {
  const params = useParams()
  const expertCode = params.id as string

  const {
    data: expertData,
    isLoading: expertLoading,
  } = useGetUserByCode({ code: expertCode })

  const {
    data: skillsData,
    isLoading: skillsLoading,
  } = useGetSkillsByExpertCode({ code: expertCode })

  const expert = expertData?.result ?? null
  const skills = skillsData?.result ?? []

  return (
    <main className="min-h-screen bg-background px-6 pb-10 pt-32 text-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-8">
          {expertLoading ? (
            <div className="rounded-[2rem] border border-border bg-card p-8 text-sm text-muted-foreground">
              Loading expert profile...
            </div>
          ) : expert ? (
            <ExpertProfileHeader
              expert={expert}
              skills={skillsLoading ? [] : skills}
              editable={false}
            />
          ) : (
            <div className="rounded-[2rem] border border-border bg-card p-8 text-sm text-muted-foreground">
              Không tải được expert.
            </div>
          )}

          <section>
            <h2 className="mb-4 text-base font-semibold text-foreground">
              Skills
            </h2>

            {skillsLoading ? (
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
        </section>

        <div>
          <ExpertSidebarCard expert={expertProfile} />
        </div>
      </div>
    </main>
  )
}
