"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"

import Header from "@/components/layout/Header"
import type { RootState } from "@/redux/store"
import { UserRole } from "@/types/user/user.type"
import type { UserResponse } from "@/types/user/user.type"
import type { ChatUser } from "@/types/chat.types"
import { getInitialsAvatar } from "@/constants/assets"

import { useWorkspaceDetail } from "@/services/workspace.service"
import {
  getWorkspaceMembers,
  type WorkspaceMember,
} from "@/services/workspace-member.service"

import { ProjectSubmissionPanel } from "../_components/ProjectSubmissionPanel"
import { ClientProjectSubmissionPanel } from "../_components/ClientProjectSubmissionPanel"
import { ChatComposer } from "../_components/ChatComposer"
import { ChatHeader } from "../_components/ChatHeader"
import { ChatMessage } from "../_components/ChatMessage"
import { ChatProfilePanel } from "../_components/ChatProfilePanel"
import { chatMedia, chatMessages } from "../_data/mock-chat-room"

const getAvatarUrl = (avatarUrl?: string | null, name = "User") =>
  avatarUrl?.trim() ? avatarUrl : getInitialsAvatar(name)

export default function ChatRoomPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string

  const user = useSelector(
    (state: RootState) => state.user
  ) as UserResponse | null

  const { data: workspace } = useWorkspaceDetail(workspaceId)

  const [members, setMembers] = useState<WorkspaceMember[]>([])

  useEffect(() => {
    if (!workspaceId) return

    getWorkspaceMembers(workspaceId)
      .then(setMembers)
      .catch(() => {
        toast.error("Failed to load workspace members.")
        setMembers([])
      })
  }, [workspaceId])

  const isExpert = user?.role === UserRole.EXPERT
  const isClient = user?.role === UserRole.CLIENT

  const clientMember = members.find((member) => member.role === "CLIENT")
  const expertMember = members.find((member) => member.role === "EXPERT")

  const currentMember = isExpert ? expertMember : clientMember
  const partnerMember = isExpert ? clientMember : expertMember

  const realCurrentUser: ChatUser = {
    id: isExpert ? "expert-1" : "client-1",
    name: currentMember?.name ?? user?.fullName ?? "You",
    avatarUrl: getAvatarUrl(
      currentMember?.avatarUrl ?? user?.avatarUrl,
      currentMember?.name ?? user?.fullName ?? "You"
    ),
    role: isExpert ? "expert" : "client",
    status: "Online",
  }

  const realChatPartner: ChatUser = {
    id: isExpert ? "client-1" : "expert-1",
    name: partnerMember?.name ?? (isExpert ? "Client" : "Expert"),
    avatarUrl: getAvatarUrl(
      partnerMember?.avatarUrl,
      partnerMember?.name ?? (isExpert ? "Client" : "Expert")
    ),
    role: isExpert ? "client" : "expert",
    status: "Online",
  }

  return (
    <div className="relative min-h-screen bg-[#eaf3ff]">
      <div className="fixed inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-[#eef5ff] via-[#f7fbff] to-transparent" />

      <div className="fixed inset-x-0 top-0 z-10 h-24 bg-indigo-950/15 backdrop-blur-xl border-b border-white/20" />

      <Header />

      <main className="relative z-10 px-4 pb-6 pt-24">
        <div className="mx-auto mt-4 flex h-[calc(100vh-128px)] max-w-[1600px] gap-4 min-h-0">
          <section className="flex flex-1 max-w-[2000px] min-w-0 overflow-hidden rounded-2xl border border-white/70 bg-white/95 backdrop-blur-sm shadow-md transition-all">
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <ChatHeader user={realChatPartner} />

              <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-3">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">
                    {workspace?.projectName ?? "Loading project..."}
                  </span>

                  <span>Status: {workspace?.projectStatus ?? "-"}</span>

                  <span>Progress: {workspace?.progressPercentage ?? 0}%</span>
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
                      currentUser={realCurrentUser}
                      partner={realChatPartner}
                    />
                  ))}
                </div>
              </div>

              <ChatComposer />
            </div>

            <ChatProfilePanel user={realChatPartner} media={chatMedia} />
          </section>

          {isExpert && <ProjectSubmissionPanel workspaceId={workspaceId} />}

          {isClient && <ClientProjectSubmissionPanel workspaceId={workspaceId} />}
        </div>
      </main>
    </div>
  )
}