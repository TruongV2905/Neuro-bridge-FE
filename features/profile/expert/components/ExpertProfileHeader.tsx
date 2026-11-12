"use client"

import { BadgeCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { SkillResponse } from "@/types/skill.types"
import type { User, UserResponse } from "@/types/user/user.type"

type ExpertProfileHeaderProps = {
  expert: User | UserResponse
  skills: SkillResponse[]
  showContact?: boolean
}

export function ExpertProfileHeader({ expert, skills, showContact = false }: ExpertProfileHeaderProps) {
  const fallbackAvatar = "/images/expert-avatar.png"

  return (
    <div className="group relative rounded-[2rem] bg-border p-[1px] transition-all duration-500 hover:shadow-[0_0_24px_rgba(95,123,255,0.15)]">
      <div style={{ background: "linear-gradient(to right, #5f7bff 0%, #3e5ee0 35%, #8b5cf6 65%, #ec4899 100%)" }} className="absolute inset-0 rounded-[2rem] opacity-0 blur-[1px] transition-opacity duration-500 group-hover:opacity-100" />
      <Card className="relative z-10 rounded-[calc(2rem-1px)] border-border bg-card shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col gap-6 md:flex-row">
            <img src={expert.avatarUrl || fallbackAvatar} alt={expert.fullName} className="h-36 w-36 shrink-0 rounded-full border-4 border-primary object-cover shadow-lg" />
            <div className="flex-1">
              <div className="flex items-start gap-2"><h1 className="text-4xl font-bold text-foreground">{expert.fullName}</h1><span className="mt-2 rounded-full bg-primary p-1 text-primary-foreground"><BadgeCheck size={16} /></span></div>
              <p className="mt-1 text-sm text-muted-foreground">{expert.role === "EXPERT" ? "AI Expert" : expert.role}</p>
              {showContact ? <p className="mt-4 text-sm leading-7 text-muted-foreground">{expert.email}{expert.phone ? ` • ${expert.phone}` : ""}{expert.address ? ` • ${expert.address}` : ""}</p> : null}
              <div className="mt-5 flex flex-wrap gap-2">{skills.map((skill) => <Badge key={skill.id} variant="outline">{skill.skillName}</Badge>)}{skills.length === 0 ? <span className="text-sm text-muted-foreground">No skills listed yet.</span> : null}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
