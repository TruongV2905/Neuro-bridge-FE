import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"
import muiTen from "@/public/figma/homepage/duong-dan-anh-mui-ten.svg"

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
      variant={"default"}
      size="cta"
      className={cn(
        "bg-linear-to-r from-[#5470ff] to-[#fc38da] text-white transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-105",
        className,
      )}
    >
      <Link href={href}>
        {children}{' '}
        <Image
          src={muiTen}
          alt=""
          aria-hidden="true"
          width={16}
          height={16}
        />
      </Link>
    </Button>
  )
}
