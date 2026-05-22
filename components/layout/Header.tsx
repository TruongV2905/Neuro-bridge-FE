"use client";

import Link from "next/link";
import Image from "next/image";
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
    <header className="  top-4 flex w-full  items-center justify-between rounded-full border border-border/80 bg-linear-to-r from-[#ffffff] via-[#b7f1ff] to-[#e5d1ff] px-6 py-3 text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/img/LogoFull.png"
          alt="Neuro Bridge Logo"
          width={200}
          height={50}
          className="h-10 w-auto object-contain"
          quality={100}
          priority
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement!.innerHTML =
              '<span class="text-lg font-bold text-white">Neuro Bridge</span>';
          }}
        />
      </Link>

      <nav className="hidden items-center gap-6 md:flex">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200
                ${isActive ? "bg-primary/12 text-primary" : "text-foreground/70 hover:bg-muted hover:text-foreground"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        <Button
          asChild
          variant="ghost"
          className="rounded-full px-4 text-foreground/80 hover:bg-muted hover:text-foreground"
        >
          <Link href="/login">Login</Link>
        </Button>

        <Button
          asChild
          className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/register">Register</Link>
        </Button>
      </div>
    </header>
  );
}
