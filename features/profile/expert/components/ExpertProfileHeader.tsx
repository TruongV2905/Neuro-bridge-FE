"use client"

import { useRef, useState } from "react"
import { BadgeCheck, Camera, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { User, UserResponse } from "@/types/user/user.type"
import type { SkillResponse } from "@/types/skill.types"

type ExpertProfileHeaderProps = {
  expert: User | UserResponse
  skills: SkillResponse[]
  editable?: boolean
}

export function ExpertProfileHeader({
  expert,
  skills,
  editable = false,
}: ExpertProfileHeaderProps) {
  const defaultAvatar = "/images/expert-avatar.png"

  const [avatar, setAvatar] = useState(() => {
    if (typeof window === "undefined" || !editable) {
      return expert.avatarUrl || defaultAvatar
    }

    return (
      localStorage.getItem("expert-avatar") ||
      expert.avatarUrl ||
      defaultAvatar
    )
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const displayedAvatar = editable ? avatar : expert.avatarUrl || defaultAvatar

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onloadend = () => {
      const base64Image = reader.result as string
      setAvatar(base64Image)
      localStorage.setItem("expert-avatar", base64Image)
      window.dispatchEvent(new Event("avatar-updated"))
    }

    reader.readAsDataURL(file)
  }

  const legitScore = expert.status === "ACTIVE" ? 95 : 60
  const rating = 5

  return (
    <div className="group relative rounded-[2rem] bg-border p-[1px] transition-all duration-500 hover:shadow-[0_0_24px_rgba(95,123,255,0.15)]">
      <div
        style={{
          background:
            "linear-gradient(to right, #5f7bff 0%, #3e5ee0 35%, #8b5cf6 65%, #ec4899 100%)",
        }}
        className="absolute inset-0 rounded-[2rem] opacity-0 blur-[1px] transition-opacity duration-500 group-hover:opacity-100"
      />

      <Card className="relative z-10 rounded-[calc(2rem-1px)] border-border bg-card shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="group/avatar relative h-36 w-36 shrink-0 cursor-pointer">
              {editable && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              )}

              <img
                src={displayedAvatar}
                alt={expert.fullName}
                onClick={editable ? handleAvatarClick : undefined}
                className="h-full w-full rounded-full border-4 border-primary object-cover shadow-lg transition-transform duration-300 group-hover/avatar:scale-105"
              />

              <div
                onClick={editable ? handleAvatarClick : undefined}
                className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity duration-300 ${editable ? "group-hover/avatar:opacity-100" : ""
                  }`}
              >
                <Camera size={26} className="text-white" />
              </div>

              <div className="absolute bottom-1 right-1 rounded-full bg-primary p-2 text-primary-foreground">
                <BadgeCheck size={18} />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <h1 className="text-4xl font-bold text-foreground">
                    {expert.fullName}
                  </h1>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {expert.role === "EXPERT"
                      ? "AI Expert"
                      : expert.role}
                    {expert.address ? ` • ${expert.address}` : ""}
                  </p>
                </div>

                <Badge className="h-fit gap-2 border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.12)] dark:text-emerald-400">
                  <Star
                    size={16}
                    className="fill-cyan-400 text-cyan-400"
                  />
                  {rating} / 5 Rating
                </Badge>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  <span>Legit Score™</span>
                  <span className="text-primary">{legitScore}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${legitScore}%` }}
                  />
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
                {expert.email}
                {expert.phone ? ` • ${expert.phone}` : ""}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill.id} variant="outline">
                    {skill.skillName}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
