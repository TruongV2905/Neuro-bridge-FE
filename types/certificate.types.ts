export interface CertificateResponse {
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

export interface CertificateRequest {
  certificateName: string
  issuingOrganization: string
  issueDate: string
  expirationDate: string
  credentialId: string
  credentialUrl: string
  certificateImageUrl: string
}

export interface CertificateForExpertRequest {
  certificateIds: string[]
  code: string
}