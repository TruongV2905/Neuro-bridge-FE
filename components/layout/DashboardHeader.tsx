"use client";

import * as React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/features/notification";
import type { RootState } from "@/redux/store";
import type { UserResponse } from "@/types/user/user.type";

export function DashboardHeader() {
  const currentUser = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null;
  const profileHref = getDashboardProfileHref(currentUser?.role);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-indigo-100/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(248,250,252,0.9)_48%,rgba(238,242,255,0.86)_100%)] px-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <Link href={profileHref} aria-label="Open profile account">
          <DashboardUserAvatar user={currentUser} />
        </Link>
      </div>
    </header>
  );
}

function DashboardUserAvatar({ user }: { user: UserResponse | null }) {
  const [failedAvatarUrl, setFailedAvatarUrl] = React.useState<string | null>(
    null,
  );
  const avatarUrl = user?.avatarUrl?.trim() || "";
  const displayName = user?.fullName?.trim() || user?.email?.trim() || "User";
  const shouldShowImage = Boolean(avatarUrl && failedAvatarUrl !== avatarUrl);

  return (
    <Avatar className="h-10 w-10 rounded-full border border-white/80 bg-white shadow-sm ring-2 ring-indigo-100/80 sm:h-11 sm:w-11">
      {shouldShowImage ? (
        <AvatarImage
          src={avatarUrl}
          alt={`${displayName} avatar`}
          onLoadingStatusChange={(status) => {
            if (status === "error") {
              setFailedAvatarUrl(avatarUrl);
            }
          }}
        />
      ) : null}
      <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-sky-500 text-sm font-bold text-white">
        {getInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );
}

function getInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "U";

  const initials =
    parts.length === 1
      ? parts[0].slice(0, 2)
      : `${parts[0][0]}${parts[parts.length - 1][0]}`;

  return initials.toUpperCase();
}

function getDashboardProfileHref(role?: string | null) {
  if (role === "CLIENT") return "/client/dashboard/profile";
  if (role === "EXPERT") return "/expert/dashboard/profile";
  if (role === "ADMIN") return "/admin/dashboard";

  return "/";
}
