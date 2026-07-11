import type { JobPostStatus } from "@/types/job-post.type";

export const formatCurrency = (value: number): string => {
  if (!value || value <= 0) return "$0";

  if (value >= 1000) {
    return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  }

  return `$${value}`;
};

export const formatBudgetRange = (from: number, to: number): string => {
  if (!from && !to) return "Budget flexible";
  if (!to || to <= 0) return `From ${formatCurrency(from)}`;
  if (!from || from <= 0) return `Up to ${formatCurrency(to)}`;

  return `${formatCurrency(from)} - ${formatCurrency(to)}`;
};

export const formatTimeline = (days: number): string => {
  if (!days || days <= 0) return "Flexible";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""}`;
  }

  const months = Math.round(days / 30);
  return `${months} month${months > 1 ? "s" : ""}`;
};

export const getStatusLabel = (status: JobPostStatus): string => {
  switch (status) {
    case "PUBLIC":
      return "Public";
    case "PRIVATE":
      return "Private";
    case "ASSIGNED":
      return "Assigned";
    default:
      return status;
  }
};

export const getStatusTone = (status: JobPostStatus): string => {
  switch (status) {
    case "PUBLIC":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "PRIVATE":
      return "border-slate-200 bg-slate-100 text-slate-600";
    case "ASSIGNED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
};

export const getSkillLabel = (id: number): string => `Skill #${id}`;
