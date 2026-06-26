"use client"

import { useSearchParams } from "next/navigation"

import { PaymentStatusCard } from "./_components/payment-status-card"
import type { PaymentStatus } from "@/types/payment.type"

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const statusParam = searchParams.get("status")

  const status: PaymentStatus =
    statusParam === "success" ? "success" : "failed"

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50">
      <PaymentStatusCard status={status} />
    </main>
  )
}