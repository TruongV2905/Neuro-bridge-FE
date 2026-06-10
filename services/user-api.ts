const API_URL = process.env.NEXT_PUBLIC_API_URL

import type { UserResponse } from "@/types/user"

type ApiResponse<T> = {
  code: number
  message: string
  result: T
}

export async function getUserByCode(
  code: string,
  token?: string | null
): Promise<UserResponse> {
  const res = await fetch(`${API_URL}/identity/user/${code}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
    cache: "no-store",
  })

  const text = await res.text()

  if (!res.ok) {
    console.error("Get user by code API error:", res.status, text)
    throw new Error("Failed to fetch user by code")
  }

  const data: ApiResponse<UserResponse> = JSON.parse(text)
  return data.result
}

export async function getCurrentUser(token?: string | null) {
  const res = await fetch(`${API_URL}/identity/user/current-user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
    cache: "no-store",
  })

  const text = await res.text()

  if (!res.ok) {
    console.error("Get current user API error:", res.status, text)
    throw new Error("Failed to fetch current user")
  }

  const data: ApiResponse<UserResponse> = JSON.parse(text)
  return data.result
}