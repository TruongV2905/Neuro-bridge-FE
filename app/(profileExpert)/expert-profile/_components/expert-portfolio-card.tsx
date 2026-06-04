import { ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PortfolioApiItem } from "@/services/portfolio-api"

export function ExpertPortfolioCard({ item }: { item: PortfolioApiItem }) {
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
        <CardContent className="flex h-full flex-col p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 font-semibold text-foreground">
              {item.title}
            </h3>

            {item.projectUrl && (
              <a
                href={item.projectUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
              >
                <ExternalLink size={17} />
              </a>
            )}
          </div>

          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Technologies
              </p>

              <div className="flex flex-wrap gap-2">
                {item.technologies
                  ?.split(",")
                  .map((tech) => tech.trim())
                  .filter(Boolean)
                  .map((tech) => (
                    <Badge key={tech} variant="outline">
                      {tech}
                    </Badge>
                  ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Role in Project</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {item.roleInProject}
              </p>
            </div>

            <p className="mt-auto text-xs text-muted-foreground">
              Completed:{" "}
              {new Date(item.completedDate).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}