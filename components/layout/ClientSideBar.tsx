"use client";

import * as React from "react";

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
  FolderIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  SearchIcon,
} from "lucide-react";
import { NavMain } from "../nav-main";
import Link from "next/link";

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
      url: `${USER_ROUTE}/job-posts`,
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
  ],
};

export function ClientSideBar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard">
                <LayoutDashboardIcon className="size-5!" />
                <span className="text-base font-semibold"></span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
    </Sidebar>
  );
}
