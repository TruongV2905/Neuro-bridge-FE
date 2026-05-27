"use client";

import React, { useEffect, useState } from "react";

export type NavDotItem = {
  id: string;
  label?: string;
};

type NavDotsProps = {
  items: NavDotItem[];
};

const NavDots = ({ items }: NavDotsProps) => {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (!items.length) return;

    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: "-42% 0px -42% 0px",
        threshold: 0,
      }
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      className="fixed right-[2%] top-1/2 z-50 flex -translate-y-1/2 flex-col gap-3"
      aria-label="Section navigation"
    >
      {items.map((item) => {
        const isActive = activeId === item.id;

        return (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-label={item.label ?? item.id}
          className="group flex h-4 w-4 items-center justify-center"
        >
          <span
            className={`block h-4 w-4 rounded-full border transition-colors group-hover:bg-white ${
              isActive
                ? "border-[#5470FF] bg-[#5470FF] shadow-md shadow-[#5470FF]/30"
                : "border-slate-300 bg-slate-200"            }`}
          />
        </a>
        );
      })}
    </nav>
  );
};

export default NavDots;
