// export interface User {
//   id: string
//   name: string
//   email: string
//   role: "ADMIN" | "STAFF" | "USER"
//   status: "ACTIVE" | "INACTIVE"
//   createdAt: string
// }
export interface User {
  userId: string; // Sử dụng userId thay cho id theo sơ đồ
  name: string;
  userName: string;
  email: string;
  avatarUrl?: string;
  phoneNumber?: string;
  address?: string;
  role: "AI_EXPERT" | "CLIENT" | "ADMINISTRATOR";
  status: "INACTIVE" | "ACTIVE" | "BANNED";
}