export interface User {
  code: string;
  fullName: string;
  gender: Gender;
  status: UserStatus;
  address: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  role: Role;
  phone: string;
  email: string;
  createdAt: string;
}

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";

export type Role = "CLIENT" | "EXPERT" | "ADMIN";

export interface UserResponse {
  code: string;
  fullName: string;
  gender: Gender | null;
  status: UserStatus;
  address: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null; // LocalDate
  role: Role;
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


