import type { ComponentType } from "react"

import type { CrudConfig } from "@/types/crud"
import { userConfig } from "@/modules/users/configs/user.config"
import { UserForm } from "@/modules/users/forms/UserForm"
import type { User } from "@/modules/users/types/user.type"
import type { UserSchema } from "@/modules/users/schemas/user.schema"

export type DashboardFormMode = "create" | "edit"

export type DashboardFormProps<
  TData extends object,
  TSubmit extends object = TData,
> = {
  mode?: DashboardFormMode
  defaultValues?: Partial<TData>
  onSubmit?: (values: TSubmit) => void | Promise<void>
  onCancel?: () => void
  submitLabel?: string
  isSubmitting?: boolean
}

export type DashboardCrudModule<
  TData extends object,
  TSubmit extends object = TData,
> = {
  config: CrudConfig<TData>
  Form: ComponentType<DashboardFormProps<TData, TSubmit>>
}

export const dashboardRegister = {
  users: {
    config: userConfig,
    Form: UserForm,
  } satisfies DashboardCrudModule<User, UserSchema>,
} as const

export type DashboardEntity = keyof typeof dashboardRegister