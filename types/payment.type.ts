export type TransactionStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"

export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAW"
  | "PAY_PROPOSAL"
  | "ESCROW_HOLD"
  | "ESCROW_RELEASE"

export type PaymentStatus = "success" | "failed"

export type PaymentTransaction = {
  transactionId: string
  referenceId: string
  fromUserId: string
  toUserId: string
  fromWalletId: string
  toWalletId: string
  amount: number
  status: TransactionStatus
  type: TransactionType
  createdAt: string
}

export type PaymentStatusContent = {
  badge: string
  title: string
  description: string
  summaryTitle: string
  summaryDescription: string
  primaryActionLabel: string
  primaryActionHref: string
  secondaryActionLabel: string
  secondaryActionHref: string
}