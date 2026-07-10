import { useQuery } from "@tanstack/react-query"

export type WorkspaceMember = {
  userId: string
  name: string
  avatarUrl: string
}

export type WorkspaceDetail = {
  workspaceId: string
  jobId: string
  escrowId: string
  status: string
  createdAt: string
  client: WorkspaceMember
  expert: WorkspaceMember
  projectName: string
  deadline: string
  startDate: string
  projectStatus: string
  progressPercentage: number
}

export async function getWorkspaceDetail(workspaceId: string) {
  const accessToken = localStorage.getItem("accessToken")

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/api/v1/workspaces/${workspaceId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Get workspace detail failed")
  }

  return response.json() as Promise<WorkspaceDetail>
}

export function useWorkspaceDetail(workspaceId?: string) {
  return useQuery({
    queryKey: ["workspace-detail", workspaceId],
    queryFn: () => getWorkspaceDetail(workspaceId as string),
    enabled: !!workspaceId,
  })
}