import { WorkspaceDetailView } from "@/features/workspace"

type ClientWorkspaceDetailPageProps = {
  params: Promise<{
    workspaceId: string
  }>
}

export default async function ClientWorkspaceDetailPage({
  params,
}: ClientWorkspaceDetailPageProps) {
  const { workspaceId } = await params

  return <WorkspaceDetailView workspaceId={workspaceId} />
}
