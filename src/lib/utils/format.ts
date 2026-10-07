export function formatCurrency(amount: number, showDecimals = false): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatLoanPurpose(purpose: string): string {
  const map: Record<string, string> = {
    debt_consolidation: "Debt Consolidation",
    home_improvement: "Home Improvement",
    education: "Education",
    medical: "Medical",
    other: "Other",
    new_vehicle: "New Vehicle",
    used_vehicle: "Used Vehicle",
  };
  return map[purpose] ?? purpose.replace(/_/g, " ");
}
