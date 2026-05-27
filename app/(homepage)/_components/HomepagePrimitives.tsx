import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function GradientLabel({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p className="bg-linear-to-r from-[#5470ff] to-[#fc38da] bg-clip-text text-xs font-extrabold tracking-[0.04em] text-transparent sm:text-sm">
      {children}
    </p>
  )
}

interface GradientCtaLinkProps {
  href: string
  children: ReactNode
  className?: string
}

export function GradientCtaLink({ href, children, className }: Readonly<GradientCtaLinkProps>) {
  return (
    <Button
      asChild
      size="cta"
      className={cn(
        "bg-linear-to-r from-[#5470ff] to-[#fc38da] text-white transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-105",
        className,
      )}
    >
      <Link href={href}>
        {children} <span aria-hidden="true">&nearr;</span>
      </Link>
    </Button>
  )
}
