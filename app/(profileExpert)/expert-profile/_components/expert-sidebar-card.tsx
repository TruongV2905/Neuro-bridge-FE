import { Mail, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type Expert = typeof import("../mock-expert-profile").expertProfile

export function ExpertSidebarCard({ expert }: { expert: Expert }) {
  return (
    <div className="group relative h-fit rounded-[2rem] bg-border p-[1px] transition-all duration-500 hover:shadow-[0_0_24px_rgba(95,123,255,0.15)]">
      <div
        style={{
          background:
            "linear-gradient(to right, #5f7bff 0%, #3e5ee0 35%, #8b5cf6 65%, #ec4899 100%)",
        }}
        className="absolute inset-0 rounded-[2rem] opacity-0 blur-[1px] transition-opacity duration-500 group-hover:opacity-100"
      />
      <Card className="relative z-10 h-fit rounded-[calc(2rem-1px)] border-border bg-card shadow-sm">
        <CardContent className="p-7">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-green-500">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {expert.availability}
            </div>

            <div className="text-right">
              <span className="text-3xl font-bold text-primary">
                {expert.price}
              </span>
              <span className="text-muted-foreground">/hr</span>
            </div>
          </div>

          <Button size="cta" className="w-full">
            Hire {expert.name} →
          </Button>

          <Button variant="outline" size="lg" className="mt-4 w-full">
            <Mail className="mr-2" size={17} />
            Message
          </Button>

          <Separator className="my-6" />

          <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/40 p-4">
            <div className="rounded-xl bg-primary p-3 text-primary-foreground">
              <Shield size={20} />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">
                Secure Escrow Guaranteed
              </p>
              <p className="text-xs text-muted-foreground">
                Release funds only when 100% satisfied.
              </p>
            </div>
          </div>

          <div className="mt-7">
            <h3 className="mb-5 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Expert Metrics
            </h3>

            <div className="space-y-4 text-sm">
              <Metric label="Response Time" value={expert.responseTime} />
              <Metric label="Last Project" value={expert.lastProject} />
              <Metric label="Rehire Rate" value={expert.rehireRate} highlight />
              <Metric label="Country" value={`${expert.country} 🌐`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-semibold text-primary" : "text-foreground"}>
        {value}
      </span>
    </div>
  )
}