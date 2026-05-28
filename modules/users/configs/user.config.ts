import type { CrudConfig } from "@/types/crud"
import type { User } from "../types/user.type"
import { UserGender, UserRole, UserStatus } from "../types/user.type"
import { mockUsers } from "../mocks/user.mock"
import { userSchema } from "../schemas/user.schema"
import { userColumns } from "../table/user.column"

export const userConfig: CrudConfig<User> = {
  entityName: "user",
  title: "User Management",
  description: "Manage Neuro Bridge users, roles, and account status",

  schema: userSchema,

  data: mockUsers,

  table: {
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },

  columns: userColumns,

  fields: [
    {
      name: "userId",
      label: "User ID",
      type: "text",
      span: 6,
      disabled: true,
    },
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter full name",
      span: 6,
    },
    {
      name: "userName",
      label: "Username",
      type: "text",
      placeholder: "Enter username",
      span: 6,
    },
    {
      name: "email",
      label: "Email",
      type: "text",
      placeholder: "Enter email",
      span: 6,
    },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      span: 6,
      options: [
        {
          label: "Male",
          value: UserGender.MALE,
        },
        {
          label: "Female",
          value: UserGender.FEMALE,
        },
        {
          label: "Other",
          value: UserGender.OTHER,
        },
      ],
    },
    {
      name: "avatarUrl",
      label: "Avatar URL",
      type: "text",
      placeholder: "Enter avatar URL",
      span: 6,
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      type: "text",
      placeholder: "Enter phone number",
      span: 6,
    },
    {
      name: "address",
      label: "Address",
      type: "text",
      placeholder: "Enter address",
      span: 6,
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      span: 6,
      options: [
        {
          label: "Administrator",
          value: UserRole.ADMINISTRATOR,
        },
        {
          label: "AI Expert",
          value: UserRole.AI_EXPERT,
        },
        {
          label: "Client",
          value: UserRole.CLIENT,
        },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      span: 6,
      options: [
        {
          label: "Active",
          value: UserStatus.ACTIVE,
        },
        {
          label: "Inactive",
          value: UserStatus.INACTIVE,
        },
        {
          label: "Banned",
          value: UserStatus.BANNED,
        },
      ],
    },
  ],
}