"use client";

import { notFound, useParams } from "next/navigation";
import type { FieldValues } from "react-hook-form";

import { CrudPage } from "@/components/dashboard/crud/CrudPage";
import {
  dashboardRegister,
  type DashboardEntity,
} from "@/modules/dashboard-register";
import type { CrudConfig, UseCrudHook } from "@/types/dasboard";

type DynamicCrudConfig = CrudConfig<object, FieldValues, Record<string, unknown>>;
type DynamicCrudHook = UseCrudHook<object, FieldValues, Record<string, unknown>>;

export default function DashboardEntityPage() {
  const params = useParams<{ entities: string }>();

  const entity = params.entities as DashboardEntity;
  const dashboardModule = dashboardRegister[entity];

  if (!dashboardModule) {
    notFound();
  }

  const config = dashboardModule.config as unknown as DynamicCrudConfig;
  const useCrud = dashboardModule.useCrud as unknown as DynamicCrudHook;

  return <CrudPage config={config} useCrud={useCrud} />;
}
