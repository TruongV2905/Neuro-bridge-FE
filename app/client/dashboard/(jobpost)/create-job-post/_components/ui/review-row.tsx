type Props = {
  label: string;
  value: string;
};

export function ReviewRow({ label, value }: Props) {
  return (
    <div className="flex items-center justify-between border-b py-3 text-sm last:border-b-0">
      <p className="text-slate-500">{label}</p>
      <p className="font-bold text-slate-900">{value}</p>
    </div>
  );
}