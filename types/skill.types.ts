export interface SkillResponse {
  id: number;
  skillName: string;
  skillDescription: string;
  createdAt: string;
}
export interface SkillRequest {
  skillName: string;
  skillDescription: string;
}

export interface SkillForExpertRequest {
  skillId: number[];
  code: string;
}
