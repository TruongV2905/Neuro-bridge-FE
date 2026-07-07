import { Input } from "@/components/ui/input"

interface FormFieldProps {
  label: string
  value: string
  icon: React.ReactNode
  onChange?: (value: string) => void
}

export function ClientProfileFormField({ label, value, icon, onChange }: FormFieldProps) {
  return (
    <div className="group relative rounded-2xl bg-border p-[1px] transition-all duration-500 hover:shadow-[0_0_20px_rgba(95,123,255,0.15)]">
      <div
        style={{
          background:
            "linear-gradient(to right, #5f7bff 0%, #3e5ee0 35%, #8b5cf6 65%, #ec4899 100%)",
        }}
        className="absolute inset-0 rounded-2xl opacity-0 blur-[1px] transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative z-10 rounded-[15px] bg-muted/40 p-4 transition-all duration-500 group-hover:bg-card">
        <label className="mb-2 block text-xs font-bold text-muted-foreground transition-colors duration-300 group-hover:text-primary">
          {label}
        </label>

        <div className="relative">
          <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground/70 transition-colors duration-300 group-hover:text-primary">
            {icon}
          </div>

          <Input
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            title={value}
            className="h-11 cursor-default truncate rounded-xl border border-input/50 bg-card pl-10 pr-3 text-sm font-medium text-card-foreground transition-all duration-300 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring"
          />

          {/* Tooltip hiện full value khi hover */}
          <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden max-w-[420px] rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-card-foreground shadow-xl group-hover:block">
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}
