import type { ReactNode } from "react"
import type { ZodType } from "zod"

export type FieldType =
  | "text"
  | "textarea"
  | "select"
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
  options?: FieldOption[]
  span?: number
}

export type ColumnType =
  | "text"
  | "number"
  | "badge"
  | "avatar"
  | "custom"

export interface BadgeConfig {
  label?: string
  className?: string
}

export interface ColumnConfig<TData extends object = object> {
  key: keyof TData | string
  label: string
  type?: ColumnType
  sortable?: boolean
  badgeMap?: Record<string, BadgeConfig>
  render?: (value: unknown, record: TData) => ReactNode
}

export type ActionType = "view" | "edit" | "delete"

export interface ActionConfig<TData extends object = object> {
  type: ActionType
  label: string
  onClick?: (record: TData, rowIndex: number) => void
}

export interface FilterConfig {
  name: string
  label: string
  type: "select" | "text"
  options?: FieldOption[]
}

export interface TableConfig {
  pagination?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  sortable?: boolean
  searchable?: boolean
}

export interface CrudConfig<TData extends object = object> {
  entityName: string
  title: string
  description?: string

  /**
   * Legacy config.
   * Có thể giữ lại nếu sau này muốn build form tự động bằng FormBuilder.
   * Với module-based dashboard, Form nên nằm trong modules/[entity]/forms.
   */
  schema?: ZodType<Record<string, unknown>>
  fields?: FieldConfig[]

  columns: ColumnConfig<TData>[]
  actions?: ActionConfig<TData>[]
  filters?: FilterConfig[]
  table?: TableConfig
  data?: TData[]
}