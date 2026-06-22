"use client";

import { CheckCircle, CirclePause } from "lucide-react";

import type { CategoryResponse } from "@/types/category.types";
import type { TableAction } from "@/components/dashboard/table/DataTable";

export const categoryCustomActions: TableAction<CategoryResponse>[] = [
  {
    id: "activate-category",
    type: "custom",
    label: "Activate",
    actionKey: "activateCategory",
    hidden: (row) => row.deleted === false,
    icon: <CheckCircle className="h-4 w-4" />,
  },
  {
    id: "inactive-category",
    type: "custom",
    label: "Inactive",
    actionKey: "inactiveCategory",
    hidden: (row) => row.deleted === true,
    className:
      "text-yellow-700 focus:bg-yellow-50 focus:text-yellow-900 data-[highlighted]:bg-yellow-50 data-[highlighted]:text-yellow-900",
    icon: <CirclePause className="h-4 w-4" />,
  },
];