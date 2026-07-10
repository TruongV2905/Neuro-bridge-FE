"use client"

import { useParams } from "next/navigation"

import { WorkspaceChatRoomView } from "@/features/workspace"

export default function ChatRoomPage() {
  const params = useParams<{ workspaceId?: string | string[] }>()
  const workspaceId = Array.isArray(params.workspaceId)
    ? params.workspaceId[0]
    : params.workspaceId ?? ""

  return <WorkspaceChatRoomView workspaceId={workspaceId} />
}
