import { JobPostStatus } from "@/types/job-post.type";
import {
  CalendarDays,
  CircleDollarSign,
  Eye,
  EyeOff,
  Hourglass,
  Rocket,
  XCircle,
  CheckCircle2,
  LucideIcon,
} from "lucide-react";

export const PAGE_SIZE_OPTIONS = [6, 9, 12, 18] as const;

export const DEFAULT_PAGE = 0;
export const DEFAULT_SIZE = 9;
export const DEFAULT_SORT_BY = "createdAt";
export const DEFAULT_DIRECTION = "ASCENDING" as const;

export type SortOption = {
  value: string;
  label: string;
};

export const SORT_OPTIONS: SortOption[] = [
  { value: "createdAt", label: "Newest first" },
  { value: "title", label: "Title (A–Z)" },
  { value: "budgetFrom", label: "Budget (low–high)" },
  { value: "budgetTo", label: "Budget (high–low)" },
  { value: "estimatedDays", label: "Timeline (short–long)" },
];

export type StatusMeta = {
  value: JobPostStatus;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  pill: string;
  dot: string;
  iconBg: string;
  iconColor: string;
};

export const JOB_POST_STATUS_META: StatusMeta[] = [
  {
    value: "PUBLIC",
    label: "Public",
    description: "Anyone can discover this listing",
    icon: Eye,
    tone: "from-sky-500/15 to-sky-500/5 ring-sky-200",
    pill: "bg-sky-50 text-sky-600 border-sky-200",
    dot: "bg-sky-500",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
  },
  {
    value: "PRIVATE",
    label: "Private",
    description: "Visible to invited experts only",
    icon: EyeOff,
    tone: "from-slate-500/15 to-slate-500/5 ring-slate-200",
    pill: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-500",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },

  {
    value: "ASSIGNED",
    label: "Completed",
    description: "Project finished successfully",
    icon: CheckCircle2,
    tone: "from-emerald-500/15 to-emerald-500/5 ring-emerald-200",
    pill: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dot: "bg-emerald-500",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
];

export const STATUS_META_MAP: Record<JobPostStatus, StatusMeta> =
  JOB_POST_STATUS_META.reduce(
    (acc, item) => {
      acc[item.value] = item;
      return acc;
    },
    {} as Record<JobPostStatus, StatusMeta>,
  );

export const getStatusMeta = (status: JobPostStatus): StatusMeta =>
  STATUS_META_MAP[status] ?? JOB_POST_STATUS_META[0];

export const DEFAULT_FILTER = {
  requiredSkillIds: [],
  preferredSkillIds: [],
  minBudget: 0,
  maxBudget: 0,
  estimatedDaysFrom: 0,
  estimatedDaysTo: 0,
  status: "PUBLIC" as JobPostStatus,
};

export const BUDGET_PRESETS = [
  { value: 1000, label: "$1K" },
  { value: 5000, label: "$5K" },
  { value: 10000, label: "$10K" },
  { value: 25000, label: "$25K" },
  { value: 50000, label: "$50K" },
];

export const TIMELINE_PRESETS = [
  { value: 7, label: "1 week" },
  { value: 14, label: "2 weeks" },
  { value: 30, label: "1 month" },
  { value: 60, label: "2 months" },
  { value: 90, label: "3 months" },
];

export const formatCurrency = (value: number): string => {
  if (!value || value <= 0) return "$0";
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  }
  return `$${value}`;
};

export const formatBudgetRange = (from: number, to: number): string => {
  return `${formatCurrency(from)} – ${formatCurrency(to)}`;
};

export const formatTimeline = (days: number): string => {
  if (!days || days <= 0) return "Flexible";
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.round(days / 7)} week${days >= 14 ? "s" : ""}`;
  const months = Math.round(days / 30);
  return `${months} month${months > 1 ? "s" : ""}`;
};

export const metadataIcons = {
  budget: CircleDollarSign,
  timeline: CalendarDays,
};
