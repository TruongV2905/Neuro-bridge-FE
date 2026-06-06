import type { ComponentType } from "react"

import type { CrudConfig } from "@/types/crud"
import type { CrudFormProps, UseCrudHook } from "@/components/dashboard/crud/CrudPage"

import { userConfig } from "@/modules/users/configs/user.config"
import { UserForm } from "@/modules/users/forms/UserForm"
import { useUserCrud } from "@/modules/users/hooks/useUserCrud"

import type { User } from "@/types/user/user.type"
import type { UserSchema } from "@/schemas/user.schema"

export type DashboardCrudModule<
  TData extends object,
  TSubmit extends object = TData,
> = {
  config: CrudConfig<TData>
  Form: ComponentType<CrudFormProps<TData, TSubmit>>
  useCrud: UseCrudHook<TData, TSubmit>
}

export const dashboardRegister = {
  users: {
    config: userConfig,
    Form: UserForm,
    useCrud: useUserCrud,
  } satisfies DashboardCrudModule<User, UserSchema>,
} as const

export type DashboardEntity = keyof typeof dashboardRegister