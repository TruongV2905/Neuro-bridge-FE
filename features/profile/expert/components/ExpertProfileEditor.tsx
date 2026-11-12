"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/redux/features/userSlice"
import { useUpdateExpertProfile } from "@/services/user.service"
import type { SkillResponse } from "@/types/skill.types"
import { UserGender, type UserResponse } from "@/types/user/user.type"

export function ExpertProfileEditor({ user, skills }: { user: UserResponse; skills: SkillResponse[] }) {
  const dispatch = useDispatch()
  const updateMutation = useUpdateExpertProfile()
  const [profile, setProfile] = useState(user)

  const update = (field: keyof UserResponse, value: string) => setProfile((current) => ({ ...current, [field]: value }))

  const save = () => {
    const skillIds = profile.skillIds?.length ? profile.skillIds : skills.map((skill) => skill.id)
    if (!profile.fullName || !profile.gender || !profile.address || !profile.dateOfBirth || !profile.phone || !profile.email || skillIds.length === 0) {
      toast.error("Complete required profile fields and keep at least one skill before saving.")
      return
    }

    updateMutation.mutate({ fullName: profile.fullName, gender: profile.gender, address: profile.address, dateOfBirth: profile.dateOfBirth, avatarUrl: profile.avatarUrl, phone: profile.phone, email: profile.email, skillIds }, {
      onSuccess: (response) => {
        const savedProfile = { ...profile, ...response.result, accessToken: response.result.accessToken ?? profile.accessToken, refreshToken: response.result.refreshToken ?? profile.refreshToken }
        dispatch(login(savedProfile))
        setProfile(savedProfile)
        toast.success("Profile saved.")
      },
      onError: () => toast.error("Unable to save your profile. Please try again."),
    })
  }

  return <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-foreground">Profile details</h2><p className="mt-1 text-sm text-muted-foreground">Changes are saved to your Identity profile. Skills are preserved by this form.</p></div><Button type="button" onClick={save} disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving…" : "Save profile"}</Button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Full name"><Input value={profile.fullName} onChange={(event) => update("fullName", event.target.value)} /></Field><Field label="Email"><Input value={profile.email} readOnly /></Field><Field label="Phone"><Input value={profile.phone || ""} onChange={(event) => update("phone", event.target.value)} /></Field><Field label="Address"><Input value={profile.address || ""} onChange={(event) => update("address", event.target.value)} /></Field><Field label="Date of birth"><Input type="date" value={profile.dateOfBirth || ""} onChange={(event) => update("dateOfBirth", event.target.value)} /></Field><Field label="Gender"><select value={profile.gender || ""} onChange={(event) => update("gender", event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="" disabled>Select gender</option>{Object.values(UserGender).map((gender) => <option key={gender} value={gender}>{gender}</option>)}</select></Field><Field label="Avatar URL"><Input value={profile.avatarUrl || ""} onChange={(event) => update("avatarUrl", event.target.value)} placeholder="https://…" /></Field><Field label="Skills"><Input value={skills.map((skill) => skill.skillName).join(", ") || "No skills assigned"} readOnly /></Field></div></section>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-medium text-foreground"><span>{label}</span>{children}</label>
}
