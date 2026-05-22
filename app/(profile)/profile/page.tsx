import {
  Bell,
  MessageSquare,
  Mic,
  Search,
  Sun,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  BadgeCheck,
  Image,
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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type UserRole = "CLIENT" | "AI_EXPERT"
type UserStatus = "ACTIVE" | "INACTIVE"

type BaseUser = {
  userId: string
  name: string
  userName: string
  email: string
  avatarUrl: string
  phoneNumber: string
  address: string
  role: UserRole
  status: UserStatus
}

type ClientProfile = BaseUser & {
  role: "CLIENT"
  companyName: string
  industry: string
  companyDescription: string
}

type AIExpertProfile = BaseUser & {
  role: "AI_EXPERT"
  portfolio: string
  completedProjects: number
  rating: number
  availabilityStatus: boolean
}

type UserProfile = ClientProfile | AIExpertProfile

const user: UserProfile = {
  userId: "USR-0002",
  name: "Alexa Rawles",
  userName: "alexarawles",
  email: "alexarawles@gmail.com",
  avatarUrl: "https://i.pravatar.cc/160?img=47",
  phoneNumber: "+0123456789",
  address: "Ho Chi Minh City, Vietnam",
  role: "AI_EXPERT",
  status: "ACTIVE",

  portfolio: "https://portfolio.alexarawles.dev",
  completedProjects: 24,
  rating: 4.8,
  availabilityStatus: true,
}

export default function ProfilePage() {
  const isClient = user.role === "CLIENT"
  const isExpert = user.role === "AI_EXPERT"

  return (
    // Sử dụng bg-background và text-foreground chuẩn từ CSS global
    <main className="min-h-screen bg-background text-foreground">
      {/* Header đồng bộ màu primary của hệ thống */}
      <header className="h-[56px] bg-primary text-primary-foreground px-4 shadow-sm">
        <div className="flex h-full items-center justify-between">
          <div className="text-xl font-bold tracking-wide">
            Neuro<span className="text-muted-foreground/80">Bridge</span>
            <p className="text-[10px] font-normal opacity-60">
              AI Project Collaboration Platform
            </p>
          </div>

          <div className="hidden h-10 w-[360px] items-center rounded-xl bg-primary-foreground/10 px-4 text-primary-foreground/80 md:flex">
            <span className="mr-2 text-sm">✧</span>
            <input
              className="w-full bg-transparent text-xs outline-none placeholder:text-primary-foreground/50 text-primary-foreground"
              placeholder="Ask AI to manage your projects"
            />
            <Mic size={16} className="mr-3 opacity-80" />
            <Search size={17} />
          </div>

          <div className="flex items-center gap-3">
            <IconBox>
              <Bell size={16} />
            </IconBox>
            <IconBox>
              <MessageSquare size={16} />
            </IconBox>
            <IconBox>
              <Sun size={16} />
            </IconBox>

            <Button
              variant="ghost"
              className="h-10 gap-3 rounded-xl bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
              <div className="hidden max-w-[120px] text-left leading-tight sm:block">
                <p className="truncate text-xs font-semibold">{user.name}</p>
                <p className="truncate text-[10px] opacity-60">
                  {user.role}
                </p>
              </div>
            </Button>
          </div>
        </div>
      </header>

      {/* Banner phụ sử dụng bg-muted tinh tế thay cho slate cũ */}
      <section className="relative overflow-hidden bg-muted px-8 py-8 border-b border-border">
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Profile Management
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">
            Welcome back, {user.name}
          </h1>
          <p className="mt-2 max-w-xl text-sm font-medium text-muted-foreground">
            Manage your account information, profile details, and platform identity.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        {/* Card chính đổi sang dùng bg-card và border-border */}
        <Card className="overflow-hidden rounded-3xl border border-border bg-card py-0 shadow-md">
          {/* Banner nhỏ đổi từ gradient màu sang màu đối lập nhẹ của hệ thống */}
          <div className="h-28 bg-muted border-b border-border" />

          <CardContent className="px-8 pb-8">
            <div className="-mt-14 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-32 w-32 rounded-3xl border-4 border-card object-cover shadow-lg"
                />

                <div className="pt-0 sm:pt-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="break-words text-3xl font-extrabold tracking-tight md:text-4xl">
                      {user.name}
                    </h2> 

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                      <BadgeCheck size={18} />
                    </div>
                  </div>

                  <p className="mt-2 text-base font-semibold text-muted-foreground">
                    @{user.userName}
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-muted-foreground/80">
                    {user.email}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Badge variant="outline" className="border-border bg-transparent">
                      {isClient ? "Client" : "AI Expert"}
                    </Badge>

                    <Badge variant="secondary">
                      {user.status}
                    </Badge>

                    <Badge variant="secondary">
                      Verified Account
                    </Badge>
                  </div>
                </div>
              </div>

              <Button variant="default" className="h-11 rounded-2xl px-8 text-sm font-bold shadow-sm">
                Edit Profile
              </Button>
            </div>

            <Separator className="my-8 bg-border" />

            <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
              {/* Box thông tin cá nhân dùng bg-muted/40 lót nền mượt mà */}
              <Card className="rounded-2xl border border-border bg-muted/40 shadow-none">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Common profile fields for every user.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      icon={<User size={16} />}
                      label="Full Name"
                      value={user.name}
                    />
                    <FormField
                      icon={<User size={16} />}
                      label="Username"
                      value={user.userName}
                    />
                    <FormField
                      icon={<Mail size={16} />}
                      label="Email Address"
                      value={user.email}
                    />
                    <FormField
                      icon={<Phone size={16} />}
                      label="Phone Number"
                      value={user.phoneNumber}
                    />

                    <div className="md:col-span-2">
                      <FormField
                        icon={<MapPin size={16} />}
                        label="Address"
                        value={user.address}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <FormField
                        icon={<Image size={16} />}
                        label="Avatar URL"
                        value={user.avatarUrl}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Box bên phải tài khoản */}
              <Card className="rounded-2xl border border-border bg-muted/60 shadow-none">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>System controlled fields.</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <ReadOnlyItem
                      icon={<Hash size={17} />}
                      label="User ID"
                      value={user.userId}
                    />
                    <ReadOnlyItem
                      icon={<ShieldCheck size={17} />}
                      label="Role"
                      value={isClient ? "Client" : "AI Expert"}
                    />
                    <ReadOnlyItem
                      icon={<BadgeCheck size={17} />}
                      label="Status"
                      value={user.status}
                      active
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {isClient && (
              <RoleSection
                title="Client Information"
                description="Company profile information for client users."
              >
                <FormField
                  icon={<Building2 size={16} />}
                  label="Company Name"
                  value={user.companyName}
                />
                <FormField
                  icon={<BriefcaseBusiness size={16} />}
                  label="Industry"
                  value={user.industry}
                />
                <div className="md:col-span-2">
                  <FormField
                    icon={<FileText size={16} />}
                    label="Company Description"
                    value={user.companyDescription}
                  />
                </div>
              </RoleSection>
            )}

            {isExpert && (
              <RoleSection
                title="AI Expert Information"
                description="Professional information for AI expert users."
              >
                <FormField
                  icon={<Globe size={16} />}
                  label="Portfolio"
                  value={user.portfolio}
                />
                <FormField
                  icon={<FolderCheck size={16} />}
                  label="Completed Projects"
                  value={String(user.completedProjects)}
                />
                <FormField
                  icon={<Star size={16} />}
                  label="Rating"
                  value={String(user.rating)}
                />
                <FormField
                  icon={<Clock size={16} />}
                  label="Availability Status"
                  value={user.availabilityStatus ? "Available" : "Unavailable"}
                />
              </RoleSection>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <Button
                variant="outline"
                className="h-10 rounded-xl px-6 font-semibold border-border hover:bg-destructive hover:text-destructive-foreground"
              >
                Cancel
              </Button>

              <Button className="h-10 rounded-xl px-6 font-semibold">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-10 w-10 rounded-xl bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
    >
      {children}
    </Button>
  )
}

function RoleSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card className="mt-8 rounded-2xl border border-border bg-muted/40 shadow-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">{children}</div>
      </CardContent>
    </Card>
  )
}

function FormField({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="group rounded-2xl border border-border bg-muted/30 p-4 transition-all duration-300 hover:border-primary/50 hover:bg-muted/10 hover:shadow-sm">
      <label className="mb-2 block text-xs font-bold text-muted-foreground group-hover:text-foreground">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 group-hover:text-foreground">
          {icon}
        </div>

        <Input
          defaultValue={value}
          className="h-11 rounded-xl border border-input bg-card pl-10 text-sm font-medium text-foreground focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>
  )
}

function ReadOnlyItem({
  icon,
  label,
  value,
  active,
}: {
  icon: React.ReactNode
  label: string
  value: string
  active?: boolean
}) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-border bg-muted/50 p-4 transition-all duration-300 hover:border-border hover:bg-muted/20">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground">
          {label}
        </p>

        <p
          className={
            active
              ? "text-sm font-bold text-foreground opacity-90"
              : "text-sm font-bold text-foreground"
          }
        >
          {value}
        </p>
      </div>
    </div>
  )
}