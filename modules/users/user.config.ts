import type { CrudConfig } from "@/types/dasboard";
import type { User } from "@/types/user/user.type";
import { UserSchema, userSchema } from "@/schemas/user.schema";
import { userColumns } from "./user.column";
import { userFields } from "./user.form";
import { userFilters } from "./user.filter";

export const userConfig: CrudConfig<User, UserSchema> = {
  entityName: "user",
  title: "User Management",
  description: "Manage Neuro Bridge users, roles, and account status",

  schema: userSchema,

  table: {
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
  columns: userColumns,
  filters: userFilters,
  fields: userFields,
};
