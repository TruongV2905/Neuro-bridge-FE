"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; 
import {
  Users,
  Cpu,
  LayoutDashboard,
  Settings,
  FolderOpen,
  LogOut,
  ShieldCheck,
  Activity,
  FileCheck2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const adminNavItems = [
  {
    category: "MAIN NAVIGATION",
    items: [
      { title: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    category: "MANAGEMENT",
    items: [
      { title: "Manage Users", href: "/admin/dashboard/users", icon: Users }, 
      { title: "Skills & Categories", href: "/admin/dashboard/skills", icon: Cpu },
      { title: "Projects & Workspaces", href: "/admin/dashboard/projects", icon: FolderOpen },
    ],
  },
  {
    category: "SYSTEM",
    items: [
      { title: "Settings", href: "/admin/dashboard/settings", icon: Settings },
      { title: "Back to Home", href: "/", icon: LogOut },
    ],
  }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside 
      className="flex flex-col w-[260px] h-screen shrink-0 border-r border-white/10 backdrop-blur-xl shadow-2xl bg-gradient-to-b from-[#232A6B] to-[#4A1557]"
    >
      {/* Brand / Admin Profile Section */}
      <div className="px-6 py-5 flex items-center gap-4 border-b border-white/10">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-extrabold text-xl shadow-inner border border-white/30">
          A
        </div>
        <div>
          <p className="text-xs text-white/70 font-semibold uppercase tracking-wider">VIAA System</p>
          <h2 className="text-lg font-extrabold text-white">Administrator</h2>
          <div className="flex items-center gap-2 mt-1 px-2 py-0.5 rounded-full bg-black/20 border border-white/20 w-fit backdrop-blur-sm">
             <div className="w-2 h-2 rounded-full bg-[#34C759] shadow-[0_0_8px_#34C759]"></div>
             <span className="text-[11px] text-[#34C759] font-semibold tracking-wide">System Online</span>
          </div>
        </div>
      </div>

      {/* Navigation Links using Shadcn ScrollArea */}
      <ScrollArea className="flex-1 w-full px-4 py-4">
        <div className="space-y-6">
          {adminNavItems.map((section, idx) => (
            <div key={idx} className="px-1">
              <h3 className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-white/60">
                {section.category}
              </h3>
              <div className="space-y-1.5">
                {section.items.map((item, itemIdx) => {
                  const isActive =
                    item.href === "/admin/dashboard"
                      ? pathname === "/admin/dashboard" || pathname === "/admin/dashboard/overview"
                      : item.href !== "#" && item.href !== "/" && pathname?.startsWith(item.href);

                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        isActive 
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-900/40" 
                          : "text-white/80 hover:bg-white/10 hover:text-white" 
                      }`}
                    >
                      <item.icon 
                        className={`w-4 h-4 transition-colors ${
                          isActive ? "text-white" : "text-white/60 group-hover:text-white"
                        }`} 
                      />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Navigation (Settings & Support) */}
      <div className="p-4 mt-auto border-t border-white/10 px-6">
        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="w-4 h-4 text-white/60" />
          <span>Exit to Website</span>
        </Link>
      </div>
    </aside>
  );
}
