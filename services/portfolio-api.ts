const API_URL = process.env.NEXT_PUBLIC_API_URL

export type PortfolioApiItem = {
  id: string
  title: string
  description: string
  technologies: string
  completedDate: string
  createdAt: string
  roleInProject: string
  projectUrl: string
}

type ApiResponse<T> = {
  code: number
  message: string
  result: T
}

export async function getPortfoliosByExpertCode(
  code: string,
  token?: string | null
) {
  const res = await fetch(`${API_URL}/identity/portfolio/expert/${code}`, {
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
    console.error("Portfolio API error:", res.status, text)
    throw new Error("Failed to fetch expert portfolios")
  }

  const data: ApiResponse<PortfolioApiItem[]> = JSON.parse(text)
  return data.result
}