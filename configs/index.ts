import { userConfig } from "@/modules/users/user.config";

export const crudModules = {
  users: {
    config: userConfig,
  },
};

export type CrudModuleKey = keyof typeof crudModules;
