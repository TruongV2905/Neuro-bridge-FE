"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock4,
  DollarSign,
  Eye,
  EyeOff,
  ListChecks,
  Pencil,
  Save,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useGetClientJobPosts } from "@/services/job-post.service";
import type { JobPostListItem } from "@/types/job-post.type";
import {
  formatBudgetRange,
  formatCurrency,
  formatTimeline,
  getStatusMeta,
} from "./constants/myJobPost.constants";

type EditFormState = {
  title: string;
  description: string;
  requiredSkillIds: string;
  preferredSkillIds: string;
  budgetFrom: string;
  budgetTo: string;
  estimatedDays: string;
};

const FALLBACK_JOB_POSTS: JobPostListItem[] = [
  {
    id: "1",
    title: "AI Customer Support Chatbot",
    description:
      "Build a customer support assistant that can answer product questions, route complex cases, and summarize conversations for the support team.",
    requiredSkillIds: [1, 3, 7],
    preferredSkillIds: [9, 12],
    budgetFrom: 5000,
    budgetTo: 15000,
    estimatedDays: 21,
    status: "PUBLIC",
    expertApplyCodes: ["EXP-102", "EXP-204", "EXP-318"],
  },
  {
    id: "2",
    title: "Data Analytics Dashboard",
    description:
      "Create an internal analytics dashboard for business metrics, reporting workflows, and lightweight predictive insights.",
    requiredSkillIds: [2, 5, 8],
    preferredSkillIds: [11],
    budgetFrom: 10000,
    budgetTo: 20000,
    estimatedDays: 30,
    status: "PRIVATE",
    expertApplyCodes: ["EXP-406"],
  },
];

const EMPTY_JOB_POST: JobPostListItem = {
  id: "",
  title: "Untitled Jobpost",
  description:
    "This preview uses local state because a dedicated jobpost detail API is not wired yet.",
  requiredSkillIds: [],
  preferredSkillIds: [],
  budgetFrom: 0,
  budgetTo: 0,
  estimatedDays: 0,
  status: "PRIVATE",
  expertApplyCodes: [],
};

const listQueryParams = {
  page: 0,
  size: 100,
  sortBy: "createdAt",
  direction: "DESCENDING",
  search: undefined,
};

