import type { User, UserFilterRequest } from "@/types/user/user.type";
import {
  createMutationHook,
  createPostQueryHook,
  createQueryHook,
} from "@/hooks/userAPI";
import { PageResponse } from "@/types/common.starter";

const USER_ENDPOINT = "/identity/user";

export const useFilterUsers = createPostQueryHook<
  PageResponse<User>,
  UserFilterRequest
>(["users", "filter"], `${USER_ENDPOINT}/filter`);

export const useUpdateUserStatus = createMutationHook<User>({
  url: `${USER_ENDPOINT}/:code/status`,
  method: "PATCH",
  queryKeyToInvalidate: [["users"], ["users", "detail"]],
});

export const useGetUserByCode = createQueryHook<User>(
  ["users", "detail"],
  `${USER_ENDPOINT}/:code`,
);
