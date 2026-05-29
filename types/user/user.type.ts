export type UserId = string

export enum UserRole {
  AI_EXPERT = "AI_EXPERT",
  CLIENT = "CLIENT",
  ADMINISTRATOR = "ADMINISTRATOR",
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
  userId: UserId
  fullName: string
  username: string
  email: string
  gender?: UserGender
  avatarUrl?: string
  phoneNumber?: string
  address?: string
  role: UserRole
  status: UserStatus
  createdAt?: string
  updatedAt?: string
}