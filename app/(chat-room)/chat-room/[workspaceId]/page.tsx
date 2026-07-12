import { WorkspaceDetailView } from "@/features/workspace"

type WorkspaceDetailPageProps = {
  params: Promise<{
    workspaceId: string
  }>
}

export default async function WorkspaceDetailPage({
  params,
}: WorkspaceDetailPageProps) {
  const { workspaceId } = await params

  return <WorkspaceDetailView workspaceId={workspaceId} />
}
