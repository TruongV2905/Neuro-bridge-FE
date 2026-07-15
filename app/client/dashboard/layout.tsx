"use client";

import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { WorkspaceSideBar } from "@/components/layout/ClientSideBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <WorkspaceSideBar role="CLIENT" />
        <SidebarInset>
          <DashboardHeader />
          <main className="min-h-[calc(100dvh-4rem)] bg-background">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
