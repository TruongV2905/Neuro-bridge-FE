import { createMutationHook } from "@/hooks/userAPI";
import { LoginFormValues } from "@/schemas/loginSchema";
import { UserResponse } from "@/types/user";

export const useLoginMutation = createMutationHook<
  UserResponse,
  LoginFormValues
>({
  url: "/identity/auth/login",
  method: "POST",
});
