import type { CrudConfig } from "@/types/dasboard";
import type { CategoryResponse } from "@/types/category.types";

import { CategorySchema, categorySchema } from "@/schemas/category.schema";
import { categoryColumns } from "./category.column";
import { categoryFields } from "./category.form";
import { categoryCustomActions } from "./category.customAction";

export const categoryConfig: CrudConfig<CategoryResponse, CategorySchema> = {
  entityName: "category",
  title: "Category Management",
  description: "Manage categories used by skills, experts and job posts",

  schema: categorySchema,

  table: {
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },

  actions: {
    view: false,
    edit: true,
    create: true,
  },

  customActions: categoryCustomActions,
  fields: categoryFields,
  columns: categoryColumns,
  filters: [],
};