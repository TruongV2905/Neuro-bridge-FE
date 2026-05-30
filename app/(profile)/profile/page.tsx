// src/app/profile/page.tsx
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
import { UserProfile } from "../../../types/profile-types"
import { ProfileHeader } from "./_components/profile-header"
import { FormField } from "./_components/form-field"
import { ReadOnlyItem } from "./_components/read-only-item"
import { RoleSection } from "./_components/role-section"

const mockUser: UserProfile = {
  userId: "USR-0002",
  name: "Thương Nhị Ca",
  userName: "alexarawles",
  email: "alexarawles@gmail.com",
  avatarUrl: "/thuongnhica.png",
  phoneNumber: "+0123456789",
  address: "Ho Chi Minh City, Vietnam",
  role: "CLIENT", // Để "CLIENT" để tự động bật khung Client Information phía dưới góc phải
  status: "ACTIVE",
  companyName: "NeuroBridge Solutions Corp",
  industry: "Artificial Intelligence & SaaS",
  companyDescription: "Providing cutting-edge AI collaboration tools and expert matching workflows globally."
}

export default function ProfilePage() {
  const isClient = mockUser.role === "CLIENT"
  const isExpert = mockUser.role === "AI_EXPERT"

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
      <ProfileHeader user={{ ...mockUser, avatarUrl: avatar }} />

      {/* Banner Profile */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-r from-[#5f7bff] via-[#8b5cf6] to-[#ec4899] px-6 py-6">
        {/* Overlay làm màu dịu hơn */}
        <div className="absolute inset-0 bg-black/10 dark:bg-black/25" />

        {/* Glow nhẹ */}
        <div className="absolute -top-20 right-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-44 w-44 rounded-full bg-pink-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            Profile Management
          </div>

          <div>
            <p className="mt-1 text-sm text-white/75">
              Manage your personal profile and workspace identity
            </p>
          </div>
        </div>
      </section>

      {/* BỐ CỤC CHÍNH CHIA THÀNH 2 CỘT THEO ẢNH MẪU */}
      <section className="mx-auto max-w-7xl px-4 py-8 grid gap-6 md:grid-cols-[1.05fr_0.95fr] lg:grid-cols-[1.08fr_0.92fr] items-start">
        <div>
          {/* ================= CỘT TRÁI: AVATAR & PERSONAL INFORMATION ================= */}
          <Card
            style={{
              backgroundImage: "linear-gradient(var(--card), var(--card)), linear-gradient(to bottom, #5f7bff 0%, #8b5cf6 100%)",
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box"
            }}
            className="overflow-hidden rounded-[2.5rem] border-2 border-transparent bg-card shadow-xl"
          >
            <CardContent className="p-6 flex flex-col items-center">

              {/* LỚP BỌC MỚI: Đưa Ảnh và Chữ nằm ngang hàng với nhau */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full mb-6">

                {/* Vùng chọn ảnh đại diện (Xóa class mx-auto và mb-6 đi) */}
                <div className="relative h-44 w-44 rounded-[2rem] overflow-hidden border border-border group/avatar cursor-pointer bg-muted shadow-lg shrink-0">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <img
                    src={avatar}
                    alt={mockUser.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/avatar:scale-105"
                    onClick={handleAvatarClick}
                  />
                  <div
                    onClick={handleAvatarClick}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 text-white gap-1.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Change Avatar</span>
                  </div>
                </div>

                {/* Thông tin chữ được đẩy lên bên phải ảnh (Sửa text-left, xóa mb-6, thêm flex-1 và sm:pt-4) */}
                <div className="flex-1 text-left space-y-1 px-1 sm:pt-4 w-full">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black tracking-tight text-card-foreground">
                      {mockUser.name}
                    </h2>
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                      <BadgeCheck size={14} />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-primary">@{mockUser.userName}</p>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-border text-muted-foreground text-[11px]">
                      {isClient ? "Core Client" : "AI Master Expert"}
                    </Badge>
                    <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-500/10 text-[11px]">
                      Verified Node
                    </Badge>
                  </div>
                </div>

              </div> {/* Đóng lớp bọc ngang hàng tại đây */}

              {/* Ngay sau div bọc là đường gạch ngang ngăn cách, giữ nguyên */}
              <Separator className="bg-border mb-6" />

              {/* Ruột Personal Information — ĐÃ ĐỔI THÀNH CẤU TRÚC GRID 2 Ô MỖI HÀNG */}
              <div className="w-full space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground px-1 mb-2">
                  Personal Information
                </h3>

                {/* Hàng 1: Full Name và Email Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField icon={<User size={16} />} label="Full Name" value={mockUser.name} />
                  <FormField icon={<Mail size={16} />} label="Email Address" value={mockUser.email} />
                </div>

                {/* Hàng 2: Phone Number và Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField icon={<Phone size={16} />} label="Phone Number" value={mockUser.phoneNumber} />
                  <FormField icon={<MapPin size={16} />} label="Address" value={mockUser.address} />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Action Buttons */}
            <div className=" bottom-4 z-20 flex justify-end pt-4">
              <div className="flex w-full sm:w-auto items-center gap-3 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-xl backdrop-blur-xl">

                {/* Cancel */}
                <Button
                  variant="outline"
                  className="
                              h-11
                              rounded-xl
                              border-border
                              bg-background/60
                              px-5
                              text-xs
                              font-bold
                              text-muted-foreground
                              transition-all
                              hover:border-destructive/40
                              hover:bg-destructive/10
                              hover:text-destructive
                            "
                >
                  Cancel
                </Button>

                {/* Save */}
                <Button
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
                              shadow-lg
                              transition-all
                              hover:scale-[1.01]
                              hover:opacity-95
                              active:scale-[0.99]
                            "
                >
                  Save Changes
                </Button>

              </div>
            </div>
        </div>
        {/* ================= CỘT PHẢI: ACCOUNT INFO & DYNAMIC ROLE INFO ================= */}
        <div className="space-y-6">

          {/* KHUNG TRÊN BÊN PHẢI: Account Information */}
          <Card className="rounded-[2rem] border border-border bg-card shadow-md overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 py-4 px-6">
              <CardTitle className="text-base font-black text-card-foreground">Account Information</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Immutable platform verification matrix fields.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <ReadOnlyItem icon={<Hash size={17} />} label="User ID" value={mockUser.userId} />
              <ReadOnlyItem icon={<ShieldCheck size={17} />} label="System Role" value={isClient ? "Client Node" : "AI Expert Node"} />
              <ReadOnlyItem icon={<BadgeCheck size={17} />} label="Network Status" value={mockUser.status} active />
            </CardContent>
          </Card>

          {/* KHUNG DƯỚI BÊN PHẢI: Client Information hoặc AI Expert Information */}
          {isClient && (
            <RoleSection
              title="Client Information"
              description="Corporate ledger details and operations parameters for project owners."
            >
              <FormField icon={<Building2 size={16} />} label="Company Name" value={(mockUser as any).companyName || ""} />
              <FormField icon={<BriefcaseBusiness size={16} />} label="Operating Industry" value={(mockUser as any).industry || ""} />
              <div className="md:col-span-2">
                <FormField icon={<FileText size={16} />} label="Company Core Description" value={(mockUser as any).companyDescription || ""} />
              </div>
            </RoleSection>
          )}

          {isExpert && (
            <RoleSection
              title="AI Expert Information"
              description="Professional compute telemetry and experience credentials."
            >
              <FormField icon={<Globe size={16} />} label="Network Portfolio" value={(mockUser as any).portfolio || ""} />
              <FolderCheck icon={<FolderCheck size={16} />} label="Completed Projects" value={String((mockUser as any).completedProjects || 0)} />
              <FormField icon={<Star size={16} />} label="Trust Rating" value={String((mockUser as any).rating || 0)} />
              <FormField icon={<Clock size={16} />} label="Availability Node Status" value={(mockUser as any).availabilityStatus ? "Available for Sync" : "Dormant Node"} />
            </RoleSection>
          )}

        </div>

      </section>
    </main>
  )
}