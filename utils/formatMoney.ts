type MoneyValue = number | string | null | undefined;

export function formatMoney(amount: MoneyValue, fallback = "—"): string {
  const normalizedAmount = normalizeMoneyAmount(amount);

  if (normalizedAmount === null) {
    return fallback;
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(normalizedAmount);
}

function normalizeMoneyAmount(amount: MoneyValue) {
  if (typeof amount === "number") {
    return Number.isFinite(amount) ? amount : null;
  }

  if (typeof amount === "string") {
    const trimmedAmount = amount.trim();

    if (!trimmedAmount) {
      return null;
    }

    const numericAmount = Number(trimmedAmount);

    return Number.isFinite(numericAmount) ? numericAmount : null;
  }

  return null;
}
