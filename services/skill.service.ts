import { createMutationHook, createQueryHook } from "@/hooks/userAPI";
import { PageResponse } from "@/types/common.starter";
import {
  SkillForExpertRequest,
  SkillRequest,
  SkillResponse,
} from "@/types/skill.types";

const SKILL_ENDPOINT = "/identity/skill";

const skillKeys = {
  all: ["skills"],
  list: ["skills", "list"],
  admin: ["skills", "admin"],
  detail: ["skills", "detail"],
  expert: ["skills", "expert"],
};

export const useGetAllSkills = createQueryHook<PageResponse<SkillResponse>>(
  skillKeys.list,
  SKILL_ENDPOINT,
);

export const useGetSkillById = createQueryHook<SkillResponse>(
  skillKeys.detail,
  `${SKILL_ENDPOINT}/:id`,
);

export const useGetAllSkillsForAdmin = createQueryHook<SkillResponse[]>(
  skillKeys.admin,
  `${SKILL_ENDPOINT}/admin`,
);

export const useGetSkillsByExpertCode = createQueryHook<SkillResponse[]>(
  skillKeys.expert,
  `${SKILL_ENDPOINT}/expert/:code`,
);

export const useCreateSkill = createMutationHook<SkillResponse, SkillRequest>({
  url: SKILL_ENDPOINT,
  method: "POST",
  queryKeyToInvalidate: [skillKeys.list, skillKeys.admin],
});

export const useUpdateSkill = createMutationHook<SkillResponse, SkillRequest>({
  url: `${SKILL_ENDPOINT}/:id`,
  method: "PUT",
  queryKeyToInvalidate: [skillKeys.list, skillKeys.admin, skillKeys.detail],
});

export const useDeleteSkill = createMutationHook<SkillResponse, void>({
  url: `${SKILL_ENDPOINT}/:id`,
  method: "DELETE",
  queryKeyToInvalidate: [skillKeys.list, skillKeys.admin],
});

export const useCreateSkillsByFile = createMutationHook<
  SkillResponse[],
  FormData
>({
  url: `${SKILL_ENDPOINT}/import`,
  method: "POST",
  queryKeyToInvalidate: [skillKeys.list, skillKeys.admin],
});

export const useAssignSkillsToExpert = createMutationHook<
  void,
  SkillForExpertRequest
>({
  url: `${SKILL_ENDPOINT}/expert/:code`,
  method: "PUT",
  queryKeyToInvalidate: [skillKeys.expert],
});
