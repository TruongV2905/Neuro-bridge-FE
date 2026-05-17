"use client"; // Bắt buộc vì có sử dụng usePathname()

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  {
    label: "Users",
    path: "/users", 
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-red-500">
          VIAA Admin
        </h1>
      </div>

      <nav className="space-y-2 p-4">
        {menus.map((menu) => {
          const isActive = pathname.startsWith(menu.path);

          return (
            <Link
              key={menu.path}
              href={menu.path}
              className={`
                flex items-center rounded-lg px-4 py-3
                text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-red-500 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }
              `}
            >
              {menu.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}