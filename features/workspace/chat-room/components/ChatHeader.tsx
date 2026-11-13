import { Bot, MessageSquare, Sparkles, Wifi, WifiOff } from "lucide-react"

import type { ChatSocketState } from "@/hooks/useChatSocket"
import type { ChatType, ChatUser } from "@/types/chat.types"

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=4f46e5&color=fff&name=NB"

type ChatHeaderProps = {
  user: ChatUser
  socketState?: ChatSocketState
  activeMode?: ChatType
  onModeChange?: (mode: "PROJECT" | "AI") => void
}

export function ChatHeader({
  user,
  socketState = "idle",
  activeMode = "PROJECT",
  onModeChange,
}: ChatHeaderProps) {
  const isRealtimeConnected = socketState === "connected"
  const isConnecting =
    socketState === "connecting" || socketState === "reconnecting"

  return (
    <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-white px-6 shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <img
            src={user.avatarUrl || DEFAULT_AVATAR}
            alt={user.name}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100"
          />
          <span
            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${isRealtimeConnected
              ? "bg-emerald-500"
              : isConnecting
                ? "bg-amber-400"
                : "bg-emerald-500"
              }`}
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-[14px] font-semibold text-slate-800 leading-none">
              {user.name}
            </h2>
            {activeMode === "AI" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                <Sparkles className="h-2.5 w-2.5" />
                AI Bot
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] font-medium">
            <span className="text-emerald-600">{user.status}</span>
            <span className="text-slate-300">•</span>
            <span
              className={`inline-flex items-center gap-1 ${isRealtimeConnected
                ? "text-emerald-600"
                : isConnecting
                  ? "text-amber-600"
                  : "text-slate-400"
                }`}
            >
              {isRealtimeConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Live
                </>
              ) : isConnecting ? (
                <>
                  <Wifi className="h-3 w-3 animate-pulse" />
                  Syncing...
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Auto-sync
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {onModeChange && (
        <div className="flex items-center rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => onModeChange("PROJECT")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${activeMode === "PROJECT"
              ? "bg-white text-indigo-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Project Chat
          </button>
          <button
            type="button"
            onClick={() => onModeChange("AI")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${activeMode === "AI"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Bot className="h-3.5 w-3.5" />
            NeuroBot AI
          </button>
        </div>
      )}
    </div>
  )
}
