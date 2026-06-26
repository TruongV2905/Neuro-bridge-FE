"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, type Variants } from "framer-motion"
import {
    ArrowRight,
    Check,
    Home,
    ReceiptText,
    ShieldCheck,
    X,
} from "lucide-react"

import type { PaymentStatus } from "@/types/payment.type"
import { PAYMENT_STATUS_CONTENT } from "../_constants/payment.constant"

type PaymentStatusCardProps = {
    status: PaymentStatus
}

const fadeUp: Variants = {
    hidden: {
        opacity: 0,
        y: 24,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: "easeOut",
        },
    },
}

const staggerContainer: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.12,
        },
    },
}

export function PaymentStatusCard({ status }: PaymentStatusCardProps) {
    const [isLoading, setIsLoading] = useState(true)

    const isSuccess = status === "success"
    const content = PAYMENT_STATUS_CONTENT[status]

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setIsLoading(false)
        }, 1200)

        return () => window.clearTimeout(timer)
    }, [status])

    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-28 sm:px-6 lg:px-8">
            <div
                className={`absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${isLoading
                    ? "bg-[var(--primary)]/20"
                    : isSuccess
                        ? "bg-emerald-200/50"
                        : "bg-rose-200/50"
                    }`}
            />

            <motion.div
                initial="hidden"
                animate="show"
                variants={staggerContainer}
                className="relative z-10 w-full max-w-4xl"
            >
                <motion.div
                    variants={fadeUp}
                    className={`rounded-[36px] border bg-white p-6 text-center shadow-sm sm:p-10 ${isLoading
                        ? "border-[var(--primary)]/20"
                        : isSuccess
                            ? "border-emerald-100"
                            : "border-rose-100"
                        }`}
                >
                    <motion.div variants={fadeUp} className="flex justify-center">
                        <div
                            className={`relative flex h-44 w-44 items-center justify-center rounded-full ${isLoading
                                ? "bg-[var(--primary)]/5"
                                : isSuccess
                                    ? "bg-emerald-50"
                                    : "bg-rose-50"
                                }`}
                        >
                            <div
                                className={`absolute h-36 w-36 rounded-full border ${isLoading
                                    ? "border-[var(--primary)]/20"
                                    : isSuccess
                                        ? "border-emerald-200"
                                        : "border-rose-200"
                                    }`}
                            />

                            <div
                                className={`absolute h-28 w-28 rounded-full ${isLoading
                                    ? "bg-[var(--primary)]/10"
                                    : isSuccess
                                        ? "bg-emerald-100"
                                        : "bg-rose-100"
                                    }`}
                            />

                            <div
                                className={`relative flex h-24 w-24 items-center justify-center rounded-full text-white shadow-lg ${isLoading
                                    ? "bg-[var(--primary)]"
                                    : isSuccess
                                        ? "bg-emerald-500"
                                        : "bg-rose-500"
                                    }`}
                            >
                                {isLoading ? (
                                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/40 border-t-white" />
                                ) : isSuccess ? (
                                    <Check className="h-12 w-12" />
                                ) : (
                                    <X className="h-12 w-12" />
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={fadeUp}>
                        <span
                            className={`mt-8 inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ${isLoading
                                ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                                : isSuccess
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                                }`}
                        >
                            {isLoading ? "Loading payment result" : content.badge}
                        </span>

                        <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                            {isLoading ? "Checking payment result..." : content.title}
                        </h1>

                        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500">
                            {isLoading
                                ? "Please wait a moment while we load your transaction result."
                                : content.description}
                        </p>
                    </motion.div>

                    {!isLoading && (
                        <>
                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                animate="show"
                                className={`mx-auto mt-8 max-w-2xl rounded-3xl border p-5 text-left ${isSuccess
                                    ? "border-emerald-100 bg-emerald-50/40"
                                    : "border-rose-100 bg-rose-50/40"
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                                        <ReceiptText className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-slate-950">
                                            {content.summaryTitle}
                                        </h2>
                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                            {content.summaryDescription}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                animate="show"
                                className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-2"
                            >
                                <Link
                                    href={content.primaryActionHref}
                                    className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${isSuccess
                                            ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg"
                                            : "bg-rose-600 hover:bg-rose-700 hover:shadow-lg"
                                        }`}
                                >
                                    {content.primaryActionLabel}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>

                                <Link
                                    href={content.secondaryActionHref}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[var(--primary)]/20 bg-white px-6 text-sm font-semibold text-[var(--primary)] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 hover:shadow-[0_12px_32px_rgba(84,112,255,0.18)]"
                                >
                                    <Home className="h-4 w-4" />
                                    {content.secondaryActionLabel}
                                </Link>
                            </motion.div>

                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                animate="show"
                                className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500"
                            >
                                <ShieldCheck
                                    className={`h-4 w-4 ${isSuccess ? "text-emerald-500" : "text-rose-500"
                                        }`}
                                />
                                Your payment is secure and protected by Neuro Bridge
                            </motion.div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </section>
    )
}