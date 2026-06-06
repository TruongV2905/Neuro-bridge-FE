# 🎛️ DASHBOARD UI MODULE DEVELOPMENT GUIDE

The Frontend Dashboard UI is designed with a reusable and scalable CRUD architecture.
Each dashboard feature is implemented as an independent module and then registered into the dynamic dashboard system.

This structure helps the project remain consistent, maintainable, and easy to scale when new business modules are added, such as `users`, `courses`, `programs`, `consultants`, `appointments`, or other management pages.

---

## 🛠️ PART 1: Guide for Core Developers

### When Adding a New Dashboard Module

When the system grows and a new dashboard module needs to be added, follow the standardized 8-step workflow below.

For example, when creating a new module named `users`, the module should be placed under:

```txt
src/modules/users/
```

The recommended module structure is:

```txt
src/modules/<module-name>/
├── types/
│   └── <module>.type.ts
│
├── services/
│   └── <module>.service.ts
│
├── schemas/
│   └── <module>.schema.ts
│
├── columns/
│   └── <module>.columns.tsx
│
├── configs/
│   └── <module>.config.ts
│
├── forms/
│   └── <Module>Form.tsx
│
└── hooks/
    └── use<Module>Crud.ts
```

---

## ⚠️ Important Development Rules

When adding a new dashboard module, only create or update files inside the module folder and the dashboard registry.

Do **not** modify the shared dashboard core files below:

```txt
src/types/crud.ts

src/components/dashboard/crud/CrudPage.tsx
src/components/dashboard/crud/CrudToolbar.tsx
src/components/dashboard/crud/CrudModal.tsx

src/components/dashboard/table/DataTable.tsx
src/components/dashboard/table/TablePagination.tsx

src/components/common/PageWrapper.tsx
```

These files are part of the reusable dashboard infrastructure.
Changing them may affect all existing dashboard modules.

All UI components must use the existing shadcn-based component system located in:

```txt
src/components/ui
```

Commonly used UI components include:

```txt
Button
Input
Select
Dialog
DropdownMenu
Table
Badge
Card
Form
Textarea
Checkbox
```

---

# 📦 Standard 8-Step Workflow

## Step 1: Create Types

Create the module type definition file.

Example:

```txt
src/modules/users/types/user.type.ts
```

This file defines the main entity, enum values, request payloads, and response types.

Example:

```ts
export type UserRole = "ADMINISTRATOR" | "AI_EXPERT" | "CLIENT"

export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED"

export interface User {
  userId: string
  fullName: string
  username: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt?: string
  updatedAt?: string
}
```

Purpose of this step:

```txt
Define a clear data contract for the module.
Avoid using any or duplicated object structures.
Ensure type safety across services, forms, columns, and configs.
```

---

## Step 2: Create API Service

Create the service file used to communicate with the backend API.

Example:

```txt
src/modules/users/services/user.service.ts
```

The service file should contain API functions such as:

```ts
getUsers()
getUserById()
createUser()
updateUser()
deleteUser()
```

Example:

```ts
import { api } from "@/services/api"
import type { User } from "../types/user.type"

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get("/identity/user")
    return response.data
  },

  createUser: async (payload: Partial<User>): Promise<User> => {
    const response = await api.post("/identity/user", payload)
    return response.data
  },

  updateUser: async (userId: string, payload: Partial<User>): Promise<User> => {
    const response = await api.put(`/identity/user/${userId}`, payload)
    return response.data
  },
}
```

Purpose of this step:

```txt
Keep API logic separated from UI components.
Make backend endpoints easier to maintain.
Allow hooks to reuse API methods cleanly.
```

Do **not** call APIs directly inside table, form, or page components.

---

## Step 3: Create Schema

Create the validation schema for the module form.

Example:

```txt
src/modules/users/schemas/user.schema.ts
```

Use Zod or the validation library currently used in the project.

Example:

