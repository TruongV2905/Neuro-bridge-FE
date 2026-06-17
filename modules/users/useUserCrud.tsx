"use client";

import {
  UserStatus,
  type User,
  type UserFilterRequest,
} from "@/types/user/user.type";
import type { UserSchema } from "@/schemas/user.schema";
import {
  useFilterUsers,
  userKeys,
  useUpdateUserStatus,
} from "@/services/user.service";
import type { UseCrudHook, UseCrudParams } from "@/types/dasboard";
import { skillKeys } from "@/services/skill.service";
import { useQueryClient } from "@tanstack/react-query";

export const useUserCrud: UseCrudHook<User, UserSchema> = (
  params: UseCrudParams,
) => {
  const queryClient = useQueryClient();
  const filterRequest: UserFilterRequest = {
    page: params.page,
    size: params.size,
    search: params.search,
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
    filter: params.filters,
  };

  const {
    data: usersResponse,
    isLoading,
    isFetching,
    error,
  } = useFilterUsers(filterRequest);

  const updateStatusMutation = useUpdateUserStatus();

  const result = usersResponse?.result;

  return {
    data: result?.data ?? [],
    totalItems: result?.metadata?.totalElements ?? 0,
    totalPages: result?.metadata?.totalPages ?? 0,

    loading: isLoading || isFetching || updateStatusMutation.isPending,
    error: error?.message ?? null,

    refresh: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: userKeys.all,
          exact: false,
          refetchType: "active",
        }),

        queryClient.invalidateQueries({
          queryKey: skillKeys.all,
          exact: false,
          refetchType: "active",
        }),
      ]);
    },

    handlers: {
      activateUser: async (record) => {
        if (record.status === UserStatus.ACTIVE) return;

        await updateStatusMutation.mutateAsync({
          pathParams: {
            code: record.code,
            status: UserStatus.ACTIVE,
          },
        });
      },

      inactiveUser: async (record) => {
        if (record.status === UserStatus.INACTIVE) return;

        await updateStatusMutation.mutateAsync({
          pathParams: {
            code: record.code,
            status: UserStatus.INACTIVE,
          },
        });
      },

      banUser: async (record) => {
        if (record.status === UserStatus.BANNED) return;

        await updateStatusMutation.mutateAsync({
          pathParams: {
            code: record.code,
            status: UserStatus.BANNED,
          },
        });
      },
    },
  };
};
