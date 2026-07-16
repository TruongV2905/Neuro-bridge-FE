"use client";

import { type MouseEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

import type { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { UserResponse } from "@/types/user/user.type";
import { logout } from "@/redux/features/userSlice";

const NAV_LINKS = [
  { label: "Home", path: "/#home", sectionId: "home" },
  { label: "AI Models", path: "/#activities", sectionId: "activities" },
  { label: "Benefits", path: "/#benefits", sectionId: "benefits" },
  { label: "Insights", path: "/#blog", sectionId: "blog" },
] as const;

type NavSectionId = (typeof NAV_LINKS)[number]["sectionId"];

const HEADER_HIDE_THRESHOLD = 140;
const HEADER_SOLID_THRESHOLD = 40;
const HEADER_TOP_VISIBLE_DISTANCE = 80;
const ACTIVE_SECTION_OFFSET = 140;

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const currentUser = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null;

  const [headerAvatar, setHeaderAvatar] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] =
    useState<NavSectionId | null>("home");
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const updateAvatar = () => {
      const savedAvatar = localStorage.getItem("expert-avatar");
      setHeaderAvatar(savedAvatar || currentUser?.avatarUrl || null);
    };

    updateAvatar();

    window.addEventListener("avatar-updated", updateAvatar);

    return () => {
      window.removeEventListener("avatar-updated", updateAvatar);
    };
  }, [currentUser?.avatarUrl]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let animationFrameId: number | null = null;

    const updateActiveSection = (scrollY: number) => {
      if (pathname !== "/") {
        setActiveSectionId(null);
        return;
      }

      let currentSectionId: NavSectionId = "home";
      const activationPoint = scrollY + ACTIVE_SECTION_OFFSET;

      for (const link of NAV_LINKS) {
        const section = document.getElementById(link.sectionId);

        if (!section) continue;

        const sectionTop = section.getBoundingClientRect().top + scrollY;

        if (sectionTop <= activationPoint) {
          currentSectionId = link.sectionId;
        }
      }

      setActiveSectionId(currentSectionId);
    };

    const updateHeaderState = () => {
      const currentScrollY = Math.max(window.scrollY, 0);

      setHasScrolled(currentScrollY > HEADER_SOLID_THRESHOLD);
      updateActiveSection(currentScrollY);

      if (isUserMenuOpen || currentScrollY < HEADER_TOP_VISIBLE_DISTANCE) {
        setIsHeaderHidden(false);
      } else if (
        currentScrollY > lastScrollY &&
        currentScrollY > HEADER_HIDE_THRESHOLD
      ) {
        setIsHeaderHidden(true);
      } else if (currentScrollY < lastScrollY) {
        setIsHeaderHidden(false);
      }

      lastScrollY = currentScrollY;
      animationFrameId = null;
    };

    const requestHeaderUpdate = () => {
      if (animationFrameId !== null) return;

      animationFrameId = window.requestAnimationFrame(updateHeaderState);
    };

    requestHeaderUpdate();

    const settleTimerId = window.setTimeout(requestHeaderUpdate, 350);

    window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
    window.addEventListener("resize", requestHeaderUpdate);

    return () => {
      window.clearTimeout(settleTimerId);
      window.removeEventListener("scroll", requestHeaderUpdate);
      window.removeEventListener("resize", requestHeaderUpdate);

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isUserMenuOpen, pathname]);

  const getFallbackName = (name?: string) => {
    if (!name) return "U";

    return name
      .trim()
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const profilePath =
    currentUser?.role === "EXPERT" ? "/expert-profile" : "/profile";

  const dashboardPath =
    currentUser?.role === "EXPERT"
      ? "/expert/dashboard/my-applications"
      : currentUser?.role === "ADMIN"
        ? "/admin/dashboard"
        : "/client/dashboard/my-job-post";
  const dashboardLabel =
    currentUser?.role === "EXPERT"
      ? "My Applications"
      : currentUser?.role === "ADMIN"
        ? "Dashboard"
        : "My Jobpost";
  const handleLogout = () => {
    dispatch(logout());

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  const handleSectionClick = (
    event: MouseEvent<HTMLAnchorElement>,
    link: (typeof NAV_LINKS)[number],
  ) => {
    if (pathname !== "/") return;

    event.preventDefault();

    const targetSection = document.getElementById(link.sectionId);

    if (!targetSection) {
      router.push(link.path);
      return;
    }

    targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", link.path);
    setActiveSectionId(link.sectionId);
    setIsHeaderHidden(false);
  };

  const shouldUseStrongHeader = pathname !== "/" || hasScrolled;

  return (
    <header
      className={`fixed left-1/2 top-4 z-[50] grid w-[75%] -translate-x-1/2 grid-cols-[1fr_auto_1fr] items-center rounded-full border px-6 py-3 text-white backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 ease-out ${
        shouldUseStrongHeader
          ? "border-white/15 bg-[#101827]/90 shadow-[0_18px_50px_rgba(2,8,23,0.35)]"
          : "border-white/35 bg-white/20 shadow-[0_10px_30px_rgba(15,23,42,0.2)]"
      } ${
        isHeaderHidden
          ? "pointer-events-none -translate-y-[120%] opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      {/* Logo - left */}
      <Link href="/" className="flex items-center gap-2 justify-self-start">
        <Image
          src="/img/MainLogo.png"
          alt="Neuro Bridge Logo"
          width={350}
          height={70}
          className="h-10 w-auto object-contain object-left"
          quality={100}
          priority
        />
      </Link>

      {/* Navigate - center */}
      <nav className="hidden items-center gap-6 justify-self-center md:flex">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === "/" && activeSectionId === link.sectionId;

          return (
            <Link
              key={link.path}
              href={link.path}
              onClick={(event) => handleSectionClick(event, link)}
              className={`relative rounded-full px-3 py-1.5 text-sm font-semibold transition-colors duration-200 ${
                isActive
                  ? "border border-white/45 bg-white/25 text-white shadow-sm"
                  : "text-white/75 hover:bg-white/15 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Tool / Auth - right */}
      <div className="flex items-center justify-end gap-4 justify-self-end">
        {currentUser ? (
          <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 px-2.5 py-1.5 text-white transition-all duration-200 cursor-pointer">
                <span className="hidden max-w-[180px] truncate text-sm font-semibold sm:block">
                  {currentUser.fullName}
                </span>

                <Avatar className="h-10 w-10 border border-white/70 shadow-sm">
                  <AvatarImage
                    src={
                      headerAvatar ||
                      currentUser.avatarUrl ||
                      "/img/default-avatar.png"
                    }
                    alt={currentUser.fullName || "User avatar"}
                  />

                  <AvatarFallback className="bg-[#2563EB] text-sm font-semibold text-white">
                    {getFallbackName(currentUser.fullName)}
                  </AvatarFallback>
                </Avatar>

                <ChevronDown className="hidden h-4 w-4 text-white/70 sm:block" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={14}
              className="z-[999] w-64 rounded-2xl border border-slate-200 bg-white p-2 text-[#0A0D17] shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
            >
              <DropdownMenuLabel className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border border-slate-200">
                    <AvatarImage
                      src={
                        headerAvatar ||
                        currentUser.avatarUrl ||
                        "/img/default-avatar.png"
                      }
                      alt={currentUser.fullName || "User avatar"}
                    />

                    <AvatarFallback className="bg-[#2563EB] text-sm font-semibold text-white">
                      {getFallbackName(currentUser.fullName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#0A0D17]">
                      {currentUser.fullName}
                    </p>

                    <p className="mt-0.5 w-fit rounded-full bg-[#2563EB]/10 px-2 py-0.5 text-[11px] font-semibold text-[#2563EB]">
                      {currentUser.role}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="my-2 bg-slate-200/80" />

              <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-[#0A0D17] outline-none transition-colors focus:bg-transparent focus:text-[#0A0D17] data-[highlighted]:bg-transparent data-[highlighted]:text-[#0A0D17]"
              >
                <Link href={profilePath} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]">
                    <UserRound className="h-4 w-4" />
                  </span>

                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-[#0A0D17] outline-none transition-colors focus:bg-transparent focus:text-[#0A0D17] data-[highlighted]:bg-transparent data-[highlighted]:text-[#0A0D17]"
              >
                <Link href={dashboardPath} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]">
                    <UserRound className="h-4 w-4" />
                  </span>

                  <span>{dashboardLabel}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleLogout}
                className="mt-1 cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 outline-none transition-colors focus:bg-transparent focus:text-red-600 data-[highlighted]:bg-transparent data-[highlighted]:text-red-600"
              >
                <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <LogOut className="h-4 w-4" />
                </span>

                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button
              asChild
              variant="ghost"
              className="rounded-full px-4 text-white/80 hover:bg-white/20 hover:text-white"
            >
              <Link href="/login">Login</Link>
            </Button>

            <Button
              asChild
              className="rounded-full px-5 py-4 text-white hover:bg-primary/90"
            >
              <Link href="/register">Register</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
