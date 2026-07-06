import { PageRequest } from "./common.starter";

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
export type JobPostStatus =
  | "PRIVATE"
  | "PUBLIC"
  | "ASSIGNED";

export type JobPostDirection = "ASCENDING" | "DESCENDING";

export type JobPostFilter = {
  requiredSkillIds: number[];
  preferredSkillIds: number[];
  minBudget: number;
  maxBudget: number;
  estimatedDaysFrom: number;
  estimatedDaysTo: number;
  status: JobPostStatus;
};

export type JobPostClientListRequest = {
  page: number;
  size: number;
  sortBy: string;
  direction: JobPostDirection;
  search: string;
  filter: JobPostFilter;
};

export type JobPostListItem = {
  id: string;
  title: string;
  description: string;
  requiredSkillIds: number[];
  preferredSkillIds: number[];
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
  status: JobPostStatus;
  expertApplyCodes: string[];
};

export type JobPostClientListParams = PageRequest & {
  filter: JobPostFilter;
};

export type JobPostAnalyzeRequest = {
  title: string;
  description: string;
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
};

export type RecommendExpertsRequest = JobPostAnalyzeRequest & {
  requiredSkillIds: number[];
  preferredSkillIds: number[];
};