```ts
import { z } from "zod"

export const userSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMINISTRATOR", "AI_EXPERT", "CLIENT"]),
  status: z.enum(["ACTIVE", "INACTIVE", "BANNED"]),
})

export type UserFormValues = z.infer<typeof userSchema>
```

Purpose of this step:

```txt
Validate form data before submitting to the API.
Keep form rules centralized.
Prevent invalid payloads from being sent to the backend.
```

---

## Step 4: Create Table Columns

Create the column definition file for the dashboard table.

Example:

```txt
src/modules/users/columns/user.columns.tsx
```

This file defines how the entity is displayed in the table.

Example:

```ts
import type { ColumnConfig } from "@/types/crud"
import type { User } from "../types/user.type"

export const userColumns: ColumnConfig<User>[] = [
  {
    key: "fullName",
    label: "User",
    sortable: true,
    searchable: true,
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    searchable: true,
  },
  {
    key: "role",
    label: "Role",
    sortable: true,
    filterable: true,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    filterable: true,
  },
]
```

Purpose of this step:

```txt
Control table display per module.
Define searchable, sortable, and filterable columns.
Keep table configuration outside the core DataTable component.
```

---

## Step 5: Create Module Config

Create the module configuration file.

Example:

```txt
src/modules/users/configs/user.config.ts
```

The config file connects the module metadata, table columns, and dashboard behavior.

Example:

```ts
import type { CrudConfig } from "@/types/crud"
import type { User } from "../types/user.type"
import { userColumns } from "../columns/user.columns"

export const userConfig: CrudConfig<User> = {
  entityName: "users",
  title: "User Management",
  description: "Manage users, roles, and account status.",
  columns: userColumns,
  searchableFields: ["fullName", "username", "email"],
  pagination: {
    enabled: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
}
```

Purpose of this step:

```txt
Define module-level dashboard behavior.
Provide metadata for the dashboard page.
Connect columns and search configuration.
```

---

## Step 6: Create Form Component

Create the form component used for create and update actions.

Example:

```txt
src/modules/users/forms/UserForm.tsx
```

The form should use shadcn UI components and receive props from the reusable `CrudModal`.

The form should support both create and edit mode.

Example responsibilities:

```txt
Render input fields.
Load default values when editing.
Validate form data using schema.
Submit data through the provided onSubmit handler.
Display validation errors clearly.
```

Example:

```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { userSchema, type UserFormValues } from "../schemas/user.schema"

interface UserFormProps {
  defaultValues?: Partial<UserFormValues>
  onSubmit: (values: UserFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function UserForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues,
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        placeholder="Full name"
        {...form.register("fullName")}
      />

      <Input
        placeholder="Email"
        {...form.register("email")}
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          Save
        </Button>
      </div>
    </form>
  )
}
```

Purpose of this step:

```txt
Keep create and update UI inside the module.
Reuse shadcn components for consistent styling.
Avoid modifying CrudModal or CrudPage.
```

---

## Step 7: Create CRUD Hook

Create a custom hook to manage the module CRUD workflow.

Example:

```txt
src/modules/users/hooks/useUserCrud.ts
```

The hook should handle API integration and business logic.

Example responsibilities:

```txt
Fetch data from API.
Create new records.
Update existing records.
Delete or disable records.
Manage loading state.
Manage error state.
Expose handlers to the dashboard page.
```

Example:

```ts
import { useEffect, useState } from "react"
import type { User } from "../types/user.type"
import { userService } from "../services/user.service"

export function useUserCrud() {
  const [data, setData] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchUsers = async () => {
    setIsLoading(true)

    try {
      const users = await userService.getUsers()
      setData(users)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (payload: Partial<User>) => {
    const createdUser = await userService.createUser(payload)
    setData((prev) => [createdUser, ...prev])
  }

  const handleUpdate = async (userId: string, payload: Partial<User>) => {
    const updatedUser = await userService.updateUser(userId, payload)

    setData((prev) =>
      prev.map((user) =>
        user.userId === userId ? updatedUser : user
      )
    )
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    data,
    isLoading,
    fetchUsers,
    handleCreate,
    handleUpdate,
  }
}
```

