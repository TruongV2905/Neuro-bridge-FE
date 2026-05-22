
"use client"

import { useState, useRef } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  BadgeCheck,
  Image as ImageIcon,
  Hash,
  Building2,
  BriefcaseBusiness,
  FileText,
  Star,
  FolderCheck,
  Globe,
  Clock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Import types và components tách nhỏ
import { UserProfile } from "./types"
import { ProfileHeader } from "./components/profile-header"
import { FormField } from "./components/form-field"
import { ReadOnlyItem } from "./components/read-only-item"
import { RoleSection } from "./components/role-section"

const mockUser: UserProfile = {
  userId: "USR-0002",
  name: "Thương Nhị Ca",
  userName: "alexarawles",
  email: "alexarawles@gmail.com",
  avatarUrl: "/thuongnhica.png", // Đường dẫn ảnh mặc định trỏ vào thư mục public
  phoneNumber: "+0123456789",
  address: "Ho Chi Minh City, Vietnam",
  role: "AI_EXPERT", // Bạn có thể chuyển sang "CLIENT" để test giao diện Client
  status: "ACTIVE",
  portfolio: "https://portfolio.alexarawles.dev",
  completedProjects: 24,
  rating: 4.8,
  availabilityStatus: true,
  companyName: "NeuroBridge Solutions Corp",
  industry: "Artificial Intelligence & SaaS",
  companyDescription: "Providing cutting-edge AI collaboration tools and expert matching workflows globally."
}

