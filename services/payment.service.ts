import api from "@/configs/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { APIResponse } from "@/types/common.starter";
import type {
  MyPaymentTransactionsParams,
  PayProposalByWalletRequest,
  PaymentTransaction,
  PaymentTransactionFilterRequest,
  PaymentTransactionPageResponse,
  UpdateMyWalletBankInfoRequest,
  UserWallet,
  WalletResponse,
} from "@/types/payment.type";

const WALLET_ENDPOINT = "/payment/api/wallet";
const PAYMENT_TRANSACTION_ENDPOINT = "/payment/payment-transactions";

type PaymentApiError = AxiosError<APIResponse<null>>;

export const paymentKeys = {
  all: ["payments"],
  wallet: ["payments", "wallet"],
  walletMine: ["payments", "wallet", "mine"],
  transactions: ["payments", "transactions"],
  transactionsFilter: ["payments", "transactions", "filter"],
  transactionDetail: ["payments", "transactions", "detail"],
  myTransactions: ["payments", "transactions", "mine"],
};

export async function getMyWallet(): Promise<APIResponse<UserWallet>> {
  const { data } = await api.get<APIResponse<UserWallet>>(
    `${WALLET_ENDPOINT}/mine`,
  );

  return data;
}

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

export async function payProposalByWallet(
  request: PayProposalByWalletRequest,
): Promise<APIResponse<PaymentTransaction>> {
  const { proposalId } = request;

  const { data } = await api.post<APIResponse<PaymentTransaction>>(
    `${PAYMENT_TRANSACTION_ENDPOINT}/proposal/pay-by-wallet`,
    undefined,
    {
      params: {
        proposalId,
      },
    },
  );

  return data;
}

// The current controller binds its PageRequest fields from GET query parameters.
// It always scopes records to the authenticated user; its nested type/status
// filter is intentionally not accepted by this private-history endpoint.
export async function getMyPaymentTransactions(
  params?: MyPaymentTransactionsParams,
) {
  const { data } = await api.get<
    APIResponse<PaymentTransactionPageResponse>
  >(`${PAYMENT_TRANSACTION_ENDPOINT}/mine`, { params });

  return data;
}

export function useGetMyWallet(
  options?: Omit<
    UseQueryOptions<
      APIResponse<UserWallet>,
      PaymentApiError,
      APIResponse<UserWallet>,
      QueryKey
    >,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<
    APIResponse<UserWallet>,
    PaymentApiError,
    APIResponse<UserWallet>,
    QueryKey
  >({
    queryKey: paymentKeys.walletMine,
    queryFn: getMyWallet,
    retry: 0,
    ...options,
  });
}

export function usePayProposalByWallet(
  options?: Omit<
    UseMutationOptions<
      APIResponse<PaymentTransaction>,
      PaymentApiError,
      PayProposalByWalletRequest,
      unknown
    >,
    "mutationFn" | "retry"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    APIResponse<PaymentTransaction>,
    PaymentApiError,
    PayProposalByWalletRequest,
    unknown
  >({
    ...options,
    mutationFn: payProposalByWallet,
    retry: 0,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: paymentKeys.walletMine,
        }),
        queryClient.invalidateQueries({
          queryKey: paymentKeys.myTransactions,
        }),
        queryClient.invalidateQueries({
          queryKey: paymentKeys.transactionsFilter,
        }),
      ]);

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateMyWalletBankInfo(
  options?: Omit<
    UseMutationOptions<
      APIResponse<WalletResponse>,
      PaymentApiError,
      UpdateMyWalletBankInfoRequest,
      unknown
    >,
    "mutationFn" | "retry"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateMyWalletBankInfo,
    retry: 0,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: paymentKeys.walletMine });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useFilterPaymentTransactions(
  payload: PaymentTransactionFilterRequest,
  options?: Omit<
    UseQueryOptions<
      APIResponse<PaymentTransactionPageResponse>,
      PaymentApiError,
      APIResponse<PaymentTransactionPageResponse>,
      QueryKey
    >,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [...paymentKeys.transactionsFilter, payload],
    queryFn: () => filterPaymentTransactions(payload),
    retry: 0,
    ...options,
  });
}

export function useGetPaymentTransactionById(
  id?: string,
  options?: Omit<
    UseQueryOptions<
      APIResponse<PaymentTransaction>,
      PaymentApiError,
      APIResponse<PaymentTransaction>,
      QueryKey
    >,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [...paymentKeys.transactionDetail, id],
    queryFn: () => getPaymentTransactionById(id!),
    enabled: Boolean(id) && (options?.enabled ?? true),
    retry: 0,
    ...options,
  });
}

export function useGetMyPaymentTransactions(
  params?: MyPaymentTransactionsParams,
  options?: Omit<
    UseQueryOptions<
      APIResponse<PaymentTransactionPageResponse>,
      PaymentApiError,
      APIResponse<PaymentTransactionPageResponse>,
      QueryKey
    >,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [...paymentKeys.myTransactions, params],
    queryFn: () => getMyPaymentTransactions(params),
    retry: 0,
    ...options,
  });
}
