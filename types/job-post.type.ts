export type CreateJobPostStep = 1 | 2 | 3 | 4;

export type CreateJobPostFormValues = {
  projectTitle: string;
  businessGoal: string;
  description: string;
};

export type CreateJobPostPayload = {
  title: string;
  businessGoal: string;
  description: string;
  category: string;
  requiredSkills: string[];
  budgetFrom: number;
  budgetTo: number;
  timeline: string;
};