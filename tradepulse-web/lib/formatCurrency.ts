/**
 * Formats a money amount for display. Accepts number or numeric string from the API.
 * Display-only — do not use for trade math.
 */
export function formatCurrency(
  value: number | string,
  options?: { currency?: string; locale?: string },
): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount)) {
    return "—";
  }
  return new Intl.NumberFormat(options?.locale ?? "en-US", {
    style: "currency",
    currency: options?.currency ?? "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
