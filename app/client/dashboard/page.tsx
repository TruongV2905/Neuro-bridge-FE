"use client";

import { Briefcase, TrendingUp, MessageSquare, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const stats = [
  {
    title: "Active Projects",
    value: "3",
    change: "+1 this month",
    icon: Briefcase,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    title: "Total Proposals",
    value: "12",
    change: "+4 this week",
    icon: MessageSquare,
    color: "from-sky-500 to-blue-600",
    bgColor: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    title: "Saved Experts",
    value: "8",
    change: "2 new this week",
    icon: Star,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    title: "Success Rate",
    value: "94%",
    change: "+2% from last month",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

const recentProjects = [
  { id: 1, name: "AI Customer Support Chatbot", status: "In Progress", proposals: 5, budget: "$5K – $15K" },
  { id: 2, name: "Data Analytics Dashboard", status: "Reviewing", proposals: 3, budget: "$10K – $20K" },
  { id: 3, name: "Mobile App Redesign", status: "Completed", proposals: 8, budget: "$8K – $12K" },
];

export default function ClientDashboardPage() {
  return (
    <div className="min-h-screen bg-[#f6f1f1] p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0A0D17]">
          Welcome back, Client
        </h1>
        <p className="mt-1 text-slate-500">
          Here is what is happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="group relative overflow-hidden border-slate-200/70 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(15,23,42,0.12)]"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#0A0D17]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{stat.change}</p>
                </div>

                <div className={`${stat.bgColor} rounded-2xl p-3 transition-transform duration-300 group-hover:scale-110`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} strokeWidth={2} />
                </div>
              </div>

              <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${stat.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200/70 bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-6 py-5">
              <CardTitle className="text-base font-extrabold tracking-tight text-[#0A0D17]">
                Recent Projects
              </CardTitle>
              <Button
                variant="ghost"
                asChild
                className="h-8 rounded-xl px-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Link href="/client/dashboard/projects">View all</Link>
              </Button>
            </CardHeader>

            <CardContent className="divide-y divide-slate-100 px-0">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between px-6 py-4 transition-colors duration-200 hover:bg-slate-50/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#0A0D17]">
                      {project.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {project.proposals} proposals · {project.budget}
                    </p>
                  </div>

                  <span
                    className={`ml-4 shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      project.status === "In Progress"
                        ? "bg-blue-50 text-blue-600"
                        : project.status === "Reviewing"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="border-slate-200/70 bg-white">
            <CardHeader className="border-b border-slate-100 px-6 py-5">
              <CardTitle className="text-base font-extrabold tracking-tight text-[#0A0D17]">
                Quick Actions
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 p-6">
              <Button
                asChild
                className="w-full justify-start rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-6 text-sm font-bold text-white shadow-[0_8px_24px_rgba(99,102,241,0.3)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(99,102,241,0.4)] hover:from-indigo-600 hover:to-violet-600"
              >
                <Link href="/client/dashboard/create-job-post">
                  <Briefcase className="mr-3 h-5 w-5" />
                  Post a New Project
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card className="border-slate-200/70 bg-gradient-to-br from-indigo-50 to-violet-50/60">
            <CardHeader className="border-b border-indigo-100/50 px-6 py-5">
              <CardTitle className="text-base font-extrabold tracking-tight text-[#0A0D17]">
                Weekly Activity
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 p-6">
              {[
                { label: "Proposals received", value: 4, total: 12 },
                { label: "Projects updated", value: 2, total: 3 },
                { label: "Experts contacted", value: 1, total: 8 },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-bold text-[#0A0D17]">
                      {item.value}/{item.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/70">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      style={{ width: `${(item.value / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
