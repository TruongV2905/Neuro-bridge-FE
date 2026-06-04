const API_URL = process.env.NEXT_PUBLIC_API_URL

export type SkillApiItem = {
  id: number
  skillName: string
  skillDescription: string
  createdAt: string
}

type ApiResponse<T> = {
  code: number
  message: string
  result: T
}


export async function getSkills(token?: string | null) {
  const res = await fetch(`${API_URL}/identity/skill`, {
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
    console.error("Skill API error:", res.status, text)
    throw new Error("Failed to fetch skills")
  }

  const data: ApiResponse<SkillApiItem[]> = JSON.parse(text)
  return data.result
}