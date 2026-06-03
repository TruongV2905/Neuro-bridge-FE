// src/app/profile/types.ts

export type UserRole = "CLIENT" | "AI_EXPERT"
export type UserStatus = "ACTIVE" | "INACTIVE"

export type BaseUser = {
  userId: string
  name: string
  userName: string
  email: string
  avatarUrl: string
  phoneNumber: string
  address: string
  role: UserRole
  status: UserStatus
}

export type ClientProfile = BaseUser & {
  role: "CLIENT"
  companyName: string
  industry: string
  companyDescription: string
}

export type AIExpertProfile = BaseUser & {
  role: "AI_EXPERT"
  portfolio: string
  completedProjects: number
  rating: number
  availabilityStatus: boolean
}

export type UserProfile = ClientProfile | AIExpertProfile