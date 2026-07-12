import type { PageResponse } from "./common.starter";

export type ExtensibleString<TKnown extends string> =
  | TKnown
  | (string & Record<never, never>);

export type PaymentSortDirection = "ASCENDING" | "DESCENDING";

export type WalletStatus = ExtensibleString<"ACTIVE">;

export type PaymentTransactionType = ExtensibleString<"WALLET_DEPOSIT">;

export type PaymentTransactionStatus = ExtensibleString<
  "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED"
>;

export type PaymentReferenceType = ExtensibleString<"PROPOSAL">;

export type UpdateMyWalletBankInfoRequest = {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
};

export type PayProposalByWalletRequest = {
  amount: number;
  expertCode: string;
  proposalId: string;
  description?: string;
};

export type DepositWalletByVnPayRequest = {
  depositAmount: number;
  description?: string;
};

export type UserWallet = {
  id: string;
  userCode: string;
  walletBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  status: WalletStatus;
  bankName: string | null;
  accountNumber: string | null;
  accountHolderName: string | null;
};

export type WalletResponse = UserWallet;

export type PaymentTransaction = {
  id: string;
  fromUserCode: string;
  toUserCode: string;
  amount: number;
  type: PaymentTransactionType;
  status: PaymentTransactionStatus;
  referenceId: string;
  referenceType: PaymentReferenceType;
  description: string;
  createdAt: string;
};

export type PaymentTransactionFilter = {
  fromUserCode?: string;
  toUserCode?: string;
  involvingUserCode?: string;
  type?: PaymentTransactionType;
  status?: PaymentTransactionStatus;
  referenceId?: string;
};

export type PaymentTransactionFilterRequest = {
  page: number;
  size: number;
  sortBy?: string;
  direction?: PaymentSortDirection;
  search?: string;
  filter?: PaymentTransactionFilter;
};

export type MyPaymentTransactionsParams = Partial<
  Pick<
    PaymentTransactionFilterRequest,
    "page" | "size" | "sortBy" | "direction" | "search"
  >
>;

export type PaymentTransactionPageResponse =
  PageResponse<PaymentTransaction>;
