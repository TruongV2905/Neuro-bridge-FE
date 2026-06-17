
import { FieldConfig } from "@/types/dasboard";
import type { SkillRequest } from "@/types/skill.types";

export const skillFields: FieldConfig<SkillRequest>[] = [
  {
    name: "skillName",
    label: "Skill Name",
    type: "text",
    placeholder: "Enter skill name",
    required: true,
    span: 1,
  },
  {
    name: "skillDescription",
    label: "Skill Description",
    type: "textarea",
    placeholder: "Enter skill description",
    required: true,
    span: 2,
  },
];
