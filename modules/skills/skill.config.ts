import type { CrudConfig } from "@/types/dasboard";
import type { SkillResponse } from "@/types/skill.types";

import { SkillSchema, skillSchema } from "@/schemas/skill.schema";
import { skillColumns } from "./skill.column";
import { skillFields } from "./skill.form";
import { skillCustomActions } from "./skill.customAction";

export const skillConfig: CrudConfig<SkillResponse, SkillSchema> = {
  entityName: "skill",
  title: "Skill Management",
  description: "Manage skills used by experts and job posts",

  schema: skillSchema,

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
  customActions: skillCustomActions,
  fields: skillFields,
  columns: skillColumns,
  filters: [],
};
