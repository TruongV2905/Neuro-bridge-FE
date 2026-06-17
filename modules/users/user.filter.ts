import type { FilterConfig } from "@/types/dasboard";
import {
  UserGender,
  UserRole,
  UserStatus,
  type UserFilterRequest,
} from "@/types/user/user.type";

type UserFilterValues = NonNullable<UserFilterRequest["filter"]>;

export const userFilters: FilterConfig<UserFilterValues>[] = [
  {
    name: "role",
    label: "Role",
    type: "select",
    placeholder: "Select role",
    options: [
      {
        label: "Admin",
        value: UserRole.ADMINISTRATOR,
      },
      {
        label: "Client",
        value: UserRole.CLIENT,
      },
      {
        label: "Expert",
        value: UserRole.EXPERT,
      },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    placeholder: "Select status",
    options: [
      {
        label: "Active",
        value: UserStatus.ACTIVE,
      },
      {
        label: "Inactive",
        value: UserStatus.INACTIVE,
      },
      {
        label: "Banned",
        value: UserStatus.BANNED,
      },
    ],
  },
  {
    name: "gender",
    label: "Gender",
    type: "select",
    placeholder: "Select gender",
    options: [
      {
        label: "Male",
        value: UserGender.MALE,
      },
      {
        label: "Female",
        value: UserGender.FEMALE,
      },
      {
        label: "Other",
        value: UserGender.OTHER,
      },
    ],
  },
  {
    name: "address",
    label: "Address",
    type: "text",
    placeholder: "Search by address",
  },
  {
    name: "createdFrom",
    label: "Created Date",
    type: "date-range",
    placeholder: "Select created date range",
    rangeKeys: {
      from: "createdFrom",
      to: "createdTo",
    },
  },
];
