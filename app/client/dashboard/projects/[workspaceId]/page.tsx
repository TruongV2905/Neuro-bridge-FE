import { WorkspaceDetailView } from "@/features/workspace";

export default async function ClientWorkspaceDetailPage({
  params,
}: PageProps<"/client/dashboard/projects/[workspaceId]">) {
  const { workspaceId } = await params;

  return <WorkspaceDetailView workspaceId={workspaceId} role="CLIENT" />;
}
