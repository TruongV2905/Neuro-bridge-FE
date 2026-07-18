// src/app/client/dashboard/profile/page.tsx
"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import { login, logout } from "@/redux/features/userSlice"
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
    Loader2,
} from "lucide-react"

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
import { UserGender, type ClientProfileUpdateRequest, type UserResponse } from "@/types/user/user.type"
import { formatMoney } from "@/utils/formatMoney"
import { useUpdateClientProfile } from "@/services/user.service"

import { ClientProfileFormField } from "./components/ClientProfileFormField"
import { ClientReadOnlyItem } from "./components/ClientReadOnlyItem"
import { ClientRoleSection } from "./components/ClientRoleSection"

const defaultAvatar = "/thuongnhica.png"

export function ClientProfileView() {
    const reduxUser = useSelector(
        (state: RootState) => state.user
    ) as UserResponse | null

    return (
        <ClientProfileEditor
            key={getClientProfileKey(reduxUser)}
            reduxUser={reduxUser}
        />
    )
}

function getClientProfileKey(reduxUser: UserResponse | null) {
    if (!reduxUser) return "anonymous-client-profile"

    return [
        reduxUser.code,
        reduxUser.email,
        reduxUser.avatarUrl,
        reduxUser.fullName,
        reduxUser.gender,
        reduxUser.status,
        reduxUser.address,
        reduxUser.dateOfBirth,
        reduxUser.role,
        reduxUser.phone,
        reduxUser.createdAt,
        reduxUser.companyName,
        reduxUser.industry,
        reduxUser.companyDescription,
        reduxUser.skillIds?.join(","),
    ].join("|")
}

