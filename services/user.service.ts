import { useMutation, useQueryClient } from "@tanstack/react-query";

import api from "@/configs/api";
import type { APIResponse } from "@/types/common.starter";
import type {
  ClientProfileUpdateRequest,
  ExpertProfileUpdateRequest,
  User,
  UserFilterRequest,
  UserResponse,
} from "@/types/user/user.type";
import {
  createMutationHook,
  createPostQueryHook,
  createQueryHook,
} from "@/hooks/userAPI";
import { PageResponse } from "@/types/common.starter";

const USER_ENDPOINT = "/identity/user";

export const userKeys = {
  all: ["users"],
  filter: ["users", "filter"],
  detail: ["users", "detail"],
};

export const useFilterUsers = createPostQueryHook<
  PageResponse<User>,
  UserFilterRequest
>(userKeys.filter, `${USER_ENDPOINT}/filter`);

export const useUpdateUserStatus = createMutationHook<User>({
  url: `${USER_ENDPOINT}/:code/status`,
  method: "PATCH",
  queryKeyToInvalidate: [userKeys.all],
});

export const useGetUserByCode = createQueryHook<User>(
  userKeys.detail,
  `${USER_ENDPOINT}/:code`,
);

function useUpdateProfile<TRequest>(path: "client" | "expert") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: TRequest) => {
      const { data } = await api.put<APIResponse<UserResponse>>(
        `${USER_ENDPOINT}/${path}`,
        request,
      );

      return data;
    },
    retry: 0,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      await queryClient.setQueryData(
        [...userKeys.detail, { code: response.result.code }],
        response,
      );
    },
  });
}

export function useUpdateClientProfile() {
  return useUpdateProfile<ClientProfileUpdateRequest>("client");
}

export function useUpdateExpertProfile() {
  return useUpdateProfile<ExpertProfileUpdateRequest>("expert");
}
