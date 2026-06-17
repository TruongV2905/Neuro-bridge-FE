"use client";

import { CheckCircle, CirclePause } from "lucide-react";

import type { SkillResponse } from "@/types/skill.types";
import type { TableAction } from "@/components/dashboard/table/DataTable";

export const skillCustomActions: TableAction<SkillResponse>[] = [
  {
    id: "activate-skill",
    type: "custom",
    label: "Activate",
    actionKey: "activateSkill",
    hidden: (row) => row.deleted === false,
    icon: <CheckCircle className="h-4 w-4" />,
  },
  {
    id: "inactive-skill",
    type: "custom",
    label: "Inactive",
    actionKey: "inactiveSkill",
    hidden: (row) => row.deleted === true,
    className:
      "text-yellow-700 focus:bg-yellow-50 focus:text-yellow-900 data-[highlighted]:bg-yellow-50 data-[highlighted]:text-yellow-900",
    icon: <CirclePause className="h-4 w-4" />,
  },
];
