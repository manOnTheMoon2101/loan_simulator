import type { RequestHandler } from './$types';
import {
  getInterestRate,
  calculateMonthlyPayment,
  calculateMaxLoanAmount,
} from "#lib/utils/calculations";

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { personalInfo, financialInfo, loanDetails } = body;

  const { age, employmentStatus, employmentDuration } = personalInfo;
  const { monthlyIncome, monthlyExpenses, existingDebt, creditScore } =
    financialInfo;
  const { requestedAmount, loanTerm, loanPurpose } = loanDetails;

  const loanType = ["new_vehicle", "used_vehicle"].includes(loanPurpose)
    ? "vehicle_loan"
    : "personal_loan";

  const disposableIncome = monthlyIncome - monthlyExpenses;
  const debtToIncomeRatio = parseFloat(
    ((existingDebt / monthlyIncome) * 100).toFixed(1),
  );
  const loanToIncomeRatio = parseFloat(
    ((requestedAmount / (monthlyIncome * 12)) * 100).toFixed(1),
  );

  const interestRate = getInterestRate(creditScore, loanType);
  const monthlyPayment = calculateMonthlyPayment(
    requestedAmount,
    interestRate,
    loanTerm,
  );

  const ineligibleReasons: string[] = [];

  if (age < 18 || age > 65) {
    ineligibleReasons.push("Age must be between 18 and 65 years");
  }

  if (employmentStatus === "unemployed") {
    ineligibleReasons.push(
      "Must be employed, self-employed, or retired to qualify",
    );
  }

  if (
    employmentStatus !== "unemployed" &&
    employmentStatus !== "retired" &&
    employmentDuration < 3
  ) {
    ineligibleReasons.push("Minimum 3 months employment history required");
  }

  if (monthlyIncome < 5000) {
    ineligibleReasons.push("Minimum monthly income of R5,000 required");
  }

  if (disposableIncome <= 0) {
    ineligibleReasons.push(
      "Monthly expenses exceed income — insufficient disposable income",
    );
  }

  if (disposableIncome > 0 && monthlyPayment > disposableIncome * 0.6) {
    ineligibleReasons.push(
      "Loan repayment would exceed 60% of disposable income",
    );
  }

  const isEligible = ineligibleReasons.length === 0;

  let likelihood = 50;

  if (creditScore) {
    if (creditScore >= 750) likelihood += 25;
    else if (creditScore >= 700) likelihood += 15;
    else if (creditScore >= 650) likelihood += 5;
    else if (creditScore >= 600) likelihood -= 5;
    else if (creditScore >= 550) likelihood -= 15;
    else likelihood -= 25;
  }

  if (debtToIncomeRatio < 20) likelihood += 15;
  else if (debtToIncomeRatio < 30) likelihood += 5;
  else if (debtToIncomeRatio > 50) likelihood -= 20;
  else if (debtToIncomeRatio > 40) likelihood -= 10;

  if (employmentDuration >= 24) likelihood += 10;
  else if (employmentDuration >= 12) likelihood += 5;
  else if (employmentDuration < 6) likelihood -= 5;

  if (disposableIncome > 0) {
    const paymentRatio = monthlyPayment / disposableIncome;
    if (paymentRatio < 0.3) likelihood += 10;
    else if (paymentRatio < 0.4) likelihood += 5;
    else if (paymentRatio > 0.5) likelihood -= 10;
  }

  likelihood = Math.min(95, Math.max(5, likelihood));

  const riskCategory: "low" | "medium" | "high" =
    likelihood >= 70 ? "low" : likelihood >= 45 ? "medium" : "high";

  let decisionReason: string;
  if (isEligible) {
    if (debtToIncomeRatio < 25 && (creditScore ?? 0) >= 650) {
      decisionReason =
        "Strong income-to-expense ratio and manageable existing debt";
    } else if (disposableIncome > monthlyIncome * 0.35) {
      decisionReason =
        "Good disposable income with sufficient repayment capacity";
    } else {
      decisionReason =
        "Acceptable financial profile with adequate repayment capacity";
    }
  } else {
    decisionReason = ineligibleReasons[0];
  }

  const incomeRatio = monthlyIncome > 0 ? disposableIncome / monthlyIncome : 0;
  const affordabilityScore: "excellent" | "good" | "fair" | "poor" =
    incomeRatio > 0.5
      ? "excellent"
      : incomeRatio > 0.35
        ? "good"
        : incomeRatio > 0.2
          ? "fair"
          : "poor";

  const absoluteMax = loanType === "vehicle_loan" ? 1_500_000 : 300_000;
  const maxAmount = isEligible
    ? Math.min(
        calculateMaxLoanAmount(disposableIncome, interestRate, loanTerm),
        absoluteMax,
      )
    : 0;

  const totalRepayment = parseFloat((monthlyPayment * loanTerm).toFixed(2));

  return Response.json({
    eligibilityResult: {
      isEligible,
      approvalLikelihood: isEligible ? likelihood : 0,
      riskCategory: isEligible ? riskCategory : "high",
      decisionReason,
    },
    recommendedLoan: {
      maxAmount,
      recommendedAmount: isEligible ? requestedAmount : 0,
      interestRate,
      monthlyPayment: isEligible ? parseFloat(monthlyPayment.toFixed(2)) : 0,
      totalRepayment: isEligible ? totalRepayment : 0,
    },
    affordabilityAnalysis: {
      disposableIncome: parseFloat(disposableIncome.toFixed(2)),
      debtToIncomeRatio,
      loanToIncomeRatio,
      affordabilityScore,
    },
  });
};
