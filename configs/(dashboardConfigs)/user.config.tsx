// import type { CrudConfig } from "@/types/crud"
// import type { User } from "@/types/user"
// import { mockUsers } from "@/mocks/user.mock"

// export const userConfig: CrudConfig<User> = {
//   entityName: "user",
//   title: "User Management",

//   data: mockUsers,

//   table: {
//     pagination: true,
//     pageSize: 10,
//     pageSizeOptions: [10, 25, 50, 100],
//   },

//   columns: [
//     { key: "id", label: "ID" },
//     { key: "name", label: "Name" },
//     { key: "email", label: "Email" },
//     { key: "role", label: "Role" },
//     { key: "status", label: "Status" },
//   ],

//   fields: [
//     {
//       name: "id",
//       label: "User ID",
//       type: "text",
//       span: 6,
//     },
//     {
//       name: "name",
//       label: "Name",
//       type: "text",
//       span: 6,
//     },
//     {
//       name: "email",
//       label: "Email",
//       type: "text",
//       span: 6,
//     },
//     {
//       name: "role",
//       label: "Role",
//       type: "select",
//       span: 6,
//       options: [
//         { label: "Admin", value: "ADMIN" },
//         { label: "Staff", value: "STAFF" },
//         { label: "User", value: "USER" },
//       ],
//     },
//     {
//       name: "status",
//       label: "Status",
//       type: "select",
//       span: 6,
//       options: [
//         { label: "Active", value: "ACTIVE" },
//         { label: "Inactive", value: "INACTIVE" },
//       ],
//     },
//   ],
// }

"use client";

import type { CrudConfig } from "@/types/crud"
import type { User } from "@/types/user"
import { mockUsers } from "@/mocks/user.mock"
import React from "react"

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
    { key: "userId", label: "User ID" },
    { key: "name", label: "Name" },
    { key: "userName", label: "Username" },
    { key: "email", label: "Email" },
    { 
      key: "role", 
      label: "Role",
      render: (value) => {
        const colorMap: Record<string, string> = {
          ADMINISTRATOR: "bg-destructive text-destructive-foreground", // Đỏ
          AI_EXPERT: "bg-primary text-primary-foreground", // Xanh (--primary)
          CLIENT: "bg-secondary text-secondary-foreground", // Hồng (--secondary)
        };
        const className = colorMap[String(value)] || "bg-muted text-muted-foreground";
        return (
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${className}`}>
            {String(value).replace("_", " ")}
          </span>
        );
      }
    },
    { 
      key: "status", 
      label: "Status",
      render: (value) => {
        const colorMap: Record<string, string> = {
          ACTIVE: "text-green-600 bg-green-100 dark:bg-green-900/30",
          INACTIVE: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
          BANNED: "text-red-600 bg-red-100 dark:bg-red-900/30",
        };
        const className = colorMap[String(value)] || "text-gray-600 bg-gray-100";
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${className}`}>
            {String(value)}
          </span>
        );
      }
    },
  ],

  fields: [
    { name: "userId", label: "User ID", type: "text", span: 6, disabled: true },
    { name: "name", label: "Full Name", type: "text", span: 6 },
    { name: "userName", label: "Username", type: "text", span: 6 },
    { name: "email", label: "Email", type: "text", span: 6 },
    { name: "phoneNumber", label: "Phone Number", type: "text", span: 6 },
    { name: "address", label: "Address", type: "text", span: 6 },
    {
      name: "role",
      label: "Role",
      type: "select",
      span: 6,
      options: [
        { label: "Administrator", value: "ADMINISTRATOR" },
        { label: "AI Expert", value: "AI_EXPERT" },
        { label: "Client", value: "CLIENT" },
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
        { label: "Banned", value: "BANNED" },
      ],
    },
  ],
}