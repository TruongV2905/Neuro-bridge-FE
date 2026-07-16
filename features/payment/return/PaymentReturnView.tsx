"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  WalletCards,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { RootState } from "@/redux/store";
import {
  useConfirmVnPayDeposit,
  useGetPaymentTransactionById,
} from "@/services/payment.service";
import { UserRole, type UserResponse } from "@/types/user/user.type";
import { formatMoney } from "@/utils/formatMoney";

const VNPAY_SUCCESS_CODE = "00";
const CONFIRM_TIMEOUT_MS = 8000;
const autoConfirmRequestKeys = new Set<string>();

type ConfirmStatus =
  | "idle"
  | "checking"
  | "confirming"
  | "confirmed"
  | "failed"
  | "timeout";

export function PaymentReturnView() {
  const searchParams = useSearchParams();
  const currentUser = useSelector(
    (state: RootState) => state.user,
  ) as UserResponse | null;
  const confirmMutation = useConfirmVnPayDeposit();
  const [confirmStatus, setConfirmStatus] = useState<ConfirmStatus>("idle");

  const walletHref =
    currentUser?.role === UserRole.EXPERT
      ? "/expert/dashboard/wallet"
      : "/client/dashboard/wallet";

  const paymentResult = useMemo(() => {
    const paymentTransactionId = searchParams.get("paymentTransactionId") ?? "";
    const rawAmount = Number(searchParams.get("vnp_Amount"));
    const responseCode = searchParams.get("vnp_ResponseCode") ?? "";
    const transactionStatus = searchParams.get("vnp_TransactionStatus") ?? "";
    const bankCode = searchParams.get("vnp_BankCode") ?? "";
    const transactionNo = searchParams.get("vnp_TransactionNo") ?? "";
    const payDate = searchParams.get("vnp_PayDate") ?? "";

    return {
      amount: Number.isFinite(rawAmount) ? rawAmount / 100 : 0,
      bankCode,
      isSuccess:
        responseCode === VNPAY_SUCCESS_CODE &&
        transactionStatus === VNPAY_SUCCESS_CODE,
      payDate,
      paymentTransactionId,
      responseCode,
      transactionNo,
      transactionStatus,
    };
  }, [searchParams]);

  const hasRequiredParams =
    !!paymentResult.paymentTransactionId && paymentResult.amount > 0;
  const autoConfirmKey = hasRequiredParams
    ? `${paymentResult.paymentTransactionId}:${paymentResult.amount}`
    : "";

  const transactionQuery = useGetPaymentTransactionById(
    { id: paymentResult.paymentTransactionId },
    {
      enabled: hasRequiredParams && paymentResult.isSuccess,
    },
  );
  const transactionStatus = transactionQuery.data?.result?.status;
  const hasAutoConfirmStarted = autoConfirmRequestKeys.has(autoConfirmKey);
  const effectiveConfirmStatus = getEffectiveConfirmStatus({
    confirmStatus,
    hasAutoConfirmStarted,
    isMutationPending: confirmMutation.isPending,
    isQueryChecking: transactionQuery.isLoading || transactionQuery.isFetching,
    transactionStatus,
  });

  useEffect(() => {
    if (
      !hasRequiredParams ||
      !paymentResult.isSuccess ||
      !autoConfirmKey ||
      autoConfirmRequestKeys.has(autoConfirmKey)
    ) {
      return;
    }

    if (transactionQuery.isLoading || transactionQuery.isFetching) {
      return;
    }

    if (transactionStatus === "SUCCESS") {
      return;
    }

    if (
      transactionStatus &&
      transactionStatus !== "PENDING" &&
      transactionStatus !== "SUCCESS"
    ) {
      return;
    }

    autoConfirmRequestKeys.add(autoConfirmKey);
    const timeoutId = window.setTimeout(() => {
      setConfirmStatus((current) =>
        current === "confirmed" || current === "failed" ? current : "timeout",
      );
    }, CONFIRM_TIMEOUT_MS);

    confirmMutation.mutate(
      {
        depositAmount: paymentResult.amount,
        transactionId: paymentResult.paymentTransactionId,
      },
      {
        onSuccess: () => {
          window.clearTimeout(timeoutId);
          setConfirmStatus("confirmed");
        },
        onError: () => {
          window.clearTimeout(timeoutId);
          setConfirmStatus("failed");
          transactionQuery.refetch();
        },
      },
    );
  }, [
    autoConfirmKey,
    confirmMutation,
    hasRequiredParams,
    paymentResult.amount,
    paymentResult.isSuccess,
    paymentResult.paymentTransactionId,
    transactionQuery,
    transactionStatus,
  ]);

  const status = getReturnStatus({
    confirmStatus: effectiveConfirmStatus,
    hasRequiredParams,
    isVnPaySuccess: paymentResult.isSuccess,
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f1f1] p-6">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/50 sm:p-8">
        <div className="flex items-start gap-4">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${status.iconClassName}`}
          >
            <status.Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
              VNPay return
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
              {status.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {status.description}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm sm:grid-cols-2">
          <ReturnInfo label="Amount" value={formatMoney(paymentResult.amount)} />
          <ReturnInfo label="VNPay code" value={paymentResult.responseCode || "-"} />
          <ReturnInfo
            label="Transaction status"
            value={paymentResult.transactionStatus || "-"}
          />
          <ReturnInfo label="Bank" value={paymentResult.bankCode || "-"} />
          <ReturnInfo
            label="Transaction no"
            value={paymentResult.transactionNo || "-"}
          />
          <ReturnInfo label="Pay date" value={formatVnPayDate(paymentResult.payDate)} />
        </div>

        {confirmMutation.isError && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {getPaymentErrorMessage(confirmMutation.error)}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {status.canRetry && (
            <Button
              type="button"
              onClick={() => {
                setConfirmStatus("confirming");
                const timeoutId = window.setTimeout(() => {
                  setConfirmStatus((current) =>
                    current === "confirming" ? "timeout" : current,
                  );
                }, CONFIRM_TIMEOUT_MS);

                confirmMutation.mutate(
                  {
                    depositAmount: paymentResult.amount,
                    transactionId: paymentResult.paymentTransactionId,
                  },
                  {
                    onSuccess: () => {
                      window.clearTimeout(timeoutId);
                      setConfirmStatus("confirmed");
                    },
                    onError: () => {
                      window.clearTimeout(timeoutId);
                      setConfirmStatus("failed");
                      transactionQuery.refetch();
                    },
                  },
                );
              }}
              className="h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-5 text-sm font-bold text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Confirm again
            </Button>
          )}
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-xl border-slate-200 bg-white px-5 text-sm font-bold text-slate-700"
          >
            <Link href={walletHref}>
              <WalletCards className="mr-2 h-4 w-4" />
              Go to wallet
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function ReturnInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words font-bold text-slate-950">{value}</p>
    </div>
  );
}

function getEffectiveConfirmStatus({
  confirmStatus,
  hasAutoConfirmStarted,
  isMutationPending,
  isQueryChecking,
  transactionStatus,
}: {
  confirmStatus: ConfirmStatus;
  hasAutoConfirmStarted: boolean;
  isMutationPending: boolean;
  isQueryChecking: boolean;
  transactionStatus?: string;
}): ConfirmStatus {
  if (confirmStatus === "confirmed" || confirmStatus === "failed") {
    return confirmStatus;
  }

  if (transactionStatus === "SUCCESS") {
    return "confirmed";
  }

  if (
    transactionStatus &&
    transactionStatus !== "PENDING" &&
    transactionStatus !== "SUCCESS"
  ) {
    return "failed";
  }

  if (confirmStatus === "timeout") {
    return "timeout";
  }

  if (isMutationPending || hasAutoConfirmStarted) {
    return "confirming";
  }

  if (isQueryChecking) {
    return "checking";
  }

  return confirmStatus;
}

function getReturnStatus({
  confirmStatus,
  hasRequiredParams,
  isVnPaySuccess,
}: {
  confirmStatus: ConfirmStatus;
  hasRequiredParams: boolean;
  isVnPaySuccess: boolean;
}) {
  if (!hasRequiredParams) {
    return {
      Icon: AlertTriangle,
      canRetry: false,
      description: "The payment return URL is missing required transaction data.",
      iconClassName: "bg-amber-50 text-amber-600",
      title: "Payment data is incomplete",
    };
  }

  if (!isVnPaySuccess) {
    return {
      Icon: XCircle,
      canRetry: false,
      description: "VNPay did not mark this sandbox payment as successful.",
      iconClassName: "bg-rose-50 text-rose-600",
      title: "Payment was not completed",
    };
  }

  if (confirmStatus === "checking") {
    return {
      Icon: Loader2,
      canRetry: false,
      description: "Checking whether this payment was already confirmed.",
      iconClassName: "bg-indigo-50 text-indigo-600 [&_svg]:animate-spin",
      title: "Checking payment status",
    };
  }

  if (confirmStatus === "confirming") {
    return {
      Icon: Loader2,
      canRetry: false,
      description: "Confirming the wallet top-up with the payment service.",
      iconClassName: "bg-indigo-50 text-indigo-600 [&_svg]:animate-spin",
      title: "Confirming wallet top-up",
    };
  }

  if (confirmStatus === "timeout") {
    return {
      Icon: AlertTriangle,
      canRetry: true,
      description:
        "VNPay succeeded, but backend confirmation is taking longer than expected.",
      iconClassName: "bg-amber-50 text-amber-600",
      title: "Confirmation is still pending",
    };
  }

  if (confirmStatus === "failed") {
    return {
      Icon: AlertTriangle,
      canRetry: true,
      description: "VNPay succeeded, but the app could not confirm it with the backend.",
      iconClassName: "bg-amber-50 text-amber-600",
      title: "Confirmation needs attention",
    };
  }

  if (confirmStatus === "confirmed") {
    return {
      Icon: CheckCircle2,
      canRetry: false,
      description: "Your wallet balance has been updated by the payment service.",
      iconClassName: "bg-emerald-50 text-emerald-600",
      title: "Wallet top-up completed",
    };
  }

  return {
    Icon: CheckCircle2,
    canRetry: false,
    description: "VNPay marked this sandbox payment as successful.",
    iconClassName: "bg-emerald-50 text-emerald-600",
    title: "Payment completed",
  };
}

function formatVnPayDate(value: string) {
  if (!value || value.length !== 14) return value || "-";

  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);
  const hour = value.slice(8, 10);
  const minute = value.slice(10, 12);
  const second = value.slice(12, 14);
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getPaymentErrorMessage(error: unknown) {
  const apiError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return (
    apiError.response?.data?.message ||
    apiError.message ||
    "Unable to confirm this VNPay deposit."
  );
}
