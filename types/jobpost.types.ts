import { PageRequest } from "./common.starter";

export enum JobPostStatus {
  PRIVATE = "PRIVATE",
  PUBLIC = "PUBLIC",
  ASSIGNED = "ASSIGNED",
}

export interface JobPostResponse {
  id: string;
  title: string;
  description: string;
  requiredSkillIds?: number[];
  preferredSkillIds?: number[];
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
  status: JobPostStatus;
  expertApplyCodes?: string[];
}

export interface JobPostRequest {
  title: string;
  description: string;
  requiredSkillIds?: number[];
  preferredSkillIds?: number[];
  budgetFrom: number;
  budgetTo: number;
  estimatedDays: number;
}

export interface SubJobPostFilterRequest {
  creatorCode?: string;
  requiredSkillIds?: number[];
  preferredSkillIds?: number[];
  minBudget?: number;
  maxBudget?: number;
  estimatedDaysFrom?: number;
  estimatedDaysTo?: number;
  status?: JobPostStatus;
}

export type JobPostFilterRequest = Partial<PageRequest> & {
  filter?: SubJobPostFilterRequest;
};
