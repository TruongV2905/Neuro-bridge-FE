export type SubmissionFilePayload = {
  fileName: string
  fileUrl: string
  fileSize: string
  fileType: "SOURCE_CODE" | "DOCUMENT" | "VIDEO" | "DATASET"
}

export async function resubmitSubmissionPackage({
  packageId,
  notes,
  files,
}: {
  packageId: string
  notes: string
  files: SubmissionFilePayload[]
}) {
  const accessToken = localStorage.getItem("accessToken")

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/api/v1/submission-packages/${packageId}/resubmit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        currentPackageId: packageId,
        notes,
        updatedFiles: files,
      }),
    }
  )

  if (!response.ok) {
    throw new Error("Resubmit package failed")
  }

  return response.json()
}