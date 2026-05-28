"use client"

import { notFound, useParams } from "next/navigation"
import { CrudPage } from "@/components/dashboard/crud/CrudPage"
import {
  dashboardRegister,
  type DashboardEntity,
} from "@/modules/dashboard-register"

export default function DashboardEntityPage() {
  const params = useParams<{ entities: string }>()

  const entity = params.entities as DashboardEntity

  const dashboardModule = dashboardRegister[entity]

  if (!dashboardModule) {
    notFound()
  }

  const { config, Form } = dashboardModule

  return <CrudPage config={config} Form={Form} />
}