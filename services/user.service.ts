import type { User, UserFilterRequest, UserResponse } from "@/types/user/user.type";
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
  profile: ["users", "profile"],
};

export type UpdateProfilePayload = Partial<
  Pick<
    UserResponse,
    | "fullName"
    | "email"
    | "phone"
    | "address"
    | "avatarUrl"
    | "gender"
    | "dateOfBirth"
    | "companyName"
    | "industry"
    | "companyDescription"
  >
>;

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

export const useUpdateProfile = createMutationHook<
  UserResponse,
  UpdateProfilePayload
>({
  url: `${USER_ENDPOINT}/:code`,
  method: "PUT",
  queryKeyToInvalidate: [userKeys.detail, userKeys.profile],
});
