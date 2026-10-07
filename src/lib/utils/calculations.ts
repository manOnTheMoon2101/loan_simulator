import type { PaymentScheduleItem } from "#lib/types";

export function getInterestRate(
  creditScore: number | null | undefined,
  loanType: string,
): number {
  const isVehicle = loanType === "vehicle_loan";

  if (!creditScore) {
    return isVehicle ? 15.0 : 18.5;
  }

  if (isVehicle) {
    if (creditScore >= 750) return 8.5;
    if (creditScore >= 700) return 9.5;
    if (creditScore >= 650) return 11.0;
    if (creditScore >= 600) return 12.5;
    if (creditScore >= 550) return 13.5;
    return 15.0;
  }

  if (creditScore >= 750) return 10.5;
  if (creditScore >= 700) return 11.5;
  if (creditScore >= 650) return 13.0;
  if (creditScore >= 600) return 14.5;
  if (creditScore >= 550) return 16.0;
  return 18.5;
}

/**
 * Calculate the monthly repayment using the standard amortisation formula:
 *   M = P × [r(1+r)^n] / [(1+r)^n − 1]
 *
 * @param principal    Loan amount (ZAR)
 * @param annualRate   Annual interest rate as a percentage (e.g. 12.5 for 12.5%)
 * @param termMonths   Loan term in months
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number,
): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / termMonths;
  const factor = Math.pow(1 + r, termMonths);
  return (principal * r * factor) / (factor - 1);
}

export function generatePaymentSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
): PaymentScheduleItem[] {
  const r = annualRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(
    principal,
    annualRate,
    termMonths,
  );
  const schedule: PaymentScheduleItem[] = [];
  let balance = principal;

  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = balance * r;
    const principalPayment = monthlyPayment - interestPayment;
    balance = Math.max(0, balance - principalPayment);

    schedule.push({
      month,
      payment: parseFloat(monthlyPayment.toFixed(2)),
      principal: parseFloat(principalPayment.toFixed(2)),
      interest: parseFloat(interestPayment.toFixed(2)),
      balance: parseFloat(balance.toFixed(2)),
    });
  }

  return schedule;
}

/**
 * Calculate the maximum loan amount a borrower can afford based on a
 * percentage of their disposable income.
 *
 * @param disposableIncome   Monthly disposable income (ZAR)
 * @param annualRate         Annual interest rate as a percentage
 * @param termMonths         Loan term in months
 * @param maxPaymentRatio    Maximum fraction of disposable income for repayments (default 0.40)
 */
export function calculateMaxLoanAmount(
  disposableIncome: number,
  annualRate: number,
  termMonths: number,
  maxPaymentRatio = 0.4,
): number {
  const maxPayment = disposableIncome * maxPaymentRatio;
  const r = annualRate / 100 / 12;
  if (r === 0) return maxPayment * termMonths;
  const factor = Math.pow(1 + r, termMonths);
  const maxAmount = (maxPayment * (factor - 1)) / (r * factor);
  return Math.floor(maxAmount / 1000) * 1000;
}