export function ClientJobPostDetailView() {
  const params = useParams<{ id?: string | string[] }>();
  const jobId = Array.isArray(params.id) ? params.id[0] : params.id ?? "";

  const { data, isLoading, isError, refetch } =
    useGetClientJobPosts(listQueryParams);

  const apiJob = useMemo(() => {
    const jobs = data?.result?.data ?? [];
    return jobs.find((job) => String(job.id) === String(jobId));
  }, [data?.result?.data, jobId]);

  const fallbackJob = useMemo(() => {
    return (
      FALLBACK_JOB_POSTS.find((job) => String(job.id) === String(jobId)) ?? {
        ...EMPTY_JOB_POST,
        id: jobId,
      }
    );
  }, [jobId]);

  const [job, setJob] = useState<JobPostListItem>(fallbackJob);
  const [isEditing, setIsEditing] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    setJob(apiJob ?? fallbackJob);
  }, [apiJob, fallbackJob]);

  const [form, setForm] = useState<EditFormState>(() =>
    buildFormState(fallbackJob),
  );

  useEffect(() => {
    if (!isEditing) {
      setForm(buildFormState(job));
    }
  }, [isEditing, job]);

  const statusMeta = getStatusMeta(job.status);
  const StatusIcon = statusMeta.icon;
  const applicants = job.expertApplyCodes?.length ?? 0;
  const isUsingFallback = !apiJob;

  const handleEdit = () => {
    setSavedMessage("");
    setForm(buildFormState(job));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm(buildFormState(job));
    setIsEditing(false);
  };

  const handleSave = () => {
    const nextJob = {
      ...job,
      title: form.title.trim() || job.title,
      description: form.description.trim() || job.description,
      requiredSkillIds: parseSkillIds(form.requiredSkillIds),
      preferredSkillIds: parseSkillIds(form.preferredSkillIds),
      budgetFrom: toPositiveNumber(form.budgetFrom),
      budgetTo: toPositiveNumber(form.budgetTo),
      estimatedDays: toPositiveNumber(form.estimatedDays),
    };

    // TODO: Replace this local state save with the jobpost update API when
    // the backend exposes a safe detail/update endpoint.
    setJob(nextJob);
    setIsEditing(false);
    setSavedMessage("Changes saved locally for this session.");
  };

  const handleTogglePublish = () => {
    if (job.status === "ASSIGNED") return;

    setJob((current) => ({
      ...current,
      status: current.status === "PUBLIC" ? "PRIVATE" : "PUBLIC",
    }));
    setSavedMessage(
      job.status === "PUBLIC"
        ? "Jobpost marked private locally."
        : "Jobpost published locally.",
    );
  };

  const handleArchive = () => {
    setIsArchived(true);
    setSavedMessage("Archive action is staged locally. No jobpost was deleted.");
  };

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Link
                href="/client/dashboard/my-job-post"
                className="transition hover:text-indigo-600"
              >
                My Job Posts
              </Link>
              <span>/</span>
              <span className="text-slate-800">Jobpost Detail</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0A0D17]">
              {job.title}
            </h1>
          </div>

          <Button
            variant="outline"
            asChild
            className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Link href="/client/dashboard/my-job-post">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Jobpost
            </Link>
          </Button>
        </div>

        <Card className="overflow-hidden rounded-3xl border-slate-200/70 bg-white shadow-sm shadow-slate-200/40">
          <div className={cn("h-1.5 bg-gradient-to-r", statusMeta.tone)} />
          <CardContent className="p-6 sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-7 rounded-full border px-3 text-[11px] font-bold uppercase tracking-wider",
                      statusMeta.pill,
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        statusMeta.dot,
                      )}
                    />
                    {statusMeta.label}
                  </Badge>
                  {isArchived && (
                    <Badge
                      variant="outline"
                      className="h-7 rounded-full border-amber-200 bg-amber-50 px-3 text-[11px] font-bold uppercase tracking-wider text-amber-600"
                    >
                      Archive staged
                    </Badge>
                  )}
                  {isUsingFallback && (
                    <Badge
                      variant="outline"
                      className="h-7 rounded-full border-violet-200 bg-violet-50 px-3 text-[11px] font-bold uppercase tracking-wider text-violet-600"
                    >
                      Preview data
                    </Badge>
                  )}
                </div>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
                  {job.description}
                </p>
              </div>

              <div className="grid min-w-full gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <SummaryMetric
                  icon={DollarSign}
                  label="Budget"
                  value={formatBudgetRange(job.budgetFrom, job.budgetTo)}
                />
                <SummaryMetric
                  icon={Clock4}
                  label="Timeline"
                  value={formatTimeline(job.estimatedDays)}
                />
                <SummaryMetric
                  icon={Users}
                  label="Applicants"
                  value={String(applicants)}
                  highlight
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    onClick={handleSave}
                    className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(99,102,241,0.28)] hover:from-indigo-600 hover:to-violet-600"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={handleEdit}
                  className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(99,102,241,0.28)] hover:from-indigo-600 hover:to-violet-600"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Jobpost
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                disabled={job.status === "ASSIGNED"}
                onClick={handleTogglePublish}
                className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                {job.status === "PUBLIC" ? (
                  <EyeOff className="mr-2 h-4 w-4 text-slate-500" />
                ) : (
                  <Eye className="mr-2 h-4 w-4 text-sky-500" />
                )}
                {job.status === "PUBLIC"
                  ? "Make Private"
                  : job.status === "ASSIGNED"
                    ? "Assigned"
                    : "Publish"}
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={handleArchive}
                disabled={isArchived}
                className="h-10 rounded-xl px-4 text-sm font-bold"
              >
                <Archive className="mr-2 h-4 w-4" />
                {isArchived ? "Archive Staged" : "Archive"}
              </Button>

              <Button
                variant="ghost"
                asChild
                className="h-10 rounded-xl px-4 text-sm font-bold text-slate-600 hover:bg-white/70 hover:text-slate-900"
              >
                <Link href="/client/dashboard/my-job-post">
                  Back to My Jobpost
                </Link>
              </Button>
            </div>

            {savedMessage && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {savedMessage}
              </div>
            )}

            {isError && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                <span>
                  Unable to load the jobpost list. Showing local preview data for
                  now.
                </span>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-amber-700"
                >
                  Retry
                </button>
              </div>
            )}

            {isLoading && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                Loading latest jobpost data...
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm shadow-slate-200/40">
            <CardHeader className="border-b border-slate-100 px-6 py-5">
              <CardTitle className="flex items-center gap-2 text-base font-extrabold tracking-tight text-[#0A0D17]">
                <ListChecks className="h-5 w-5 text-indigo-500" />
                {isEditing ? "Edit Overview" : "Overview"}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              {isEditing ? (
                <EditForm form={form} onChange={setForm} />
              ) : (
                <Overview job={job} statusLabel={statusMeta.label} />
              )}
            </CardContent>
          </Card>

          <aside className="space-y-6">
            <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm shadow-slate-200/40">
              <CardHeader className="border-b border-slate-100 px-6 py-5">
                <CardTitle className="text-base font-extrabold tracking-tight text-[#0A0D17]">
                  Jobpost Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-4",
                    statusMeta.pill,
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      statusMeta.iconBg,
                    )}
                  >
                    <StatusIcon
                      className={cn("h-5 w-5", statusMeta.iconColor)}
                    />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold">{statusMeta.label}</p>
                    <p className="text-xs font-medium opacity-80">
                      {statusMeta.description}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <SidebarStat
                    icon={Briefcase}
                    label="Budget From"
                    value={formatCurrency(job.budgetFrom)}
                  />
                  <SidebarStat
                    icon={Briefcase}
                    label="Budget To"
                    value={formatCurrency(job.budgetTo)}
                  />
                  <SidebarStat
                    icon={CalendarDays}
                    label="Estimated Days"
                    value={`${job.estimatedDays || 0} days`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200/70 bg-gradient-to-br from-indigo-50 to-violet-50/70 shadow-sm shadow-slate-200/40">
              <CardContent className="p-6">
                <p className="text-sm font-extrabold text-[#0A0D17]">
                  Workspace Tabs
                </p>
                <div className="mt-4 grid gap-2">
                  {["Overview", "Applicants", "Proposals", "Activity"].map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        disabled={item !== "Overview"}
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm font-bold transition",
                          item === "Overview"
                            ? "border-indigo-200 bg-white text-indigo-600 shadow-sm"
                            : "border-white/70 bg-white/50 text-slate-400",
                        )}
                      >
                        {item}
                        {item === "Overview" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <span className="text-[10px] uppercase tracking-wider">
                            Soon
                          </span>
                        )}
                      </button>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Overview({
  job,
  statusLabel,
}: {
  job: JobPostListItem;
  statusLabel: string;
}) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
          Description
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {job.description}
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <InfoBlock title="Required Skills">
          <SkillList ids={job.requiredSkillIds} tone="indigo" />
        </InfoBlock>
        <InfoBlock title="Preferred Skills">
          <SkillList ids={job.preferredSkillIds} tone="violet" />
        </InfoBlock>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DetailTile label="Budget From" value={formatCurrency(job.budgetFrom)} />
        <DetailTile label="Budget To" value={formatCurrency(job.budgetTo)} />
        <DetailTile
          label="Estimated Days"
          value={`${job.estimatedDays || 0} days`}
        />
        <DetailTile label="Status" value={statusLabel} />
      </div>
    </div>
  );
}

