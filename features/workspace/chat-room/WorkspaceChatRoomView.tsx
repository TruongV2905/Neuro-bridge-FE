"use client"

import { useSelector } from "react-redux"

import Header from "@/components/layout/Header"
import type { RootState } from "@/redux/store"
import { UserRole } from "@/types/user/user.type"
import type { UserResponse } from "@/types/user/user.type"
import { useWorkspaceDetail } from "@/services/workspace.service"

import { ChatComposer } from "./components/ChatComposer"
import { ChatHeader } from "./components/ChatHeader"
import { ChatMessage } from "./components/ChatMessage"
import { ChatProfilePanel } from "./components/ChatProfilePanel"
import {
  chatMedia,
  chatMessages,
  chatPartner,
  currentUser,
} from "./data/mock-chat-room"

type WorkspaceChatRoomViewProps = {
  workspaceId: string
}

export function WorkspaceChatRoomView({ workspaceId }: WorkspaceChatRoomViewProps) {
  const normalizedWorkspaceId = workspaceId.trim()

  const user = useSelector(
    (state: RootState) => state.user
  ) as UserResponse | null

  const {
    data: workspace,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
    error: workspaceError,
  } = useWorkspaceDetail(normalizedWorkspaceId)

  const isExpert = user?.role === UserRole.EXPERT

  const partner = isExpert
    ? workspace?.client
    : workspace?.expert
  const partnerName = partner?.name ?? chatPartner.name
  const partnerAvatarUrl = partner?.avatarUrl ?? chatPartner.avatarUrl
  const workspaceStatusMessage = getWorkspaceStatusMessage({
    isInvalidWorkspaceId: !normalizedWorkspaceId,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
    error: workspaceError,
  })

  return (
    <div className="relative min-h-screen bg-[#eaf3ff]">
      <div className="fixed inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-[#eef5ff] via-[#f7fbff] to-transparent" />

      <div className="fixed inset-x-0 top-0 z-10 h-24 bg-indigo-950/15 backdrop-blur-xl border-b border-white/20" />

      <Header />

      <main className="relative z-10 px-4 pb-6 pt-24">
        <div className="mx-auto mt-4 flex h-[calc(100vh-128px)] max-w-[1600px] gap-4 min-h-0">
          <section className="flex flex-1 max-w-[2000px] min-w-0 overflow-hidden rounded-2xl border border-white/70 bg-white/95 backdrop-blur-sm shadow-md transition-all">
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <ChatHeader
                user={{
                  ...chatPartner,
                  name: partnerName,
                  avatarUrl: partnerAvatarUrl,
                }}
              />

              <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-3">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">
                    {workspace?.projectName ?? workspaceStatusMessage}
                  </span>

                  <span>
                    Status: {workspace?.projectStatus ?? "-"}
                  </span>

                  <span>
                    Progress: {workspace?.progressPercentage ?? 0}%
                  </span>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
                <div className="mx-auto flex flex-col gap-6 pb-4">
                  <div className="flex justify-center my-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                      Yesterday
                    </span>
                  </div>

                  {chatMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      currentUser={currentUser}
                      partner={chatPartner}
                    />
                  ))}
                </div>
              </div>

              <ChatComposer />
            </div>

            <ChatProfilePanel
              user={{
                ...chatPartner,
                name: partnerName,
                avatarUrl: partnerAvatarUrl,
              }}
              media={chatMedia}
            />
          </section>
        </div>
      </main>
    </div>
  )
}

function getWorkspaceStatusMessage({
  isInvalidWorkspaceId,
  isLoading,
  isError,
  error,
}: {
  isInvalidWorkspaceId: boolean
  isLoading: boolean
  isError: boolean
  error: { response?: { status?: number; data?: { message?: string } } } | null
}) {
  if (isInvalidWorkspaceId) {
    return "Invalid workspace ID"
  }

  if (isLoading) {
    return "Loading project..."
  }

  if (isError) {
    const status = error?.response?.status
    const message = error?.response?.data?.message

    if (message) return message
    if (status === 401 || status === 403) return "Workspace access denied"
    if (status === 404) return "Workspace not found"

    return "Unable to load workspace"
  }

  return "Workspace unavailable"
}
