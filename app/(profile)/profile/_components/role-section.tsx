import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RoleSectionProps {
  title: string
  description: string
  children: React.ReactNode
}

export function RoleSection({ title, description, children }: RoleSectionProps) {
  return (
    /* Sửa bg-muted/30 thành bg-card để lên màu nền trắng hệ thống, và bật shadow-md */
    <Card className="rounded-[2rem] border border-border bg-card shadow-md overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/60 py-4 px-6">
        <CardTitle className="text-base font-black text-card-foreground">{title}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-2">{children}</div>
      </CardContent>
    </Card>
  )
}