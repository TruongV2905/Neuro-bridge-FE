"use client";

import { WalletCards } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { MarketplaceProductDetail } from "@/features/ai-place/types";
import { formatVnd } from "@/features/ai-place/expert/utils/presentation";
import { useGetMyWallet } from "@/services/payment.service";

type AiPlacePurchaseConfirmationDialogProps = {
  product: Pick<MarketplaceProductDetail, "name" | "priceVnd" | "seller">;
  open: boolean;
  isConfirming: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function AiPlacePurchaseConfirmationDialog({
  product,
  open,
  isConfirming,
  onOpenChange,
  onConfirm,
}: AiPlacePurchaseConfirmationDialogProps) {
  const walletQuery = useGetMyWallet({ enabled: open });
  const wallet = walletQuery.data?.result;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isConfirming && !nextOpen) return;

        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent className="max-w-[440px] rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-extrabold text-slate-950">
            Confirm AI product purchase
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-6 text-slate-500">
            Review this purchase before the Payment service processes it.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <section className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              AI product
            </p>
            <p className="mt-1 text-base font-extrabold text-slate-950">
              {product.name}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Seller: {product.seller.displayName}
            </p>
            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Current product price
              </p>
              <p className="mt-1 text-2xl font-extrabold text-indigo-950">
                {formatVnd(product.priceVnd)}
              </p>
            </div>
          </section>

          <section
            aria-label="Wallet information"
            className="rounded-2xl border border-slate-100 bg-white p-4"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <WalletCards className="h-4 w-4" />
              Wallet information
            </div>
            {walletQuery.isLoading || walletQuery.isFetching ? (
              <p className="mt-2 text-sm text-slate-500">
                Reading current wallet information…
              </p>
            ) : wallet ? (
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold text-slate-500">
                    Current balance
                  </dt>
                  <dd className="mt-1 font-extrabold text-slate-950">
                    {formatVnd(wallet.walletBalance)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-500">
                    Wallet status
                  </dt>
                  <dd className="mt-1 font-extrabold text-slate-950">
                    {wallet.status}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Wallet information is unavailable. The Payment service will
                verify payment when you confirm.
              </p>
            )}
          </section>

          <p className="text-xs leading-5 text-slate-500">
            The Payment service validates the purchase and current price when
            you confirm. This review does not reserve funds or create a
            purchase.
          </p>
        </div>

        <AlertDialogFooter className="mt-2 gap-2 sm:gap-2">
          <AlertDialogCancel disabled={isConfirming}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isConfirming}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {isConfirming ? "Processing payment…" : "Confirm purchase"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
