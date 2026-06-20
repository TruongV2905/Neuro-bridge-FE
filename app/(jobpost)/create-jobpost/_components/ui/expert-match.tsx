import { BadgeCheck, Star } from "lucide-react";

type Props = {
  name: string;
  role: string;
  score: string;
};

export function ExpertMatch({ name, role, score }: Props) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-100 hover:bg-white hover:shadow-[0_10px_28px_rgba(99,102,241,0.12)]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-extrabold text-white shadow-[0_8px_24px_rgba(99,102,241,0.28)]">
          {initials}

          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-white">
            <BadgeCheck size={13} className="text-white" strokeWidth={2.6} />
          </span>
        </div>

        <div className="min-w-0">
          <p className="truncate font-bold text-slate-900 transition-colors duration-300 group-hover:text-indigo-600">
            {name}
          </p>

          <p className="truncate text-sm font-medium text-slate-400">
            {role}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-white px-3 py-1 text-sm font-extrabold text-indigo-500 shadow-sm">
          <Star
            size={14}
            className="fill-indigo-500 text-indigo-500"
            strokeWidth={2.25}
          />
          {score}
        </div>

        <p className="text-sm font-semibold text-slate-400">$120/hr</p>
      </div>
    </div>
  );
}