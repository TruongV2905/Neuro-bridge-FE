import type { PrivateConversation } from "@/types/private-chat.type"

type ConversationListItemProps = {
  conversation: PrivateConversation
  isActive: boolean
  onClick: () => void
}

export function ConversationListItem({
  conversation,
  isActive,
  onClick,
}: ConversationListItemProps) {
  const { participant } = conversation

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl px-3 py-3 text-left transition ${
        isActive
          ? "bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/15"
          : "hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <img
            src={
              participant.avatarUrl ||
              "/img/default-avatar.png"
            }
            alt={participant.name}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
          />

          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
              conversation.status === "ACTIVE"
                ? "bg-emerald-500"
                : "bg-slate-300"
            }`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-slate-800">
              {participant.name}
            </p>

            <span className="shrink-0 text-[10px] text-slate-400">
              {conversation.lastMessageTime}
            </span>
          </div>

          <p className="mt-0.5 text-[11px] capitalize text-slate-400">
            {participant.role}
          </p>

          <p className="mt-1 truncate text-xs text-slate-500">
            {conversation.lastMessage ||
              "Open conversation"}
          </p>
        </div>
      </div>
    </button>
  )
}