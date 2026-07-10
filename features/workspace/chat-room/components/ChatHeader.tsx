import type { ChatUser } from "@/types/chat.types"

type ChatHeaderProps = {
  user: ChatUser
}

export function ChatHeader({ user }: ChatHeaderProps) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100"
          />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
        </div>

        <div>
          <h2 className="text-[14px] font-semibold text-slate-800 leading-none mb-0.5">{user.name}</h2>
          <p className="text-[11px] font-medium text-emerald-500">{user.status}</p>
        </div>
      </div>
    </div>
  )
}