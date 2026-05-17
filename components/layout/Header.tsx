export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">
          Welcome back
        </span>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-sm font-semibold text-white">
          A
        </div>
      </div>
    </header>
  );
}