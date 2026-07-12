import {
  Bell,
  Ban,
  ChevronDown,
  ChevronUp,
  Search,
  User,
} from "lucide-react"

import type { ChatUser } from "@/types/chat.types"

type PrivateChatProfilePanelProps = {
  user: ChatUser
  media: string[]
  isBlocked: boolean
  isBlocking?: boolean
  onBlock: () => void
}

export function PrivateChatProfilePanel({
  user,
  media,
  isBlocked,
  isBlocking = false,
  onBlock,
}: PrivateChatProfilePanelProps) {
  return (
    <aside className="hidden w-[300px] shrink-0 flex-col overflow-y-auto border-l border-slate-100 bg-white xl:flex">
      <div className="flex flex-col items-center px-6 py-6 text-center">
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="h-20 w-20 rounded-full object-cover shadow-xs ring-4 ring-slate-50"
        />

        <h3 className="mt-3 text-sm font-semibold text-slate-800">
          {user.name}
        </h3>

        <p
          className={`mt-0.5 text-[11px] font-medium ${user.status === "Online"
              ? "text-emerald-500"
              : "text-slate-400"
            }`}
        >
          {user.status}
        </p>

        <div className="mt-5 grid w-full grid-cols-4 gap-2">
          <ProfileAction
            icon={<User className="h-4 w-4" />}
            label="Profile"
          />

          <ProfileAction
            icon={<Bell className="h-4 w-4" />}
            label="Mute"
          />

          <ProfileAction
            icon={<Search className="h-4 w-4" />}
            label="Search"
          />

          <ProfileAction
            icon={<Ban className="h-4 w-4" />}
            label={
              isBlocked
                ? "Blocked"
                : isBlocking
                  ? "Blocking..."
                  : "Block"
            }
            onClick={onBlock}
            disabled={isBlocked || isBlocking}
            danger
          />
        </div>
      </div>

      <div className="flex-1 border-t border-slate-100 px-6 py-4">
        <PanelTitle
          title="Media, Files And Links"
          isOpen
        />

        <div className="mt-3 flex gap-1.5 rounded-lg bg-slate-50 p-1">
          <button
            type="button"
            className="flex-1 rounded-md bg-white py-1.5 text-[11px] font-medium text-[var(--primary)] shadow-xs"
          >
            Media
          </button>

          <button
            type="button"
            className="flex-1 rounded-md py-1.5 text-[11px] font-medium text-slate-500 transition hover:text-slate-700"
          >
            Files
          </button>

          <button
            type="button"
            className="flex-1 rounded-md py-1.5 text-[11px] font-medium text-slate-500 transition hover:text-slate-700"
          >
            Links
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {media.map((item, index) => (
            <img
              key={`${item}-${index}`}
              src={item}
              alt={`media-${index}`}
              className="aspect-square cursor-pointer rounded-lg border border-slate-100 object-cover transition hover:opacity-90"
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
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
}

function ProfileAction({
  icon,
  label,
  onClick,
  disabled = false,
  danger = false,
}: ProfileActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1.5 rounded-xl py-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "text-red-400 hover:bg-red-50 hover:text-red-600"
          : "text-slate-400 hover:bg-slate-50 hover:text-[var(--primary)]"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          danger ? "bg-red-50" : "bg-slate-50"
        }`}
      >
        {icon}
      </span>

      <span className="text-[10px] font-medium">
        {label}
      </span>
    </button>
  )
}

type PanelTitleProps = {
  title: string
  isOpen: boolean
}

function PanelTitle({
  title,
  isOpen,
}: PanelTitleProps) {
  return (
    <div className="group flex cursor-pointer items-center justify-between">
      <h4 className="text-xs font-semibold text-slate-700 transition group-hover:text-slate-900">
        {title}
      </h4>

      <button
        type="button"
        className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-50 text-slate-400 transition group-hover:text-slate-600"
      >
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  )
}