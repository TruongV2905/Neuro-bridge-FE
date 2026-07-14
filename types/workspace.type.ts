export type WorkspaceParticipant = {
  userId: string;
  name: string;
  avatarUrl: string | null;
};

export type WorkspaceDetail = {
  workspaceId: string;
  jobId: string;
  escrowId: string;
  status: string;
  createdAt: string;
  client: WorkspaceParticipant;
  expert: WorkspaceParticipant;
  projectName: string;
  deadline: string;
  startDate: string;
  projectStatus: string;
  progressPercentage: number;
};

export type WorkspaceDashboardPartner = {
  name: string;
  avatarUrl: string | null;
  role: string;
};

export type WorkspaceDashboardItem = {
  workspaceId: string;
  projectName: string;
  projectStatus: string;
  progressPercentage: number;
  deadline: string | null;
  partner: WorkspaceDashboardPartner;
};

export type WorkspaceDashboardPage = {
  content: WorkspaceDashboardItem[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type WorkspaceMember = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  role: string;
};
