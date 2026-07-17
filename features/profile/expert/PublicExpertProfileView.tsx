"use client"

import { useParams } from "next/navigation"

import { useGetSkillsByExpertCode } from "@/services/skill.service"
import { useGetUserByCode } from "@/services/user.service"
import { useExpertRatingSummary } from "@/services/rating.service"

import { ExpertProfileHeader } from "./components/ExpertProfileHeader"
import { ExpertSidebarCard } from "./components/ExpertSidebarCard"
import { ExpertSkillCard } from "./components/ExpertSkillCard"

export function PublicExpertProfileView() {
  const params = useParams<{ id?: string | string[] }>()
  const expertCode = Array.isArray(params.id) ? params.id[0] : params.id ?? ""

  const {
    data: expertData,
    isLoading: expertLoading,
    isError: expertError,
    error,
    refetch,
  } = useGetUserByCode(
    { code: expertCode },
    { enabled: Boolean(expertCode) },
  )

  const {
    data: skillData,
    isLoading: skillLoading,
    isError: skillError,
  } = useGetSkillsByExpertCode(
    { code: expertCode },
    { enabled: Boolean(expertCode) },
  )

  const expert = expertData?.result ?? null
  const skills = skillData?.result ?? []
  const {
    data: ratingSummary,
    isLoading: ratingSummaryLoading,
  } = useExpertRatingSummary(expert?.id ?? "", {
    enabled: Boolean(expert?.id),
  })

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <section className="space-y-8">
        {expertLoading ? (
          <ProfileState message="Loading expert profile..." />
        ) : !expertCode || expertError || !expert ? (
          <ProfileState
            message={getErrorMessage(error)}
            actionLabel="Retry"
            onAction={() => refetch()}
          />
        ) : (
          <ExpertProfileHeader
            expert={expert}
            skills={skillLoading || skillError ? [] : skills}
            editable={false}
            ratingSummary={ratingSummary}
            ratingLoading={ratingSummaryLoading}
          />
        )}

        <section>
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Skills
          </h2>

          {skillLoading ? (
            <ProfileState message="Loading skills..." compact />
          ) : skillError ? (
            <ProfileState message="Unable to load skills." compact />
          ) : skills.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {skills.map((item) => (
                <ExpertSkillCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <ProfileState message="No skills are available for this expert." compact />
          )}
        </section>
      </section>

      <div>
        {expertLoading ? (
          <ProfileState message="Loading expert summary..." compact />
        ) : expert ? (
          <ExpertSidebarCard expert={expert} />
        ) : null}
      </div>
    </div>
  )
}

function ProfileState({
  message,
  compact = false,
  actionLabel,
  onAction,
}: {
  message: string
  compact?: boolean
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div
      className={
        compact
          ? "rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground"
          : "rounded-[2rem] border border-border bg-card p-8 text-sm text-muted-foreground"
      }
    >
      <p>{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

function getErrorMessage(error: unknown) {
  if (!isRecord(error)) {
    return "Unable to load this expert profile."
  }

  const response = isRecord(error.response) ? error.response : null
  const data = response && isRecord(response.data) ? response.data : null
  const responseMessage =
    data && typeof data.message === "string" ? data.message : null
  const message = typeof error.message === "string" ? error.message : null

  return (
    responseMessage ||
    message ||
    "Unable to load this expert profile."
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
