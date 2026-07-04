import api from "@/configs/api"

export type WorkspaceMemberRole = "CLIENT" | "EXPERT"

export type WorkspaceMember = {
  userId: string
  name: string
  avatarUrl: string | null
  role: WorkspaceMemberRole
}

type WorkspaceMembersResponse = {
  result: WorkspaceMember[]
}

export async function getWorkspaceMembers(workspaceId: string) {
  const { data } = await api.get<WorkspaceMembersResponse>(
    `/workspace/api/v1/workspace-members/workspace/${workspaceId}`
  )
  return data.result
}
