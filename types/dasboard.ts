import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
  UseFormReturn,
} from "react-hook-form";
import type { ZodType } from "zod";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "number"
  | "upload"
  | "email"
  | "password"
  | "date"
  | "checkbox"
  | "switch"
  | "radio"
  | "multiSelect"
  | "custom";

export type FieldOption = {
  label: string;
  value: string | number | boolean;
};

export interface FieldConfig<
  TFormValues extends FieldValues = FieldValues,
  TName extends Path<TFormValues> = Path<TFormValues>,
> {
  name: TName;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: FieldOption[];
  span?: 1 | 2;

  render?: (props: {
    field: ControllerRenderProps<TFormValues, TName>;
    fieldState: ControllerFieldState;
    form: UseFormReturn<TFormValues>;
    config: FieldConfig<TFormValues, TName>;
    isSubmitting: boolean;
  }) => ReactNode;
}

export type FilterType =
  | "text"
  | "select"
  | "multi-select"
  | "number"
  | "number-range"
  | "date"
  | "date-range"
  | "boolean";

export type FilterOption = {
  label: string;
  value: string | number | boolean;
};

export type FilterKey<TFilter extends object> = Extract<keyof TFilter, string>;

export type FilterConfig<TFilter extends object = Record<string, unknown>> = {
  name: FilterKey<TFilter>;
  label: string;
  type: FilterType;
  placeholder?: string;
  options?: FilterOption[];

  min?: number;
  max?: number;
  step?: number;
  defaultValue?: unknown;
  rangeKeys?: {
    from: FilterKey<TFilter>;
    to: FilterKey<TFilter>;
  };
};

export interface TableConfig {
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  sortable?: boolean;
  searchable?: boolean;
}

export interface CrudConfig<
  TData extends object = object,
  TFormValues extends FieldValues = FieldValues,
  TFilter extends object = Record<string, unknown>,
> {
  entityName: string;
  title: string;
  description?: string;

  schema?: ZodType<TFormValues>;
  fields?: FieldConfig<TFormValues>[];

  columns: ColumnDef<TData>[];

  filters?: FilterConfig<TFilter>[];
  table?: TableConfig;
  data?: TData[];
}
