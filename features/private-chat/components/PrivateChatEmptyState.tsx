import { MessageCircleMore } from "lucide-react"

export function PrivateChatEmptyState() {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)]/10">
        <MessageCircleMore className="h-9 w-9 text-[var(--primary)]" />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-slate-800">
        Select a conversation
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Choose a private conversation from the
        list to start messaging an expert.
      </p>
    </div>
  )
}