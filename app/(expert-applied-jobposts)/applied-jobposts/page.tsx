"use client"

import { useMemo, useState } from "react"
import { Search, Sparkles } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import type { AppliedJobStatus } from "@/types/applied-job.type"
import { appliedJobMock } from "./_mock/applied-job.mock"
import { AppliedJobFilter } from "./_components/applied-job-filter"
import { AppliedJobList } from "./_components/applied-job-list"
import Header from "@/components/layout/Header"

type FilterValue = "ALL" | AppliedJobStatus

const containerVariants: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.12,
        },
    },
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

export default function ExpertAppliedJobPostsPage() {
    const [search, setSearch] = useState("")
    const [activeFilter, setActiveFilter] = useState<FilterValue>("ALL")

    const filteredJobs = useMemo(() => {
        return appliedJobMock.filter((job) => {
            const matchSearch =
                job.title.toLowerCase().includes(search.toLowerCase()) ||
                job.companyName.toLowerCase().includes(search.toLowerCase()) ||
                job.skills.some((skill) =>
                    skill.toLowerCase().includes(search.toLowerCase()),
                )

            const matchStatus =
                activeFilter === "ALL" || job.status === activeFilter

            return matchSearch && matchStatus
        })
    }, [search, activeFilter])

    return (

        <main className="min-h-screen bg-background px-4 pb-12 pt-28 sm:px-6 lg:px-8">
            <Header />
            <motion.div
                className="mx-auto max-w-6xl"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <motion.section
                    variants={fadeUp}
                    className="relative overflow-hidden rounded-[32px] border border-border bg-white p-6 shadow-sm sm:p-8"
                >
                    <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--primary)]/10 blur-3xl" />
                    <div className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[var(--secondary)]/10 blur-3xl" />

                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-4 py-2 text-sm font-bold text-[var(--primary)]">
                                <Sparkles className="h-4 w-4" />
                                Expert Workspace
                            </div>

                            <h1 className="mt-5 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                                My Applied Job Posts
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Track all job posts you have applied to, review application
                                status, and continue the next steps with clients.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[var(--primary)]/10 bg-[var(--primary)]/5 px-5 py-4">
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Applications
                            </p>
                            <p className="mt-1 text-3xl font-black text-foreground">
                                {appliedJobMock.length}
                            </p>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    variants={fadeUp}
                    className="mt-6 rounded-[28px] border border-border bg-white p-5 shadow-sm"
                >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-md">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by job, company, or skill..."
                                className="h-12 w-full rounded-2xl border border-border bg-white pl-11 pr-4 text-sm font-medium text-foreground outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                            />
                        </div>

                        <AppliedJobFilter
                            activeFilter={activeFilter}
                            onChange={setActiveFilter}
                        />
                    </div>
                </motion.section>

                <motion.section
                    variants={fadeUp}
                    className="mt-6"
                >
                    <AppliedJobList jobs={filteredJobs} />
                </motion.section>
            </motion.div>
        </main>
    )
}