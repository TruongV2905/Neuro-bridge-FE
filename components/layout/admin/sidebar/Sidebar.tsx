"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { 
  Users, 
  Briefcase, 
  Cpu, 
  LineChart, 
  Settings,
  HelpCircle,
  FolderOpen,
  FileText
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Dữ liệu điều hướng
const adminNavItems = [
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
];

export function AdminSidebar() {
  const pathname = usePathname(); // Lấy URL path hiện tại

  return (
    <aside 
      className="flex flex-col w-[250px] h-[981px] pt-[11px] gap-[10px] shrink-0 border-r border-white/10 backdrop-blur-xl shadow-2xl bg-gradient-to-b from-[#232A6B] to-[#4A1557]"
    >
      {/* Brand / Admin Profile Section */}
      <div className="px-6 py-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl shadow-inner border border-white/30">
          A
        </div>
        <div>
          <p className="text-sm text-white/80 font-medium">Welcome back</p>
          <h2 className="text-xl font-bold text-white">Administrator</h2>
          <div className="flex items-center gap-2 mt-1 px-2 py-0.5 rounded-full bg-black/20 border border-white/20 w-fit backdrop-blur-sm">
             <div className="w-2 h-2 rounded-full bg-[#34C759] shadow-[0_0_8px_#34C759]"></div>
             <span className="text-xs text-[#34C759] font-semibold tracking-wide">System Online</span>
          </div>
        </div>
      </div>

      <Separator className="bg-white/20 mx-6 w-auto" />

      {/* Navigation Links using Shadcn ScrollArea */}
      <ScrollArea className="flex-1 w-full px-4">
        <div className="space-y-6 py-4">
          {adminNavItems.map((section, idx) => (
            <div key={idx} className="px-2">
              <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-white/70">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, itemIdx) => {
                  // Xử lý logic Active:
                  // Nếu href khác "#" và pathname bắt đầu bằng href (để bao gồm cả các trang con như /users/1)
                  const isActive = item.href !== "#" && pathname?.startsWith(item.href);

                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                        isActive 
                          ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-md" // Style khi Active
                          : "text-white/90 hover:bg-white/20 hover:text-white hover:shadow-sm" // Style khi Không Active
                      }`}
                    >
                      <item.icon 
                        className={`w-5 h-5 transition-colors ${
                          isActive ? "text-white" : "text-white/70 group-hover:text-white"
                        }`} 
                      />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Navigation (Settings & Support) */}
      <div className="p-4 mt-auto space-y-2 px-6 pb-8">
        <Separator className="bg-white/20 mb-4" />
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 transition-all duration-300 hover:bg-white/20 hover:text-white"
        >
          <Settings className="w-5 h-5 text-white/70" />
          <span className="font-medium">Settings</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 transition-all duration-300 hover:bg-white/20 hover:text-white"
        >
          <HelpCircle className="w-5 h-5 text-white/70" />
          <span className="font-medium">Support Center</span>
        </Link>
      </div>
    </aside>
  );
}