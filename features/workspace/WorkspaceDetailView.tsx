"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, CalendarDays, FolderKanban, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceDetail } from "@/services/workspace.service";
import type { WorkspaceParticipant } from "@/types/workspace.type";

type WorkspaceRole = "CLIENT" | "EXPERT";

export function WorkspaceDetailView({ workspaceId, role = "EXPERT" }: { workspaceId: string; role?: WorkspaceRole }) {
  const workspaceQuery = useWorkspaceDetail(workspaceId);
  const workspace = workspaceQuery.data;

  if (workspaceQuery.isLoading) return <LoadingState />;
  if (workspaceQuery.isError || !workspace) return <PageShell><StatePanel title="Unable to load workspace" message={getErrorMessage(workspaceQuery.error)} projectsHref={`/${role.toLowerCase()}/dashboard/projects`} retry={workspaceQuery.isError ? () => workspaceQuery.refetch() : undefined} /></PageShell>;

  return <PageShell>
    <Link href={`/${role.toLowerCase()}/dashboard/projects`} className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800"><ArrowLeft className="h-4 w-4" /> Back to projects</Link>
    <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Workspace</p><h1 className="mt-2 text-3xl font-extrabold text-slate-950">{workspace.projectName || "Untitled project"}</h1><div className="mt-4 flex flex-wrap gap-2"><StatusBadge value={workspace.status} /><StatusBadge value={workspace.projectStatus} /></div></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><Metric icon={CalendarDays} label="Start" value={formatDate(workspace.startDate)} /><Metric icon={CalendarDays} label="Deadline" value={formatDate(workspace.deadline)} /><Metric icon={FolderKanban} label="Progress" value={`${clamp(workspace.progressPercentage)}%`} /></div></div>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${clamp(workspace.progressPercentage)}%` }} /></div>
    </section>
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-indigo-600" /><h2 className="text-lg font-extrabold text-slate-950">Workspace members</h2></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Member participant={workspace.client} role="Client" /><Member participant={workspace.expert} role="Expert" /></div></section>
    <section className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"><Field label="Workspace reference" value={workspace.workspaceId} /><Field label="Job reference" value={workspace.jobId} /><Field label="Escrow reference" value={workspace.escrowId} /><Field label="Created" value={formatDate(workspace.createdAt)} /></section>
  </PageShell>;
}

function PageShell({ children }: { children: React.ReactNode }) { return <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10"><div className="mx-auto max-w-7xl">{children}</div></main>; }
function LoadingState() { return <PageShell><Skeleton className="h-8 w-36" /><Skeleton className="mt-5 h-72 rounded-3xl" /><Skeleton className="mt-6 h-56 rounded-3xl" /></PageShell>; }
function StatePanel({ title, message, projectsHref, retry }: { title: string; message: string; projectsHref: string; retry?: () => void }) { return <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><AlertTriangle className="mx-auto h-7 w-7 text-amber-600" /><h1 className="mt-4 text-xl font-extrabold text-slate-950">{title}</h1><p className="mt-2 text-sm text-slate-500">{message}</p><div className="mt-5 flex justify-center gap-3"><Button asChild variant="outline"><Link href={projectsHref}>Back to projects</Link></Button>{retry && <Button onClick={retry} className="bg-indigo-600 text-white hover:bg-indigo-700">Retry</Button>}</div></section>; }
function Member({ participant, role }: { participant: WorkspaceParticipant; role: string }) { const name = participant?.name?.trim() || "Unknown member"; return <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><Avatar className="h-11 w-11">{participant?.avatarUrl && <AvatarImage src={participant.avatarUrl} alt={name} />}<AvatarFallback>{getInitials(name)}</AvatarFallback></Avatar><div><p className="font-extrabold text-slate-950">{name}</p><p className="text-sm font-semibold text-slate-500">{role}</p></div></div>; }
function Metric({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) { return <div className="rounded-2xl bg-slate-50 p-3"><div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-400"><Icon className="h-3.5 w-3.5" />{label}</div><p className="mt-2 text-sm font-extrabold text-slate-950">{value}</p></div>; }
function StatusBadge({ value }: { value?: string | null }) { return <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{formatLabel(value)}</span>; }
function Field({ label, value }: { label: string; value?: string | null }) { return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 break-all text-sm font-extrabold text-slate-950">{value?.trim() || "Not available"}</p></div>; }
function clamp(value: number) { return Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 0; }
function formatLabel(value?: string | null) { return value?.trim().replace(/[_-]+/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Unknown"; }
function formatDate(value?: string | null) { const date = value ? new Date(value) : null; return date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(date) : "Not available"; }
function getInitials(value: string) { return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "NB"; }
function getErrorMessage(error: unknown) { const apiError = error as { response?: { data?: { message?: string } }; message?: string } | undefined; return apiError?.response?.data?.message || apiError?.message || "The workspace could not be loaded. Please try again."; }
