import { Card, CardContent } from "@/components/ui/card"

type PortfolioItem = {
  title: string
  description: string
  image: string
}

export function ExpertPortfolioCard({ item }: { item: PortfolioItem }) {
  return (
  <div className="group relative rounded-xl bg-border p-[1px] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(95,123,255,0.15)]">
    
    {/* Gradient Border */}
    <div
      style={{
        background:
          "linear-gradient(to right, #5f7bff 0%, #3e5ee0 35%, #8b5cf6 65%, #ec4899 100%)",
      }}
      className="absolute inset-0 rounded-xl opacity-0 blur-[1px] transition-opacity duration-500 group-hover:opacity-100"
    />

    <Card className="relative z-10 overflow-hidden border-border bg-card shadow-sm transition-colors duration-500 group-hover:bg-card">
      <img
        src={item.image}
        alt={item.title}
        className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />

      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground">
          {item.title}
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          {item.description}
        </p>
      </CardContent>
    </Card>
  </div>
)
}