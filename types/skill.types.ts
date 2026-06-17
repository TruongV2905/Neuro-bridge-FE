export interface SkillResponse {
  id: number;
  skillName: string;
  skillDescription: string;
  createdAt: string;
  deleted: boolean;
}
export interface SkillRequest {
  skillName: string;
  skillDescription: string;
}

export interface SkillForExpertRequest {
  skillIds: number[];
  code: string;
}
