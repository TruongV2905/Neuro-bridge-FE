"use client"
import { BadgeCheck, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import { Camera } from "lucide-react"

type Expert = typeof import("../mock-expert-profile").expertProfile

export function ExpertProfileHeader({ expert }: { expert: Expert }) {
  const [avatar, setAvatar] = useState(expert.avatar)
  const fileInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
  const savedAvatar = localStorage.getItem("expert-avatar")

  if (savedAvatar) {
    setAvatar(savedAvatar)
  }
}, [])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()

  reader.onloadend = () => {
    const base64Image = reader.result as string
    setAvatar(base64Image)
    localStorage.setItem("expert-avatar", base64Image)
  }

  reader.readAsDataURL(file)
}
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <img
                src={avatar}
                alt={expert.name}
                onClick={handleAvatarClick}
                className="
      h-full
      w-full
      rounded-full
      border-4
      border-primary
      object-cover
      shadow-lg
      transition-transform
      duration-300
      group-hover/avatar:scale-105
    "
              />

              <div
                onClick={handleAvatarClick}
                className="
      absolute
      inset-0
      flex
      items-center
      justify-center
      rounded-full
      bg-black/60
      opacity-0
      transition-opacity
      duration-300
      group-hover/avatar:opacity-100
    "
              >
                <Camera size={26} className="text-white" />


                <div className="absolute bottom-1 right-1 rounded-full bg-primary p-2 text-primary-foreground">
                  <BadgeCheck size={18} />
                </div>
              </div>

              <div className="absolute bottom-1 right-1 rounded-full bg-primary p-2 text-primary-foreground">
                <BadgeCheck size={18} />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <h1 className="text-4xl font-bold text-foreground">
                    {expert.name}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {expert.title}
                  </p>
                </div>

                <Badge
                  className="
    h-fit
    gap-2
    px-4
    py-2
    border
    border-emerald-500/30
    bg-emerald-500/10
    text-emerald-600
    dark:text-emerald-400
    shadow-[0_0_15px_rgba(16,185,129,0.12)]
  "
                >
                  <Star
                    size={16}
                    className="fill-cyan-400 text-cyan-400"
                  />

                  {expert.rating} / 5 Rating
                </Badge>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  <span>Legit Score™</span>
                  <span className="text-primary">{expert.legitScore}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${expert.legitScore}%` }}
                  />
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
                {expert.bio}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {expert.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div >
  )
}