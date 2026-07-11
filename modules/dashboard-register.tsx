import type { ReactNode } from "react";
import type { FieldValues } from "react-hook-form";

import { CrudPage } from "@/components/dashboard/crud/CrudPage";

import type { CrudConfig, UseCrudHook } from "@/types/dasboard";

import { userConfig } from "@/modules/users/user.config";
import { useUserCrud } from "@/modules/users/useUserCrud";
import type { User } from "@/types/user/user.type";

import { useSkillCrud } from "./skills/useSkillCrud";
import { skillConfig } from "./skills/skill.config";
import type { SkillSchema } from "@/schemas/skill.schema";
import type { SkillResponse } from "@/types/skill.types";

export type DashboardCrudModule<
  TData extends object,
  TSubmit extends FieldValues = FieldValues,
  TFilter extends object = Record<string, unknown>,
> = {
  config: CrudConfig<TData, TSubmit, TFilter>;
  useCrud: UseCrudHook<TData, TSubmit, TFilter>;
  render: () => ReactNode;
};

export const dashboardRegister = {
  users: {
    config: userConfig,
    useCrud: useUserCrud,
    render: () => (
      <CrudPage<User>
        config={userConfig}
        useCrud={useUserCrud}
      />
    ),
  } satisfies DashboardCrudModule<User>,

  skills: {
    config: skillConfig,
    useCrud: useSkillCrud,
    render: () => (
      <CrudPage<SkillResponse, SkillSchema>
        config={skillConfig}
        useCrud={useSkillCrud}
      />
    ),
  } satisfies DashboardCrudModule<SkillResponse, SkillSchema>,
} as const;

export type DashboardEntity = keyof typeof dashboardRegister;