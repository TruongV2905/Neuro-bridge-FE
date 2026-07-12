"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CreditCard,
  Loader2,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDepositWalletByVnPay,
  useGetMyPaymentTransactions,
  useGetMyWallet,
} from "@/services/payment.service";
import type { PaymentTransaction } from "@/types/payment.type";

type PaymentWalletViewProps = {
  role: "CLIENT" | "EXPERT";
};

const DEFAULT_DEPOSIT_AMOUNT = "100000";

export function PaymentWalletView({ role }: PaymentWalletViewProps) {
  const [amount, setAmount] = useState(DEFAULT_DEPOSIT_AMOUNT);
  const [description, setDescription] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");

  const walletQuery = useGetMyWallet();
  const transactionsQuery = useGetMyPaymentTransactions({
    page: 0,
    size: 6,
    sortBy: "createdAt",
    direction: "DESCENDING",
  });
  const depositMutation = useDepositWalletByVnPay();

  const wallet = walletQuery.data?.result;
  const transactions = useMemo(
    () => transactionsQuery.data?.result?.data ?? [],
    [transactionsQuery.data?.result?.data],
  );
  const isInitialLoading = walletQuery.isLoading && !wallet;

  const handleDeposit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const depositAmount = Number(amount);
    if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
      toast.error("Please enter a valid deposit amount.");
      return;
    }

    depositMutation.mutate(
      {
        depositAmount,
        description: description.trim() || undefined,
      },
      {
        onSuccess: (response) => {
          const nextPaymentUrl = response.result;

          if (nextPaymentUrl) {
            setPaymentUrl(nextPaymentUrl);
            toast.success("VNPay payment link created.");

            if (isHttpUrl(nextPaymentUrl)) {
              window.location.href = nextPaymentUrl;
            }
            return;
          }

          toast.success(response.message || "Deposit request created.");
        },
        onError: (error) => {
          toast.error(getPaymentErrorMessage(error));
        },
      },
    );
  };

  const handleRefresh = () => {
    walletQuery.refetch();
    transactionsQuery.refetch();
  };

  return (
    <main className="min-h-screen bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-indigo-600 shadow-sm">
              <WalletCards className="h-3.5 w-3.5" />
              {role === "CLIENT" ? "Client Wallet" : "Expert Wallet"}
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0A0D17]">
              Wallet
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage your wallet balance, create a VNPay top-up request, and
              review recent wallet transactions.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleRefresh}
            disabled={walletQuery.isFetching || transactionsQuery.isFetching}
            className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {isInitialLoading ? (
            <>
              <WalletMetricSkeleton />
              <WalletMetricSkeleton />
              <WalletMetricSkeleton />
            </>
          ) : (
            <>
              <WalletMetric
                label="Wallet balance"
                value={formatMoney(wallet?.walletBalance ?? 0)}
                highlight
              />
              <WalletMetric
                label="Total earned"
                value={formatMoney(wallet?.totalEarned ?? 0)}
              />
              <WalletMetric
                label="Total withdrawn"
                value={formatMoney(wallet?.totalWithdrawn ?? 0)}
              />
            </>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-extrabold text-slate-950">
                  Top up wallet
                </h2>
                <p className="text-sm text-slate-500">
                  Create a VNPay payment link.
                </p>
              </div>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleDeposit}>
              <div>
                <label
                  htmlFor="depositAmount"
                  className="text-xs font-extrabold uppercase tracking-wider text-slate-400"
                >
                  Deposit amount
                </label>
                <Input
                  id="depositAmount"
                  type="number"
                  min={10000}
                  step={1000}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="mt-2 h-12 rounded-xl border-slate-200 bg-slate-50/70 px-4 font-bold"
                />
              </div>

              <div>
                <label
                  htmlFor="depositDescription"
                  className="text-xs font-extrabold uppercase tracking-wider text-slate-400"
                >
                  Description
                </label>
                <Input
                  id="depositDescription"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Wallet top-up"
                  className="mt-2 h-12 rounded-xl border-slate-200 bg-slate-50/70 px-4"
                />
              </div>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm font-semibold text-indigo-700">
                Amount preview: {formatMoney(Number(amount) || 0)}
              </div>

              <Button
                type="submit"
                disabled={depositMutation.isPending}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-sm font-bold text-white shadow-[0_10px_30px_rgba(99,102,241,0.22)]"
              >
                {depositMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                )}
                {depositMutation.isPending ? "Creating link..." : "Top up with VNPay"}
              </Button>
            </form>

            {paymentUrl && !isHttpUrl(paymentUrl) && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {paymentUrl}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-950">
                  Recent transactions
                </h2>
                <p className="text-sm text-slate-500">
                  Latest wallet activity from payment service.
                </p>
              </div>
              {wallet?.status && (
                <Badge
                  variant="outline"
                  className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700"
                >
                  {wallet.status}
                </Badge>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {transactionsQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TransactionSkeleton key={index} />
                ))
              ) : transactions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center">
                  <p className="font-extrabold text-slate-900">
                    No transactions yet
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Top up your wallet to create the first transaction.
                  </p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function WalletMetric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
      <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <p
        className={`mt-2 text-2xl font-extrabold ${
          highlight ? "text-indigo-600" : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function WalletMetricSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-8 w-36" />
    </div>
  );
}

function TransactionRow({
  transaction,
}: {
  transaction: PaymentTransaction;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-extrabold text-slate-950">{transaction.type}</p>
          <Badge
            variant="outline"
            className={`rounded-full px-2.5 py-1 text-[11px] ${getStatusClassName(transaction.status)}`}
          >
            {transaction.status}
          </Badge>
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
          {transaction.description || transaction.referenceType || "Wallet transaction"}
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-400">
          {formatDateTime(transaction.createdAt)}
        </p>
      </div>
      <p className="text-right text-base font-extrabold text-slate-950">
        {formatMoney(transaction.amount)}
      </p>
    </div>
  );
}

function TransactionSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <Skeleton className="h-4 w-44" />
      <Skeleton className="mt-2 h-3 w-64" />
    </div>
  );
}

function getStatusClassName(status: string) {
  switch (status) {
    case "SUCCESS":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "FAILED":
    case "CANCELLED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-white text-slate-600";
  }
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function isHttpUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function getPaymentErrorMessage(error: unknown) {
  const apiError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return (
    apiError.response?.data?.message ||
    apiError.message ||
    "Unable to create a deposit request. Please try again."
  );
}
