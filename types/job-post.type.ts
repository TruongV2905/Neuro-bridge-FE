export type CreateJobPostStep = 1 | 2 | 3 | 4;

export type CreateJobPostFormValues = {
  title: string;
  description: string;
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
};

export type CreateJobPostPayload = {
  title: string;
  description: string;
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
};

export type JobPostAnalyzeResponse = {
  title: string;
  description: string;
  requiredSkillIds: number[];
  preferredSkillIds: number[];
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
};