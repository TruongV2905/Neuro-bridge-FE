import { apiRequest } from "@/services/api.service"
import type {
  ApiResponse,
  User,
  UserFilterRequest,
  UserListResult,
  UserStatus,
  UserRole,
} from "@/types/user/user.type"
import type { UserSchema } from "@/schemas/user.schema"

const USER_ENDPOINT = "/identity/user"

export const userService = {
  filterUsers(payload: UserFilterRequest) {
    return apiRequest<ApiResponse<UserListResult>>(`${USER_ENDPOINT}/filter`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  getCurrentUser() {
    return apiRequest<ApiResponse<User>>(`${USER_ENDPOINT}/current-user`, {
      method: "GET",
    })
  },

  getUserByCode(code: string) {
    return apiRequest<ApiResponse<User>>(`${USER_ENDPOINT}/${code}`, {
      method: "GET",
    })
  },

  updateUserStatus(code: string, status: UserStatus) {
    const params = new URLSearchParams({
      status,
    })

    return apiRequest<ApiResponse<User>>(
      `${USER_ENDPOINT}/${encodeURIComponent(code)}/status?${params.toString()}`,
      {
        method: "PATCH",
      },
    )
  }
}