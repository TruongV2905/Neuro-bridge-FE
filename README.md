# 🎛️ DASHBOARD UI MODULE DEVELOPMENT GUIDE

The Frontend Dashboard UI is built with a reusable and scalable CRUD-based architecture.

Each dashboard feature is developed as an independent module and then registered into the dynamic dashboard system. This approach helps the project remain consistent, maintainable, and easy to extend when new business modules are added.

Examples of dashboard modules include:

* User Management
* Course Management
* Program Management
* Program Registration Management
* Consultant Management
* Appointment Management
* Report Management

---

## 🛠️ PART 1: Guide for Core Developers

### When Scaling or Adding a New Dashboard Module

When the system grows and a new dashboard module needs to be added, follow the standardized development workflow below.

A dashboard module should be placed inside:

```txt
src/modules/<module-name>/
```

For example:

```txt
src/modules/users/
src/modules/courses/
src/modules/programs/
```

The module folder is responsible for UI configuration, table columns, forms, hooks, and module-level logic.

Recommended module structure:

```txt
src/modules/<module-name>/
├── types/
├── columns/
├── configs/
├── forms/
└── hooks/
```

API services and validation schemas are placed outside the module folder to keep shared backend communication and validation logic centralized.

Recommended shared structure:

```txt
src/services/
└── <module>.service.ts

src/schemas/
└── <module>.schema.ts
```

---

## ⚠️ Important Development Rules

When adding or updating a dashboard module, developers should only work inside the target module folder, the related service file, the related schema file, and the dashboard registry.

Do **not** modify the shared dashboard core files unless the whole team agrees that the global dashboard behavior needs to change.

The following files are considered shared dashboard infrastructure:

```txt
src/types/crud.ts

src/components/dashboard/crud/CrudPage.tsx
src/components/dashboard/crud/CrudToolbar.tsx
src/components/dashboard/crud/CrudModal.tsx

src/components/dashboard/table/DataTable.tsx
src/components/dashboard/table/TablePagination.tsx

src/components/common/PageWrapper.tsx
```

These files are reused by all dashboard modules.
Changing them may affect every existing dashboard page.

All UI elements must use the existing shadcn-based component system from:

```txt
src/components/ui
```

Developers should reuse available UI components such as buttons, inputs, selects, dialogs, tables, badges, dropdown menus, textareas, checkboxes, and cards instead of creating duplicated UI components.

---

# 📦 Standard Dashboard Module Workflow

## Step 1: Define Module Types

Create the type definition file for the module.

This step is used to define the data structure of the module, including:

* Main entity type
* Enum values
* API request types
* API response types
* Optional display-related types

The purpose of this step is to make the module type-safe and prevent duplicated or unclear data structures across services, forms, columns, configs, and hooks.

Example location:

```txt
src/modules/<module-name>/types/<module>.type.ts
```

---

## Step 2: Create API Service Layer

Create the API service file for the module.

Services are placed outside `src/modules` because they are part of the shared API communication layer.

Example location:

```txt
src/services/<module>.service.ts
```

The service layer is responsible for communicating with the backend API. It should contain all API-related functions such as fetching data, creating records, updating records, deleting records, banning accounts, activating accounts, or performing other module-specific actions.

The service layer helps keep API logic separated from UI components.

Do **not** call APIs directly inside:

```txt
Page components
Table components
Form components
Modal components
```

All backend communication should go through the service layer.

---

## Step 3: Create Validation Schema

Create the validation schema for the module form.

Schemas are placed outside `src/modules` because validation rules may be reused by multiple components, pages, or workflows.

Example location:

```txt
src/schemas/<module>.schema.ts
```

The schema is used to validate create and update data before submitting it to the backend.

The schema should define:

* Required fields
* Optional fields
* Field length rules
* Enum validation
* Email or URL validation
* Any business input constraints required by the module

The purpose of this step is to keep form validation centralized and prevent invalid payloads from being submitted to the API.

---

## Step 4: Define Table Columns

Create the table column definition file for the module.

This file describes how the module data should be displayed inside the reusable dashboard table.

Example location:

```txt
src/modules/<module-name>/columns/<module>.columns.tsx
```

Column definitions may include:

* Column labels
* Display fields
* Searchable columns
* Sortable columns
* Filterable columns
* Custom cell rendering
* Status or role display formatting

The column file should only control table display behavior.
Business logic should remain inside services, hooks, or module-specific utilities.

---

## Step 5: Create Module Config

Create the module configuration file.

The config file connects the module metadata with the reusable dashboard system.

Example location:

```txt
src/modules/<module-name>/configs/<module>.config.ts
```

The module config usually defines:

* Entity name
* Page title
* Page description
* Table columns
* Search settings
* Pagination options
* Filter options
* Default table behavior
* Module-level dashboard settings

