import { WorkspaceDetailView } from "@/features/workspace";

export default async function ExpertWorkspaceDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return <WorkspaceDetailView workspaceId={workspaceId} />;
}