function ClientProfileEditor({
    reduxUser,
}: {
    reduxUser: UserResponse | null
}) {
    const dispatch = useDispatch()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const updateClientProfileMutation = useUpdateClientProfile()

    const [profile, setProfile] = useState<UserResponse | null>(reduxUser)
    const [avatar, setAvatar] = useState(
        reduxUser?.avatarUrl || defaultAvatar
    )

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

    const updateProfile = (
        field: keyof UserResponse,
        value: UserResponse[keyof UserResponse],
    ) => {
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

    const handleSave = async () => {
        if (!profile) return

        const profileRequest = buildClientProfileUpdateRequest(profile, avatar)

        if (!profileRequest.request) {
            toast.error(profileRequest.error)
            return
        }

        try {
            const response = await updateClientProfileMutation.mutateAsync({
                data: profileRequest.request,
            })
            const responseProfile = response.result

            const updatedUser: UserResponse = {
                ...profile,
                ...responseProfile,
                fullName: profileRequest.request.fullName,
                gender: profileRequest.request.gender,
                address: profileRequest.request.address,
                dateOfBirth: profileRequest.request.dateOfBirth,
                avatarUrl: profileRequest.request.avatarUrl ?? null,
                phone: profileRequest.request.phone,
                email: profileRequest.request.email,
                companyName: profileRequest.request.companyName,
                industry: profileRequest.request.industry,
                companyDescription: profileRequest.request.companyDescription,
                accessToken: profile.accessToken,
                refreshToken: profile.refreshToken,
            }

            dispatch(login(updatedUser))
            setProfile(updatedUser)
            setAvatar(updatedUser.avatarUrl || defaultAvatar)
            toast.success("Profile updated successfully.")
        } catch (error) {
            toast.error(getProfileApiErrorMessage(error))
        }
    }

    const handleLogout = () => {
        dispatch(logout())

        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")

        window.location.href = "/login"
    }

    if (!profile) {
        return (
            <main className="min-h-[calc(100dvh-4rem)] bg-background text-foreground">
                <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center text-sm font-semibold text-destructive">
                    Failed to load profile.
                </div>
            </main>
        )
    }

    const isClient = profile.role === "CLIENT"
    const isSaving = updateClientProfileMutation.isPending

    return (
        <main className="min-h-[calc(100dvh-4rem)] bg-background text-foreground transition-colors duration-300">
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

                                    <Image
                                        src={avatar}
                                        alt={profile.fullName}
                                        fill
                                        sizes="176px"
                                        unoptimized
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
                                    <ClientProfileFormField
                                        icon={<User size={16} />}
                                        label="Full Name"
                                        value={profile.fullName}
                                        onChange={(value) => updateProfile("fullName", value)}
                                    />

                                    <ClientProfileFormField
                                        icon={<Mail size={16} />}
                                        label="Email Address"
                                        value={profile.email || "No email"}
                                        onChange={(value) => updateProfile("email", value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <ClientProfileFormField
                                        icon={<BadgeCheck size={16} />}
                                        label="Gender"
                                        value={profile.gender || ""}
                                        onChange={(value) =>
                                            updateProfile("gender", normalizeUserGender(value))
                                        }
                                    />

                                    <ClientProfileFormField
                                        icon={<Clock size={16} />}
                                        label="Date of Birth"
                                        value={profile.dateOfBirth || ""}
                                        onChange={(value) => updateProfile("dateOfBirth", value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <ClientProfileFormField
                                        icon={<Phone size={16} />}
                                        label="Phone Number"
                                        value={profile.phone || "No phone"}
                                        onChange={(value) => updateProfile("phone", value)}
                                    />

                                    <ClientProfileFormField
                                        icon={<MapPin size={16} />}
                                        label="Address"
                                        value={profile.address || "No address"}
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
                                <ClientProfileFormField icon={<Hash size={16} />} label="Wallet ID" value="WAL-0002" />
                                <ClientProfileFormField icon={<Building2 size={16} />} label="Bank Name" value="Vietcombank" />
                                <ClientProfileFormField icon={<FileText size={16} />} label="Account Number" value="0123456789" />
                                <ClientProfileFormField icon={<User size={16} />} label="Account Holder Name" value={profile.fullName} />
                                <ClientProfileFormField icon={<BriefcaseBusiness size={16} />} label="Wallet Balance" value={formatMoney(2500000)} />
                                <ClientProfileFormField icon={<Clock size={16} />} label="Total Withdrawn" value={formatMoney(500000)} />
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
                                disabled={isSaving}
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
    disabled:cursor-not-allowed
    disabled:opacity-70
  "
                            >
                                {isSaving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
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
                            <ClientReadOnlyItem icon={<Hash size={17} />} label="User Code" value={profile.code} />
                            <ClientReadOnlyItem icon={<ShieldCheck size={17} />} label="System Role" value="Client Node" />
                            <ClientReadOnlyItem icon={<BadgeCheck size={17} />} label="Network Status" value={profile.status} active />
                        </CardContent>
                    </Card>

                    {isClient && (
                        <ClientRoleSection
                            title="Client Information"
                            description="Corporate ledger details and operations parameters for project owners."
                        >
                            <ClientProfileFormField
                                icon={<Building2 size={16} />}
                                label="Company Name"
                                value={profile.companyName || ""}
                                onChange={(value) => updateProfile("companyName", value)}
                            />

                            <ClientProfileFormField
                                icon={<BriefcaseBusiness size={16} />}
                                label="Operating Industry"
                                value={profile.industry || ""}
                                onChange={(value) => updateProfile("industry", value)}
                            />

                            <div className="md:col-span-2">
                                <ClientProfileFormField
                                    icon={<FileText size={16} />}
                                    label="Company Core Description"
                                    value={profile.companyDescription || ""}
                                    onChange={(value) =>
                                        updateProfile("companyDescription", value)
                                    }
                                />
                            </div>
                        </ClientRoleSection>
                    )}
                </div>
            </section>
        </main>
    )
}

function buildClientProfileUpdateRequest(
    profile: UserResponse,
    avatar: string,
): { request?: ClientProfileUpdateRequest; error?: string } {
    const request: ClientProfileUpdateRequest = {
        fullName: profile.fullName?.trim() ?? "",
        gender: profile.gender ?? UserGender.OTHER,
        address: profile.address?.trim() ?? "",
        dateOfBirth: profile.dateOfBirth?.trim() ?? "",
        avatarUrl: avatar || profile.avatarUrl || null,
        phone: profile.phone?.trim() ?? "",
        email: profile.email?.trim() ?? "",
        companyName: profile.companyName?.trim() ?? "",
        industry: profile.industry?.trim() ?? "",
        companyDescription: profile.companyDescription?.trim() ?? "",
    }

    const missingField = getMissingClientProfileField(request)

    if (missingField) {
        return {
            error: `${missingField} is required before saving your profile.`,
        }
    }

    return { request }
}

function getMissingClientProfileField(request: ClientProfileUpdateRequest) {
    const requiredFields: Array<[keyof ClientProfileUpdateRequest, string]> = [
        ["fullName", "Full name"],
        ["gender", "Gender"],
        ["address", "Address"],
        ["dateOfBirth", "Date of birth"],
        ["phone", "Phone number"],
        ["email", "Email address"],
        ["companyName", "Company name"],
        ["industry", "Operating industry"],
        ["companyDescription", "Company description"],
    ]

    const missing = requiredFields.find(([field]) => !request[field])

    return missing?.[1]
}

function normalizeUserGender(value: string) {
    const normalizedValue = value.trim().toUpperCase()

    if (
        normalizedValue === UserGender.MALE ||
        normalizedValue === UserGender.FEMALE ||
        normalizedValue === UserGender.OTHER
    ) {
        return normalizedValue
    }

    return UserGender.OTHER
}

function getProfileApiErrorMessage(error: unknown) {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
    ) {
        const response = error.response as {
            data?: {
                message?: string
            }
        }

        return response.data?.message ?? "Failed to update profile."
    }

    return "Failed to update profile."
}
