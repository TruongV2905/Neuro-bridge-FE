// src/app/profile/page.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "@/redux/features/userSlice"
import {
    User,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    BadgeCheck,
    Hash,
    Building2,
    BriefcaseBusiness,
    FileText,
    Clock,
} from "lucide-react"

import Header from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import type { RootState } from "@/redux/store"
import type { UserResponse } from "@/types/user/user.type"

import { FormField } from "./_components/form-field"
import { ReadOnlyItem } from "./_components/read-only-item"
import { RoleSection } from "./_components/role-section"

const defaultAvatar = "/thuongnhica.png"

export default function ProfilePage() {
    const reduxUser = useSelector(
        (state: RootState) => state.user
    ) as UserResponse | null

    console.log("reduxUser profile:", reduxUser)

    const dispatch = useDispatch()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [profile, setProfile] = useState<UserResponse | null>(reduxUser)
    const [avatar, setAvatar] = useState(
        reduxUser?.avatarUrl || defaultAvatar
    )

    useEffect(() => {
        setProfile(reduxUser)
        setAvatar(reduxUser?.avatarUrl || defaultAvatar)
    }, [reduxUser])


    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        if (!file) return

        const reader = new FileReader()

        reader.onloadend = () => {
            const imageUrl = reader.result as string
            setAvatar(imageUrl)
        }

        reader.readAsDataURL(file)
    }

    const updateProfile = (field: keyof UserResponse, value: string) => {
        setProfile((prev: UserResponse | null) => {
            if (!prev) return prev

            return {
                ...prev,
                [field]: value,
            }
        })
    }

    const handleCancel = () => {
        setProfile(reduxUser)
        setAvatar(reduxUser?.avatarUrl || defaultAvatar)
    }

    const handleSave = () => {
        console.log("Saved client profile:", profile)
    }

    const handleLogout = () => {
        dispatch(logout())

        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")

        window.location.href = "/login"
    }

    if (!profile) {
        return (
            <main className="min-h-screen bg-background text-foreground">
                <Header />
                <div className="flex min-h-screen items-center justify-center text-sm font-semibold text-destructive">
                    Failed to load profile.
                </div>
            </main>
        )
    }

    const isClient = profile.role === "CLIENT"

    return (
        <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Header />

            <section
                className="
          relative h-[100px] overflow-hidden border-b border-border
          bg-gradient-to-r from-[#5f7bff] via-[#8b5cf6] to-[#ec4899]
        "
            >
                <div className="absolute inset-0 bg-black/10 dark:bg-black/25" />
                <div className="absolute -top-20 right-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
                <div className="absolute -bottom-24 left-10 h-44 w-44 rounded-full bg-pink-300/20 blur-3xl" />
            </section>

            <section className="mx-auto grid max-w-7xl items-start gap-6 px-4 py-8 md:grid-cols-[1.05fr_0.95fr] lg:grid-cols-[1.08fr_0.92fr]">
                <div>
                    <Card
                        style={{
                            backgroundImage:
                                "linear-gradient(var(--card), var(--card)), linear-gradient(to bottom, #5f7bff 0%, #8b5cf6 100%)",
                            backgroundOrigin: "border-box",
                            backgroundClip: "padding-box, border-box",
                        }}
                        className="overflow-hidden rounded-[2.5rem] border-2 border-transparent bg-card shadow-xl"
                    >
                        <CardContent className="flex flex-col items-center p-6">
                            <div className="mb-6 flex w-full flex-col items-center gap-6 sm:flex-row sm:items-start">
                                <div className="group/avatar relative h-44 w-44 shrink-0 cursor-pointer overflow-hidden rounded-[2rem] border border-border bg-muted shadow-lg">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />

                                    <img
                                        src={avatar}
                                        alt={profile.fullName}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover/avatar:scale-105"
                                        onClick={handleAvatarClick}
                                    />

                                    <div
                                        onClick={handleAvatarClick}
                                        className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 text-white opacity-0 transition-opacity duration-300 group-hover/avatar:opacity-100"
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
                                            Change Avatar
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full flex-1 space-y-1 px-1 text-left sm:pt-4">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-black tracking-tight text-card-foreground">
                                            {profile.fullName}
                                        </h2>

                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                                            <BadgeCheck size={14} />
                                        </div>
                                    </div>

                                    <p className="text-sm font-bold text-primary">
                                        @{profile.code}
                                    </p>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <Badge
                                            variant="outline"
                                            className="border-border text-[11px] text-muted-foreground"
                                        >
                                            Core Client
                                        </Badge>

                                        <Badge
                                            variant="outline"
                                            className="border-emerald-500 bg-emerald-500/10 text-[11px] text-emerald-500"
                                        >
                                            Verified Node
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator className="mb-6 bg-border" />

                            <div className="w-full space-y-4">
                                <h3 className="mb-2 px-1 text-sm font-black uppercase tracking-wider text-muted-foreground">
                                    Personal Information
                                </h3>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField
                                        icon={<User size={16} />}
                                        label="Full Name"
                                        value={profile.fullName}
                                        onChange={(value) => updateProfile("fullName", value)}
                                    />

                                    <FormField
                                        icon={<Mail size={16} />}
                                        label="Email Address"
                                        value={profile.email || "" }
                                        onChange={(value) => updateProfile("email", value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField
                                        icon={<Phone size={16} />}
                                        label="Phone Number"
                                        value={profile.phone || ""}
                                        onChange={(value) => updateProfile("phone", value)}
                                    />

                                    <FormField
                                        icon={<MapPin size={16} />}
                                        label="Address"
                                        value={profile.address || ""}
                                        onChange={(value) => updateProfile("address", value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-card shadow-md">
                        <CardHeader className="border-b border-border/60 bg-muted/30 px-6 py-4">
                            <CardTitle className="text-base font-black text-card-foreground">
                                Wallet Information
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Bank account and wallet balance details.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField icon={<Hash size={16} />} label="Wallet ID" value="WAL-0002" />
                                <FormField icon={<Building2 size={16} />} label="Bank Name" value="Vietcombank" />
                                <FormField icon={<FileText size={16} />} label="Account Number" value="0123456789" />
                                <FormField icon={<User size={16} />} label="Account Holder Name" value={profile.fullName} />
                                <FormField icon={<BriefcaseBusiness size={16} />} label="Wallet Balance" value="2,500,000 VND" />
                                <FormField icon={<Clock size={16} />} label="Total Withdrawn" value="500,000 VND" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="z-20 flex justify-end pt-4">
                        <div className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-xl backdrop-blur-xl sm:w-auto">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="h-11 rounded-xl border-border bg-background/60 px-5 text-xs font-bold text-muted-foreground"
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="
    h-11
    rounded-xl
    border-red-500/30
    bg-red-500/10
    px-5
    text-xs
    font-bold
    text-red-500
    hover:bg-red-500/20
  "
                            >
                                Logout
                            </Button>

                            <Button
                                onClick={handleSave}
                                className="
    h-11
    min-w-[150px]
    rounded-xl
    bg-gradient-to-r
    from-[#5f7bff]
    via-[#8b5cf6]
    to-[#ec4899]
    px-6
    text-xs
    font-bold
    text-white
  "
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-md">
                        <CardHeader className="border-b border-border/60 bg-muted/30 px-6 py-4">
                            <CardTitle className="text-base font-black text-card-foreground">
                                Account Information
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Immutable platform verification matrix fields.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 p-6">
                            <ReadOnlyItem icon={<Hash size={17} />} label="User Code" value={profile.code} />
                            <ReadOnlyItem icon={<ShieldCheck size={17} />} label="System Role" value="Client Node" />
                            <ReadOnlyItem icon={<BadgeCheck size={17} />} label="Network Status" value={profile.status} active />
                        </CardContent>
                    </Card>

                    {isClient && (
                        <RoleSection
                            title="Client Information"
                            description="Corporate ledger details and operations parameters for project owners."
                        >
                            <FormField
                                icon={<Building2 size={16} />}
                                label="Company Name"
                                value={profile.companyName || ""}
                                onChange={(value) => updateProfile("companyName", value)}
                            />

                            <FormField
                                icon={<BriefcaseBusiness size={16} />}
                                label="Operating Industry"
                                value={profile.industry || ""}
                                onChange={(value) => updateProfile("industry", value)}
                            />

                            <div className="md:col-span-2">
                                <FormField
                                    icon={<FileText size={16} />}
                                    label="Company Core Description"
                                    value={profile.companyDescription || ""}
                                    onChange={(value) =>
                                        updateProfile("companyDescription", value)
                                    }
                                />
                            </div>
                        </RoleSection>
                    )}
                </div>
            </section>
        </main>
    )
}