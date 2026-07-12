import { WorkspaceDetailView } from "@/features/workspace"

type ExpertWorkspaceDetailPageProps = {
  params: Promise<{
    workspaceId: string
  }>
}

export default async function ExpertWorkspaceDetailPage({
  params,
}: ExpertWorkspaceDetailPageProps) {
  const { workspaceId } = await params

  return <WorkspaceDetailView workspaceId={workspaceId} />
}
