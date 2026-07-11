"use client";

import { notFound, useParams } from "next/navigation";

import {
  dashboardRegister,
  type DashboardEntity,
} from "@/modules/dashboard-register";

function isDashboardEntity(value: string): value is DashboardEntity {
  return value in dashboardRegister;
}

export default function DashboardEntityPage() {
  const params = useParams<{ entities: string }>();

  const entity = params.entities;

  if (!isDashboardEntity(entity)) {
    notFound();
  }

  return dashboardRegister[entity].render();
}
