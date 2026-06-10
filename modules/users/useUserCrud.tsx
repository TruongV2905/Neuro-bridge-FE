"use client";

import { CheckCircle, Ban, CirclePause } from "lucide-react";

import type {
  UseCrudHook,
  UseCrudParams,
} from "@/components/dashboard/crud/CrudPage";

import {
  UserStatus,
  type User,
  type UserFilterRequest,
} from "@/types/user/user.type";
import type { UserSchema } from "@/schemas/user.schema";
import { useFilterUsers, useUpdateUserStatus } from "@/services/userService";

export const useUserCrud: UseCrudHook<User, UserSchema> = (
  params: UseCrudParams,
) => {
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
    refetch,
  } = useFilterUsers(filterRequest);

  const updateStatusMutation = useUpdateUserStatus();

  const result = usersResponse?.result;

  return {
    data: result?.data ?? [],
    metadata: result?.metadata,
    totalItems: result?.metadata?.totalElements ?? 0,
    totalPages: result?.metadata?.totalPages ?? 0,

    loading: isLoading || isFetching || updateStatusMutation.isPending,
    error: error?.message ?? null,

    refresh: async () => {
      await refetch();
    },

    customActions: [
      {
        type: "custom",
        label: "Activate",
        hidden: (row) => row.status === UserStatus.ACTIVE,
        icon: <CheckCircle className="h-4 w-4" />,
        onClick: async (row) => {
          if (row.status === UserStatus.ACTIVE) return;

          await updateStatusMutation.mutate({
            pathParams: {
              code: row.code,
              status: UserStatus.ACTIVE,
            },
          });
        },
      },
      {
        type: "custom",
        label: "Inactive",
        className:
          "text-yellow-700 focus:bg-yellow-50 focus:text-yellow-900 data-[highlighted]:bg-yellow-50 data-[highlighted]:text-yellow-900",
        hidden: (row) => row.status === UserStatus.INACTIVE,
        icon: <CirclePause className="h-4 w-4" />,
        onClick: async (row) => {
          if (row.status === UserStatus.INACTIVE) return;

          await updateStatusMutation.mutateAsync({
            pathParams: {
              code: row.code,
              status: UserStatus.INACTIVE,
            },
          });
        },
      },
      {
        type: "custom",
        label: "Ban",
        hidden: (row) => row.status === UserStatus.BANNED,
        icon: <Ban className="h-4 w-4" />,
        variant: "destructive",
        onClick: async (row) => {
          if (row.status === UserStatus.BANNED) return;

          await updateStatusMutation.mutateAsync({
            pathParams: {
              code: row.code,
              status: UserStatus.BANNED,
            },
          });
        },
      },
    ],
  };
};
