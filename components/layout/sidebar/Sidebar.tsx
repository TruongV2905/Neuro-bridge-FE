"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ElementType } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
export type NavItem = {
  title: string;
  icon?: ElementType;
  /** Link target — renders a Next.js Link when provided. */
  href?: string;
  /** Click handler — renders a `<button>` when provided (no Link). */
  onClick?: () => void;
  render?: (props: any) => React.ReactNode;
};

export type NavSection = {
  category: string;
  items: NavItem[];
};

export type SidebarProps = {
  /** Sections of nav items grouped by category */
  navItems: NavSection[];
  /** Footer nav items (rendered below the scrollable nav, above the bottom padding) */
  footerItems?: NavItem[];
  /** Optional custom header — renders at the very top of the sidebar */
  header?: React.ReactNode;
  /** Dark gradient style (default) or light/white style */
  variant?: "dark" | "light";
  /** Additional classes merged into the aside element */
  className?: string;
};

const BASE_LINK = (isActive: boolean, isDark: boolean) => {
  if (isDark) {
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      isActive
        ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-md"
        : "text-white/90 hover:bg-white/20 hover:text-white hover:shadow-sm"
    }`;
  }
  return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
    isActive
      ? "bg-indigo-50 text-indigo-700 font-semibold"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
};

const ICON_COLOR = (isActive: boolean, isDark: boolean) => {
  if (isDark) {
    return isActive ? "text-white" : "text-white/70 group-hover:text-white";
  }
  return isActive
    ? "text-indigo-600"
    : "text-slate-400 group-hover:text-slate-600";
};

export function Sidebar({
  navItems,
  footerItems,
  header,
  variant = "dark",
  className = "",
}: SidebarProps) {
  const pathname = usePathname();
  const isDark = variant === "dark";

  const asideClassName = isDark
    ? `flex flex-col shrink-0 border-r border-white/10 bg-gradient-to-b from-[#232A6B] to-[#4A1557] pt-[11px] gap-[10px] ${className}`
    : `flex flex-col shrink-0 border-r border-slate-200 bg-white pt-[11px] gap-[10px] ${className}`;

  const sectionLabelClassName = isDark
    ? "mb-3 px-2 text-xs font-bold uppercase tracking-wider text-white/70"
    : "mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400";

  return (
    <aside className={asideClassName}>
      {/* Custom header slot */}
      {header && (
        <>
          {header}
          <Separator
            className={
              isDark ? "bg-white/20 mx-6 w-auto" : "bg-slate-100 mx-4 w-auto"
            }
          />
        </>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 w-full px-4">
        <div className="space-y-6 py-4">
          {navItems.map((section, sIdx) => (
            <div key={sIdx} className="px-2">
              <h3 className={sectionLabelClassName}>{section.category}</h3>
              <div className="space-y-2">
                {section.items.map((item, iIdx) => {
                  const isActive =
                    !!item.href && pathname?.startsWith(item.href);
                  const commonClassName = BASE_LINK(isActive, isDark);

                  return (
                    <div key={iIdx} className={commonClassName}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 w-full"
                        >
                          {item.icon && (
                            <item.icon
                              className={`h-5 w-5 flex-shrink-0 transition-colors ${ICON_COLOR(isActive, isDark)}`}
                            />
                          )}
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      ) : item.onClick ? (
                        <button
                          type="button"
                          onClick={item.onClick}
                          className="flex items-center gap-3 w-full text-left bg-transparent border-none p-0 cursor-pointer"
                        >
                          {item.icon && (
                            <item.icon
                              className={`h-5 w-5 flex-shrink-0 transition-colors ${ICON_COLOR(false, isDark)}`}
                            />
                          )}
                          <span className="font-medium">{item.title}</span>
                        </button>
                      ) : (
                        <>
                          {item.icon && (
                            <item.icon
                              className={`h-5 w-5 flex-shrink-0 transition-colors ${ICON_COLOR(false, isDark)}`}
                            />
                          )}
                          <span className="font-medium">{item.title}</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer items */}
      {footerItems && footerItems.length > 0 && (
        <div className="p-4 mt-auto space-y-2 px-6 pb-8">
          <Separator
            className={isDark ? "bg-white/20 mb-4" : "bg-slate-100 mb-4"}
          />

          {footerItems.map((item, idx) => {
            const Icon = item.icon;

            const itemClassName = isDark
              ? "flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 transition-all duration-300 hover:bg-white/20 hover:text-white"
              : "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900";

            const iconClassName = `h-5 w-5 flex-shrink-0 ${
              isDark ? "text-white/70" : "text-slate-400"
            }`;

            // Nếu item có render thì cho render tự xử lý hoàn toàn
            if (item.render) {
              return (
                <div key={idx}>
                  {item.render({
                    item,
                    isDark,
                    className: itemClassName,
                    iconClassName,
                  })}
                </div>
              );
            }

            const content = (
              <>
                {Icon && <Icon className={iconClassName} />}
                <span className="font-medium">{item.title}</span>
              </>
            );

            if (item.href) {
              return (
                <Link key={idx} href={item.href} className={itemClassName}>
                  {content}
                </Link>
              );
            }

            if (item.onClick) {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={item.onClick}
                  className={`${itemClassName} w-full bg-transparent border-none cursor-pointer text-left`}
                >
                  {content}
                </button>
              );
            }

            return (
              <div key={idx} className={itemClassName}>
                {content}
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
