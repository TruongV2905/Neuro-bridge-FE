import { createInfiniteQueryHook, createMutationHook, createQueryHook } from "@/hooks/userAPI";
import { PageResponse } from "@/types/common.starter";
import {
  SkillForExpertRequest,
  SkillRequest,
  SkillResponse,
} from "@/types/skill.types";

const SKILL_ENDPOINT = "/identity/skill";

export const skillKeys = {
  all: ["skills"],
  list: ["skills", "list"],
  admin: ["skills", "admin"],
  detail: ["skills", "detail"],
  expert: ["skills", "expert"],
};

export const useGetAllSkills = createQueryHook<PageResponse<SkillResponse>>(
  skillKeys.list,
  `${SKILL_ENDPOINT}/user`,
);

export const useGetSkillsByExpertCode = createQueryHook<SkillResponse[]>(
  skillKeys.expert,
  `${SKILL_ENDPOINT}/expert/:code`,
);

export const useAssignSkillsToExpert = createMutationHook<
  void,
  SkillForExpertRequest
>({
  url: `${SKILL_ENDPOINT}/expert/:code`,
  method: "PUT",
  queryKeyToInvalidate: [skillKeys.expert],
});

//Dashboard admin skill management hooks
export const useCreateSkill = createMutationHook<SkillResponse, SkillRequest>({
  url: SKILL_ENDPOINT,
  method: "POST",
  queryKeyToInvalidate: [skillKeys.list, skillKeys.admin],
});

export const useGetSkillById = createQueryHook<SkillResponse>(
  skillKeys.detail,
  `${SKILL_ENDPOINT}/:id`,
);

export const useGetAllSkillsForAdmin = createQueryHook<
  PageResponse<SkillResponse>
>(skillKeys.admin, `${SKILL_ENDPOINT}/admin`);
export const useUpdateSkill = createMutationHook<SkillResponse, SkillRequest>({
  url: `${SKILL_ENDPOINT}/:id`,
  method: "PUT",
  queryKeyToInvalidate: [skillKeys.list, skillKeys.admin, skillKeys.detail],
});

export const useDeleteSkill = createMutationHook<void, void>({
  url: `${SKILL_ENDPOINT}/:id`,
  method: "DELETE",
  queryKeyToInvalidate: [skillKeys.list, skillKeys.admin, skillKeys.detail],
});

export const useCreateSkillsByFile = createMutationHook<void, FormData>({
  url: `${SKILL_ENDPOINT}/import`,
  method: "POST",
  isMultipart: true,
  queryKeyToInvalidate: [skillKeys.list, skillKeys.admin, skillKeys.detail],
});
export const useInfiniteGetAllSkills =
  createInfiniteQueryHook<SkillResponse>(
    skillKeys.list,
    `${SKILL_ENDPOINT}/user`,
  );