function EditForm({
  form,
  onChange,
}: {
  form: EditFormState;
  onChange: React.Dispatch<React.SetStateAction<EditFormState>>;
}) {
  const setField = (field: keyof EditFormState, value: string) => {
    onChange((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-5">
      <Field label="Title" htmlFor="title">
        <Input
          id="title"
          value={form.title}
          onChange={(event) => setField("title", event.target.value)}
          className="h-11 rounded-xl border-slate-200 bg-white px-4 text-sm"
        />
      </Field>

      <Field label="Description" htmlFor="description">
        <Textarea
          id="description"
          value={form.description}
          onChange={(event) => setField("description", event.target.value)}
          className="min-h-36 rounded-xl border-slate-200 bg-white px-4 py-3 text-sm leading-6"
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Required skills" htmlFor="requiredSkillIds">
          <Input
            id="requiredSkillIds"
            value={form.requiredSkillIds}
            onChange={(event) =>
              setField("requiredSkillIds", event.target.value)
            }
            placeholder="Example: 1, 3, 7"
            className="h-11 rounded-xl border-slate-200 bg-white px-4 text-sm"
          />
        </Field>
        <Field label="Preferred skills" htmlFor="preferredSkillIds">
          <Input
            id="preferredSkillIds"
            value={form.preferredSkillIds}
            onChange={(event) =>
              setField("preferredSkillIds", event.target.value)
            }
            placeholder="Example: 9, 12"
            className="h-11 rounded-xl border-slate-200 bg-white px-4 text-sm"
          />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Budget from" htmlFor="budgetFrom">
          <Input
            id="budgetFrom"
            type="number"
            value={form.budgetFrom}
            onChange={(event) => setField("budgetFrom", event.target.value)}
            className="h-11 rounded-xl border-slate-200 bg-white px-4 text-sm"
          />
        </Field>
        <Field label="Budget to" htmlFor="budgetTo">
          <Input
            id="budgetTo"
            type="number"
            value={form.budgetTo}
            onChange={(event) => setField("budgetTo", event.target.value)}
            className="h-11 rounded-xl border-slate-200 bg-white px-4 text-sm"
          />
        </Field>
        <Field label="Estimated days" htmlFor="estimatedDays">
          <Input
            id="estimatedDays"
            type="number"
            value={form.estimatedDays}
            onChange={(event) => setField("estimatedDays", event.target.value)}
            className="h-11 rounded-xl border-slate-200 bg-white px-4 text-sm"
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-bold text-slate-700">
        {label}
      </Label>
      {children}
    </div>
  );
}

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SkillList({
  ids,
  tone,
}: {
  ids: number[];
  tone: "indigo" | "violet";
}) {
  if (!ids.length) {
    return <p className="text-sm text-slate-400">No skills selected.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ids.map((id) => (
        <Badge
          key={`${tone}-${id}`}
          variant="outline"
          className={cn(
            "h-7 rounded-lg px-2.5 text-xs font-bold",
            tone === "indigo"
              ? "border-indigo-200 bg-indigo-50 text-indigo-600"
              : "border-violet-200 bg-violet-50 text-violet-600",
          )}
        >
          <Sparkles className="h-3 w-3" />
          Skill #{id}
        </Badge>
      ))}
    </div>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function SummaryMetric({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p
        className={cn(
          "mt-2 truncate text-sm font-extrabold",
          highlight ? "text-indigo-600" : "text-slate-900",
        )}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function SidebarStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <span className="text-sm font-extrabold text-slate-900">{value}</span>
    </div>
  );
}

function buildFormState(job: JobPostListItem): EditFormState {
  return {
    title: job.title,
    description: job.description,
    requiredSkillIds: job.requiredSkillIds.join(", "),
    preferredSkillIds: job.preferredSkillIds.join(", "),
    budgetFrom: String(job.budgetFrom),
    budgetTo: String(job.budgetTo),
    estimatedDays: String(job.estimatedDays),
  };
}

function parseSkillIds(value: string) {
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);
}

function toPositiveNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}
