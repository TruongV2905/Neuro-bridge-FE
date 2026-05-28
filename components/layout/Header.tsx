"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "AI Models", path: "/availableAI" },
  { label: "AI Experts", path: "/experts" },
  { label: "Benefits", path: "/#benefits" },
  { label: "Insights", path: "/#blog" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed left-1/2 top-4 z-50 flex w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 items-center justify-between rounded-full border border-white/10 bg-[#121827]/90 px-4 py-3 text-white shadow-[0_18px_50px_rgba(3,7,18,0.24)] backdrop-blur-md sm:px-6">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/img/LogoFull.png"
          alt="Neuro Bridge Logo"
          width={170}
          height={40}
          priority
          className="h-10 w-auto object-contain"
        />
      </Link>

      <nav className="hidden items-center gap-6 lg:flex">
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

      <div className="flex items-center gap-2 sm:gap-4">
        <Button asChild variant="ghost" className="hidden text-gray-300 hover:bg-white/10 hover:text-white sm:inline-flex">
          <Link href="/login">Login</Link>
        </Button>

        <Button asChild className="rounded-full bg-blue-600 px-5 text-white hover:bg-blue-700">
          <Link href="/experts">Find Experts</Link>
        </Button>
      </div>
    </header>
  );
}
