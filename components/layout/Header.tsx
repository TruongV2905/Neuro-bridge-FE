"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "AI Models", path: "/ai-models" },
  { label: "AI Experts", path: "/experts" },
  { label: "Support", path: "/support" },
  { label: "Contact", path: "/contact" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed left-1/2 top-4 z-50 flex w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 items-center justify-between rounded-full border border-white/10 bg-[#232943] px-6 py-3 text-white shadow-lg backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-2">
        <img
          src="/img/LogoFull.png"
          alt="Neuro Bridge Logo"
          className="h-10 w-auto object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement!.innerHTML =
              '<span class="text-lg font-bold text-white">Neuro Bridge</span>';
          }}
        />
      </Link>

      <nav className="hidden items-center gap-8 md:flex">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`relative py-1 text-sm font-medium transition-colors duration-300
                ${isActive ? "text-blue-400" : "text-gray-300 hover:text-white"}
                after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-blue-400 after:transition-all after:duration-300 after:content-['']
                ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" className="text-gray-300 hover:bg-white/10 hover:text-white">
          <Link href="/login">Login</Link>
        </Button>

        <Button asChild className="rounded-full bg-blue-600 px-5 text-white hover:bg-blue-700">
          <Link href="/register">Register</Link>
        </Button>
      </div>
    </header>
  );
}
