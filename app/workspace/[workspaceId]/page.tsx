import { WorkspaceDetailView } from "@/features/workspace";

type WorkspacePageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;

  return <WorkspaceDetailView workspaceId={workspaceId} role="CLIENT" />;
}
