import { Button } from "@/components/ui/button"

export function ClientProfileIconBox({ children }: { children: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-10 w-10 rounded-xl bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
    >
      {children}
    </Button>
  )
}