The purpose of this step is to allow the shared `CrudPage` to render the module correctly without changing the core dashboard components.

---

## Step 6: Create Form Component

Create the form component for create and update actions.

Example location:

```txt
src/modules/<module-name>/forms/<Module>Form.tsx
```

The form component should:

* Use shadcn UI components
* Support create mode
* Support edit mode
* Receive default values when editing
* Use the shared schema from `src/schemas`
* Submit data through the provided submit handler
* Display validation errors clearly

The form should focus only on rendering and validating user input.

Do **not** place unrelated business logic or direct API calls inside the form unless the module has a specific reason to do so.

---

## Step 7: Create CRUD Hook

Create a custom hook to manage the module’s CRUD workflow.

Example location:

```txt
src/modules/<module-name>/hooks/use<Module>Crud.ts
```

The CRUD hook should handle:

* Fetching data
* Creating records
* Updating records
* Deleting or disabling records
* Managing loading state
* Managing error state
* Calling service functions from `src/services`
* Exposing handlers to the dashboard page

This step keeps business logic outside of UI components and makes the module easier to maintain, debug, and reuse.

---

## Step 8: Register Module into Dashboard

After completing the module, register it in the dashboard registry.

Example location:

```txt
src/modules/dashboard-register.ts
```

The registry connects the module config and form component to the reusable dashboard system.

After registration, the module can be accessed through the dynamic dashboard route.

Example route:

```txt
/dashboard/<module-name>
```

For example:

```txt
/dashboard/users
/dashboard/courses
/dashboard/programs
```

The purpose of this step is to expose the module to the dashboard without creating a separate page manually for every module.

---

# 🧩 PART 2: Guide for Teammates

## When Working With Existing Dashboard Modules

When working on an existing module, developers should follow the module-based structure and avoid changing shared dashboard infrastructure.

For example, when working on the `users` module, changes are usually located in:

```txt
src/modules/users/
src/services/user.service.ts
src/schemas/user.schema.ts
```

Typical files inside a module include:

```txt
types/
columns/
configs/
forms/
hooks/
```

---

## 1. Do Not Modify Core Dashboard Components

Avoid editing shared dashboard files unless there is a confirmed requirement to change global dashboard behavior.

Shared files affect all dashboard modules, so changing them can easily break other pages.

---

## 2. Work Inside the Target Module and Related Shared Files

Each module should be isolated and responsible for its own dashboard behavior.

For example:

```txt
src/modules/users/
src/modules/courses/
src/modules/programs/
```

API services should be placed in:

```txt
src/services/
```

Validation schemas should be placed in:

```txt
src/schemas/
```

This keeps the project organized while still allowing services and schemas to be reused outside the dashboard when needed.

---

## 3. Use Existing shadcn UI Components

All forms, buttons, modals, inputs, selects, tables, dropdowns, badges, and other UI elements should use existing components from:

```txt
src/components/ui
```

Do not create duplicate UI components if an equivalent shadcn-based component already exists.

This keeps the dashboard interface visually consistent across all modules.

---

## 4. Keep API Logic in Services

API-related logic must be placed inside the shared service layer.

Example:

```txt
src/services/<module>.service.ts
```

This makes backend integration easier to update when API endpoints change.

---

## 5. Keep Validation Logic in Schemas

Validation rules must be placed inside the shared schema layer.

Example:

```txt
src/schemas/<module>.schema.ts
```

This keeps form validation consistent and reusable.

---

## 6. Keep Business Logic in Hooks

CRUD workflow and module-specific business logic should be placed inside the module hook.

Example:

```txt
src/modules/<module-name>/hooks/use<Module>Crud.ts
```

This helps keep UI components clean and focused on rendering.

---

# ✅ Final Checklist Before Registering a Module

Before registering a new dashboard module, make sure the following items are completed:

```txt
[ ] Module types are defined.
[ ] API service layer is created in src/services.
[ ] Validation schema is created in src/schemas.
[ ] Table columns are configured.
[ ] Module config is completed.
[ ] Form component supports create and edit modes.
[ ] CRUD hook handles module workflow.
[ ] shadcn UI components are used.
[ ] No shared dashboard core file is modified.
[ ] Module is registered in dashboard-register.ts.
[ ] Dynamic dashboard route works correctly.
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

Recommended file locations:

```txt
src/modules/<module-name>/types/
src/services/<module>.service.ts
src/schemas/<module>.schema.ts
src/modules/<module-name>/columns/
src/modules/<module-name>/configs/
src/modules/<module-name>/forms/
src/modules/<module-name>/hooks/
src/modules/dashboard-register.ts
```

This standardized workflow ensures that the Dashboard UI remains clean, scalable, reusable, and consistent as the system continues to grow.
