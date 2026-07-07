// src/app/.../[id]/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import type { UserResponse } from "@/types/user"
import {
  ExpertProfileHeader,
  ExpertSidebarCard,
  ExpertSkillCard,
  expertProfile,
} from "@/features/profile/expert"

import { getUserByCode } from "@/services/user-api"
import {
  getSkillsByExpertCode,
  type SkillApiItem,
} from "@/services/skill-api"

export default function ExpertDetailPage() {
  const params = useParams()
  const expertCode = params.id as string

  const currentUser = useSelector(
    (state: RootState) => state.user
  ) as UserResponse | null

  const [expert, setExpert] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const [skills, setSkills] = useState<SkillApiItem[]>([])
  const [skillLoading, setSkillLoading] = useState(true)

  useEffect(() => {
    async function fetchExpert() {
      try {
        const token =
          currentUser?.accessToken || localStorage.getItem("accessToken")

        const data = await getUserByCode(expertCode, token)
        setExpert(data)
      } catch (error) {
        console.error("Fetch expert detail error:", error)
        setExpert(null)
      } finally {
        setLoading(false)
      }
    }

    fetchExpert()
  }, [expertCode, currentUser?.accessToken])

  useEffect(() => {
    async function fetchExpertSkills() {
      try {
        const token =
          currentUser?.accessToken ||
          localStorage.getItem("accessToken") ||
          process.env.NEXT_PUBLIC_ACCESS_TOKEN

        const data = await getSkillsByExpertCode(expertCode, token)
        setSkills(data)
      } catch (error) {
        console.error("Fetch expert skills error:", error)
        setSkills([])
      } finally {
        setSkillLoading(false)
      }
    }

    fetchExpertSkills()
  }, [expertCode, currentUser?.accessToken])

  return (
    <main className="min-h-screen bg-background px-6 pb-10 pt-32 text-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-8">
          {loading ? (
            <div className="rounded-[2rem] border border-border bg-card p-8 text-sm text-muted-foreground">
              Loading expert profile...
            </div>
          ) : expert ? (
            <ExpertProfileHeader
              expert={expert}
              skills={skillLoading ? [] : skills}
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
        </section>

        <div>
          <ExpertSidebarCard expert={expertProfile} />
        </div>
      </div>
    </main>
  )
}