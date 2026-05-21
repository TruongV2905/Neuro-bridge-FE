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
    <header 
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 
                 bg-[#232943] text-white rounded-full px-6 py-3 shadow-lg 
                 flex items-center justify-between border border-white/10 backdrop-blur-sm"
    >
      {/* LOGO */}
      <Link href="/" className="flex items-center gap-2">
        <img 
          src="/img/LogoFull.png" 
          alt="Neuro Bridge Logo" 
          className="h-10 w-auto object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = '<span class="font-bold text-white text-lg">Neuro Bridge</span>';
          }}
        />
      </Link>

      {/* MENU NAVIGATION */}
      <nav className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`relative py-1 text-sm font-medium transition-colors duration-300
                ${isActive ? "text-blue-400" : "text-gray-300 hover:text-white"}
                
                after:content-[''] after:absolute after:bottom-0 after:left-0 
                after:h-[2px] after:bg-blue-400 after:transition-all after:duration-300
                ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}
              `}
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
          className="text-gray-300 hover:text-white hover:bg-white/10"
        >
          <Link href="/login">Login</Link>
        </Button>

        <Button 
          asChild 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5"
        >
          <Link href="/register">Register</Link>
        </Button>
      </div>
    </header>
  );
}