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
  const [activeId, setActiveId] = useState<string | null>(null);

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
        threshold: 0.6,
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
              isActive ? "border-white bg-white" : "border-white/70 bg-white/30"
            }`}
          />
        </a>
        );
      })}
    </nav>
  );
};

export default NavDots;
