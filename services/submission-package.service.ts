import api from "@/configs/api"

export type SubmissionFilePayload = {
  fileName: string
  fileUrl: string
  fileSize: string
  fileType: "SOURCE_CODE" | "DOCUMENT" | "VIDEO" | "DATASET"
}

type ResubmitPayload = {
  packageId: string
  notes: string
  files: SubmissionFilePayload[]
}

export async function resubmitSubmissionPackage({
  packageId,
  notes,
  files,
}: ResubmitPayload) {
  const { data } = await api.post(
    `/workspace/api/v1/submission-packages/${packageId}/resubmit`,
    {
      currentPackageId: packageId,
      notes,
      updatedFiles: files,
    }
  )
  return data
}
