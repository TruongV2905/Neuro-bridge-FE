import type { FieldValues } from "react-hook-form";

import type { CrudConfig } from "@/types/dasboard";
import type { UseCrudHook } from "@/components/dashboard/crud/CrudPage";

import { userConfig } from "@/modules/users/user.config";
import { useUserCrud } from "@/modules/users/useUserCrud";

import type { User } from "@/types/user/user.type";
import type { UserSchema } from "@/schemas/user.schema";

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
} as const;

export type DashboardEntity = keyof typeof dashboardRegister;
