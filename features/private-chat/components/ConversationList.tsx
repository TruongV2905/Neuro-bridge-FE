"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import type { PrivateConversation } from "@/types/private-chat.type"

import { ConversationListItem } from "./ConversationListItem"

type ConversationListProps = {
  conversations: PrivateConversation[]
  selectedConversationId: string | null
  onSelectConversation: (
    conversationId: string,
  ) => void
  isLoading?: boolean
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading = false,
}: ConversationListProps) {
  const [searchValue, setSearchValue] = useState("")

  const filteredConversations = useMemo(() => {
    const normalizedSearch = searchValue
      .trim()
      .toLowerCase()

    if (!normalizedSearch) {
      return conversations
    }

    return conversations.filter((conversation) =>
      conversation.participant.name
        .toLowerCase()
        .includes(normalizedSearch),
    )
  }, [conversations, searchValue])

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-r border-slate-100 bg-white">
      <div className="border-b border-slate-100 px-4 py-4">
        <h1 className="text-lg font-semibold text-slate-800">
          Messages
        </h1>

        <p className="mt-0.5 text-xs text-slate-400">
          Your private conversations
        </p>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            value={searchValue}
            onChange={(event) =>
              setSearchValue(event.target.value)
            }
            placeholder="Search conversations..."
            className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--primary)]/30 focus:bg-white"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">
            Loading conversations...
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="space-y-1">
            {filteredConversations.map(
              (conversation) => (
                <ConversationListItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={
                    selectedConversationId ===
                    conversation.id
                  }
                  onClick={() =>
                    onSelectConversation(
                      conversation.id,
                    )
                  }
                />
              ),
            )}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-slate-400">
            No conversations found
          </div>
        )}
      </div>
    </aside>
  )
}