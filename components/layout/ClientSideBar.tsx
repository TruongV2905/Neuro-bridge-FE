"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BriefcaseIcon,
  FileTextIcon,
  FolderIcon,
  HomeIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  SearchIcon,
} from "lucide-react";
import { NavMain } from "../nav-main";

const USER_ROUTE = "/client/dashboard";

const data = {
  user: {
    name: "Client",
    email: "client@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navMain: [
    {
      title: "Dashboard",
      url: USER_ROUTE,
      icon: LayoutDashboardIcon,
    },
    {
      title: "My Jobpost",
      url: `${USER_ROUTE}/my-job-post`,
      icon: BriefcaseIcon,
    },
    {
      title: "Browse Jobpost",
      url: `${USER_ROUTE}/browse-job-posts`,
      icon: SearchIcon,
    },
    {
      title: "Messages",
      url: `${USER_ROUTE}/messages`,
      icon: MessageSquareIcon,
    },
    {
      title: "Project",
      url: `${USER_ROUTE}/projects`,
      icon: FolderIcon,
    },
    {
      title: "Report",
      url: `${USER_ROUTE}/reports`,
      icon: FileTextIcon,
    },
  ],
};

export function ClientSideBar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-white/10 px-4 py-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-0! group/logo h-auto rounded-2xl hover:bg-white/10"
            >
              <div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                  <Image
                    src="/img/Logo.png"
                    alt="Neuro Bridge Logo"
                    width={24}
                    height={24}
                    className="h-6 w-6 object-contain"
                    quality={100}
                    priority
                  />
                </div>

                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-base font-bold tracking-tight text-white">
                    Neuro Bridge
                  </span>
                  <span className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-white/60">
                    Client Workspace
                  </span>
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-4">
        <NavMain
          items={data.navMain}
          className="text-white/85 hover:bg-[#5a1fd1]! hover:text-white! data-[active=true]:bg-[#5a1fd1]! data-[active=true]:text-white! focus-visible:bg-[#5a1fd1]! active:bg-[#5a1fd1]!"
        />
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip="Back to homepage"
              className="group/home h-11 w-full justify-center rounded-xl bg-white/10 px-3 text-sm font-bold text-white shadow-inner shadow-black/10 ring-1 ring-white/15 transition-all duration-200 hover:bg-white/20 hover:text-white hover:ring-white/30 hover:shadow-lg hover:shadow-black/20"
            >
              <Link href="/" className="flex w-full items-center gap-2.5">
                <HomeIcon className="size-4! transition-transform duration-300 group-hover/home:-translate-x-0.5" />
                <span>Back to homepage</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
