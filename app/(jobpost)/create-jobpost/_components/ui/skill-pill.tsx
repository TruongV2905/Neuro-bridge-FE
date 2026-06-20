import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  active?: boolean;
};

export function SkillPill({ children, active }: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-4 py-2 text-xs font-bold ${
        active
          ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white"
          : "bg-indigo-50 text-indigo-500"
      }`}
    >
      {children}
    </span>
  );
}