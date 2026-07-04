"use client";

import { Users, Briefcase, Cpu, LineChart, Settings, HelpCircle, FolderOpen, FileText } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar/Sidebar";
import type { NavSection } from "@/components/layout/sidebar/Sidebar";

const ADMIN_NAV: NavSection[] = [
  {
    category: "MAIN NAVIGATION",
    items: [
      { title: "Analytics", href: "#", icon: LineChart },
    ],
  },
  {
    category: "MANAGEMENT",
    items: [
      { title: "Projects", href: "#", icon: FolderOpen },
      { title: "Manage User", href: "/dashboard/users", icon: Users },
      { title: "Jobpost", href: "#", icon: FileText },
      { title: "Services", href: "#", icon: Cpu },
    ],
  },
  {
    category: "SETTINGS",
    items: [
      { title: "Settings", href: "#", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  return (
    <Sidebar
      navItems={ADMIN_NAV}
      footerItems={[
        { title: "Settings", href: "#", icon: Settings },
        { title: "Support Center", href: "#", icon: HelpCircle },
      ]}
      variant="dark"
      className="w-[250px]"
      header={
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl shadow-inner border border-white/30">
            A
          </div>
          <div>
            <p className="text-sm text-white/80 font-medium">Welcome back</p>
            <h2 className="text-xl font-bold text-white">Administrator</h2>
            <div className="flex items-center gap-2 mt-1 px-2 py-0.5 rounded-full bg-black/20 border border-white/20 w-fit backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-[#34C759] shadow-[0_0_8px_#34C759]" />
              <span className="text-xs text-[#34C759] font-semibold tracking-wide">System Online</span>
            </div>
          </div>
        </div>
      }
    />
  );
}
