"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";

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
  SidebarRail,
} from "@/components/ui/sidebar";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface SidebarSection {
  label?: string;
  items: NavItem[];
}

interface ReusableSidebarProps {
  sections: SidebarSection[];
  footerItems?: NavItem[];
  header?: React.ReactNode;
  className?: string;
}

function NavItemRow({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className="text-white/90 hover:bg-white/20 hover:text-white data-[active=true]:bg-gradient-to-r data-[active=true]:from-[#4F46E5] data-[active=true]:to-[#7C3AED] data-[active=true]:text-white data-[active=true]:shadow-md"
      >
        <Link href={item.href}>
          <item.icon className="!h-5 !w-5" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function FooterItemRow({ item }: { item: NavItem }) {
  return (
    <SidebarMenuItem>
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
  );
}

export function ReusableSidebar({
  sections,
  footerItems,
  header,
  className,
}: ReusableSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className={className}>
      {header && (
        <>
          <SidebarHeader>{header}</SidebarHeader>
          <SidebarSeparator className="bg-white/20" />
        </>
      )}

      <SidebarContent>
        {sections.map((section, idx) => (
          <SidebarGroup key={section.label ?? `section-${idx}`}>
            {section.label && (
              <SidebarGroupLabel className="text-white/70">
                {section.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <NavItemRow key={item.href} item={item} pathname={pathname} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {footerItems && footerItems.length > 0 && (
        <SidebarFooter>
          <SidebarSeparator className="bg-white/20" />
          <SidebarMenu>
            {footerItems.map((item) => (
              <FooterItemRow key={item.href} item={item} />
            ))}
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
