import { WorkspaceProjectsListView } from "@/features/workspace"
import { UserRole } from "@/types/user/user.type"

export default function ExpertProjectsPage() {
  return <WorkspaceProjectsListView role={UserRole.EXPERT} />
}
