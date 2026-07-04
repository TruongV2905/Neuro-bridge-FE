"use client";

import { Sidebar, SidebarInset, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/layout/client/Sidebar";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider collapsible="icon">
        <Sidebar>
          <AppSidebar />
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="flex items-center gap-2 p-4">
            <SidebarTrigger />
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
