import { createMutationHook } from "@/hooks/userAPI";
import { LoginFormValues } from "@/schemas/loginSchema";
import { UserResponse } from "@/types/user/user.type";

export const useLoginMutation = createMutationHook<
  UserResponse,
  LoginFormValues
>({
  url: "/identity/auth/login",
  method: "POST",
});
