import type { CrudConfig } from "@/types/crud"
import type { User } from "@/types/user"
import { mockUsers } from "@/mocks/user.mock"

export const userConfig: CrudConfig<User> = {
  entityName: "user",
  title: "User Management",

  data: mockUsers,

  table: {
    pagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },

  columns: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
  ],

  fields: [
    {
      name: "id",
      label: "User ID",
      type: "text",
      span: 6,
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      span: 6,
    },
    {
      name: "email",
      label: "Email",
      type: "text",
      span: 6,
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      span: 6,
      options: [
        { label: "Admin", value: "ADMIN" },
        { label: "Staff", value: "STAFF" },
        { label: "User", value: "USER" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      span: 6,
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
      ],
    },
  ],
}