import { createMutationHook, createQueryHook } from "@/hooks/userAPI"
import {
  CertificateForExpertRequest,
  CertificateRequest,
  CertificateResponse,
} from "@/types/certificate.types"

const CERTIFICATE_ENDPOINT = "/identity/certificate"

const certificateKeys = {
  all: ["certificates"],
  list: ["certificates", "list"],
  detail: ["certificates", "detail"],
  expert: ["certificates", "expert"],
}

export const useGetCertificates = createQueryHook<CertificateResponse[]>(
  certificateKeys.list,
  CERTIFICATE_ENDPOINT,
)

export const useGetCertificatesByExpertCode = createQueryHook<
  CertificateResponse[]
>(
  certificateKeys.expert,
  `${CERTIFICATE_ENDPOINT}/expert/:code`,
)

export const useGetCertificateById = createQueryHook<CertificateResponse>(
  certificateKeys.detail,
  `${CERTIFICATE_ENDPOINT}/:id`,
)

export const useCreateCertificate = createMutationHook<
  CertificateResponse,
  CertificateRequest
>({
  url: CERTIFICATE_ENDPOINT,
  method: "POST",
  queryKeyToInvalidate: [certificateKeys.list, certificateKeys.expert],
})

export const useUpdateCertificate = createMutationHook<
  CertificateResponse,
  CertificateRequest
>({
  url: `${CERTIFICATE_ENDPOINT}/:id`,
  method: "PUT",
  queryKeyToInvalidate: [
    certificateKeys.list,
    certificateKeys.detail,
    certificateKeys.expert,
  ],
})

export const useDeleteCertificate = createMutationHook<
  CertificateResponse,
  void
>({
  url: `${CERTIFICATE_ENDPOINT}/:id`,
  method: "DELETE",
  queryKeyToInvalidate: [certificateKeys.list, certificateKeys.expert],
})

export const useAssignCertificatesToExpert = createMutationHook<
  void,
  CertificateForExpertRequest
>({
  url: `${CERTIFICATE_ENDPOINT}/expert/:code`,
  method: "PUT",
  queryKeyToInvalidate: [certificateKeys.expert],
})