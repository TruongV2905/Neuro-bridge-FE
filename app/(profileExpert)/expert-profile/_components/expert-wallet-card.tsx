import {
  Wallet,
  Landmark,
  CreditCard,
  User,
  TrendingUp,
  ArrowDownToLine,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ExpertWalletCardProps = {
  wallet: {
    bankName: string
    accountNumber: string
    accountHolderName: string
    walletBalance: number
    totalEarned: number
    totalWithdrawn: number
  }
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("vi-VN").format(amount) + " ₫"

export function ExpertWalletCard({ wallet }: ExpertWalletCardProps) {
  return (
    <div className="group relative rounded-[2rem] bg-border p-[1px] transition-all duration-500 hover:shadow-[0_0_24px_rgba(95,123,255,0.15)]">
      <div
        style={{
          background:
            "linear-gradient(to right, #5f7bff 0%, #3e5ee0 35%, #8b5cf6 65%, #ec4899 100%)",
        }}
        className="absolute inset-0 rounded-[2rem] opacity-0 blur-[1px] transition-opacity duration-500 group-hover:opacity-100"
      />

      <Card className="relative z-10 rounded-[calc(2rem-1px)] border-border bg-card text-foreground shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5 text-primary" />
            Wallet Information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Available Balance
            </p>

            <p className="mt-2 text-2xl font-bold text-primary">
              {formatMoney(wallet.walletBalance)}
            </p>
          </div>

          <div className="space-y-3">
            <WalletInfoItem
              icon={<Landmark className="h-4 w-4" />}
              label="Bank"
              value={wallet.bankName}
            />

            <WalletInfoItem
              icon={<CreditCard className="h-4 w-4" />}
              label="Account Number"
              value={wallet.accountNumber}
            />

            <WalletInfoItem
              icon={<User className="h-4 w-4" />}
              label="Account Holder"
              value={wallet.accountHolderName}
            />
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Total Earned
              </div>

              <span className="font-medium text-emerald-500">
                {formatMoney(wallet.totalEarned)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowDownToLine className="h-4 w-4" />
                Withdrawn
              </div>

              <span className="font-medium text-orange-500">
                {formatMoney(wallet.totalWithdrawn)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function WalletInfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>

      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}