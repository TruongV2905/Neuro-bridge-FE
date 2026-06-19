type Props = {
  name: string;
  role: string;
  score: string;
};

export function ExpertMatch({ name, role, score }: Props) {
  return (
    <div className="mb-5 flex items-center justify-between last:mb-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-bold text-white">
          {name
            .split(" ")
            .map((word) => word[0])
            .join("")}
        </div>

        <div>
          <p className="font-bold text-slate-900">{name}</p>
          <p className="text-sm text-slate-400">{role}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-bold text-indigo-500">⭐ {score}</p>
        <p className="text-sm text-slate-400">$120/hr</p>
      </div>
    </div>
  );
}