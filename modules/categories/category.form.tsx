import { FieldConfig } from "@/types/dasboard";
import type { CategoryRequest } from "@/types/category.types";

export const categoryFields: FieldConfig<CategoryRequest>[] = [
  {
    name: "categoryName",
    label: "Category Name",
    type: "text",
    placeholder: "Enter category name",
    required: true,
    span: 1,
  },
  {
    name: "categoryDescription",
    label: "Category Description",
    type: "textarea",
    placeholder: "Enter category description",
    required: true,
    span: 2,
  },
];