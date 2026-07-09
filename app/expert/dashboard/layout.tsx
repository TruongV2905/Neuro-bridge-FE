"use client";

import { WorkspaceSideBar } from "@/components/layout/ClientSideBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BellIcon } from "lucide-react"; // import { AppSidebar } from "@/components/layout/client/Sidebar";

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
        <WorkspaceSideBar role="EXPERT" />
        <SidebarInset>
          <header className="sticky top-0 z-100 flex h-[7vh] min-h-16 items-center justify-between bg-background px-6 border border-b-2">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-11 w-11 rounded-full"
              >
                <BellIcon className="!h-6 !w-6" />

                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-red-500" />
              </Button>

              <Avatar className="h-11 w-11">
                <AvatarImage src="/avatars/shadcn.jpg" alt="Client" />
                <AvatarFallback>CL</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="min-h-[93vh]  bg-background">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}