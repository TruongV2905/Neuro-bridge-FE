import { WorkspaceProjectsListView } from "@/features/workspace"
import { UserRole } from "@/types/user/user.type"

export default function ClientProjectsPage() {
  return <WorkspaceProjectsListView role={UserRole.CLIENT} />
}
