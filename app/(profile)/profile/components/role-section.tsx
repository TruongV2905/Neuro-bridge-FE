import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RoleSectionProps {
  title: string
  description: string
  children: React.ReactNode
}

export function RoleSection({ title, description, children }: RoleSectionProps) {
  return (
    <Card className="mt-8 rounded-2xl border border-border bg-muted/30 shadow-none">
      <CardHeader>
        <CardTitle className="text-card-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">{children}</div>
      </CardContent>
    </Card>
  )
}