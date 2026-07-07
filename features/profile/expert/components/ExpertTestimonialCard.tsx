import { Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type Testimonial = {
  name: string
  role: string
  content: string
}

export function ExpertTestimonialCard({
  item,
}: {
  item: Testimonial
}) {
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
        <CardContent className="p-6">
          <div className="absolute -top-3 left-5 rounded-full border border-border bg-background p-2 text-primary shadow-sm">
            <Quote size={18} />
          </div>

          <p className="mt-3 text-sm leading-7 italic text-muted-foreground">
            “{item.content}”
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              {item.name.charAt(0)}
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">
                {item.name}
              </p>

              <p className="text-xs text-muted-foreground">
                {item.role}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}