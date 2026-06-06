import type { CrudConfig } from "@/types/crud"
import type { User } from "@/types/user/user.type"
import { userSchema } from "@/schemas/user.schema"
import { userColumns } from "../table/user.column"

export const userConfig: CrudConfig<User> = {
  entityName: "user",
  title: "User Management",
  description: "Manage Neuro Bridge users, roles, and account status",

  schema: userSchema,

  data: [],

  table: {
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },

  columns: userColumns,

  fields: [],
}