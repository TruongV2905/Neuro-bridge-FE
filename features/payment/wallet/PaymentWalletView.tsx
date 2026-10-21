"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CircleDollarSign,
  Eye,
  Landmark,
  Pencil,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetMyPaymentTransactions,
  useGetMyWallet,
  useGetPaymentTransactionById,
  useFilterPaymentTransactions,
  useUpdateMyWalletBankInfo,
} from "@/services/payment.service";
import type {
  PaymentTransaction,
  PaymentTransactionStatus,
  PaymentTransactionType,
  UpdateMyWalletBankInfoRequest,
  UserWallet,
} from "@/types/payment.type";
import { formatMoney } from "@/utils/formatMoney";

type PaymentWalletViewProps = {
  role: "CLIENT" | "EXPERT";
};

const PAGE_SIZE = 10;
const ALL_FILTER = "ALL";

const transactionTypes: PaymentTransactionType[] = [
  "WALLET_DEPOSIT",
  "WALLET_WITHDRAW",
  "PROPOSAL_PAYMENT",
  "AI_PRODUCT_PAYMENT",
  "PROJECT_ESCROW_DEPOSIT",
  "PROJECT_RELEASE",
  "PROJECT_REFUND",
  "REFUND",
  "SYSTEM_FEE",
  "ADMIN_ADD",
  "ADMIN_DEDUCT",
];

const transactionStatuses: PaymentTransactionStatus[] = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
];

export function PaymentWalletView({ role }: PaymentWalletViewProps) {
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState(ALL_FILTER);
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>();

  const walletQuery = useGetMyWallet();
  const wallet = walletQuery.data?.result;
  const serverFiltering = typeFilter !== ALL_FILTER || statusFilter !== ALL_FILTER;
  const transactionsQuery = useGetMyPaymentTransactions({
    page,
    size: PAGE_SIZE,
    sortBy: "createdAt",
    direction: "DESCENDING",
  }, {
    enabled: !serverFiltering,
  });
  const filteredTransactionsQuery = useFilterPaymentTransactions({
    page,
    size: PAGE_SIZE,
    sortBy: "createdAt",
    direction: "DESCENDING",
    filter: {
      involvingUserCode: wallet?.userCode,
      ...(typeFilter !== ALL_FILTER ? { type: typeFilter } : {}),
      ...(statusFilter !== ALL_FILTER ? { status: statusFilter } : {}),
    },
  }, {
    enabled: Boolean(wallet?.userCode) && serverFiltering,
  });
  const transactionQuery = useGetPaymentTransactionById(selectedTransactionId);

  const historyResponse = serverFiltering
    ? filteredTransactionsQuery.data
    : transactionsQuery.data;
  const historyLoading = serverFiltering
    ? filteredTransactionsQuery.isLoading
    : transactionsQuery.isLoading;
  const historyError = serverFiltering
    ? filteredTransactionsQuery.isError
    : transactionsQuery.isError;
  const allTransactions = useMemo(
    () => historyResponse?.result?.data ?? [],
    [historyResponse],
  );
  const metadata = historyResponse?.result?.metadata;

  const refresh = () => {
    void walletQuery.refetch();
    void transactionsQuery.refetch();
    void filteredTransactionsQuery.refetch();
  };

  const updateTypeFilter = (value: string) => {
    setPage(0);
    setTypeFilter(value);
  };

  const updateStatusFilter = (value: string) => {
    setPage(0);
    setStatusFilter(value);
  };

  return (
    <main className="min-h-full bg-[#f6f1f1] p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-indigo-600 shadow-sm">
              <WalletCards className="h-3.5 w-3.5" />
              {role === "EXPERT" ? "Expert Wallet" : "Client Wallet"}
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0A0D17]">
              Wallet
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review your balance, bank details, and payment activity from the
              current Payment service.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={refresh}
            disabled={walletQuery.isFetching || transactionsQuery.isFetching || filteredTransactionsQuery.isFetching}
            className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </header>

        {walletQuery.isError ? (
          <WalletError onRetry={() => void walletQuery.refetch()} />
        ) : (
          <>
            <WalletMetrics wallet={wallet} loading={walletQuery.isLoading} role={role} />
            <section className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)]">
              <BankInformation
                wallet={wallet}
                loading={walletQuery.isLoading}
                onEdit={() => setBankDialogOpen(true)}
              />
              <TransactionHistory
                loading={historyLoading}
                error={historyError}
                transactions={allTransactions}
                page={page}
                totalPages={metadata?.totalPages ?? 0}
                typeFilter={typeFilter}
                statusFilter={statusFilter}
                onTypeFilterChange={updateTypeFilter}
                onStatusFilterChange={updateStatusFilter}
                onPrevious={() => setPage((current) => Math.max(0, current - 1))}
                onNext={() =>
                  setPage((current) =>
                    metadata && current + 1 < metadata.totalPages ? current + 1 : current,
                  )
                }
                onRetry={() => {
                  if (serverFiltering) {
                    void filteredTransactionsQuery.refetch();
                  } else {
                    void transactionsQuery.refetch();
                  }
                }}
                onSelect={setSelectedTransactionId}
              />
            </section>
          </>
        )}
      </div>

      {bankDialogOpen ? (
        <BankInformationDialog
          wallet={wallet}
          open={bankDialogOpen}
          onOpenChange={setBankDialogOpen}
        />
      ) : null}
      <TransactionDetailDialog
        open={Boolean(selectedTransactionId)}
        transaction={transactionQuery.data?.result}
        loading={transactionQuery.isLoading}
        error={transactionQuery.isError}
        onOpenChange={(open) => {
          if (!open) setSelectedTransactionId(undefined);
        }}
        onRetry={() => void transactionQuery.refetch()}
      />
    </main>
  );
}

