import { createMutationHook } from "@/hooks/userAPI";
import { LoginFormValues } from "@/schemas/loginSchema";
import {
  RegisterClientPayload,
  RegisterExpertPayload,
} from "@/schemas/user.schema";
import { UserResponse } from "@/types/user/user.type";

export const useLoginMutation = createMutationHook<
  UserResponse,
  LoginFormValues
>({
  url: "/identity/auth/login",
  method: "POST",
});

export const useRegisterExpertMutation = createMutationHook<
  string,
  RegisterExpertPayload
>({
  url: "/identity/auth/register/expert",
  method: "POST",
});
export const useRegisterClientMutation = createMutationHook<
  string,
  RegisterClientPayload
>({
  url: "/identity/auth/register/client",
  method: "POST",
});
