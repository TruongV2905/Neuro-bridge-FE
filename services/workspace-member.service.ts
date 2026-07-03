export type WorkspaceMemberRole = "CLIENT" | "EXPERT"

export type WorkspaceMember = {
  userId: string
  name: string
  avatarUrl: string | null
  role: WorkspaceMemberRole
}

export async function getWorkspaceMembers(workspaceId: string) {
  const accessToken = localStorage.getItem("accessToken")

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/api/v1/workspace-members/workspace/${workspaceId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Get workspace members failed")
  }

  const data = await response.json()

  return data.result as WorkspaceMember[]
}