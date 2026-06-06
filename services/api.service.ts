const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL

type RequestOptions = RequestInit & {
  auth?: boolean
}

const getAccessToken = () => {
  if (typeof window === "undefined") {
    return null
  }

  return (
    localStorage.getItem("accessToken") ??
    localStorage.getItem("token") ??
    null
  )
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = getAccessToken()

  const headers = new Headers(options.headers)

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (options.auth !== false && token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      data?.message ?? `Request failed with status ${response.status}`,
    )
  }

  return data as T
}