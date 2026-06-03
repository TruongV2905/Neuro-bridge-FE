import { Award, Rocket, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const icons = {
  rocket: Rocket,
  award: Award,
  zap: Zap,
}

type Stat = {
  icon: keyof typeof icons
  value: string
  label: string
}

export function ExpertStatsCard({ stat }: { stat: Stat }) {
  const Icon = icons[stat.icon]

  return (
    <div className="group relative rounded-xl bg-border p-[1px] transition-all duration-500 hover:shadow-[0_0_20px_rgba(95,123,255,0.15)]">
      <div
        style={{
          background:
            "linear-gradient(to right, #5f7bff 0%, #3e5ee0 35%, #8b5cf6 65%, #ec4899 100%)",
        }}
        className="absolute inset-0 rounded-xl opacity-0 blur-[1px] transition-opacity duration-500 group-hover:opacity-100"
      />

      <Card className="relative z-10 border-border bg-card shadow-sm">
        <CardContent className="flex h-36 flex-col items-center justify-center text-center">
          <Icon className="mb-4 text-primary" size={30} />
          <p className="text-3xl font-bold text-foreground">{stat.value}</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            {stat.label}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}