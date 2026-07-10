import { Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { SkillResponse } from "@/types/skill.types"

export function ExpertSkillCard({ item }: { item: SkillResponse }) {
  return (
    <div className="group relative rounded-xl bg-border p-[1px] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(95,123,255,0.15)]">
      <div
        style={{
          background:
            "linear-gradient(to right, #5f7bff 0%, #3e5ee0 35%, #8b5cf6 65%, #ec4899 100%)",
        }}
        className="absolute inset-0 rounded-xl opacity-0 blur-[1px] transition-opacity duration-500 group-hover:opacity-100"
      />

      <Card className="relative z-10 h-full border-border bg-card shadow-sm">
        <CardContent className="p-5">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles size={20} />
          </div>

          <h3 className="font-semibold text-foreground">
            {item.skillName}
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {item.skillDescription}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
