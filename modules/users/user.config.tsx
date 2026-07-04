import type { CrudConfig } from "@/types/dasboard";
import type { User } from "@/types/user/user.type";
import type { UserSchema } from "@/schemas/user.schema";
import { userColumns } from "./user.column";
import { userFilters } from "./user.filter";
import { userCustomActions } from "./user.customAction";
import { mockUsers } from "./user.mock";
import UserView from "./user.view";
export const userConfig: CrudConfig<User, UserSchema> = {
  entityName: "user",
  title: "User Management",
  description: "Manage Neuro Bridge users, roles, and account status",

  table: {
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
  actions: {
    view: true,
    edit: false,
    delete: false,
  },
  columns: userColumns,
  filters: userFilters,
  customActions: userCustomActions,
  view: {
    title: "User Details",
    render: (user: User) => <UserView user={user} />,
  },
  // mockData: mockUsers,
  // useMockData: true
};
