import { useQuery } from "@tanstack/react-query"
import api from "@/configs/api"

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
  const { data } = await api.get<WorkspaceDetail>(
    `/workspace/api/v1/workspaces/${workspaceId}`
  )
  return data
}

export function useWorkspaceDetail(workspaceId?: string) {
  return useQuery({
    queryKey: ["workspace-detail", workspaceId],
    queryFn: () => getWorkspaceDetail(workspaceId as string),
    enabled: !!workspaceId,
  })
}
