import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowBigRight } from "lucide-react";

export function GradientLabel({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <p
      className={cn(
        "bg-linear-to-r from-[#5470ff] to-[#fc38da] bg-clip-text  font-extrabold tracking-[0.04em] font-display text-3xl text-[#e5e7eb]/60",
        className,
      )}
    >
      {children}
    </p>
  );
}

interface GradientCtaLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function GradientCtaLink({
  href,
  children,
  className,
}: Readonly<GradientCtaLinkProps>) {
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
        {children} <ArrowBigRight />
      </Link>
    </Button>
  );
}
