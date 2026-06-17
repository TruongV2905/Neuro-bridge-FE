"use client";

import type { SkillResponse } from "@/types/skill.types";
import type { SkillSchema } from "@/schemas/skill.schema";
import type { UseCrudHook, UseCrudParams } from "@/types/dasboard";

import {
  useCreateSkill,
  useCreateSkillsByFile,
  useDeleteSkill,
  useGetAllSkillsForAdmin,
  useUpdateSkill,
} from "@/services/skill.service";

export const useSkillCrud: UseCrudHook<SkillResponse, SkillSchema> = (
  params: UseCrudParams,
) => {
  const {
    data: skillsResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAllSkillsForAdmin({
    page: params.page,
    size: params.size,
    search: params.search,
    sortBy: params.sortBy,
    direction: params.sortDirection,
  });

  const createSkillMutation = useCreateSkill();
  const updateSkillMutation = useUpdateSkill();
  const toggleSkillMutation = useDeleteSkill();
  const importSkillsMutation = useCreateSkillsByFile();

  const skills = skillsResponse?.result;

  return {
    data: skills?.data ?? [],
    totalItems: skills?.metadata?.totalElements ?? 0,
    totalPages: skills?.metadata?.totalPages ?? 1,

    loading:
      isLoading ||
      isFetching ||
      createSkillMutation.isPending ||
      updateSkillMutation.isPending ||
      toggleSkillMutation.isPending ||
      importSkillsMutation.isPending,

    error: error?.message ?? null,

    refresh: async () => {
      await refetch();
    },

    createItem: async (values) => {
      await createSkillMutation.mutateAsync({
        data: {
          skillName: values.skillName,
          skillDescription: values.skillDescription,
        },
      });
    },

    updateItem: async (record, values) => {
      await updateSkillMutation.mutateAsync({
        pathParams: {
          id: record.id,
        },
        data: {
          skillName: values.skillName,
          skillDescription: values.skillDescription,
        },
      });
    },

    importItems: async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      await importSkillsMutation.mutateAsync({
        data: formData,
      });
    },

    handlers: {
      activateSkill: async (record) => {
        if (!record.deleted) return;

        await toggleSkillMutation.mutateAsync({
          pathParams: {
            id: record.id,
          },
        });
      },

      inactiveSkill: async (record) => {
        if (record.deleted) return;

        await toggleSkillMutation.mutateAsync({
          pathParams: {
            id: record.id,
          },
        });
      },
    },
  };
};
