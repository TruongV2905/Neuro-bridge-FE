import type { JobPostDirection, JobPostStatus } from "@/types/job-post.type";

export const HIRING_PAGE_SIZE = 8;
export const HIRING_DEFAULT_PAGE = 0;
export const HIRING_DEFAULT_SORT_BY = "createdAt";
export const HIRING_DEFAULT_DIRECTION: JobPostDirection = "ASCENDING";
export const HIRING_DEFAULT_STATUS: JobPostStatus = "PUBLIC";

export const HIRING_STATUS_OPTIONS: Array<{
  value: JobPostStatus;
  label: string;
  description: string;
}> = [
  {
    value: "PUBLIC",
    label: "Ready to hire",
    description: "Published jobposts that can still receive a hire decision.",
  },
  {
    value: "ASSIGNED",
    label: "Hired",
    description: "Jobposts that already have a hired expert.",
  },
];
