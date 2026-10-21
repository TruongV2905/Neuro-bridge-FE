import type { PageResponse } from "./common.starter";

export type ExtensibleString<TKnown extends string> =
  | TKnown
  | (string & Record<never, never>);

export type PaymentSortDirection = "ASCENDING" | "DESCENDING";

export type WalletStatus = ExtensibleString<
  "ACTIVE" | "INACTIVE" | "LOCKED" | "PENDING_VERIFICATION"
>;

export type PaymentTransactionType = ExtensibleString<
  | "WALLET_DEPOSIT"
  | "WALLET_WITHDRAW"
  | "PROPOSAL_PAYMENT"
  | "AI_PRODUCT_PAYMENT"
  | "PROJECT_ESCROW_DEPOSIT"
  | "PROJECT_RELEASE"
  | "PROJECT_REFUND"
  | "REFUND"
  | "SYSTEM_FEE"
  | "ADMIN_ADD"
  | "ADMIN_DEDUCT"
>;

export type PaymentTransactionStatus = ExtensibleString<
  "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED"
>;

export type PaymentReferenceType = ExtensibleString<
  | "PROPOSAL"
  | "AI_PRODUCT"
  | "PROJECT"
  | "JOB_POST"
  | "WITHDRAW_REQUEST"
  | "DEPOSIT_REQUEST"
  | "ADMIN_ACTION"
>;

export type UpdateMyWalletBankInfoRequest = {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
};

export type PayProposalByWalletRequest = {
  proposalId: string;
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
  fromUserCode: string | null;
  toUserCode: string | null;
  amount: number;
  type: PaymentTransactionType;
  status: PaymentTransactionStatus;
  referenceId: string | null;
  referenceType: PaymentReferenceType;
  description: string | null;
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