export default function ProfilePage() {
  const isClient = mockUser.role === "CLIENT"
  const isExpert = mockUser.role === "AI_EXPERT"

  // State quản lý avatar động và ref điều khiển File Explorer
  const [avatar, setAvatar] = useState(mockUser.avatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const localImageUrl = URL.createObjectURL(file)
      setAvatar(localImageUrl)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Đồng bộ avatar mới lên Header */}
      <ProfileHeader user={{ ...mockUser, avatarUrl: avatar }} />

      {/* Banner AI Control Panel */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#5f7bff] via-[#3e5ee0] via-[#8b5cf6] to-[#ec4899] px-6 py-6 border-b border-border">
        <div
          className="absolute inset-0 opacity-10 mix-blend-overlay z-0"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), 
                        linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />

        <div className="absolute inset-0 bg-black/15 dark:bg-black/30 z-0" />

        <div className="relative z-10 text-white flex flex-col gap-1.5">
          <div className="self-start inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </span>
            Profile management
          </div>

          <h1 className="text-xl font-black tracking-tight sm:text-2xl text-white">
            Welcome,{" "}
            <span className="bg-gradient-to-r from-[#ffffff] via-purple-200 to-[#fc38da] bg-clip-text text-transparent">
              {mockUser.name}
            </span>{" "}
            <span className="inline-block animate-pulse text-sm text-[#fc38da]">✧</span>
          </h1>

          <p className="max-w-xl text-xs font-medium text-white/75 leading-normal">
            Manage your AI node identity and workspace configuration on the <span className="font-bold text-white">NeuroBridge Matrix</span>.
          </p>
        </div>
      </section>

      {/* Main Content Container */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        {/* Card chính với viền màu Gradient */}
        <Card 
          style={{
            backgroundImage: "linear-gradient(var(--card), var(--card)), linear-gradient(to right, #5f7bff 0%, #3e5ee0 35%, #8b5cf6 65%, #ec4899 100%)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box"
          }}
          className="overflow-hidden rounded-3xl border border-transparent py-0 shadow-lg"
        >
          {/* Cover Photo màu Gradient */}
          <div
            style={{
              background: 'linear-gradient(to right, #5f7bff 0%, #3e5ee0 35%, #8b5cf6 65%, #ec4899 100%)'
            }}
            className="h-28 border-b border-border/20 relative"
          >
            <div className="absolute inset-0 bg-black/5 dark:bg-black/20" />
          </div>

          <CardContent className="px-8 pb-8">
            {/* Top Info Banner (Avatar & Name) */}
            <div className="-mt-14 flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                
                {/* Input file ẩn phục vụ tính năng upload */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />

                {/* Khung chứa Avatar hỗ trợ Hover & Click như Facebook */}
                <div 
                  onClick={handleAvatarClick}
                  className="group/avatar relative h-32 w-32 shrink-0 cursor-pointer overflow-hidden rounded-3xl border-4 border-card shadow-xl transition-transform active:scale-95 bg-muted"
                >
                  <img
                    src={avatar}
                    alt={mockUser.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 text-white gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                      <circle cx="12" cy="13" r="3"/>
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">Update</span>
                  </div>
                </div>

                <div className="pt-0 sm:pt-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="break-words text-3xl font-extrabold tracking-tight md:text-4xl text-card-foreground">
                      {mockUser.name}
                    </h2>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                      <BadgeCheck size={18} />
                    </div>
                  </div>

                  <p className="mt-2 text-base font-semibold text-primary">@{mockUser.userName}</p>
                  <p className="mt-1 break-all text-sm font-medium text-muted-foreground">{mockUser.email}</p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Badge variant="outline" className="border-border text-muted-foreground bg-transparent">
                      {isClient ? "Client" : "AI Expert"}
                    </Badge>
                    <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20">
                      {mockUser.status}
                    </Badge>
                    <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20">
                      Verified Account
                    </Badge>
                  </div>
                </div>
              </div>

              <Button className="h-11 rounded-2xl bg-gradient-to-r from-[#5b51ef] to-[#6366f1] text-white hover:opacity-90 px-8 text-sm font-bold shadow-md transition-opacity">
                Edit Profile
              </Button>
            </div>

            <Separator className="my-8 bg-border" />

            {/* Info Grid Split */}
            <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
              {/* Personal Info Box */}
              <Card className="rounded-2xl border border-border bg-muted/30 shadow-none">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Personal Information</CardTitle>
                  <CardDescription className="text-muted-foreground">Common profile fields for every user.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField icon={<User size={16} />} label="Full Name" value={mockUser.name} />
                    <FormField icon={<User size={16} />} label="Username" value={mockUser.userName} />
                    <FormField icon={<Mail size={16} />} label="Email Address" value={mockUser.email} />
                    <FormField icon={<Phone size={16} />} label="Phone Number" value={mockUser.phoneNumber} />
                    <div className="md:col-span-2">
                      <FormField icon={<MapPin size={16} />} label="Address" value={mockUser.address} />
                    </div>
                    <div className="md:col-span-2">
                      <FormField icon={<ImageIcon size={16} />} label="Avatar URL" value={mockUser.avatarUrl} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Info Box */}
              <Card className="rounded-2xl border border-border bg-muted/50 shadow-none">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Account Information</CardTitle>
                  <CardDescription className="text-muted-foreground">System controlled fields.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ReadOnlyItem icon={<Hash size={17} />} label="User ID" value={mockUser.userId} />
                    <ReadOnlyItem icon={<ShieldCheck size={17} />} label="Role" value={isClient ? "Client" : "AI Expert"} />
                    <ReadOnlyItem icon={<BadgeCheck size={17} />} label="Status" value={mockUser.status} active />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conditional Client Section (Sửa lỗi ép kiểu an toàn khi đổi role) */}
            {isClient && (
              <RoleSection title="Client Information" description="Company profile information for client users.">
                <FormField icon={<Building2 size={16} />} label="Company Name" value={(mockUser as any).companyName || ""} />
                <FormField icon={<BriefcaseBusiness size={16} />} label="Industry" value={(mockUser as any).industry || ""} />
                <div className="md:col-span-2">
                  <FormField icon={<FileText size={16} />} label="Company Description" value={(mockUser as any).companyDescription || ""} />
                </div>
              </RoleSection>
            )}

            {isExpert && (
              <RoleSection title="AI Expert Information" description="Professional information for AI expert users.">
                <FormField icon={<Globe size={16} />} label="Portfolio" value={(mockUser as any).portfolio || ""} />
                <FormField icon={<FolderCheck size={16} />} label="Completed Projects" value={String((mockUser as any).completedProjects || 0)} />
                <FormField icon={<Star size={16} />} label="Rating" value={String((mockUser as any).rating || 0)} />
                <FormField icon={<Clock size={16} />} label="Availability Status" value={(mockUser as any).availabilityStatus ? "Available" : "Unavailable"} />
              </RoleSection>
            )}

            {/* Actions Footer */}
            <div className="mt-8 flex justify-end gap-3">
              <Button
                variant="outline"
                className="h-10 rounded-xl px-6 font-semibold border-border text-card-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
              >
                Cancel
              </Button>
              <Button className="h-10 rounded-xl bg-gradient-to-r from-[#5b51ef] to-[#6366f1] text-white hover:opacity-90 px-6 font-semibold shadow-md transition-opacity">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}