import { userConfig } from "@/modules/users/user.config";
import { UserForm } from "@/modules/users/forms/UserForm";

export const crudModules = {
  users: {
    config: userConfig,
    Form: UserForm,
  },
};

export type CrudModuleKey = keyof typeof crudModules;