function WalletMetrics({
  wallet,
  loading,
  role,
}: {
  wallet?: UserWallet;
  loading: boolean;
  role: PaymentWalletViewProps["role"];
}) {
  const metrics = [
    { label: "Available balance", value: wallet?.walletBalance ?? 0, primary: true },
    ...(role === "EXPERT"
      ? [
          { label: "Total earned", value: wallet?.totalEarned ?? 0 },
          { label: "Total withdrawn", value: wallet?.totalWithdrawn ?? 0 },
        ]
      : [
          { label: "Wallet status", value: wallet?.status ?? "-", text: true },
          { label: "Total withdrawn", value: wallet?.totalWithdrawn ?? 0 },
        ]),
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{metric.label}</p>
          {loading ? (
            <Skeleton className="mt-3 h-8 w-36" />
          ) : (
            <p className={`mt-2 text-2xl font-extrabold ${metric.primary ? "text-indigo-600" : "text-slate-950"}`}>
              {metric.text ? String(metric.value) : formatMoney(Number(metric.value))}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}

function BankInformation({
  wallet,
  loading,
  onEdit,
}: {
  wallet?: UserWallet;
  loading: boolean;
  onEdit: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Landmark className="h-5 w-5" /></span>
          <div>
            <h2 className="font-extrabold text-slate-950">Bank information</h2>
            <p className="text-sm text-slate-500">Used by the Payment service for wallet records.</p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={onEdit} disabled={loading} className="rounded-xl border-slate-200 bg-white font-bold">
          <Pencil className="mr-2 h-4 w-4" />
          {wallet?.bankName ? "Edit" : "Add bank info"}
        </Button>
      </div>
      <dl className="mt-5 space-y-3">
        <BankRow label="Bank" value={wallet?.bankName} loading={loading} />
        <BankRow label="Account holder" value={wallet?.accountHolderName} loading={loading} />
        <BankRow label="Account number" value={wallet?.accountNumber ? maskAccountNumber(wallet.accountNumber) : undefined} loading={loading} />
      </dl>
    </section>
  );
}

function BankRow({ label, value, loading }: { label: string; value?: string | null; loading: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <dt className="text-sm font-semibold text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-bold text-slate-950">{loading ? <Skeleton className="h-4 w-28" /> : value || "Not provided"}</dd>
    </div>
  );
}

function TransactionHistory({
  loading,
  error,
  transactions,
  page,
  totalPages,
  typeFilter,
  statusFilter,
  onTypeFilterChange,
  onStatusFilterChange,
  onPrevious,
  onNext,
  onRetry,
  onSelect,
}: {
  loading: boolean;
  error: boolean;
  transactions: PaymentTransaction[];
  page: number;
  totalPages: number;
  typeFilter: string;
  statusFilter: string;
  onTypeFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onRetry: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-extrabold text-slate-950">Transaction history</h2>
          <p className="mt-1 text-sm text-slate-500">Newest wallet activity first. Filters and pagination come from the Payment service.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger className="h-9 w-[168px] bg-white"><SelectValue placeholder="All types" /></SelectTrigger>
            <SelectContent><SelectItem value={ALL_FILTER}>All types</SelectItem>{transactionTypes.map((type) => <SelectItem key={type} value={type}>{formatTransactionType(type)}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="h-9 w-[150px] bg-white"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent><SelectItem value={ALL_FILTER}>All statuses</SelectItem>{transactionStatuses.map((status) => <SelectItem key={status} value={status}>{formatLabel(status)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><tr><th className="pb-3 font-extrabold">Transaction</th><th className="pb-3 font-extrabold">Status</th><th className="pb-3 font-extrabold">Date</th><th className="pb-3 text-right font-extrabold">Amount</th><th className="pb-3" /></tr></thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, index) => <tr key={index} className="border-b border-slate-50"><td className="py-4"><Skeleton className="h-4 w-40" /></td><td><Skeleton className="h-5 w-20" /></td><td><Skeleton className="h-4 w-28" /></td><td><Skeleton className="ml-auto h-4 w-24" /></td><td /></tr>) : null}
            {!loading && error ? <tr><td colSpan={5} className="py-10 text-center"><p className="font-bold text-slate-900">Unable to load transactions.</p><Button type="button" variant="outline" onClick={onRetry} className="mt-3">Retry</Button></td></tr> : null}
            {!loading && !error && transactions.length === 0 ? <tr><td colSpan={5} className="py-10 text-center text-slate-500">No transactions match the current view.</td></tr> : null}
            {!loading && !error && transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} onSelect={onSelect} />)}
          </tbody>
        </table>
      </div>
      {!loading && !error && totalPages > 1 ? <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><p className="text-sm text-slate-500">Page {page + 1} of {totalPages}</p><div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={onPrevious} disabled={page === 0}>Previous</Button><Button type="button" variant="outline" size="sm" onClick={onNext} disabled={page + 1 >= totalPages}>Next</Button></div></div> : null}
    </section>
  );
}

function TransactionRow({ transaction, onSelect }: { transaction: PaymentTransaction; onSelect: (id: string) => void }) {
  return <tr className="border-b border-slate-50 last:border-0"><td className="py-4"><p className="font-bold text-slate-950">{formatTransactionType(transaction.type)}</p><p className="mt-0.5 max-w-[260px] truncate text-xs text-slate-500">{transaction.description || transaction.referenceType || "Wallet transaction"}</p></td><td><StatusBadge status={transaction.status} /></td><td className="text-slate-500">{formatDateTime(transaction.createdAt)}</td><td className="text-right font-extrabold text-slate-950">{formatMoney(transaction.amount)}</td><td className="pl-4 text-right"><Button type="button" variant="ghost" size="icon-sm" onClick={() => onSelect(transaction.id)} aria-label="View transaction details"><Eye className="h-4 w-4" /></Button></td></tr>;
}

function TransactionDetailDialog({ open, transaction, loading, error, onOpenChange, onRetry }: { open: boolean; transaction?: PaymentTransaction; loading: boolean; error: boolean; onOpenChange: (open: boolean) => void; onRetry: () => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Transaction detail</DialogTitle><DialogDescription>Details returned by the Payment service.</DialogDescription></DialogHeader>{loading ? <div className="space-y-3"><Skeleton className="h-5 w-40" /><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-3/4" /></div> : error ? <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800"><p>Transaction details are unavailable.</p><Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-3">Retry</Button></div> : transaction ? <dl className="space-y-3"><DetailRow label="Type" value={formatTransactionType(transaction.type)} /><DetailRow label="Status" value={<StatusBadge status={transaction.status} />} /><DetailRow label="Amount" value={formatMoney(transaction.amount)} /><DetailRow label="Created" value={formatDateTime(transaction.createdAt)} /><DetailRow label="Reference" value={transaction.referenceId || "Not provided"} /><DetailRow label="Reference type" value={transaction.referenceType || "Not provided"} /><DetailRow label="Description" value={transaction.description || "Not provided"} /></dl> : null}<DialogFooter showCloseButton /></DialogContent></Dialog>;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) { return <div className="grid grid-cols-[120px_1fr] gap-4 border-b border-slate-100 pb-3 text-sm last:border-0"><dt className="font-semibold text-slate-500">{label}</dt><dd className="break-words text-right font-bold text-slate-950">{value}</dd></div>; }

function BankInformationDialog({ wallet, open, onOpenChange }: { wallet?: UserWallet; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [values, setValues] = useState<UpdateMyWalletBankInfoRequest>({ accountHolderName: wallet?.accountHolderName || "", accountNumber: wallet?.accountNumber || "", bankName: wallet?.bankName || "" });
  const [formError, setFormError] = useState<string>();
  const updateMutation = useUpdateMyWalletBankInfo();
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!values.accountHolderName.trim() || !values.bankName.trim() || !/^\d{6,20}$/.test(values.accountNumber)) { setFormError("Enter a bank, account holder, and an account number with 6–20 digits."); return; } updateMutation.mutate({ accountHolderName: values.accountHolderName.trim(), accountNumber: values.accountNumber, bankName: values.bankName.trim() }, { onSuccess: () => { toast.success("Bank information updated."); onOpenChange(false); }, onError: (error) => setFormError(getPaymentErrorMessage(error, "Unable to update bank information.")) }); };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Bank information</DialogTitle><DialogDescription>This updates the current wallet only.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><Field label="Bank name" value={values.bankName} onChange={(bankName) => setValues((current) => ({ ...current, bankName }))} /><Field label="Account holder name" value={values.accountHolderName} onChange={(accountHolderName) => setValues((current) => ({ ...current, accountHolderName }))} /><Field label="Account number" value={values.accountNumber} inputMode="numeric" onChange={(accountNumber) => setValues((current) => ({ ...current, accountNumber }))} />{formError ? <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p> : null}<DialogFooter><Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving..." : "Save bank information"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

function Field({ label, value, onChange, inputMode }: { label: string; value: string; onChange: (value: string) => void; inputMode?: "numeric" }) { return <label className="block space-y-1.5 text-sm font-semibold text-slate-700"><span>{label}</span><Input value={value} inputMode={inputMode} onChange={(event) => onChange(event.target.value)} /></label>; }

function WalletError({ onRetry }: { onRetry: () => void }) { return <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"><div className="flex gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><CircleDollarSign className="h-5 w-5" /></span><div><h2 className="font-extrabold text-slate-950">Wallet is unavailable</h2><p className="mt-1 text-sm text-slate-500">We could not load your wallet. Sign in again if your session has expired, then retry.</p><Button type="button" variant="outline" onClick={onRetry} className="mt-4">Retry</Button></div></div></section>; }

function StatusBadge({ status }: { status: string }) { const className = status === "SUCCESS" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : status === "PENDING" ? "border-amber-200 bg-amber-50 text-amber-700" : status === "FAILED" || status === "CANCELLED" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600"; return <Badge variant="outline" className={`rounded-full px-2.5 py-1 text-[11px] ${className}`}>{formatLabel(status)}</Badge>; }

function formatTransactionType(type: string) { return formatLabel(type); }
function formatLabel(value: string) { return value.toLowerCase().split("_").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" "); }
function formatDateTime(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date); }
function maskAccountNumber(value: string) { return value.length <= 4 ? value : `${"•".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`; }
function getPaymentErrorMessage(error: unknown, fallback: string) { const response = error as { response?: { status?: number; data?: { message?: unknown } } }; const status = response.response?.status; if (status === 401) return "Your session has expired. Please sign in again."; if (status === 403) return "You do not have permission to update this wallet."; if (status === 503) return "The Payment service is temporarily unavailable. Please retry shortly."; if (status === 400) return "The bank information is invalid. Check the required fields and retry."; return fallback; }
