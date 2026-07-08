// "use client";

// import { ChevronRight, type LucideIcon } from "lucide-react";
// import Link from "next/link";

// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible";

// import {
//   SidebarGroup,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarMenuSub,
//   SidebarMenuSubButton,
//   SidebarMenuSubItem,
// } from "@/components/ui/sidebar";
// import { cn } from "@/lib/utils";

// export function NavMain({
//   items,
//   className,
// }: {
//   items: {
//     title: string;
//     url: string;
//     icon?: LucideIcon;
//     isActive?: boolean;
//     items?: {
//       title: string;
//       url: string;
//     }[];
//   }[];
//   className?: string;
// }) {
//   return (
//     <SidebarGroup>
//       <SidebarMenu className="gap-1 px-2">
//         {items.map((item) => {
//           const hasSubItems = item.items && item.items.length > 0;

//           if (!hasSubItems) {
//             return (
//               <SidebarMenuItem key={item.title}>
//                 <SidebarMenuButton
//                   asChild
//                   tooltip={item.title}
//                   size="lg"
//                   className={cn(
//                     "h-11 rounded-xl px-3 text-sm font-semibold transition-all duration-200 [&_svg]:size-5!",
//                     className,
//                   )}
//                 >
//                   <Link href={item.url}>
//                     {item.icon && <item.icon />}
//                     <span>{item.title}</span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             );
//           }

//           return (
//             <Collapsible
//               key={item.title}
//               asChild
//               defaultOpen={item.isActive}
//               className="group/collapsible"
//             >
//               <SidebarMenuItem>
//                 <CollapsibleTrigger asChild>
//                   <SidebarMenuButton
//                     tooltip={item.title}
//                     size="lg"
//                     className={cn(
//                       "h-11 rounded-xl px-3 text-sm font-semibold transition-all duration-200 [&_svg]:size-5!",
//                       className,
//                     )}
//                   >
//                     {item.icon && <item.icon />}
//                     <span>{item.title}</span>

//                     <ChevronRight className="ml-auto size-4! transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
//                   </SidebarMenuButton>
//                 </CollapsibleTrigger>

//                 <CollapsibleContent>
//                   <SidebarMenuSub>
//                     {item.items?.map((subItem) => (
//                       <SidebarMenuSubItem key={subItem.title}>
//                         <SidebarMenuSubButton asChild>
//                           <Link href={subItem.url}>
//                             <span>{subItem.title}</span>
//                           </Link>
//                         </SidebarMenuSubButton>
//                       </SidebarMenuSubItem>
//                     ))}
//                   </SidebarMenuSub>
//                 </CollapsibleContent>
//               </SidebarMenuItem>
//             </Collapsible>
//           );
//         })}
//       </SidebarMenu>
//     </SidebarGroup>
//   );
// }

"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

function normalizePath(path: string) {
  const cleanPath = path.split(/[?#]/)[0];

  if (cleanPath.length <= 1) return cleanPath;

  return cleanPath.endsWith("/") ? cleanPath.slice(0, -1) : cleanPath;
}

function isDashboardRoot(url: string) {
  return /^\/(client|expert)\/dashboard$/.test(normalizePath(url));
}

function isRouteActive(pathname: string, url: string) {
  const currentPath = normalizePath(pathname);
  const itemUrl = normalizePath(url);

  if (isDashboardRoot(itemUrl)) {
    return currentPath === itemUrl;
  }

  return currentPath === itemUrl || currentPath.startsWith(`${itemUrl}/`);
}

export function NavMain({
  items,
  className,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu className="gap-1 px-2">
        {items.map((item) => {
          const subItems = item.items ?? [];
          const hasSubItems = subItems.length > 0;
          const hasActiveSubItem = subItems.some((subItem) =>
            isRouteActive(pathname, subItem.url),
          );
          const isActive =
            item.isActive === true ||
            isRouteActive(pathname, item.url) ||
            hasActiveSubItem;

          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  size="lg"
                  isActive={isActive}
                  className={cn(
                    "h-11 rounded-xl px-3 text-sm font-semibold transition-all duration-200 [&_svg]:size-5!",
                    className,
                  )}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    size="lg"
                    isActive={isActive}
                    className={cn(
                      "h-11 rounded-xl px-3 text-sm font-semibold transition-all duration-200 [&_svg]:size-5!",
                      className,
                    )}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>

                    <ChevronRight className="ml-auto size-4! transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {subItems.map((subItem) => {
                      const isSubItemActive = isRouteActive(
                        pathname,
                        subItem.url,
                      );

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isSubItemActive}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}