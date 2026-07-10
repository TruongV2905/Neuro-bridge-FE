import { Bell, ChevronDown, ChevronUp, Search, User } from "lucide-react"
import type { ChatUser } from "@/types/chat.types"

type ChatProfilePanelProps = {
  user: ChatUser
  media: string[]
}

export function ChatProfilePanel({ user, media }: ChatProfilePanelProps) {
  return (
    <aside className="hidden w-[300px] shrink-0 border-l border-slate-100 bg-white xl:flex flex-col overflow-y-auto">
      <div className="flex flex-col items-center px-6 py-6 text-center">
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="h-20 w-20 rounded-full object-cover ring-4 ring-slate-50 shadow-xs"
        />

        <h3 className="mt-3 text-sm font-semibold text-slate-800">{user.name}</h3>
        <p className="text-[11px] font-medium text-emerald-500 mt-0.5">{user.status}</p>

        <div className="mt-5 grid w-full grid-cols-3 gap-2">
          <ProfileAction icon={<User className="h-4 w-4" />} label="Profile" />
          <ProfileAction icon={<Bell className="h-4 w-4" />} label="Mute" />
          <ProfileAction icon={<Search className="h-4 w-4" />} label="Search" />
        </div>
      </div>

      <div className="border-t border-slate-100 px-6 py-4 flex-1">
        <PanelTitle title="Media, Files And Links" isOpen />

        <div className="mt-3 flex gap-1.5 bg-slate-50 p-1 rounded-lg">
          <button className="flex-1 rounded-md bg-white py-1.5 text-[11px] font-medium text-[var(--primary)] shadow-xs">
            Media
          </button>
          <button className="flex-1 rounded-md py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-700 transition">
            Files
          </button>
          <button className="flex-1 rounded-md py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-700 transition">
            Links
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {media.map((item, index) => (
            <img
              key={index}
              src={item}
              alt={`media-${index}`}
              className="aspect-square rounded-lg object-cover hover:opacity-90 transition cursor-pointer border border-slate-100"
            />
          ))}
        </div>
      </div>

    </aside>
  )
}

type ProfileActionProps = {
  icon: React.ReactNode
  label: string
}

function ProfileAction({ icon, label }: ProfileActionProps) {
  return (
    <button className="flex flex-col items-center gap-1.5 py-2 rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-[var(--primary)]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50">
        {icon}
      </span>
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  )
}

type PanelTitleProps = {
  title: string
  isOpen: boolean
}

function PanelTitle({ title, isOpen }: PanelTitleProps) {
  return (
    <div className="flex items-center justify-between cursor-pointer group">
      <h4 className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition">{title}</h4>
      <button className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-50 text-slate-400 group-hover:text-slate-600 transition">
        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}