import { Metadata, PageRequest } from "../common.starter";

export enum UserRole {
  EXPERT = "EXPERT",
  CLIENT = "CLIENT",
  ADMINISTRATOR = "ADMIN",
}

export enum UserGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum UserStatus {
  INACTIVE = "INACTIVE",
  ACTIVE = "ACTIVE",
  BANNED = "BANNED",
}

export interface User {
  id: string;
  code: string;
  fullName: string;
  email: string;
  gender?: UserGender;
  status: UserStatus;
  address?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  role: UserRole;
  phone?: string;
  createdAt?: string;
  companyName?: string;
  industry?: string;
  companyDescription?: string;
  skillIds?: number[];
}

export type UserSortDirection = "ASCENDING" | "DESCENDING";

export type UserFilterRequest = PageRequest & {
  filter?: {
    role?: UserRole;
    status?: UserStatus;
    gender?: UserGender;
    address?: string;
    createdFrom?: string;
    createdTo?: string;
  };
};

export interface UserResponse {
  code: string;
  fullName: string;
  gender: UserGender | null;
  status: UserStatus;
  address: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null; // LocalDate
  role: UserRole;
  phone: string | null;
  email: string;
  accessToken: string | null;
  refreshToken: string | null;
  createdAt: string; // LocalDateTime

  // client
  companyName?: string | null;
  industry?: string | null;
  companyDescription?: string | null;

  // expert
  skillIds?: number[] | null;
}
