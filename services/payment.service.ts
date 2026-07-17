import api from "@/configs/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  createMutationHook,
  createPostQueryHook,
  createQueryHook,
} from "@/hooks/userAPI";
import type { APIResponse } from "@/types/common.starter";
import type {
  ConfirmVnPayDepositRequest,
  DepositWalletByVnPayRequest,
  MyPaymentTransactionsParams,
  PayProposalByWalletRequest,
  PaymentTransaction,
  PaymentTransactionFilterRequest,
  PaymentTransactionPageResponse,
  ProjectEscrowPayment,
  UpdateMyWalletBankInfoRequest,
  UserWallet,
  WalletResponse,
} from "@/types/payment.type";

const WALLET_ENDPOINT = "/payment/api/wallet";
const PAYMENT_TRANSACTION_ENDPOINT = "/payment/payment-transactions";
const PROJECT_ESCROW_ENDPOINT = "/payment/api/project-escrow";

type PaymentApiError = AxiosError<APIResponse<null>>;

export const paymentKeys = {
  all: ["payments"],
  wallet: ["payments", "wallet"],
  walletMine: ["payments", "wallet", "mine"],
  transactions: ["payments", "transactions"],
  transactionsFilter: ["payments", "transactions", "filter"],
  transactionDetail: ["payments", "transactions", "detail"],
  myTransactions: ["payments", "transactions", "mine"],
  projectEscrow: (projectId: string) =>
    ["payments", "project-escrow", projectId] as const,
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

export async function getProjectEscrowPayment(projectId: string) {
  const { data } = await api.get<APIResponse<ProjectEscrowPayment>>(
    `${PROJECT_ESCROW_ENDPOINT}/${encodeURIComponent(projectId)}`,
  );

  return data;
}

export async function payProposalByWallet(
  request: PayProposalByWalletRequest,
): Promise<APIResponse<PaymentTransaction>> {
  const { amount, description, expertCode, proposalId } = request;

  const { data } = await api.post<APIResponse<PaymentTransaction>>(
    `${PAYMENT_TRANSACTION_ENDPOINT}/proposal/pay-by-wallet`,
    undefined,
    {
      params: {
        amount,
        expertCode,
        proposalId,
        ...(description ? { description } : {}),
      },
    },
  );

  return data;
}

export async function depositWalletByVnPay(
  request: DepositWalletByVnPayRequest,
): Promise<APIResponse<string>> {
  const { depositAmount, description } = request;

  const { data } = await api.post<APIResponse<string>>(
    `${WALLET_ENDPOINT}/deposit/vnpay`,
    undefined,
    {
      params: {
        depositAmount,
        ...(description ? { description } : {}),
      },
    },
  );

  return data;
}

export async function confirmVnPayDeposit(
  request: ConfirmVnPayDepositRequest,
): Promise<APIResponse<null>> {
  const { depositAmount, transactionId } = request;

  const { data } = await api.post<APIResponse<null>>(
    `${WALLET_ENDPOINT}/deposit/success`,
    undefined,
    {
      params: {
        depositAmount,
        transactionId,
      },
    },
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

export function useProjectEscrowPayment(
  projectId?: string | null,
  options?: Omit<
    UseQueryOptions<
      APIResponse<ProjectEscrowPayment>,
      PaymentApiError,
      APIResponse<ProjectEscrowPayment>,
      QueryKey
    >,
    "queryKey" | "queryFn"
  >,
) {
  const normalizedProjectId = normalizePaymentIdentifier(projectId);

  return useQuery<
    APIResponse<ProjectEscrowPayment>,
    PaymentApiError,
    APIResponse<ProjectEscrowPayment>,
    QueryKey
  >({
    queryKey: normalizedProjectId
      ? paymentKeys.projectEscrow(normalizedProjectId)
      : paymentKeys.projectEscrow(""),
    queryFn: () => getProjectEscrowPayment(normalizedProjectId ?? ""),
    enabled: Boolean(normalizedProjectId),
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

export function useDepositWalletByVnPay(
  options?: Omit<
    UseMutationOptions<
      APIResponse<string>,
      PaymentApiError,
      DepositWalletByVnPayRequest,
      unknown
    >,
    "mutationFn" | "retry"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    APIResponse<string>,
    PaymentApiError,
    DepositWalletByVnPayRequest,
    unknown
  >({
    ...options,
    mutationFn: depositWalletByVnPay,
    retry: 0,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: paymentKeys.walletMine,
        }),
        queryClient.invalidateQueries({
          queryKey: paymentKeys.myTransactions,
        }),
      ]);

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useConfirmVnPayDeposit(
  options?: Omit<
    UseMutationOptions<
      APIResponse<null>,
      PaymentApiError,
      ConfirmVnPayDepositRequest,
      unknown
    >,
    "mutationFn" | "retry"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    APIResponse<null>,
    PaymentApiError,
    ConfirmVnPayDepositRequest,
    unknown
  >({
    ...options,
    mutationFn: confirmVnPayDeposit,
    retry: 0,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.walletMine,
      });
      queryClient.invalidateQueries({
        queryKey: paymentKeys.myTransactions,
      });

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
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

function normalizePaymentIdentifier(value?: string | null) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}
