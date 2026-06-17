import { z } from "zod";

export const skillSchema = z.object({
  skillName: z.string().min(1, "Skill name is required"),
  skillDescription: z.string().min(1, "Skill description is required"),
});

export type SkillSchema = z.infer<typeof skillSchema>;