Purpose of this step:

```txt
Keep business logic outside UI components.
Make each module easier to maintain.
Allow service logic to be reused cleanly.
```

---

## Step 8: Register Module into Dashboard

After completing the module, register it in the dashboard registry.

Example:

```txt
src/modules/dashboard-register.ts
```

Example:

```ts
import { userConfig } from "@/modules/users/configs/user.config"
import { UserForm } from "@/modules/users/forms/UserForm"

export const dashboardRegister = {
  users: {
    config: userConfig,
    Form: UserForm,
  },
}
```

Once registered, the module can be accessed through the dynamic dashboard route:

```txt
/dashboard/users
```

Purpose of this step:

```txt
Expose the module to the dashboard system.
Enable dynamic routing for the module.
Connect config and form to the reusable CrudPage.
```

---

# 🧩 PART 2: Guide for Teammates

## When Working With Existing Dashboard Modules

When pulling the project or working on an existing dashboard module, follow these rules:

## 1. Do Not Modify Core Dashboard Components

Avoid editing these files unless the whole team agrees that the dashboard core behavior must change:

```txt
src/types/crud.ts
src/components/dashboard/crud/CrudPage.tsx
src/components/dashboard/crud/CrudToolbar.tsx
src/components/dashboard/crud/CrudModal.tsx
src/components/dashboard/table/DataTable.tsx
src/components/dashboard/table/TablePagination.tsx
src/components/common/PageWrapper.tsx
```

These files are shared by all dashboard modules.

---

## 2. Work Only Inside the Target Module

For example, when working on the `users` module, changes should usually be limited to:

```txt
src/modules/users/
```

Typical files to update:

```txt
types/user.type.ts
services/user.service.ts
schemas/user.schema.ts
columns/user.columns.tsx
configs/user.config.ts
forms/UserForm.tsx
hooks/useUserCrud.ts
```

---

## 3. Use shadcn UI Components

Use existing UI components from:

```txt
src/components/ui
```

Do not create duplicate button, input, modal, select, or table components if the project already provides them.

Example:

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Dialog } from "@/components/ui/dialog"
```

---

## 4. Keep API Logic in Services

API calls should be placed in:

```txt
src/modules/<module-name>/services/
```

Do not write API calls directly inside:

```txt
Form components
Table components
Page components
Modal components
```

This keeps the code easier to debug and prevents UI components from becoming too complex.

---

## 5. Keep CRUD Logic in Hooks

Business logic for fetching, creating, updating, deleting, banning, activating, or disabling records should be placed in:

```txt
src/modules/<module-name>/hooks/use<Module>Crud.ts
```

This makes the module easier to test, reuse, and maintain.

---

# ✅ Final Checklist Before Registering a Module

Before registering a new module into the dashboard, make sure all items below are completed:

```txt
[ ] Type definitions are created.
[ ] API service functions are implemented.
[ ] Validation schema is created.
[ ] Table columns are configured.
[ ] Module config is completed.
[ ] Form component supports create and edit modes.
[ ] CRUD hook handles API workflow.
[ ] shadcn UI components are used.
[ ] No shared dashboard core file is modified.
[ ] Module is registered in dashboard-register.ts.
[ ] Dynamic route works correctly.
```

---

# 🚀 Summary

To add a new Dashboard UI module, always follow this workflow:

```txt
Step 1: types
Step 2: services/api
Step 3: schemas
Step 4: columns
Step 5: configs
Step 6: forms
Step 7: hooks/useXxxCrud
Step 8: register into dashboard
```

This standardized structure ensures that the Dashboard UI remains clean, scalable, reusable, and consistent across all modules in the system.
