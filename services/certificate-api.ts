const API_URL = process.env.NEXT_PUBLIC_API_URL

export type CertificateApiItem = {
  id: string
  certificateName: string
  issuingOrganization: string
  issueDate: string
  expirationDate: string
  credentialId: string
  credentialUrl: string
  certificateImageUrl: string
  createdAt: string
}

type ApiResponse<T> = {
  code: number
  message: string
  result: T
}

export async function getCertificates(token?: string | null) {
  const res = await fetch(`${API_URL}/identity/certificate`, {
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
    console.error("Certificate API error:", res.status, text)
    throw new Error("Failed to fetch certificates")
  }

  const data: ApiResponse<CertificateApiItem[]> = JSON.parse(text)
  return data.result
}