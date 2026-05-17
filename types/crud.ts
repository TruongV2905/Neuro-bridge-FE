import React from "react"

/* ========================
   FIELD SYSTEM (FORM)
======================== */

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "date"
  | "number"
  | "upload"

export interface FieldOption {
  label: string
  value: string | number
}

export interface FieldConfig {
  name: string
  label: string
  type: FieldType

  placeholder?: string
  required?: boolean
  disabled?: boolean

  // select only
  options?: FieldOption[]

  // validation (basic FE)
  rules?: {
    required?: boolean
    message?: string
    min?: number
    max?: number
    pattern?: RegExp
  }

  // layout (GRID)
  span?: number // 1 - 12 (Tailwind grid)
}

/* ========================
   TABLE SYSTEM
======================== */

export type ColumnType =
  | "text"
  | "number"
  | "date"
  | "badge"
  | "avatar"
  | "custom"

export interface ColumnConfig<T = unknown> {
  key: keyof T | string
  label: string
  type?: ColumnType

  sortable?: boolean

  // custom render (important)
  render?: (value: unknown, record: T) => React.ReactNode
}

/* ========================
   ACTION SYSTEM
======================== */

export type ActionType = "view" | "edit" | "delete"

export interface ActionConfig<T = unknown> {
  type: ActionType
  label: string
  onClick?: (record: T) => void
}

/* ========================
   FILTER SYSTEM
======================== */

export interface FilterConfig {
  name: string
  label: string
  type: "select" | "text"

  options?: FieldOption[]
}

/* ========================
   PAGINATION + SORT
======================== */

export interface TableConfig {
  pagination?: boolean
  pageSize?: number
  pageSizeOptions?: number[]

  sortable?: boolean
  searchable?: boolean
}

/* ========================
   MAIN CRUD CONFIG
======================== */

export interface CrudConfig<T = unknown> {
  entityName: string
  title: string

  columns: ColumnConfig<T>[]
  fields: FieldConfig[]

  actions?: ActionConfig<T>[]
  filters?: FilterConfig[]

  table?: TableConfig

  // mock data for now
  data?: T[]
}