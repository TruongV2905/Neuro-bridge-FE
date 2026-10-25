"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BriefcaseIcon,
  BoxesIcon,
  FolderIcon,
  HomeIcon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  SearchIcon,
  SparklesIcon,
  WalletCardsIcon,
  type LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "../nav-main";

type WorkspaceRole = "CLIENT" | "EXPERT";

type SidebarBaseProps = Omit<React.ComponentProps<typeof Sidebar>, "role">;

type WorkspaceSideBarProps = SidebarBaseProps & {
  role: WorkspaceRole;
};

type WorkspaceNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

const WORKSPACE_CONFIG: Record<
  WorkspaceRole,
  {
    label: string;
    navMain: WorkspaceNavItem[];
  }
> = {
  CLIENT: {
    label: "Client Workspace",
    navMain: [
      {
        title: "Dashboard",
        url: "/client/dashboard",
        icon: LayoutDashboardIcon,
      },
      {
        title: "My Jobpost",
        url: "/client/dashboard/my-job-post",
        icon: BriefcaseIcon,
      },
      {
        title: "Create Jobpost",
        url: "/client/dashboard/create-job-post",
        icon: PlusCircleIcon,
      },
      {
        title: "Project",
        url: "/client/dashboard/projects",
        icon: FolderIcon,
      },
      {
        title: "AI Place",
        url: "/client/dashboard/ai-place",
        icon: BoxesIcon,
      },
      {
        title: "Wallet",
        url: "/client/dashboard/wallet",
        icon: WalletCardsIcon,
      },
    ],
  },
  EXPERT: {
    label: "Expert Workspace",
    navMain: [
      {
        title: "AI Products",
        url: "/expert/dashboard/ai-place/products",
        icon: BoxesIcon,
      },
      {
        title: "My Applications",
        url: "/expert/dashboard/my-applications",
        icon: SparklesIcon,
      },
      {
        title: "Browse Jobpost",
        url: "/expert/dashboard",
        icon: SearchIcon,
      },
      {
        title: "Project",
        url: "/expert/dashboard/projects",
        icon: FolderIcon,
      },
      {
        title: "Wallet",
        url: "/expert/dashboard/wallet",
        icon: WalletCardsIcon,
      },
    ],
  },
};

export function WorkspaceSideBar({ role, ...props }: WorkspaceSideBarProps) {
  const workspace = WORKSPACE_CONFIG[role];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#13072f] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(96,165,250,0.34),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(236,72,153,0.22),transparent_26%),radial-gradient(circle_at_50%_92%,rgba(124,58,237,0.34),transparent_34%),linear-gradient(155deg,#13072f_0%,#2a1268_48%,#07182f_100%)]" />
        <div className="pointer-events-none absolute inset-x-5 top-20 h-28 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-24 h-36 w-36 rounded-full bg-fuchsia-300/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_30%,rgba(255,255,255,0.04))]" />

        <SidebarHeader className="relative z-10 border-b border-white/10 px-4 py-5">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="lg"
                className="data-[slot=sidebar-menu-button]:p-0! group/logo h-auto rounded-2xl transition-all duration-200 hover:bg-white/10"
              >
                <div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-white/70">
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
                    <span className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-white/65">
                      {workspace.label}
                    </span>
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="relative z-10 px-2 pt-4">
          <NavMain
            items={workspace.navMain}
            className="text-white/82 hover:bg-white/10! hover:text-white! hover:shadow-[0_10px_28px_rgba(15,23,42,0.18)] data-[active=true]:bg-white/[0.18]! data-[active=true]:text-white! data-[active=true]:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_14px_32px_rgba(15,23,42,0.24)] data-[active=true]:ring-1 data-[active=true]:ring-white/25 focus-visible:bg-white/15! active:bg-white/[0.16]!"
          />
        </SidebarContent>

        <SidebarFooter className="relative z-10 border-t border-white/10 p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="lg"
                tooltip="Back to homepage"
                className="group/home h-11 w-full justify-center rounded-xl bg-white/10 px-3 text-sm font-bold text-white shadow-inner shadow-black/10 ring-1 ring-white/15 transition-all duration-200 hover:bg-white/[0.18] hover:text-white hover:shadow-lg hover:shadow-black/20 hover:ring-white/30"
              >
                <Link href="/" className="flex w-full items-center gap-2.5">
                  <HomeIcon className="size-4! transition-transform duration-300 group-hover/home:-translate-x-0.5" />
                  <span>Back to homepage</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}

export function ClientSideBar(props: SidebarBaseProps) {
  return <WorkspaceSideBar {...props} role="CLIENT" />;
}
