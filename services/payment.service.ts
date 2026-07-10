import api from "@/configs/api";
import {
  createMutationHook,
  createPostQueryHook,
  createQueryHook,
} from "@/hooks/userAPI";
import type { APIResponse } from "@/types/common.starter";
import type {
  MyPaymentTransactionsParams,
  PaymentTransaction,
  PaymentTransactionFilterRequest,
  PaymentTransactionPageResponse,
  UpdateMyWalletBankInfoRequest,
  WalletResponse,
} from "@/types/payment.type";

const WALLET_ENDPOINT = "/payment/api/wallet";
const PAYMENT_TRANSACTION_ENDPOINT = "/payment/payment-transactions";

export const paymentKeys = {
  all: ["payments"],
  wallet: ["payments", "wallet"],
  transactions: ["payments", "transactions"],
  transactionsFilter: ["payments", "transactions", "filter"],
  transactionDetail: ["payments", "transactions", "detail"],
  myTransactions: ["payments", "transactions", "mine"],
};

// TODO: Replace bank-info update response as a wallet source when BE provides
// GET /api/payment/api/wallet/me. Updating bank info must not be used as a
// wallet-balance read endpoint.
export async function updateMyWalletBankInfo(
  payload: UpdateMyWalletBankInfoRequest,
) {
  const { data } = await api.put<APIResponse<WalletResponse>>(
    `${WALLET_ENDPOINT}/me/bank-info`,
    payload,
  );

  return data;
}

export async function filterPaymentTransactions(
  payload: PaymentTransactionFilterRequest,
) {
  const { data } = await api.post<
    APIResponse<PaymentTransactionPageResponse>
  >(`${PAYMENT_TRANSACTION_ENDPOINT}/filter`, payload);

  return data;
}

export async function getPaymentTransactionById(id: string) {
  const { data } = await api.get<APIResponse<PaymentTransaction>>(
    `${PAYMENT_TRANSACTION_ENDPOINT}/${encodeURIComponent(id)}`,
  );

  return data;
}

// TODO: Confirm GET /payment-transactions/mine parameter convention with BE.
// Swagger currently shows a GET request body, while the existing API helper
// safely supports query params only for GET requests.
export async function getMyPaymentTransactions(
  params?: MyPaymentTransactionsParams,
) {
  const { data } = await api.get<
    APIResponse<PaymentTransactionPageResponse>
  >(`${PAYMENT_TRANSACTION_ENDPOINT}/mine`, { params });

  return data;
}

export const useUpdateMyWalletBankInfo = createMutationHook<
  WalletResponse,
  UpdateMyWalletBankInfoRequest
>({
  url: `${WALLET_ENDPOINT}/me/bank-info`,
  method: "PUT",
  queryKeyToInvalidate: paymentKeys.wallet,
});

export const useFilterPaymentTransactions = createPostQueryHook<
  PaymentTransactionPageResponse,
  PaymentTransactionFilterRequest
>(
  paymentKeys.transactionsFilter,
  `${PAYMENT_TRANSACTION_ENDPOINT}/filter`,
);

export const useGetPaymentTransactionById =
  createQueryHook<PaymentTransaction>(
    paymentKeys.transactionDetail,
    `${PAYMENT_TRANSACTION_ENDPOINT}/:id`,
  );

// TODO: Confirm GET /payment-transactions/mine parameter convention with BE
// before relying on pagination/filter fields in production.
export const useGetMyPaymentTransactions =
  createQueryHook<PaymentTransactionPageResponse>(
    paymentKeys.myTransactions,
    `${PAYMENT_TRANSACTION_ENDPOINT}/mine`,
  );

// TODO: Add a proposal unlock purchase mutation only after BE provides an
// atomic wallet purchase endpoint. Do not expose success/fail/cancel hooks to
// normal Client UI; those transaction status operations are not confirmed as
// Client-safe.
