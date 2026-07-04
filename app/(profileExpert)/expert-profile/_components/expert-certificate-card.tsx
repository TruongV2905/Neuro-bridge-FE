import { Award, CalendarDays, ExternalLink, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CertificateResponse } from "@/types/certificate.types"

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN")
}

export function ExpertCertificateCard({
  item,
}: {
  item: CertificateResponse
}) {
  return (
    <div className="group relative rounded-[2rem] bg-border p-[1px] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(95,123,255,0.15)]">
      <div
        style={{
          background:
            "linear-gradient(to right, #5f7bff 0%, #3e5ee0 35%, #8b5cf6 65%, #ec4899 100%)",
        }}
        className="absolute inset-0 rounded-[2rem] opacity-0 blur-[1px] transition-opacity duration-500 group-hover:opacity-100"
      />

      <Card className="relative z-10 h-full rounded-[calc(2rem-1px)] border-border bg-card shadow-sm">
        <CardContent className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Award size={22} />
            </div>

            <Badge variant="outline" className="gap-1">
              <ShieldCheck size={14} />
              Verified
            </Badge>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-foreground">
                {item.certificateName}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {item.issuingOrganization}
              </p>
            </div>

            {item.credentialUrl && (
              <a
                href={item.credentialUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
              >
                <ExternalLink size={17} />
              </a>
            )}
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays size={15} />
                Issue Date
              </span>
              <span className="font-medium text-foreground">
                {formatDate(item.issueDate)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">
                Expiration
              </span>
              <span className="font-medium text-foreground">
                {formatDate(item.expirationDate)}
              </span>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">
                Credential ID
              </p>
              <p className="mt-1 break-all text-sm font-medium text-foreground">
                {item.credentialId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}