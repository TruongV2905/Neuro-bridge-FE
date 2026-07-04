"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SidebarMenuItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export interface SidebarSection {
  label: string;
  items: SidebarMenuItem[];
}

export interface SidebarUser {
  name: string;
  role: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

interface AppSidebarProps {
  user: SidebarUser;
  sections: SidebarSection[];
  footerItems?: SidebarMenuItem[];
  activePath?: string;
  width?: string;
  className?: string;
}

function isItemActive(pathname: string, item: SidebarMenuItem, activePath?: string) {
  if (activePath) {
    return activePath === item.href;
  }
  if (!item.href) return false;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export function AppSidebar({
  user,
  sections,
  footerItems,
  activePath,
  width = "w-64",
  className,
}: AppSidebarProps) {
  const pathname = usePathname();

  const getFallback = (name: string) =>
    name
      .trim()
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col bg-gradient-to-b from-indigo-950 via-purple-950 to-fuchsia-950 text-white shadow-2xl",
        width,
        "p-5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-white/10 text-base font-bold text-white shadow-inner">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              getFallback(user.name)
            )}
          </div>
          {user.isOnline && (
            <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-indigo-950 bg-emerald-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-white/60">Welcome back</p>
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-300 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {user.role}
          </span>
        </div>
      </div>

      <div className="mt-6 mb-2 h-px bg-white/10" />

      {/* Sections */}
      <nav className="flex-1 space-y-6 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label} className="space-y-2">
            <h3 className="px-2 text-xs font-semibold tracking-wider text-white/60 uppercase">
              {section.label}
            </h3>
            <ul className="space-y-1.5">
              {section.items.map((item) => {
                const active = isItemActive(pathname, item, activePath);
                const content = (
                  <>
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </>
                );
                const classNameItem = cn(
                  "group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200",
                  "text-white/80 hover:bg-white/10 hover:text-white",
                  active &&
                    "bg-white/15 text-white border border-white/20 shadow-lg"
                );

                if (item.onClick) {
                  return (
                    <li key={item.title}>
                      <button
                        type="button"
                        onClick={item.onClick}
                        className={classNameItem}
                      >
                        {content}
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={item.title}>
                    <Link href={item.href ?? "#"} className={classNameItem}>
                      {content}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {footerItems && footerItems.length > 0 && (
        <div className="mt-auto space-y-1.5">
          <div className="my-3 h-px bg-white/10" />
          {footerItems.map((item) => {
            const content = (
              <>
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.title}</span>
              </>
            );
            const classNameItem = cn(
              "group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200",
              "text-white/80 hover:bg-white/10 hover:text-white",
              isItemActive(pathname, item, activePath) &&
                "bg-white/15 text-white border border-white/20 shadow-lg"
            );

            if (item.onClick) {
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={item.onClick}
                  className={classNameItem}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.title}
                href={item.href ?? "#"}
                className={classNameItem}
              >
                {content}
              </Link>
            );
          })}
        </div>
      )}
    </aside>
  );
}