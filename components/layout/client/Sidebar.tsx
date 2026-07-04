"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Star,
  Settings,
  HelpCircle,
  UserRound,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logout } from "@/redux/features/userSlice";
import type { RootState } from "@/redux/store";
import type { UserResponse } from "@/types/user/user.type";

const MAIN_ITEMS = [
  { title: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { title: "My Projects", href: "/client/dashboard/projects", icon: Briefcase },
];

const ENGAGEMENT_ITEMS = [
  { title: "Create Proposal", href: "/client/dashboard/create-proposal", icon: MessageSquare },
  { title: "Saved Experts", href: "/client/dashboard/saved", icon: Star },
];

const ACCOUNT_ITEMS = [
  { title: "Settings", href: "/client/dashboard/settings", icon: Settings },
];

const FOOTER_ITEMS = [
  { title: "Support Center", href: "/client/dashboard/support", icon: HelpCircle },
];

export function ClientSidebar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const currentUser = useSelector((state: RootState) => state.user) as UserResponse | null;
  const [headerAvatar, setHeaderAvatar] = useState<string | null>(null);

  useEffect(() => {
    const updateAvatar = () => {
      const saved = localStorage.getItem("expert-avatar");
      setHeaderAvatar(saved || currentUser?.avatarUrl || null);
    };
    updateAvatar();
    window.addEventListener("avatar-updated", updateAvatar);
    return () => window.removeEventListener("avatar-updated", updateAvatar);
  }, [currentUser?.avatarUrl]);

  const getFallback = (name?: string) => {
    if (!name) return "U";
    return name.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  const header = (
    <div className="px-5 py-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex cursor-pointer items-center gap-3 rounded-2xl p-2 transition-all duration-300 hover:bg-white/10 active:bg-white/5">
            <Avatar className="h-12 w-12 shrink-0 border-2 border-white/30 shadow-inner">
              <AvatarImage
                src={headerAvatar || currentUser?.avatarUrl || "/img/default-avatar.png"}
                alt={currentUser?.fullName || "Client"}
              />
              <AvatarFallback className="bg-white/20 text-base font-bold text-white">
                {getFallback(currentUser?.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white/80">
                {currentUser?.fullName || "Client"}
              </p>
              <p className="truncate text-xs text-white/50">Client Account</p>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-white/50" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="z-[999] w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
        >
          <DropdownMenuLabel className="px-3 py-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border border-slate-200">
                <AvatarImage
                  src={headerAvatar || currentUser?.avatarUrl || "/img/default-avatar.png"}
                  alt={currentUser?.fullName || "Client"}
                />
                <AvatarFallback className="bg-[#2563EB] text-sm font-semibold text-white">
                  {getFallback(currentUser?.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{currentUser?.fullName}</p>
                <p className="mt-0.5 w-fit rounded-full bg-[#2563EB]/10 px-2 py-0.5 text-[11px] font-semibold text-[#2563EB]">
                  CLIENT
                </p>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="my-2 bg-slate-200/80" />

          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors focus:bg-transparent data-[highlighted]:bg-transparent"
          >
            <a href="/profile" className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]">
                <UserRound className="h-4 w-4" />
              </span>
              <span>Profile</span>
            </a>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-2 bg-slate-200/80" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="mt-1 cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 outline-none transition-colors focus:bg-transparent data-[highlighted]:bg-transparent"
          >
            <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600">
              <LogOut className="h-4 w-4" />
            </span>
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/10 bg-gradient-to-b from-[#232A6B] to-[#4A1557]"
    >
      {/* Custom header with avatar */}
      <SidebarHeader>{header}</SidebarHeader>
      <SidebarSeparator className="bg-white/20" />

      <SidebarContent>
        {/* MAIN section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70">MAIN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.title}
                    className="text-white/90 hover:bg-white/20 hover:text-white data-[active=true]:bg-gradient-to-r data-[active=true]:from-[#4F46E5] data-[active=true]:to-[#7C3AED] data-[active=true]:text-white data-[active=true]:shadow-md"
                  >
                    <Link href={item.href}>
                      <item.icon className="!h-5 !w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ENGAGEMENTS section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70">ENGAGEMENTS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ENGAGEMENT_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.title}
                    className="text-white/90 hover:bg-white/20 hover:text-white data-[active=true]:bg-gradient-to-r data-[active=true]:from-[#4F46E5] data-[active=true]:to-[#7C3AED] data-[active=true]:text-white data-[active=true]:shadow-md"
                  >
                    <Link href={item.href}>
                      <item.icon className="!h-5 !w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ACCOUNT section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70">ACCOUNT</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ACCOUNT_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.title}
                    className="text-white/90 hover:bg-white/20 hover:text-white data-[active=true]:bg-gradient-to-r data-[active=true]:from-[#4F46E5] data-[active=true]:to-[#7C3AED] data-[active=true]:text-white data-[active=true]:shadow-md"
                  >
                    <Link href={item.href}>
                      <item.icon className="!h-5 !w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator className="bg-white/20" />
        <SidebarMenu>
          {FOOTER_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className="text-white/90 hover:bg-white/20 hover:text-white"
              >
                <Link href={item.href}>
                  <item.icon className="!h-5 !w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export const AppSidebar = ClientSidebar;
