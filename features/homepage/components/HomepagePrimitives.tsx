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
        "h-14 gap-2 rounded-full bg-linear-to-r from-[#5470ff] to-[#fc38da] px-8 text-base font-bold text-white transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-105 sm:h-16 sm:px-10 [&_svg:not([class*='size-'])]:size-5",
        className,
      )}
    >
      <Link href={href}>
        {children} <ArrowBigRight />
      </Link>
    </Button>
  );
}
