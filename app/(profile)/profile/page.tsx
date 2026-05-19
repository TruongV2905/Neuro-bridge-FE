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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const user = {
  userId: "USR-0001",
  name: "Alexa Rawles",
  userName: "alexarawles",
  email: "alexarawles@gmail.com",
  avatarUrl: "https://i.pravatar.cc/160?img=47",
  phoneNumber: "+0123456789",
  address: "Ho Chi Minh City, Vietnam",
  role: "ROLE_USER",
  status: "ACTIVE",
}

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#202124]">
      <header className="h-[56px] bg-gradient-to-r from-[#5b3fd4] via-[#8d3fd1] to-[#465bd6] px-4">
        <div className="flex h-full items-center justify-between">
          <div className="text-xl font-bold tracking-wide text-[#10105a]">
            Neuro<span className="text-[#00a7ff]">Bridge</span>
            <p className="text-[10px] font-normal text-white/60">
              AI Project Collaboration Platform
            </p>
          </div>

          <div className="hidden h-10 w-[360px] items-center rounded-xl bg-white/10 px-4 text-white/70 md:flex">
            <span className="mr-2 text-sm">✧</span>
            <input
              className="w-full bg-transparent text-xs outline-none placeholder:text-white/55"
              placeholder="Ask AI to manage your projects"
            />
            <Mic size={16} className="mr-3 text-blue-300" />
            <Search size={17} />
          </div>

          <div className="flex items-center gap-3">
            <IconBox><Bell size={16} /></IconBox>
            <IconBox><MessageSquare size={16} /></IconBox>
            <IconBox><Sun size={16} /></IconBox>

            <div className="flex h-10 items-center gap-3 rounded-xl bg-white/12 px-3 text-white">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
              <div className="hidden leading-tight sm:block">
                <p className="text-xs font-semibold">{user.name}</p>
                <p className="text-[10px] text-white/55">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-r from-[#d9ecff] via-[#eef3ff] to-[#fff4cf] px-8 py-8">
        <div className="absolute right-10 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-[#7c3aed]/10 blur-2xl" />
        <div className="absolute right-40 top-4 h-20 w-20 rounded-full bg-[#3f7df4]/10 blur-2xl" />

        <div className="relative flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3f7df4]">
            Profile Management
          </p>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#1f2937]">
            Welcome back, {user.name}
          </h1>

          <p className="max-w-xl text-sm font-medium text-gray-600">
            Manage your account information, profile details, and platform identity.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_70px_rgba(30,41,59,0.08)]">
          <div className="h-28 bg-gradient-to-r from-[#5b6cff] via-[#8b45e8] to-[#23b7ff]" />

          <div className="px-8 pb-8">
            <div className="-mt-14 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-6">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-32 w-32 rounded-3xl border-4 border-white object-cover shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
                />

                <div className="pt-10">
                  <div className="flex items-center gap-3">
                    <h2 className="text-4xl font-extrabold tracking-tight text-[#1f2937]">
                      {user.name}
                    </h2>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(34,197,94,0.45)]">
                      <BadgeCheck size={18} className="text-white" />
                    </div>
                  </div>

                  <p className="mt-2 text-base font-semibold text-[#3f7df4]">
                    @{user.userName}
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-500">
                    {user.email}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Badge>{user.role}</Badge>
                    <Badge variant="success">{user.status}</Badge>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                      Verified Account
                    </span>
                  </div>
                </div>
              </div>

              <Button className="h-11 rounded-2xl bg-[#3f7df4] px-8 text-sm font-bold shadow-[0_10px_25px_rgba(63,125,244,0.28)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#2f69dd] hover:shadow-[0_14px_30px_rgba(63,125,244,0.35)]">
                Edit Profile
              </Button>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
              <div className="rounded-2xl border border-gray-100 p-6">
                <h3 className="mb-6 text-lg font-bold text-black">
                  Personal Information
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField icon={<User size={16} />} label="Full Name" value={user.name} />
                  <FormField icon={<User size={16} />} label="Username" value={user.userName} />
                  <FormField icon={<Mail size={16} />} label="Email Address" value={user.email} />
                  <FormField icon={<Phone size={16} />} label="Phone Number" value={user.phoneNumber} />
                  <div className="md:col-span-2">
                    <FormField icon={<MapPin size={16} />} label="Address" value={user.address} />
                  </div>
                  <div className="md:col-span-2">
                    <FormField icon={<Image size={16} />} label="Avatar URL" value={user.avatarUrl} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-[#fbfcff] p-6">
                <h3 className="mb-6 text-lg font-bold text-black">
                  Account Information
                </h3>

                <div className="space-y-4">
                  <ReadOnlyItem
                    icon={<Hash size={17} />}
                    label="User ID"
                    value={user.userId}
                  />

                  <ReadOnlyItem
                    icon={<ShieldCheck size={17} />}
                    label="Role"
                    value={user.role}
                  />

                  <ReadOnlyItem
                    icon={<BadgeCheck size={17} />}
                    label="Status"
                    value={user.status}
                    active
                  />
                </div>

                <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#eef4ff] to-[#f5efff] p-4">
                  <p className="text-xs font-semibold text-gray-500">
                    Account note
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    User ID, Role và Status nên để readonly vì đây là thông tin hệ thống quản lý.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button
                variant="outline"
                className="h-10 rounded-xl border-2 border-gray-200 px-6 font-semibold text-gray-600 transition-all duration-300 hover:border-red-500 hover:bg-red-500 hover:text-white hover:shadow-[0_10px_25px_rgba(239,68,68,0.25)]"
              >
                Cancel
              </Button>
              <Button className="h-10 rounded-xl bg-[#3f7df4] px-6 font-semibold hover:bg-[#2f69dd]">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/80">
      {children}
    </div>
  )
}

function Badge({
  children,
  variant,
}: {
  children: React.ReactNode
  variant?: "success"
}) {
  return (
    <span
      className={
        variant === "success"
          ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600"
          : "rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600"
      }
    >
      {children}
    </span>
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
    <div className="group rounded-2xl border-2 border-gray-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#3f7df4] hover:bg-[#fbfdff] hover:shadow-[0_14px_35px_rgba(63,125,244,0.18)]">
      <label className="mb-2 block text-xs font-bold text-gray-600 transition-colors duration-300 group-hover:text-[#3f7df4]">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-300 group-hover:scale-110 group-hover:text-[#3f7df4]">
          {icon}
        </div>

        <Input
          defaultValue={value}
          className="h-11 rounded-xl border-2 border-gray-200 bg-[#f8fafc] pl-10 text-sm font-medium text-gray-800 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#3f7df4] focus-visible:border-[#3f7df4] group-hover:border-[#3f7df4] group-hover:bg-white"
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
    <div className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#3f7df4]/40 hover:bg-[#fbfdff] hover:shadow-[0_14px_35px_rgba(63,125,244,0.14)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4ff] text-[#3f7df4] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#3f7df4] group-hover:text-white">
        {icon}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 transition-colors group-hover:text-[#3f7df4]">
          {label}
        </p>

        <p
          className={
            active
              ? "text-sm font-bold text-emerald-600"
              : "text-sm font-bold text-gray-800"
          }
        >
          {value}
        </p>
      </div>
    </div>
  )
}