export type UserId = string

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
  id: UserId
  code: string

  fullName: string
  email: string

  gender?: UserGender
  status: UserStatus
  address?: string
  avatarUrl?: string
  dateOfBirth?: string
  role: UserRole
  phone?: string

  createdAt?: string

  companyName?: string
  industry?: string
  companyDescription?: string
  skillIds?: number[]
}

export type UserSortDirection = "ASCENDING" | "DESCENDING"

export type UserFilterRequest = {
  page: number
  size: number
  sortBy?: string
  direction?: UserSortDirection
  search?: string
  filter?: {
    role?: UserRole
    status?: UserStatus
    gender?: UserGender
    address?: string
    createdFrom?: string
    createdTo?: string
  }
}

export type UserListMetadata = {
  page: number
  size: number
  currentElements: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export type UserListResult = {
  data: User[]
  metadata: UserListMetadata
}

export type ApiResponse<T> = {
  code: number
  message: string
  result: T
}