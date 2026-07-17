export type RatingRequest = {
  score: number;
  comment?: string;
};

export type RatingResponse = {
  id: string;
  projectId: string;
  clientId: string;
  expertId: string;
  score: number;
  comment?: string | null;
  createdAt: string;
};

export type ExpertRatingSummaryResponse = {
  expertId: string;
  averageScore: number;
  totalRatings: number;
};

export type RateProjectMutationVariables = {
  projectId: string;
  request: RatingRequest;
};
