import type { FieldValues } from "react-hook-form";

import type { CrudConfig, UseCrudHook } from "@/types/dasboard";
import { userConfig } from "@/modules/users/user.config";
import { useUserCrud } from "@/modules/users/useUserCrud";

import type { User } from "@/types/user/user.type";
import type { UserSchema } from "@/schemas/user.schema";
import { useSkillCrud } from "./skills/useSkillCrud";
import { skillConfig } from "./skills/skill.config";
import { SkillSchema } from "@/schemas/skill.schema";
import { SkillResponse } from "@/types/skill.types";

export type DashboardCrudModule<
  TData extends object,
  TSubmit extends FieldValues = FieldValues,
> = {
  config: CrudConfig<TData, TSubmit>;
  useCrud: UseCrudHook<TData, TSubmit>;
};

export const dashboardRegister = {
  users: {
    config: userConfig,
    useCrud: useUserCrud,
  } satisfies DashboardCrudModule<User, UserSchema>,
  skills: {
    config: skillConfig,
    useCrud: useSkillCrud,
  } satisfies DashboardCrudModule<SkillResponse, SkillSchema>,
} as const;

export type DashboardEntity = keyof typeof dashboardRegister;
